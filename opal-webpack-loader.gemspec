require_relative 'lib/opal-webpack-loader/version'

Gem::Specification.new do |s|
  s.name         = 'opal-webpack-loader'
  s.version      = OpalWebpackLoader::VERSION
  s.author       = 'Jan Biedermann'
  s.email        = 'jan@kursator.de'
  s.licenses     = %w[MIT]
  s.homepage     = 'http://isomorfeus.com'
  s.summary      = 'Bundle assets with webpack, resolve and compile opal ruby files and import them in the bundle.'
  s.description  = <<~TEXT
    Bundle assets with webpack, resolve and compile opal ruby files
    and import them in the bundle, without sprockets or the webpacker gem
    (but can be used with both of them too). 
    Comes with a installer for rails and other frameworks.
  TEXT
  s.executables << 'opal-webpack-compile-server'
  s.executables << 'owl-install'
  s.files          = `git ls-files -- lib`.split("\n")
  s.test_files     = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.require_paths  = ['lib']

  s.add_dependency 'opal', '~> 0.11.0'
  s.add_dependency 'eventmachine', '~> 1.2.7'
  s.add_dependency 'oj', '~> 3.6.0'
  s.add_dependency 'thor', '>= 0.19.4'
  s.add_development_dependency 'bundler'
  s.add_development_dependency 'rake'
  s.add_development_dependency 'rails', '~> 5.2.0'
  s.add_development_dependency 'roda', '~> 3.19.0'
  s.add_development_dependency 'rspec', '~> 3.8.0'
end