require 'oj'

task :build_packages do
  package_json = Oj.load(File.read('package.json'), {})
  version = package_json['version']
  puts "Building packages with version #{version}"
  version_code = <<-CODE
module OpalWebpackLoader
  VERSION="#{version}"
end
  CODE
  File.write('lib/opal-webpack-loader/version.rb', version_code)
  File.delete('npm_bin/opal-webpack-loader-npm-version') if File.exist?('npm_bin/opal-webpack-loader-npm-version')
  File.write('npm_bin/opal-webpack-loader-npm-version', <<~JAVASCRIPT
#!/usr/bin/env node
console.log("#{version}");
  JAVASCRIPT
             )
  system('chmod +x npm_bin/opal-webpack-loader-npm-version')
  system('npm pack')
  system('gem build opal-webpack-loader')
end

task :push_packages, [:npm_otp] do |_, args|
  package_json = Oj.load(File.read('package.json'), {})
  version = package_json['version']
  system("npm publish opal-webpack-loader-#{version}.tgz --otp=#{args[:npm_otp]}")
  system("gem push opal-webpack-loader-#{version}.gem")
end
