

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
var yargs = require('yargs');
var path = require('path');
var join = path.join;


var config = {
    baseFolder: '',
    sourceFolder: 'src/',
    assetsFolder: 'assets/',
    buildFolder: 'build/',
    temp: 'temp/',
    bundleName: 'app.js',
    index: 'index.html'
};

gulp.task('clean', function(cb) {
    del([
        config.temp,
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

gulp.task('typecheck', function(cb) {
    var argv = yargs.argv;
    var modifyFile = require('gulp-modify-file')
    var exec = require('gulp-exec');
    var rename = require("gulp-rename");
    var fs = require('fs');

    var fpath = argv.file;
    var ftype = argv.type;
    var fdest = join(config.temp);

    var options = {
        continueOnError: true,
    };
    var reportOptions = {
        err: true, // default = true, false means don't write err 
        stderr: true, // default = true, false means don't write stderr 
        stdout: true // default = true, false means don't write stdout 
    };

    console.log('If nothing is output for a file, it is good to go!');
    console.log('Testing file', fpath);
    
    return gulp.src(fpath)
        .pipe(rename(function (path) {
            path.basename = "testfile";
            path.extname = ".ts"
        }))
        .pipe(modifyFile((content, path, file) => {
            // const start = fs.readFileSync('types/dummy.ts');
            const typeCapt = ftype[0].toUpperCase() + ftype.slice(1, ftype.length);
            const start = 
                'import { ' + typeCapt + "} from '../types/" +
                ftype + "';\nconst my" + ftype + ': ' + typeCapt + ' = ';
            
            return start + content;
        }))
        .pipe(gulp.dest(fdest))
        .pipe(exec('tsc temp/testfile.ts', options))
        .pipe(exec.reporter(reportOptions));
});



