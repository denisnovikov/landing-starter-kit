'use strict';

var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync'),
    concat = require('gulp-concat'),
    csscomb = require('gulp-csscomb'),
    cssmin = require('gulp-clean-css'),
    csso = require('gulp-csso'),
    htmlmin = require('gulp-htmlmin'),
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
    build: {
        html: './build/',
        fonts: './build/asset/fonts/',
        scripts: './build/asset/scripts/',
        styles: './build/asset/styles/',
        public: './build/'
    },

    src: {
        html: './src/pages/**/*.pug',
        fonts: './src/fonts/**/*.*',
        scripts: './src/scripts/app.js',
        styles: './src/styles/app.scss',
        public: './src/public/**/*.*'
    },

    watch: {
        html: './src/pages/**/*.pug',
        fonts: './src/fonts/**/*.*',
        scripts: './src/scripts/**/*.js',
        styles: './src/styles/**/*.scss',
        public: './src/public/**/*.*'
    },

    root: './build'
};

var config = {
    webserver: {
        server: {baseDir: path.root},
        tunnel: true,
        host: 'localhost',
        port: 9000,
        logPrefix: "SERVER"
    },

    reload: {
        stream: true
    },

    autoprefixer: {
        browsers: ['> 1%', 'last 500 versions'],
        cascade: false
    },

    rename: {
        basename: "app",
        suffix: ".min"
    },

    htmlmin: {
        collapseWhitespace: true
    }
};

// Html Build Tasks
gulp.task('html:develop:build', function () {
    gulp.src(path.src.html)
        .pipe(pug())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload(config.reload));
});

gulp.task('html:release:build', function () {
    gulp.src(path.src.html)
        .pipe(pug())
        .pipe(htmlmin(config.htmlmin))
        .pipe(gulp.dest(path.build.html));
});

// Styles Build Tasks
gulp.task('styles:develop:build', function () {
    gulp.src(path.src.styles)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(importCss())
        .pipe(autoprefixer(config.autoprefixer))
        .pipe(csso())
        .pipe(rename(config.rename))
        .pipe(size())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path.build.styles))
        .pipe(reload(config.reload));
});

gulp.task('styles:release:build', function () {
    gulp.src(path.src.styles)
        .pipe(sass())
        .pipe(importCss())
        .pipe(autoprefixer(config.autoprefixer))
        .pipe(csscomb())
        .pipe(csso())
        .pipe(cssmin())
        .pipe(rename(config.rename))
        .pipe(size())
        .pipe(gulp.dest(path.build.styles));
});

// Scripts Build Tasks
gulp.task('scripts:develop:build', function () {
    gulp.src(path.src.scripts)
        .pipe(rigger())
        .pipe(sourcemaps.init())
        .pipe(rename(config.rename))
        .pipe(size())
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(path.build.scripts))
        .pipe(reload(config.reload));
});

gulp.task('scripts:release:build', function () {
    gulp.src(path.src.scripts)
        .pipe(rigger())
        .pipe(uglify())
        .pipe(rename(config.rename))
        .pipe(size())
        .pipe(gulp.dest(path.build.scripts));
});

// Other Build Tasks
gulp.task('fonts:build', function () {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});

gulp.task('public:build', function () {
    gulp.src(path.src.public)
        .pipe(gulp.dest(path.build.public));
});

// Clear Tasks
gulp.task('clean:build', function (cb) {
    rimraf(path.root, cb);
});

// Watching Build Tasks
gulp.task('develop:watch', function () {
    watch([path.watch.html], function (event, cb) {
        gulp.start('html:develop:build');
    });
    watch([path.watch.styles], function (event, cb) {
        gulp.start('styles:develop:build');
    });
    watch([path.watch.scripts], function (event, cb) {
        gulp.start('scripts:develop:build');
    });
    watch([path.watch.fonts], function (event, cb) {
        gulp.start('fonts:build');
    });
    watch([path.watch.public], function (event, cb) {
        gulp.start('public:build');
    });
});

// WebServer Tasks
gulp.task('develop:webserver', function () {
    browserSync(config.webserver);
});

// Builder Tasks
gulp.task('develop:build', [
    'html:develop:build',
    'fonts:build',
    'scripts:develop:build',
    'styles:develop:build',
    'public:build'
]);

gulp.task('release:build', [
    'html:release:build',
    'fonts:build',
    'scripts:release:build',
    'styles:release:build',
    'public:build'
]);

gulp.task('clean', ['clean:build']);
gulp.task('develop', ['develop:build', 'develop:webserver', 'develop:watch']);
gulp.task('release', ['release:build']);
gulp.task('default', ['develop']);
