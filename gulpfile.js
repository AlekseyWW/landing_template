const { src, dest, series, watch } = require('gulp');
const postcss    = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const template = require('gulp-template');
const livereload = require('gulp-livereload');
const http = require('http');
const st = require('st');
const imagemin = require('gulp-imagemin');
const plumber = require('gulp-plumber');
const webpack = require('webpack-stream');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
const eslint = require('gulp-eslint');
const del = require('del');


process.env.NODE_ENV = 'development';

function setEnv(mode) {
  return cb => {
    process.env.NODE_ENV = mode;
    cb()
  }
}

function clean(cb) {
  return del('build').then(() => {
    cb()
  })
}

function css() {
    return src('src/css/main.css')
        .pipe( sourcemaps.init() )
        .pipe( postcss([ require('precss'), require('autoprefixer') ]) )
        .pipe( rename({ basename: 'style' }) )
        .pipe( sourcemaps.write('.') )
        .pipe( dest('build/css') )
        .pipe(livereload())
}

function javascript() {
  return src('src/js/main.js')
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(webpack({
      mode: process.env.NODE_ENV,
      output: {
        filename: '[name].min.js',
      },
      optimization: {
        chunkIds: "named",
        splitChunks: {
          cacheGroups: {
            commons: {
              chunks: "initial",
              minChunks: 2,
              maxInitialRequests: 5, // The default limit is too small to showcase the effect
              minSize: 0 // This is example is too small to create commons chunks
            },
            vendor: {
              test: /node_modules/,
              chunks: "initial",
              name: "vendor",
              priority: 10,
              enforce: true
            }
          }
        }
      },
      module: {
        rules: [
          {
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            }
          }
        ]
      },
      plugins: [
        new CircularDependencyPlugin(),
        new DuplicatePackageCheckerPlugin()
      ]
    }))
    .pipe(dest('build/js'))
    .pipe(livereload())
}

function images() {
    return src('src/img/**/*.{gif,png,jpg,svg,webp}')
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({
        quality: 75,
        progressive: true
      }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: true },
          { cleanupIDs: false }
        ]
      })
    ]))
    .pipe(dest('build/img'))
    .pipe(livereload())
};

function html() {
    return src('src/index.html')
    .pipe(template(require('./data.json'), {
        interpolate: /{{(.+?)}}/gs
    }))
    .pipe(dest('build/'))
    .pipe(livereload());
}

function fonts() {
    return src('src/fonts/*')
    .pipe(dest('build/fonts'))
    .pipe(livereload())
}

exports.default = function() {
    setEnv('development');
    http.createServer(
        st({ path: __dirname + '/build', index: 'index.html', cache: false })
    ).listen(8000, function(){
        watch('src/css/**/*.css',{ ignoreInitial: false }, css);
        watch('src/js/*.js', { ignoreInitial: false }, javascript);
        watch('src/index.html', { ignoreInitial: false }, html);
        watch('data.json', { ignoreInitial: false }, html);
        watch('src/img/**/*', { ignoreInitial: false }, images);
        watch('src/fonts/*', { ignoreInitial: false }, fonts);
        livereload.listen();
    });
};
  

exports.build = series(setEnv('production'), clean, javascript, css, images, html, fonts);