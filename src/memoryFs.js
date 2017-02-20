var MemoryFileSystem = require('memory-fs');
var path = require('path');
var fs = new MemoryFileSystem();
var utils = require('./utils');
var config = require(`../configs/${process.env.WEBPACK_SANDBOX_ENV}.json`)
var md5File = require('md5-file');
var clienttoolHash = md5File.sync(path.resolve('src', 'clienttool.js'))

module.exports = {
  fs: fs,
  updateSessionFiles: function (session, files) {
    if (!fs.existsSync(path.join('/', 'app', session.id))) {
      fs.mkdirpSync(path.join('/', 'app', session.id));
    }
    files.forEach(function (file) {
      if (file.name === 'index.html') {
        fs.writeFileSync(
          path.join('/', 'app', session.id, file.name),
          file.content.replace('</head>', [
            '   <script src="/clienttool/' + clienttoolHash + '" crossorigin></script>',
            utils.sessionHasPackages(session) ? '   <script src="' + config.dllServiceUrl + '/' + encodeURIComponent(utils.getDllName(session.packages)) + '/dll.js" crossorigin></script>' : '',
            '</head>'
          ].join('\n'))
        );
      } else {
        fs.writeFileSync(
          path.join('/', 'app', session.id, file.name),
          file.content || ' '
        );
      }
    });

    var filesToDelete = session.files.filter(function (sessionFile) {
      return !files.filter(function (passedFile) {
        return passedFile.name === sessionFile.name;
      }).length;
    });

    filesToDelete.forEach(function (file) {
      fs.unlinkSync(path.join('/', 'app', session.id, file.name));
    });
  },
  getSessionFile: function (sessionId, fileName) {
    var pathToFile = path.join('/', 'app', sessionId, fileName);
    if (!fs.existsSync(pathToFile)) {
      return null;
    }
    return fs.readFileSync(pathToFile).toString();
  },
  clear: function (sessionId) {
    var pathToSandbox = path.join('/', 'app', sessionId);
    var filesToRemove = fs.readdirSync(pathToSandbox);

    filesToRemove.forEach(function (fileName) {
      fs.unlinkSync(path.join(pathToSandbox, fileName));
    });

    fs.rmdirSync(pathToSandbox);
  }
};
