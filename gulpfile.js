'use strict';

var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync'),
    concat = require('gulp-concat'),
    csscomb = require('gulp-csscomb'),
    cssmin = require('gulp-clean-css'),
    csso = require('gulp-csso'),
    htmlmin = require('gulp-htmlmin'),
    imagemin = require('gulp-imagemin'),
    importCss = require('gulp-import-css'),
    pug = require('gulp-pug'),
    reload = browserSync.reload,
    rename = require('gulp-rename'),
    rigger = require('gulp-rigger'),
    rimraf = require('rimraf'),
    sass = require('gulp-sass'),
    size = require('gulp-filesize'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    watch = require('gulp-watch');

var path = {
    release: {
        html   : './build/release/',
        fonts  : './build/release/assets/fonts/',
        images : './build/release/assets/images/',
        scripts: './build/release/assets/scripts/',
        styles : './build/release/assets/styles/',
        public : './build/release/'
    },
    develop: {
        html   : './build/develop/',
        fonts  : './build/develop/assets/fonts/',
        images : './build/develop/assets/images/',
        scripts: './build/develop/assets/scripts/',
        styles : './build/develop/assets/styles/',
        public : './build/develop/'
    },
    src: {
        html   : './src/views/**/*.pug',
        fonts  : './src/fonts/**/*.*',
        images : './src/images/**/*.*',
        scripts: './src/components/App/App.js',
        styles : './src/components/App/App.scss',
        public : './src/other/**/*.*'
    },
    watch: {
        html   : './src/**/*.pug',
        fonts  : './src/fonts/**/*.*',
        images : './src/images/**/*.*',
        scripts: './src/components/**/*.js',
        styles : './src/components/**/*.scss',
        public : './src/other/**/*.*'
    }
};

var config = {
    server: {
        baseDir: path.develop.public
    },
    tunnel     : true,
    host       : 'localhost',
    port       : 3000,
    logPrefix  : "SERVER"
};

// HTML
gulp.task('html:develop:build', function() {
    gulp.src(path.src.html)
        .pipe(pug())
        .pipe(gulp.dest(path.develop.html))
        .pipe(reload({ stream: true }));
});

gulp.task('html:release:build', function() {
    gulp.src(path.src.html)
        .pipe(pug())
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(path.release.html));
});

// Styles
gulp.task('styles:develop:build', function() {
    gulp.src(path.src.styles)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['> 1%', 'last 2 versions'],
            cascade : false
        }))
        .pipe(csscomb())
        .pipe(csso())
        .pipe(cssmin())
        .pipe(rename({
            basename: "app",
            suffix  : ".min"
        }))
        .pipe(size())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path.develop.styles))
        .pipe(reload({ stream: true }));
});

gulp.task('styles:release:build', function() {
    gulp.src(path.src.styles)
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['> 1%', 'last 2 versions'],
            cascade : false
        }))
        .pipe(csscomb())
        .pipe(csso())
        .pipe(cssmin())
        .pipe(rename({
            basename: "app",
            suffix  : ".min"
        }))
        .pipe(size())
        .pipe(gulp.dest(path.release.styles));
});

// Scripts
gulp.task('scripts:develop:build', function() {
    gulp.src(path.src.scripts)
        .pipe(rigger())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({
            basename: "app",
            suffix  : ".min"
        }))
        .pipe(size())
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(path.develop.scripts))
        .pipe(reload({ stream: true }));
});

gulp.task('scripts:release:build', function() {
    gulp.src(path.src.scripts)
        .pipe(rigger())
        .pipe(uglify())
        .pipe(rename({
            basename: "app",
            suffix  : ".min"
        }))
        .pipe(size())
        .pipe(gulp.dest(path.release.scripts));
});

// Images
gulp.task('images:develop:build', function() {
    gulp.src(path.src.images)
        .pipe(imagemin())
        .pipe(gulp.dest(path.develop.images))
        .pipe(reload({ stream: true }));
});

gulp.task('images:release:build', function() {
    gulp.src(path.src.images)
        .pipe(imagemin({
            interlaced: true,
            progressive: true,
            optimizationLevel: 5,
            svgoPlugins: [{ removeViewBox: true }]
        }))
        .pipe(gulp.dest(path.release.images))
        .pipe(reload({ stream: true }));
});

// Fonts
gulp.task('fonts:develop:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.develop.fonts));
});

gulp.task('fonts:release:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.release.fonts));
});

// Other
gulp.task('public:develop:build', function() {
    gulp.src(path.src.public)
        .pipe(gulp.dest(path.develop.public));
});

gulp.task('public:release:build', function() {
    gulp.src(path.src.public)
        .pipe(gulp.dest(path.release.public));
});

// Clear
gulp.task('clean:develop:build', function(cb) {
    rimraf(path.develop.public, cb);
});

gulp.task('clean:release:build', function(cb) {
    rimraf(path.release.public, cb);
});

// Watching
gulp.task('develop:watch', function() {
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:develop:build');
    });
    watch([path.watch.styles], function(event, cb) {
        gulp.start('styles:develop:build');
    });
    watch([path.watch.scripts], function(event, cb) {
        gulp.start('scripts:develop:build');
    });
    watch([path.watch.images], function(event, cb) {
        gulp.start('images:develop:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:develop:build');
    });
    watch([path.watch.public], function(event, cb) {
        gulp.start('public:build');
    });
});

// WebServer
gulp.task('develop:webserver', function() {
    browserSync(config);
});

// Build
gulp.task('develop:build', [
    'html:develop:build',
    'fonts:develop:build',
    'images:develop:build',
    'scripts:develop:build',
    'styles:develop:build',
    'public:develop:build'
]);

gulp.task('release:build', [
    'html:release:build',
    'fonts:release:build',
    'images:release:build',
    'scripts:release:build',
    'styles:release:build',
    'public:release:build'
]);

gulp.task('develop', ['develop:build', 'develop:webserver', 'develop:watch']);
gulp.task('release', ['release:build']);

gulp.task('default', ['develop']);
gulp.task('clean', ['clean:develop:build', 'clean:release:build']);