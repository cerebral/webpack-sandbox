# webpack-sandbox
A service that takes code with a DLL manifest and produces a server side bundling process

## How does it work?

[Webpackbin](https://github.com/cerebral/webpackbin) requires this service to operate. The way it works is that Webpackbin makes a **post** request to the sandbox holding the files, packages and loaders. Webpack-sandbox will create a cookie, held in memory, with some information about the user. Depending on the session state it will create a webpack compiler with the passed in details and also a middleware for the session where the bundle can be requested.

When Webpackbin points to the webpak-sandbox service in its iframe the cookie identifies which bundle to grab. Any changes to files, packages and/or loaders are posted to the sandbox again and the iframe can be refreshed. This is how it communicates.

When packages are passed in to the sandbox it will make a request to [webpack-dll](https://github.com/cerebral/webpack-dll). Webpack-dll makes a request for a *manifest.json* file which holds pointers to where import statements should do their lookups in the separate *dll.js* file. The manifest is returned and webpack-sandbox bundles up your bin code and injects a script tag which points to the *dll.js* file. That means when webpackbin loads the iFrame it will load the dll file as well.
