var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    browserSync = require('browser-sync').create(),
    pug = require('gulp-pug'),
    concat = require('gulp-concat'),
    postcss = require('gulp-postcss'),
    uglify = require('gulp-uglifyjs'),
    babel = require('gulp-babel');

gulp.task('browser-sync', ['styles', 'pug', 'js'], function() {

    browserSync.init({

        server: {
            baseDir: "./app"
        },

        notify: false

    });

});

gulp.task('styles', function() {

    return gulp.src('sass/*.sass')
        .pipe(sass({
            includePaths: require('node-bourbon').includePaths,
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        // .pipe(rename({suffix: '.min', prefix : ''}))
        .pipe(autoprefixer({ browsers: ['last 15 versions'], cascade: false }))
        // .pipe(minifycss())
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.stream());

});

gulp.task('pug', function buildHTML() {

    return gulp.src(['pug/*.pug', '!pug/_*.pug'])
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest('app'));

});

gulp.task('js', function() {

     gulp.src('js/common.js')
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(gulp.dest('app/js'))

});

gulp.task('watch', function() {

    gulp.watch('sass/**/*.sass', ['styles']);
    gulp.watch('pug/**/*.pug', ['pug']);
    gulp.watch('js/**/*.js', ['js']).on("change", browserSync.reload);
    gulp.watch('app/js/**/*.js').on("change", browserSync.reload);
    gulp.watch('app/**/*.html').on('change', browserSync.reload);

});

gulp.task('default', ['browser-sync', 'watch']);