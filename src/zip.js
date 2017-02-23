var Zip = require('node-zip');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var memoryFs = require('./memoryFs');
var createLoaders = require('./createLoaders');
var loadersToDependencies = require('./loadersToDependencies');

var defaultFiles = {
  'webpack.config.js': fs.readFileSync(path.resolve('src', 'zip', 'webpack.config.js')).toString(),
  'README.md': fs.readFileSync(path.resolve('src', 'zip', 'README.md')).toString()
}

module.exports = function (req, res) {
  if (!req.session) {
    return res.send(404);
  }

  var packageJson = {
    "name": "webpackbin-project",
    "version": "1.0.0",
    "description": "Project boilerplate",
    "scripts": {
      "start": "webpack-dev-server --content-base build/ --port 3000"
    },
    "dependencies": req.session.packages || {},
    "devDependencies": Object.assign({
      "html-webpack-plugin": "2.22.0",
      "webpack-dev-server": "2.3.0",
      "webpack": "^2.2.0"
    }, loadersToDependencies(req.session.loaders || {})),
    "author": "WebpackBin",
    "license": "ISC"
  };

  var loaders = createLoaders(req.session.loaders || {}).map(function (loader) {
    loader.test = '$$' + loader.test.toString() + '$$';
    if (loader.exclude) {
      loader.exclude = '$$' + loader.exclude.toString() + '$$';
    }

    return loader;
  });
  var loadersString = JSON.stringify(loaders, null, 2);
  var regexps = /\$\$(.*?)\$\$/g;
  var matches = loadersString.match(regexps);
  loadersString = (matches || []).reduce(function (loadersString, match) {
    return loadersString.replace('"' + match + '"', match.replace(/\$\$/g, '').replace('\\\\', '\\'));
  }, loadersString);
  var webpackConfig = defaultFiles['webpack.config.js'].replace(
    '$LOADERS$',
    loadersString
  )
  var zip = new Zip();

  req.session.files.forEach(function (file) {
    if (file.name === 'index.html') {
      zip.file('src/index.tpl.html', memoryFs.getSessionFile(req.session.id, file.name))
    } else {
      zip.file('src/' + file.name, memoryFs.getSessionFile(req.session.id, file.name))
    }
    if (file.isEntry) {
      webpackConfig = webpackConfig.replace(/\$ENTRY_FILENAME\$/g, file.name)
    }
  });

  zip.file('package.json', JSON.stringify(packageJson, null, 2));
  zip.file('README.md', defaultFiles['README.md']);
  zip.file('webpack.config.js', webpackConfig);

  var data = zip.generate({base64:false,compression:'DEFLATE'});
  res.setHeader("Content-Type", mime.lookup('project.zip'));
  res.setHeader("Content-Length", data.length);
  res.send(new Buffer(data, 'binary'));
};
