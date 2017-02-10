var config = require(`../configs/${process.env.WEBPACK_SANDBOX_ENV}.json`);
var server = require('http').createServer();
var express = require('express');
var compression = require('compression');
var app = express();
var memoryFs = require('./memoryFs');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sessions = require('./sessions.js');
var utils = require('./utils');
var sandbox = require('./sandbox');
var zip = require('./zip');
var cors = require('cors');
var fs = require('fs');
var mime = require('mime')
var preloadPackages = require('./preloadPackages')
var clienttool = fs.readFileSync(path.resolve('src', 'clienttool.js'))
  .toString()
  .replace(/\{\{ORIGIN\}\}/g, JSON.stringify(config.clientOrigin))

// Init
memoryFs.fs.mkdirpSync(path.join('/', 'app'));
setInterval(sessions.clean, config.sessionsCleanInterval);

preloadPackages([
  'style-loader',
  'css-loader'
]);

app.use(cookieParser());
app.use(cors({
  origin: config.clientOrigin,
  credentials: true
}));
app.use(compression())
app.use(bodyParser.json());
app.use(sessions.middleware);

app.post('/', sandbox.updateSandbox);
app.get('/', sandbox.getIndex);
app.get('/project.zip', zip);

// Just for cache busting
app.get('/clienttool/:version', function (req, res) {
  res.setHeader('Cache-Control', 'max-age=31536000');
  res.setHeader('Content-Type', mime.lookup('clienttool.js'));
  res.setHeader('Content-Length', clienttool.length);

  return res.send(clienttool);
})
app.get('/*', sandbox.getFile)

console.log('Running Webpack Sandbox version: ', require('../package.json').version);

var server = app.listen(process.env.NODE_ENV === 'production' ? process.env.PORT : 4000);

process.on('SIGTERM', function () {
  server.close(function () {
    console.log('Graceful shutdown successful');
    process.exit(0);
  });
})
