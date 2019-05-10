require './app_loader'
require './owl_init'

class App < Roda
  include OpalWebpackLoader::ViewHelper

  route do |r|
    r.root do
      <<~HTML
      <html>
        <head>
          <title>Welcome</title>
          #{owl_script_tag 'application.js'}
        </head>
        <body>
          <div>Hello world!</div>
        </body>
      </html>
      HTML
    end
  end
end
