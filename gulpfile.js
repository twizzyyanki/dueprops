var concat = require('gulp-concat');
var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var gutil = require('gulp-util');
var shell = require('gulp-shell');
var jade = require('gulp-jade');
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var nodemon = require('gulp-nodemon');
var path = require('path');
var protractor = require('gulp-protractor').protractor;
var source = require('vinyl-source-stream');
var stringify = require('stringify');
var watchify = require('watchify');
var mocha = require('gulp-mocha');
var exit = require('gulp-exit');
var modRewrite = require('connect-modrewrite');
var inject = require('gulp-inject');
var bowerFiles = require('main-bower-files');
var _ = require('lodash');
var bower = require('gulp-bower');
var image = require('gulp-image');
var run = require('run-sequence');

var paths = {
  public: 'public/**',
  jade: 'app/**/*.jade',
  styles: 'app/styles/*.+(less|css)',
  scripts: [
    'app/**/*.js',
    '!app/spec/**/*.spec.js'
  ],
  staticFiles: [
    '!app/**/*.+(less|css|js|jade)',
     'app/**/*.*'
  ]
};

gulp.task('jade', function() {
  console.log('jade called');
  return gulp.src(paths.jade)
    .pipe(jade())
    .pipe(gulp.dest('./public/'));
});

gulp.task('concat', function() {
  return gulp.src(paths.scripts)
    .pipe(concat('index.js'))
    .pipe(gulp.dest('./public/js'));
});

gulp.task('image', function () {
  gulp.src('./app/images/*')
    .pipe(image())
    .pipe(gulp.dest('./public/img'));
});

gulp.task('scripts', function() {
  console.log('script called');
  gulp.src(paths.scripts)
    .pipe(gulp.dest('./public/js'));

});

gulp.task('inject', ['jade'], function() {
  console.log('inject called');
  var injectOptions = {
    ignorePath: ['public']
  };
 
  return gulp.src('./public/index.html')
    .pipe(inject(gulp.src(bowerFiles(), { read: false }), _.merge({}, injectOptions, { name: 'bower' })))
    .pipe(inject(gulp.src(['./public/js/**/*.js', './public/**/*.css']), injectOptions))
    .pipe(inject(gulp.src('./public/js/**/*.js'), injectOptions))
    .pipe(gulp.dest('./public'));
});

gulp.task('browser-sync', ['inject'], function() {
  console.log('browser-sync called');
  browserSync({
    server: {
      baseDir: "./public",
      middleware: [
        modRewrite([
          '!\\.\\w+$ /index.html [L]'
        ])
      ]
    }
  });
});

gulp.task('bower', function() {
  return bower()
    .pipe(gulp.dest('public/bower_components/'));
});

gulp.task('less', function () {
  console.log('less called');
  gulp.src(paths.styles)
    .pipe(less({
      paths: [ path.join(__dirname, 'styles') ]
    }))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('static-files',function(){
  console.log('static called');
  return gulp.src(paths.staticFiles)
    .pipe(gulp.dest('public/'));
});

gulp.task('lint', function () {
  gulp.src(['./app/**/*.js','./index.js','./lib/**/*.js','./workers/**/*.js','./config/**/*.js']).pipe(jshint())
  .pipe(jshint.reporter('default'));
});

gulp.task('nodemon', function () {
  nodemon({ script: 'index.js', ext: 'js', ignore: ['public/**','app/**','node_modules/**'] })
    .on('restart',['jade','less'], function () {
      console.log('>> node restart');
    });
});

//runs locally only
gulp.task('codeclimate', shell.task([
  'CODECLIMATE_REPO_TOKEN=5bdb37d182c2eee89c140cf44f338a0a20f6bc0ebaa648d7cc660dece14af397 codeclimate < "'+process.env.PWD+'/coverage/Chrome 39.0.2171 (Mac OS X 10.9.5)/lcov.info"'
]));

gulp.task('watch',function() {
  gulp.watch([paths.jade, paths.scripts], function() {
    gulp.start('inject');
  });
  gulp.watch(paths.styles, ['less']);

  gulp.watch([paths.jade, paths.styles, paths.scripts]).on('change', reload);
});

gulp.task('test:client', function() {
  var karma = require('karma').server;
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  });
});

gulp.task('test:server', ['test:client'], function() {
  return gulp.src(paths.serverTests)
  .pipe(mocha({
    reporter: 'spec',
    timeout: 50000
  }))
  .pipe(exit());
});

gulp.task('test:e2e',function(cb) {
  gulp.src(['./test/e2e/**/*.js'])
  .pipe(protractor({
    configFile: 'protractor.conf.js',
    args: ['--baseUrl', 'http://127.0.0.1:8000']
  }))
  .on('error', function(e) {
      console.log(e);
  })
  .on('end', cb);
});

gulp.task('test:one', function() {
  var argv = process.argv.slice(3);

  var testPaths = paths.clientTests;
  testPaths = testPaths.splice(0, testPaths.length-1);

  if(argv[0] === '--file' && argv[1] !== undefined) {
    testPaths.push(argv[1].trim());
  }
  return gulp.src(testPaths)
  .pipe(karma({
    configFile: 'karma.conf.js',
    action: 'run'
  }))
  .on('error', function(err) {
    throw err;
  });
});

gulp.task('build', ['bower'], function() {
  run(['less', 'jade', 'image', 'concat', 'inject', 'static-files']);
});

gulp.task('build:dev', ['bower'], function() {
  run(['less', 'jade', 'image', 'scripts', 'inject', 'static-files']);
});

gulp.task('default', ['nodemon', 'build:dev', 'browser-sync', 'watch']);
gulp.task('heroku:production', ['build']);
gulp.task('heroku:staging', ['build']);
gulp.task('test', ['test:client', 'test:server']);
