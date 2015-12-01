/**
 * Created by Ian on 12/1/2015.
 */
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minify = require('gulp-minify-css');
var underscore = require('underscore');
var underscoreStr = require('underscore.string');
var livereload = require('gulp-livereload');
var del = require('del');

var exclude = [];

gulp.task('scripts', ['bundle-libraries-js'], function() {
    return gulp.src('src/*.js')
        .pipe(concat('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});

gulp.task('styles', ['bundle-libraries-css'], function() {
    return gulp.src('css/*.css')
        .pipe(concat('all.min.css'))
        .pipe(minify())
        .pipe(gulp.dest('dist/css'))
        .pipe(livereload());
});

gulp.task('bundle-libraries-js', function() {
    /*All credit to: https://truongtx.me/2014/07/18/using-bower-with-gulp/ */
    var bowerFile = require('./bower.json');
    var bowerPackages = bowerFile.dependencies;
    var bowerDir = './bower_components';
    var packagesOrder = [];
    var mainFiles = [];

    // Function for adding package name into packagesOrder array in the right order
    function addPackage(name) {
        // package info and dependencies
        var info = require(bowerDir + '/' + name + '/bower.json');
        var dependencies = info.dependencies;

        // add dependencies by repeat the step
        if (!!dependencies) {
            underscore.each(dependencies, function (value, key) {
                if (exclude.indexOf(key) === -1) {
                    addPackage(key);
                }
            });
        }

        // and then add this package into the packagesOrder array if they are not exist yet
        if (packagesOrder.indexOf(name) === -1) {
            packagesOrder.push(name);
        }
    }

    // calculate the order of packages
    underscore.each(bowerPackages, function (value, key) {
        if (exclude.indexOf(key) === -1) { // add to packagesOrder if it's not in exclude
            addPackage(key);
        }
    });

    // get the main files of packages base on the order
    underscore.each(packagesOrder, function (bowerPackage) {
        var info = require(bowerDir + '/' + bowerPackage + '/bower.json');
        var main = info.main;
        var mainFile = main;

        // get only the .js file if mainFile is an array
        if (underscore.isArray(main)) {
            underscore.each(main, function (file) {
                if (underscoreStr.endsWith(file, '.js')) {
                    mainFile = file;
                }
            });
        }

        // make the full path
        mainFile = bowerDir + '/' + bowerPackage + '/' + mainFile;

        // only add the main file if it's a js file
        if (underscoreStr.endsWith(mainFile, '.js')) {
            mainFiles.push(mainFile);
        }
    });

    // run the gulp stream
    return gulp.src(mainFiles)
        .pipe(concat('libs.js'))
        .pipe(gulp.dest('./src'));
});

gulp.task('bundle-libraries-css', function() {
    /*All credit to: https://truongtx.me/2014/07/18/using-bower-with-gulp/ */
    var bowerFile = require('./bower.json');
    var bowerPackages = bowerFile.dependencies;
    var bowerDir = './bower_components';
    var packagesOrder = [];
    var mainFiles = [];

    // Function for adding package name into packagesOrder array in the right order
    function addPackage(name) {
        // package info and dependencies
        var info = require(bowerDir + '/' + name + '/bower.json');
        var dependencies = info.dependencies;

        // add dependencies by repeat the step
        if (!!dependencies) {
            underscore.each(dependencies, function (value, key) {
                if (exclude.indexOf(key) === -1) {
                    addPackage(key);
                }
            });
        }

        // and then add this package into the packagesOrder array if they are not exist yet
        if (packagesOrder.indexOf(name) === -1) {
            packagesOrder.push(name);
        }
    }

    // calculate the order of packages
    underscore.each(bowerPackages, function (value, key) {
        if (exclude.indexOf(key) === -1) { // add to packagesOrder if it's not in exclude
            addPackage(key);
        }
    });

    // get the main files of packages base on the order
    underscore.each(packagesOrder, function (bowerPackage) {
        var info = require(bowerDir + '/' + bowerPackage + '/bower.json');
        var main = info.main;
        var mainFile = main;

        // get only the .js file if mainFile is an array
        if (underscore.isArray(main)) {
            underscore.each(main, function (file) {
                if (underscoreStr.endsWith(file, '.css')) {
                    mainFile = file;
                }
            });
        }

        // make the full path
        mainFile = bowerDir + '/' + bowerPackage + '/' + mainFile;

        // only add the main file if it's a js file
        if (underscoreStr.endsWith(mainFile, '.css')) {
            mainFiles.push(mainFile);
        }
    });

    // run the gulp stream
    return gulp.src(mainFiles)
        .pipe(concat('libs.css'))
        .pipe(gulp.dest('./css'));
});

gulp.task('clean', function() {
    return del(['dist/']);
});

gulp.task('watch', function() {
    livereload.listen();
    gulp.watch('css/style.css', ['styles']);
});

gulp.task('default', ['clean'], function() {
    gulp.start('clean');
    gulp.start('bundle-libraries-css');
    gulp.start('bundle-libraries-js');
    gulp.start('scripts');
    gulp.start('styles');
});