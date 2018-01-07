

'use strict';

var gulp = require('gulp');
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
                'import { ' + typeCapt + "} from '../src/app/types/" +
                ftype + "';\nconst my" + ftype + ': ' + typeCapt + ' = ';
            
            return start + content;
        }))
        .pipe(gulp.dest(fdest))
        .pipe(exec('tsc temp/testfile.ts', options))
        .pipe(exec.reporter(reportOptions));
});



