var browserify = require('browserify')
var gulp = require('gulp')
var gutil = require('gulp-util')
var jshint = require('gulp-jshint')
var nodemon = require('gulp-nodemon')
var plumber = require('gulp-plumber')
var react = require('gulp-react')
var sass = require('gulp-sass');
var source = require('vinyl-source-stream')
var streamify = require('gulp-streamify')
var uglify = require('gulp-uglify')
var mocha = require('gulp-mocha');
var del = require('del');
var exit = require('gulp-exit');

var jsSrcPaths = './src/**/*.js*'
var jsLibPaths = './lib/**/*.js'
//TODO: Not sure if we need to delete all occurance of @insin as it is the name of the repo creator on https://github.com/insin/isomorphic-lab
var bundledDeps = [
    'setimmediate',
    'events',
    'react',
    '@insin/react-router',
    'superagent-ls',
    'newforms',
    'piwik-react-router',
    'react/lib/Object.assign',
    'lodash',
    'dom-scroll-into-view',
    'change-case',
    'moment',
    'superagent-bluebird-promise',
    'async',
    'react-timer-mixin'
]

process.env.NODE_ENV = gutil.env.production ? 'production' : 'development'

gulp.task('mocha-test', function() {
  require ('babel/register');
  require('./test/setup');
    return gulp.src(['test/**/*Test.js'], { read: false })
        .pipe(mocha({
            reporter: 'spec'
        }))
        .pipe(exit());
})

gulp.task('mocha-watch', function() {
  gulp.watch(['src/**', 'test/**'], ['mocha-test']);
})


gulp.task('transpile-js', function() {
  return gulp.src(jsSrcPaths)
    .pipe(plumber())
    .pipe(react({harmony: true}))
    .pipe(gulp.dest('./lib'))
})

gulp.task('lint-js', ['transpile-js'], function() {
  return gulp.src(jsLibPaths)
    .pipe(jshint('./.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
})

gulp.task('bundle-js', ['lint-js'], function() {
  var b = browserify('./lib/client.js', {
    debug: !!gutil.env.debug,
    detectGlobals: false
  }).ignore('config')
      .ignore('crypto')
      .ignore('sanitizer')
      .ignore('cheerio')
      .ignore('continuation-local-storage')
      .ignore('log4js')
      .ignore('categoryFilter')

  bundledDeps.forEach(function(dep) { b.external(dep) })
  b.transform('envify')

  var stream = b.bundle()
    .pipe(source('app.js'))

  if (gutil.env.production) {
    stream = stream.pipe(streamify(uglify()))
  }

  return stream.pipe(gulp.dest('./static/govuk-fco-etd/js'))
})

gulp.task('bundle-deps', function() {
  var b = browserify({
    debug: !!gutil.env.debug,
    detectGlobals: false
  })
  bundledDeps.forEach(function(dep) { b.require(dep) })
  b.transform('envify')

  var stream = b.bundle()
    .pipe(source('deps.js'))

  if (gutil.env.production) {
    stream = stream.pipe(streamify(uglify()))
  }

  return stream.pipe(gulp.dest('./static/govuk-fco-etd/js'))
})


gulp.task('copy-css', function() {
  gulp.src('./node_modules/govuk-elements/govuk/public/stylesheets/**/*')
      .pipe(gulp.dest('./static/govuk/css'));
});

gulp.task('copy-img', function() {
    gulp.src('./node_modules/govuk-elements/govuk/public/images/**/*')
        .pipe(gulp.dest('./static/govuk/img'));
});

gulp.task('copy-js', function() {
    gulp.src('./node_modules/govuk-elements/govuk/public/javascripts/**/*')
        .pipe(gulp.dest('./static/govuk/js'));
});

gulp.task('sass:govuk', function () {

  var elements = ['./src/sass/govuk-elements/*.scss']

  gulp.src(elements)
      .pipe(sass({
          includePaths:[
            './node_modules/govuk-elements/govuk/public/sass'
            ],
          errLogToConsole: true,
          imagePath: './static/govuk/img'
        }))
      .pipe(gulp.dest('./static/govuk/css'));

});

gulp.task('sass', function () {
  gulp.src('./src/sass/govuk-etd-template.scss')
      .pipe(sass({errLogToConsole: true}))
      .pipe(gulp.dest('./static/govuk-fco-etd/css'));
});

gulp.task('sassetdspecific', function () {
  gulp.src('./src/sass/etdonline-specific.scss')
      .pipe(sass({errLogToConsole: true}))
      .pipe(gulp.dest('./static/css/'));
});

gulp.task('sassmodal', function () {
  gulp.src('./src/sass/modal-dialog.scss')
      .pipe(sass({errLogToConsole: true}))
      .pipe(gulp.dest('./static/css/'));
});

gulp.task('clean:govuk', function() {
  del.sync(['static/govuk/css/**/*','static/govuk/img/**/*','!.gitignore']);
});


gulp.task('clean:lib', function() {
  del.sync(['lib/**/*']); //TODO: deleting the entire directory is not working so deleting the content
});

gulp.task('clean:css', ['clean:govuk'])

gulp.task('clean', ['clean:lib','clean:css' ])

gulp.task('bundle', ['clean', 'sass', 'sassetdspecific', 'sassmodal', 'copy-css', 'sass:govuk', 'copy-img', 'copy-js', 'bundle-deps', 'bundle-js'])

gulp.task('default', ['bundle'])

