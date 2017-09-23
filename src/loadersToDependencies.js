module.exports = function (loaders) {
  return Object.keys(loaders).reduce(function (depLoaders, loader) {

    if (loader === 'babel') {
      depLoaders['babel-core'] = '^6.23.1';
      depLoaders['babel-loader'] = '^6.2.10';
      if (loaders[loader].es2015) {
        depLoaders['babel-preset-es2015'] = '^6.22.0';
      }
      if (loaders[loader].react) {
        depLoaders['babel-preset-react'] = '^6.5.0';
      }
      if (loaders[loader].stage0) {
        depLoaders['babel-preset-stage-0'] = '^6.5.0';
      }
      if (loaders[loader].jsx) {
        depLoaders['babel-plugin-transform-react-jsx'] = '^6.23.0';
      }
      if (loaders[loader].decorators) {
        depLoaders['babel-plugin-transform-decorators-legacy'] = '^1.3.4';
      }
      if (loaders[loader].classProperties) {
        depLoaders['babel-plugin-transform-class-properties'] = '^6.23.0';
      }
      if (loaders[loader].inferno) {
        depLoaders['babel-plugin-inferno'] = '^1.9.0';
      }
    }

    if (loader === 'css') {
      depLoaders['style-loader'] = '^0.13.0';
      depLoaders['css-loader'] = '^0.23.1';
    }

    if (loader === 'css' && loaders[loader].less) {
      depLoaders['less-loader'] = '^2.2.2';
    }

    if (loader === 'css' && loaders[loader].sass) {
      depLoaders['sass-loader'] = '^3.1.2';
    }

    if (loader === 'typescript') {
      depLoaders['ts-loader'] = '2.0.0';
      depLoaders['typescript'] = '2.0.10';
    }

    if (loader === 'coffeescript') {
      depLoaders['coffee-loader'] = '^0.7.2';
    }

    if (loader === 'raw') {
      depLoaders['raw-loader'] = '^0.5.1';
    }

    if (loader === 'json') {
      depLoaders['json-loader'] = '^0.5.4';
    }

    if (loader === 'pug') {
      depLoaders['pug'] = '^2.0.0-beta11';
      depLoaders['pug-loader'] = '^2.3.0';
    }

    if (loader === 'handlebars') {
      depLoaders['handlebars'] = '^4.0.5';
      depLoaders['handlebars-loader'] = '^1.1.4';
    }

    if (loader === 'vue') {
      depLoaders['vue-loader'] = '^8.2.1';
    }

    return depLoaders;

  }, {});
};
