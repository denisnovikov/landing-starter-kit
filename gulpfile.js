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
    build: {
        html   : './build/',
        fonts  : './build/asset/fonts/',
        images : './build/asset/images/',
        scripts: './build/asset/scripts/',
        styles : './build/asset/styles/',
        public : './build/'
    },

    src: {
        html   : './src/pages/**/*.pug',
        fonts  : './src/fonts/**/*.*',
        images : './src/images/**/*.*',
        scripts: './src/scripts/app.js',
        styles : './src/styles/app.scss',
        public : './src/public/**/*.*'
    },

    watch: {
        html   : './src/pages/**/*.pug',
        fonts  : './src/fonts/**/*.*',
        images : './src/images/**/*.*',
        scripts: './src/scripts/**/*.js',
        styles : './src/styles/**/*.scss',
        public : './src/public/**/*.*'
    },

    root       : './build'
};

var config = {
    webserver: {
        server: { baseDir: path.root },
        tunnel: true,
        host: 'localhost',
        port: 9000,
        logPrefix: "SERVER"
    },

    reload: {
        stream: true
    },

    autoprefixer: {
        browsers: ['> 1%', 'last 2 versions'],
        cascade : false
    },

    rename: {
        basename: "app",
        suffix: ".min"
    },

    imagemin: {
        interlaced: true,
        progressive: true,
        optimizationLevel: 5,
        svgoPlugins: [{
            removeViewBox: true
        }]
    },

    htmlmin: {
        collapseWhitespace: true
    }
};

// Html Build Tasks
gulp.task('html:develop:build', function() {
    gulp.src(path.src.html)
        .pipe(pug())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload(config.reload));
});

gulp.task('html:release:build', function() {
    gulp.src(path.src.html)
        .pipe(pug())
        .pipe(htmlmin(config.htmlmin))
        .pipe(gulp.dest(path.build.html));
});

// Styles Build Tasks
gulp.task('styles:develop:build', function() {
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

gulp.task('styles:release:build', function() {
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
gulp.task('scripts:develop:build', function() {
    gulp.src(path.src.scripts)
        .pipe(rigger())
        .pipe(sourcemaps.init())
        .pipe(rename(config.rename))
        .pipe(size())
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(path.build.scripts))
        .pipe(reload(config.reload));
});

gulp.task('scripts:release:build', function() {
    gulp.src(path.src.scripts)
        .pipe(rigger())
        .pipe(uglify())
        .pipe(rename(config.rename))
        .pipe(size())
        .pipe(gulp.dest(path.build.scripts));
});

// Images Build Tasks
gulp.task('images:develop:build', function() {
    gulp.src(path.src.images)
        .pipe(gulp.dest(path.build.images))
        .pipe(reload(config.reload));
});

gulp.task('images:release:build', function() {
    gulp.src(path.src.images)
        .pipe(imagemin(config.imagemin))
        .pipe(gulp.dest(path.build.images));
});

// Other Build Tasks
gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});

gulp.task('public:build', function() {
    gulp.src(path.src.public)
        .pipe(gulp.dest(path.build.public));
});

// Clear Tasks
gulp.task('clean:build', function(cb) {
    rimraf(path.root, cb);
});

// Watching Build Tasks
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
        gulp.start('fonts:build');
    });
    watch([path.watch.public], function(event, cb) {
        gulp.start('public:build');
    });
});

// WebServer Tasks
gulp.task('develop:webserver', function() {
    browserSync(config.webserver);
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