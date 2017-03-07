var sessionBundler = require('./sessionBundler.js');
var memoryFs = require('./memoryFs');
var utils = require('./utils');
var sessions = require('./sessions');
var path = require('path');
var mime = require('mime');
var fs = require('fs');

var sandbox = {
  updateSandbox: function (req, res, next) {

    var currentEntryFile = utils.getEntry(req.session.files);

    if (utils.hasChangedPackagesOrEntry(req) || !utils.isSameLoaders(req.session.loaders, req.body.loaders)) {
      sessions.removeMiddleware(req);
    }

    sessions.updatePackages(req);
    sessions.updateLoaders(req);
    sessions.updateFiles(req);
    memoryFs.updateSessionFiles(req.session, req.body.files);

    if (req.session.middleware) {
      res.sendStatus(200);
    } else {
      sessionBundler.create(req.session)
        .then(sessions.createBundleMiddleware(req.session))
        .then(function () {
          res.sendStatus(200);
        })
        .catch(function (err) {
          utils.logError(err)
          if (err.code === 'ETIMEDOUT') {
            res.sendStatus(503);
          } else {
            res.send(500);
          }
        });
    }
  },
  getIndex: function (req, res) {
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Expires', '-1');
    res.setHeader('Pragma', 'no-cache');
    res.type('html');

    res.send(memoryFs.getSessionFile(req.session.id, 'index.html'));
  },
  getFile: function (req, res, next) {
    if (!req.session.middleware) {
      return res.sendStatus(404);
    }

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Expires', '-1');
    res.setHeader('Pragma', 'no-cache');

    if (path.basename(req.url) === utils.getEntry(req.session.files)) {
      req.url = '/app/' + req.session.id + '/bundle.js';
      req.session.middleware(req, res, next);
    } else {
      var fileName = path.basename(req.url);
      var content = memoryFs.getSessionFile(req.session.id, fileName)
      if (content === null) {
        return sandbox.getIndex(req, res)
      }
      res.setHeader("Content-Type", mime.lookup(fileName));
      res.setHeader("Content-Length", content.length);
      res.send(content);
    }
  }
};

module.exports = sandbox;
