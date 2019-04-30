'use strict';

const fs = require('fs');
const net = require('net');
const path = require('path');
const loaderUtils = require('loader-utils');

// keep some global state
let Owl = {
    c_dir: '.owl_cache',
    lp_cache: path.join('.owl_cache', 'load_paths.json'),
    socket_path: path.join('.owl_cache', 'owcs_socket'),
    module_start: 'const opal_code = function() {\n  global.Opal.modules[',
    socket_ready: false,
    options: null
};

function delegate_compilation(that, callback, meta, request_json) {
    let buffer = Buffer.alloc(0);
    // or let the source be compiled by the compile server
    let socket = net.connect(Owl.socket_path, function () {
        socket.write(request_json + "\x04"); // triggers compilation // triggers compilation
    });
    socket.on('data', function (data) {
        buffer = Buffer.concat([buffer, data]);
    });
    socket.on('end', function() {
        let compiler_result = JSON.parse(buffer.toString());
        if (typeof compiler_result.error !== 'undefined') {
            callback(new Error(
                "opal-webpack-loader: A error occurred during compiling!\n" +
                compiler_result.error.name + "\n" +
                compiler_result.error.message + "\n" +
                compiler_result.error.backtrace
            ));
        } else {
            for (var i = 0; i < compiler_result.required_trees.length; i++) {
                that.addContextDependency(path.join(path.dirname(that.resourcePath), compiler_result.required_trees[i]));
            }
            let result;
            let real_resource_path = path.normalize(that.resourcePath);
            if (Owl.options.hmr && real_resource_path.startsWith(that.rootContext)) {
                // search for ruby module name in compiled file
                let start_index = compiler_result.javascript.indexOf(Owl.module_start) + Owl.module_start.length;
                let end_index = compiler_result.javascript.indexOf(']', start_index);
                let opal_module_name = compiler_result.javascript.substr(start_index, end_index - start_index);
                let hmreloader = `
if (module.hot) {
    let initially_loaded = false;
    if (typeof global.Opal !== 'undefined') {
        if (typeof global.Opal.modules !== 'undefined') {
            if (typeof global.Opal.modules[${opal_module_name}] === 'function') {
                initially_loaded = true;
            }
        }
    }
    if (initially_loaded) {
        module.hot.accept();
        opal_code();
        try {
            global.Opal.load.call(global.Opal, ${opal_module_name});
            ${Owl.options.hmrHook}
        } catch (err) {
            console.error(err.message);
        }
    }
}`;
                result = [compiler_result.javascript, hmreloader].join("\n");
            } else { result = compiler_result.javascript; }
            callback(null, result, compiler_result.source_map, meta);
        }
    });
    socket.on('error', function (err) {
        // only with webpack-dev-server running, somehow connecting to the IPC sockets leads to ECONNREFUSED
        // even though the socket is alive. this happens every once in a while for some seconds
        // not sure why this happens, but looping here solves it after a while
        // console.log("connect error for ", that.resourcePath)
        if (err.syscall === 'connect') {
            setTimeout(function() {
                delegate_compilation(that, callback, meta, request_json);
            }, 100);
        } else { callback(err); }
    });
}

module.exports = function(source, map, meta) {
    let callback = this.async();
    this.cacheable && this.cacheable();
    if (!Owl.options) {
        Owl.options = loaderUtils.getOptions(this);
        if (typeof Owl.options.hmr === 'undefined' ) { Owl.options.hmr = false; }
        if (typeof Owl.options.hmrHook === 'undefined' ) { Owl.options.hmrHook = ''; }
        if (typeof Owl.options.sourceMap === 'undefined' ) { Owl.options.sourceMap = false; }
    }
    if(!Owl.socket_ready) {
        if (!fs.existsSync(Owl.socket_path)) {
            callback(new Error('opal-webpack-loader: opal-webpack-compile-server not running, please start opal-webpack-compile-server'));
        } else {
            Owl.socket_ready = true;
        }
    }
    let request_json = JSON.stringify({ filename: this.resourcePath, source_map: Owl.options.sourceMap });
    delegate_compilation(this, callback, meta, request_json);
};
