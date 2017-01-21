

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
var runSequence = require('run-sequence');

var path = require('path');
var join = path.join;

var config = {
    baseFolder: '',
    sourceFolder: 'src/',
    assetsFolder: 'assets/',
    buildFolder: 'build/',
    bundleName: 'app.js',
    index: 'index.html'
};

gulp.task('clean', function(cb) {
    del([
        join(config.buildFolder, 'assets/**'),
        join(config.buildFolder, '**')
    ], cb);
});

function addOne(value) {
    return value + 1;
}

gulp.task('copyindex', function(){
    return gulp.src(join(config.sourceFolder, config.index))
            .pipe(gulp.dest(config.buildFolder));
});

gulp.task('copyassets', function(){
    return gulp.src(join(config.assetsFolder, '**/*'))
        .pipe(gulp.dest(join(config.buildFolder, 'assets'), { overwrite: true }))
});

gulp.task('copy', function(cb) {
    return runSequence('copyindex', 'copyassets', cb);
});

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

gulp.task('build', function(cb) {
    return runSequence('clean', 'copy', 'browserify', cb);
});



