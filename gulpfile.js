const gulp = require('gulp');
const cssimport = require("gulp-cssimport");
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const webpack = require('webpack-stream');
const gulpif = require('gulp-if');
const browserSync = require('browser-sync').create();
const isDev = true;

const config = {
    src: './public/src',
    dist: './public/dist',
    pages: ['./*.php', './**/*.html'],
    proxy: 'b.local',
    css: {
        src: '/css/**/*.css',
        dist: '/css'
    },
    js: {
        src: '/js/**/*.js',
        dist: '/js',
        entry: './public/src/js/index.js'
    }
};

const webpackConfig = {
    output: {
        filename: 'all.js'
    },
    module: {
        rules: [{
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: '/node_modules/'
        }]
    },
    mode: isDev ? 'development' : 'production',
    devtool: isDev ? 'eval-source-map' : 'none'
};

function clean(){
	return del([config.dist + '/*']);
}

function styles(){
    return gulp.src(config.src + '/css/style.css')
        .pipe(gulpif(isDev, sourcemaps.init()))
		.pipe(cssimport())
		.pipe(autoprefixer({
            overrideBrowserslist: ['>0.1%'],
            cascade: false
        }))
        .pipe(cleanCSS({
        	level: 2
        }))
        .pipe(gulpif(isDev, sourcemaps.write()))
        .pipe(gulp.dest(config.dist + config.css.dist))
        .pipe(browserSync.stream());
}

function scripts(){
    return gulp.src(config.js.entry)
                .pipe(webpack(webpackConfig))
                .pipe(gulp.dest(config.dist + config.js.dist))
                .pipe(browserSync.stream());
}

function watch(){
    browserSync.init({
//        server: {  baseDir: "./" }
        proxy: config.proxy,
        notify: false
    });    
    gulp.watch(config.src + config.css.src, styles);
    gulp.watch(config.src + config.js.src, scripts);
    gulp.watch(config.pages).on('change', browserSync.reload);
}

gulp.task('styles', styles);
gulp.task('scripts', scripts);
gulp.task('watch', watch);
gulp.task('build', gulp.series(clean, gulp.parallel(styles, scripts), watch));