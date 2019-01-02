var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
var htmlmin = require('gulp-htmlmin');

gulp.task('html', function () {
    return gulp.src('*.html')
        .pipe(gutil.env.production ? htmlmin({ collapseWhitespace: true }) : gutil.noop())
        .pipe(gulp.dest('/'))
        .on('end', browserSync.reload);
});

gulp.task('scripts', function () {
    return gulp.src(['/codebird.js', '/scripts/*.js'])
        .pipe(sourcemaps.init())
        .pipe(concat('bundle.js'))
        .pipe(gutil.env.production ? uglify() : gutil.noop())
        .pipe(gutil.env.production ? gutil.noop() : sourcemaps.write())
        .pipe(gulp.dest('/scripts'))
        .on('end', browserSync.reload);
});

gulp.task('styles', function () {
    return gulp.src('*.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gutil.env.production ? sourcemaps.write() : gutil.noop())
        .pipe(gutil.env.production ? cssnano({ autoprefixer: false }) : gutil.noop())
        .pipe(gulp.dest('*.css'))
        .pipe(browserSync.stream());
});

gulp.task('default', ['html', 'styles', 'scripts'], function () {
    if (!gulp.env.production) {
        browserSync.init({
            server: {
                baseDir: './'
            }
        });

        gulp.watch('*.html', ['html']);
        gulp.watch('*.css', ['styles']);
        gulp.watch('scripts/*.js', ['scripts']);
    }
});
