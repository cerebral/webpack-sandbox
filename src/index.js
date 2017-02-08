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
var preLoadPackages = require('./preLoadPackages')
var clienttool = fs.readFileSync(path.resolve('src', 'clienttool.js'))
  .toString()
  .replace(/\{\{ORIGIN\}\}/g, JSON.stringify('http://localhost:3000'))

// Init
memoryFs.fs.mkdirpSync(path.join('/', 'app'));
setInterval(sessions.clean, 60 * 1000 * 60 * 5);

preLoadPackages([
  'style-loader',
  'css-loader'
]);

app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
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
  res.setHeader("Content-Type", mime.lookup('clienttool.js'));
  res.setHeader("Content-Length", clienttool.length);

  return res.send(clienttool);
})
app.get('/*', sandbox.getFile)

console.log('Running Webpack Sandbox version: ', require('../package.json').version);

app.listen(process.env.NODE_ENV === 'production' ? process.env.PORT : 4000);
