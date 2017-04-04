'use strict';

var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    csscomb = require('gulp-csscomb'),
    cssmin = require('gulp-minify-css'),
    csso = require('gulp-csso'),
    htmlmin = require('gulp-htmlmin'),
    imagemin = require('gulp-imagemin'),
    pug = require('gulp-pug'),
    plumber = require('gulp-plumber'),
    autoprefixer = require('gulp-autoprefixer'),
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
        main: './build/release/',
        html: './build/release/',
        js: './build/release/assets/scripts/',
        css: './build/release/assets/styles/',
        img: './build/release/assets/images/',
        public: './build/release/'
    },
    develop: {
        main: './build/develop/',
        html: './build/develop/',
        js: './build/develop/assets/scripts/',
        css: './build/develop/assets/styles/',
        img: './build/develop/assets/images/',
        public: './build/develop/'
    },
    src: {
        html: './src/views/**/*.pug',
        js: './src/components/App/App.js',
        css: './src/components/App/App.scss',
        img: './src/components/**/*.*',
        public: './src/other/**/*.*'
    },
    watch: {
        html: './src/**/*.pug',
        js: './src/**/*.js',
        css: './src/**/*.scss',
        img: './src/components/**/*.*',
        public: './src/other/**/*.*'
    }
};

var config = {
    server: {
        baseDir: path.develop.main
    },
    tunnel: true,
    host: 'localhost',
    port: 3000,
    logPrefix: "SERVER"
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
    gulp.src(path.src.css)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['> 1%', 'last 2 versions'],
            cascade: false
        }))
        .pipe(rename({
            basename: "app",
            suffix: ".min"
        }))
        .pipe(size())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path.develop.css))
        .pipe(reload({ stream: true }));
});

gulp.task('styles:release:build', function() {
    gulp.src(path.src.css)
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['> 1%', 'last 2 versions'],
            cascade: false
        }))
        .pipe(csscomb())
        .pipe(csso())
        .pipe(cssmin())
        .pipe(rename({
            basename: "app",
            suffix: ".min"
        }))
        .pipe(size())
        .pipe(gulp.dest(path.release.css));
});

// Scripts
gulp.task('js:develop:build', function() {
    gulp.src(path.src.js)
        .pipe(rigger())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({
            basename: "app",
            suffix: ".min"
        }))
        .pipe(size())
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(path.develop.js))
        .pipe(reload({ stream: true }));
});

gulp.task('js:release:build', function() {
    gulp.src(path.src.js)
        .pipe(rigger())
        .pipe(uglify())
        .pipe(rename({
            basename: "app",
            suffix: ".min"
        }))
        .pipe(size())
        .pipe(gulp.dest(path.release.js));
});

// Images
gulp.task('images:develop:build', function() {
    gulp.src(path.src.img)
        .pipe(imagemin())
        .pipe(gulp.dest(path.develop.img))
        .pipe(reload({ stream: true }));
});

gulp.task('images:release:build', function() {
    gulp.src(path.src.img)
        .pipe(imagemin({
            interlaced: true,
            progressive: true,
            optimizationLevel: 5,
            svgoPlugins: [{ removeViewBox: true }]
        }))
        .pipe(gulp.dest(path.release.img))
        .pipe(reload({ stream: true }));
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
    rimraf(path.develop.main, cb);
});

gulp.task('clean:release:build', function(cb) {
    rimraf(path.release.main, cb);
});

// Watching
gulp.task('develop:watch', function() {
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:develop:build');
    });
    watch([path.watch.css], function(event, cb) {
        gulp.start('styles:develop:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:develop:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('images:develop:build');
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
    'styles:develop:build',
    'js:develop:build',
    'images:develop:build',
    'public:develop:build'
]);

gulp.task('release:build', [
    'html:release:build',
    'styles:release:build',
    'js:release:build',
    'images:release:build',
    'public:release:build'
]);

gulp.task('develop', ['develop:build', 'develop:webserver', 'develop:watch']);
gulp.task('release', ['release:build']);
gulp.task('clean', ['clean:develop:build', 'clean:release:build']);