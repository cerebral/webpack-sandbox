
module.exports = function (currentLoaders) {

  var loaders = [];

  if (!currentLoaders) {
    return loaders;
  }

  // BABEL
  if (currentLoaders.babel) {
    var loader = {
      test: /\.js?$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: [],
        plugins: []
      }
    };
    if (currentLoaders.babel.es2015) {
      loader.query.presets.push(require.resolve('babel-preset-es2015'));
    }
    if (currentLoaders.babel.react) {
      loader.query.presets.push(require.resolve('babel-preset-react'));
    }
    if (currentLoaders.babel.stage0) {
      loader.query.presets.push(require.resolve('babel-preset-stage-0'));
    }
    if (currentLoaders.babel.jsx) {
      loader.query.plugins.push([
        require.resolve('babel-plugin-transform-react-jsx'), {
          pragma: currentLoaders.babel.jsx.pragma
        }
      ]);
    }
    if (currentLoaders.babel.decorators) {
      loader.query.plugins.push(require.resolve('babel-plugin-transform-decorators-legacy'))
    }
    if (currentLoaders.babel.classProperties) {
      loader.query.plugins.push(require.resolve('babel-plugin-transform-class-properties'))
    }
    if (currentLoaders.babel.inferno) {
      loader.query.plugins.push(require.resolve('babel-plugin-inferno'))
    }

    loaders.push(loader);
  }

  // CSS
  if (currentLoaders.css) {

    var loader = {
      test: /\.css?$/,
      loader: 'style-loader!css-loader'
    }

    if (currentLoaders.css.modules) {
      loader.loader = 'style-loader!css-loader?modules&localIdentName=[name]---[local]---[hash:base64:5]';
    }
    loaders.push(loader);
  }

  // TYPESCRIPT
  if (currentLoaders.typescript) {
    var loader = {
      test: /\.ts?$|\.tsx?$/,
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
        isolatedModules: true,
        silent: true,
        files: ['just-a-hack'],
        compilerOptions: {
          jsx: 'react',
          target: 'es5'
        }
      }
    }
    loaders.push(loader);
  }

  // CoffeeScript
  if (currentLoaders.coffeescript) {
    var loader = {
      test: /\.coffee?$/,
      loader: 'coffee-loader'
    }
    loaders.push(loader);
  }

  // Less
  if (currentLoaders.css && currentLoaders.css.less) {
    var loader = {
      test: /\.less?$/,
      loader: 'style-loader!css-loader!less-loader'
    }
    loaders.push(loader);
  }

  // Sass
  if (currentLoaders.css && currentLoaders.css.sass) {
    var loader = {
      test: /\.scss?$/,
      loader: 'style-loader!css-loader!sass-loader'
    }
    loaders.push(loader);
  }

  // HTML
  if (currentLoaders.raw) {
    var loader = {
      test: /\.html?$/,
      loader: 'raw-loader'
    }
    loaders.push(loader);
  }

  // JSON
  if (currentLoaders.json) {
    var loader = {
      test: /\.json?$/,
      loader: 'json-loader'
    }
    loaders.push(loader);
  }

  // PUG
  if (currentLoaders.pug) {
    var loader = {
      test: /\.pug?$/,
      loader: 'pug-loader'
    }
    loaders.push(loader);
  }

  // HANDLEBARS
  if (currentLoaders.handlebars) {
    var loader = {
      test: /\.handlebars?$/,
      loader: 'handlebars-loader'
    }
    loaders.push(loader);
  }

  // VUE
  if (currentLoaders.vue) {
    var loader = {
      test: /\.vue?$/,
      loader: 'vue-loader'
    }
    loaders.push(loader);
  }

  return loaders;
};
