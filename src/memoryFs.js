var MemoryFileSystem = require('memory-fs');
var path = require('path');
var fs = new MemoryFileSystem();
var utils = require('./utils');
var config = require('../config')[process.env.WEBPACK_WS_ENV || 'dev'];

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
            '   <script src="/clienttool/v1" crossorigin></script>',
            session.packages ? '   <script src="' + config.dllServiceUrl + '/' + utils.getDllName(session.packages) + '/dll.js"></script>' : '',
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
  }
};
