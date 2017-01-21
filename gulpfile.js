

'use strict';

var browserify = require('browserify');
var babelify = require('babelify');
var uglify = require('gulp-uglify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var glob = require('glob');
var debug = require('gulp-debug');
var del = require('del');

var path = require('path');
var join = path.join;

var config = {
    baseFolder: '',
    sourceFolder: 'src/',
    buildFolder: 'build/',
    bundleName: 'app.js',
    index: 'index.html'
};

gulp.task('clean', function(cb) {
    del([config.buildFolder], cb);
});

gulp.task('copy', function(){
    return gulp.src(join(config.sourceFolder, config.index))
            .pipe(gulp.dest(config.buildFolder));
})

gulp.task('browserify', function () {
    var b = browserify({
        transform: [["babelify", { presets: ["es2015"]}]],
        entries: glob.sync(join(config.sourceFolder, '/**/*.js')),
        // debug: true,
        paths: [config.sourceFolder]
    });

    return b.bundle()
        .pipe(source(config.bundleName))
        // .pipe(debug())
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
            // .pipe(uglify())
            .on('error', gutil.log)
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(config.buildFolder));
});

gulp.task('build', ['clean', 'browserify', 'copy']);



