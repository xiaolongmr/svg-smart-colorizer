const path = require('path');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'svg-smart-colorizer.min.js' : 'svg-smart-colorizer.js',
      library: 'SVGSmartColorizer',
      libraryTarget: 'umd',
      libraryExport: 'default',
      globalObject: 'typeof self !== \'undefined\' ? self : this'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: {
                      browsers: ['> 1%', 'last 2 versions', 'not ie <= 8']
                    },
                    modules: false
                  }
                ]
              ]
            }
          }
        }
      ]
    },
    resolve: {
      extensions: ['.js']
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    optimization: {
      minimize: isProduction
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'examples')
      },
      compress: true,
      port: 8080,
      open: true,
      hot: true
    }
  };
};