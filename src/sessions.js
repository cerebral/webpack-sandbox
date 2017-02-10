var config = require(`../configs/${process.env.WEBPACK_SANDBOX_ENV}.json`);
var utils = require('./utils.js');
var path = require('path');
var uuid = require('uuid');
var middleware = require('./middleware');
var sessions = {};

var sessionsModule = {
  get: function (id) {
    var session = sessions[id];
    if (session) {
      sessions[id].lastUpdate = Date.now();
    }
    return session;
  },
  set: function (id) {
    sessions[id] = {id: id, lastUpdate: Date.now(), files: []};

    return sessions[id];
  },
  update: function (id, key, value) {
    sessions[id][key] = value;
    return sessions[id];
  },
  clean: function () {
    var now = Date.now();
    sessions = Object.keys(sessions).filter(function (key) {
      return now - sessions[key].lastUpdate < config.sessionsMaxAge;
    }).reduce(function (remainingSessions, key) {
      remainingSessions[key] = sessions[key];
      return remainingSessions;
    }, {});
  },
  middleware: function (req, res, next) {
    if (req.cookies.webpack_sandbox && sessionsModule.get(req.cookies.webpack_sandbox)) {
      req.session = sessionsModule.get(req.cookies.webpack_sandbox);
    } else {
      var id = uuid.v4();
      req.session = sessionsModule.set(id);
      res.cookie('webpack_sandbox', String(id), {
        maxAge: config.cookie.maxAge,
        domain: config.cookie.domain,
        httpOnly: true,
        secure: Boolean(config.cookie.secure)
      });
    }
    next();
  },
  createBundleMiddleware: function (session) {
    return function (compiler) {
      if (!compiler) {
        return null;
      }
      var sessionMiddleware = middleware(compiler, {
        lazy: true,
        filename: new RegExp(session.id),
        publicPath: path.join('/', 'app', session.id),
        stats: {
          colors: true,
          hash: false,
          timings: true,
          chunks: true,
          chunkModules: false,
          modules: false
        }
      });
      sessionsModule.update(session.id, 'middleware', sessionMiddleware);
    };
  },
  updatePackages: function (req) {
    sessions[req.session.id].packages = req.body.packages;
  },
  removeMiddleware: function (req) {
    delete sessions[req.session.id].middleware;
  },
  updateLoaders: function (req) {
    sessions[req.session.id].loaders = req.body.loaders;
  },
  updateFiles: function (req) {
    sessions[req.session.id].files = req.body.files.map(function (file) {
      return {
        name: file.name,
        isEntry: Boolean(file.isEntry)
      };
    });
  }
};

module.exports = sessionsModule;
