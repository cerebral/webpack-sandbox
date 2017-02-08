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
      return now - sessions[key].lastUpdate < 60 * 1000 * 30; // Clean up after 30 min of inactivity
    }).reduce(function (remainingSessions, key) {
      remainingSessions[key] = sessions[key];
      return remainingSessions;
    }, {});
  },
  middleware: function (req, res, next) {
    if (req.cookies.webpacksandbox && sessionsModule.get(req.cookies.webpacksandbox)) {
      req.session = sessionsModule.get(req.cookies.webpacksandbox);
    } else {
      var id = uuid.v4();
      req.session = sessionsModule.set(id);
      res.cookie('webpacksandbox', String(id), {
        maxAge: 3600000 * 24, // One day
        domain: utils.isProduction() ? '.webpackbin.com' : '',
        httpOnly: true
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
