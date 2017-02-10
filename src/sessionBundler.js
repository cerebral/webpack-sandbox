var webpack = require('webpack');
var memoryFs = require('./memoryFs');
var path = require('path');
var utils = require('./utils');
var createLoaders = require('./createLoaders');

module.exports = {
  create: function (session) {
    if (!utils.getEntry(session.files)) {
      return Promise.resolve(null);
    }

    return (
        utils.sessionHasPackages(session) ? utils.getManifest(session.packages) : Promise.resolve(null)
      )
      .then(function (manifest) {

        var externals = utils.sessionHasPackages(session) ? utils.createExternals(session.packages, manifest) : []

        return new Promise(function (resolve, reject) {
          var compiler = webpack({
            devtool: 'cheap-source-map',
            entry: {
              app: path.join('/', 'app', session.id, utils.getEntry(session.files))
            },
            output: {
              path: path.join('/', 'app', session.id),
              filename: 'bundle.js'
            },
            module: {
              loaders: createLoaders(session.loaders)
            },
            plugins: manifest ? [
              new webpack.DllReferencePlugin({
                context: '/',
                manifest: manifest
              })
            ] : [],
            externals
          });

          compiler.inputFileSystem = memoryFs.fs;
          compiler.outputFileSystem = memoryFs.fs;
          compiler.resolvers.normal.fileSystem = memoryFs.fs;
          compiler.resolvers.context.fileSystem = memoryFs.fs;

          resolve(compiler);
        });
      });
  }
};
