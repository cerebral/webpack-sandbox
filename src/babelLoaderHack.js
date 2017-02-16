var path = require('path')
var m = require('module')

var ex = m._nodeModulePaths
var node_modules = path.resolve('node_modules')
m._nodeModulePaths = function () {
  var result = ex.apply(m, arguments)

  return result.concat(result.indexOf(node_modules) === -1 ? node_modules : [])
}
