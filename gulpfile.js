//var browserify = require('browserify');
var concat = require('gulp-concat');
var karma = require('gulp-karma');
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

var paths = {
  public: 'public/**',
  jade: 'app/**/*.jade',
  styles: 'app/styles/*.+(less|css)',
  scripts: 'app/**/*.js',
  staticFiles: [
    '!app/**/*.+(less|css|js|jade)',
     'app/**/*.*'
  ],
  clientTests: [
      'public/lib/angular/angular.js',
      'public/lib/angular-mocks/angular-mocks.js',
      'public/lib/angular-route/angular-route.js',
      'public/lib/angular-ui-router/release/angular-ui-router.js',
      'public/lib/angular-cookies/angular-cookies.js',
      'public/lib/angular-elastic/elastic.js',
      'public/lib/angular-bootstrap/ui-bootstrap.js',
      'public/lib/hammerjs/hammer.js',
      'public/lib/jquery/dist/jquery.min.js',
      'public/lib/angular-aria/angular-aria.js',
      'public/lib/angular-material/angular-material.js',
      'public/lib/angular-animate/angular-animate.js',
      'public/lib/angular-sanitize/angular-sanitize.js',
      'public/lib/angularfire/dist/angularfire.js',
      'public/lib/moment/moment.js',
      'public/lib/firebase/firebase.js',
      'public/js/index.js',
      'public/lib/lodash/lodash.min.js',
      'public/lib/angular-sortable-view/src/angular-sortable-view.js',
      'test/client/helpers/mocks.js',
      'test/client/**/*.js'],
  serverTests: [
      'test/server/**/*.js']
};

gulp.task('jade', function() {
  console.log('jade called');
  return gulp.src(paths.jade)
    .pipe(jade())
    .pipe(gulp.dest('./public/'));
});


gulp.task('scripts', function() {
  console.log('script called');
  gulp.src(paths.scripts)
    .pipe(gulp.dest('./public/js'));

});
 

gulp.task('inject', ['jade', 'scripts'], function() {
  console.log('inject called');
  var injectOptions = {
    ignorePath: ['public']
  };
 
  return gulp.src('./public/index.html')
    .pipe(inject(gulp.src(bowerFiles(), { read: false }), _.merge({}, injectOptions, { name: 'bower' })))
    .pipe(inject(gulp.src(['./public/js/**/*.js', './public/**/*.css']), injectOptions))
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

/*gulp.task('watchify', function() {
  var bundler = watchify(browserify('./app/application.js', watchify.args));

  bundler.transform(stringify(['.html']));
  // bundler.transform(es6ify);

  bundler.on('update', rebundle);

  function rebundle() {
    return bundler.bundle()
      // log errors if they happen
      .on('success', gutil.log.bind(gutil, 'Browserify Rebundled'))
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source('index.js'))
      .pipe(gulp.dest('./public/js'));
  }
  return rebundle();
});*/

//runs locally only
gulp.task('codeclimate', shell.task([
  'CODECLIMATE_REPO_TOKEN=5bdb37d182c2eee89c140cf44f338a0a20f6bc0ebaa648d7cc660dece14af397 codeclimate < "'+process.env.PWD+'/coverage/Chrome 39.0.2171 (Mac OS X 10.9.5)/lcov.info"'
]));

//runs DB migrations
gulp.task('db-migrate', shell.task([
  'db-migrate up'
]));

/*gulp.task('browserify', function() {
  var b = browserify();
  b.add('./app/application.js');
  return b.bundle()
  .on('success', gutil.log.bind(gutil, 'Browserify Rebundled'))
  .on('error', gutil.log.bind(gutil, 'Browserify Error: in browserify gulp task'))
  .pipe(source('index.js'))
  .pipe(gulp.dest('./public/js'));
});*/

gulp.task('watch',function() {
  gulp.watch([paths.jade, paths.scripts], function() {
    gulp.start('inject');
  });
  gulp.watch(paths.styles, ['less']);
  // gulp.watch(paths.scripts, ['scripts']); //commented Browserify task above and replaced here with scripts task

  gulp.watch([paths.jade, paths.styles, paths.scripts]).on('change', reload);
});

gulp.task('test:client', function() {//remove browserify as a prerequisite
  return gulp.src(paths.clientTests)
  .pipe(karma({
    configFile: 'karma.conf.js',
    action: 'run'
  }));
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

gulp.task('test:one', function() {//remove browserify as a prerequisite
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

gulp.task('build', ['less', 'static-files']);//remove browserify as a prerequisite 
gulp.task('production', ['nodemon','build']);
gulp.task('default', ['nodemon', 'build', 'browser-sync', 'watch']);
gulp.task('heroku:production', ['db-migrate', 'build']);
gulp.task('heroku:staging', ['build']);
gulp.task('test', ['test:client','test:server']);
