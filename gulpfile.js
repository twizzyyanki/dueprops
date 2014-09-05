var path = require('path'),
    gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    jshint = require('gulp-jshint'),
    less = require('gulp-less'),
    livereload = require('gulp-livereload'),
    usemin = require('gulp-usemin'),
    uglify = require('gulp-uglify'),
    minifyHtml = require('gulp-minify-html'),
    minifyCss = require('gulp-minify-css'),
    rev = require('gulp-rev'),
    jade = require('gulp-jade');

var paths = {
  public: 'public/**',
  jade: 'app/**/*.jade',
  styles: 'app/styles/*.+(less|css)'
}

gulp.task('lint', function () {
  gulp.src('./**/*.js').pipe(jshint())
});

gulp.task('nodemon', function () {
  nodemon({ script: 'index.js', ext: 'js' })
    .on('change', ['lint'])
    .on('restart', function () {
      console.log('>> node restart');
    })
});

gulp.task('less', function () {
  gulp.src(paths.styles)
    .pipe(less({
      paths: [ path.join(__dirname, 'styles') ]
    }))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('jade', function() {
  gulp.src('./app/*.jade')
    .pipe(jade())
    .pipe(gulp.dest('./public/'))
});

gulp.task('watch', function() {
  livereload.listen({ port: 35729 });
  gulp.watch(paths.jade, ['jade']);
  gulp.watch(paths.styles, ['less']);
  gulp.watch(paths.public).on('change',livereload.changed);
});

gulp.task('usemin', function() {
  gulp.src('app/**/*.hbs')
    .pipe(usemin({
      css: [minifyCss(), 'concat'],
      html: [minifyHtml({empty: true})],
      js: [uglify(), rev()]
    }))
    .pipe(gulp.dest('build/'));
});

gulp.task('default', ['nodemon','less','watch']);
