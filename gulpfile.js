var babelify = require ('babelify'),
    buffer = require ('vinyl-buffer'),
    browserify = require ('browserify'),
    browserSync = require ('browser-sync').create(),
    chalk = require ('chalk'),
    gulp = require ('gulp'),
    gutil = require ('gutil'),
    rename = require ('gulp-rename'),
    source = require ('vinyl-source-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    watchify = require ('watchify');

function map_error (err) {
    if (err.fileName) {
        gutil.log(chalk.red(err.name)
            +': '
            + chalk.yellow(err.fileName.replace(__dirname+'src', ''))
            + ': '
            + 'Line '
            + chalk.magenta(err.lineNumber)
            + ' & Column '
            + chalk.magenta(err.columnNumber || err.column)
            + ': '
            + chalk.blue(err.description)
        );
    } else {
        gutil.log(chalk.red(err.name)
        + ': '
        + chalk.yellow(err.message));
    }
    this.emit('end');
}

function bundle_js(src) {
    var stream = (watching?wBundler:bundler).bundle()
        .on('error', map_error)
        .pipe(source(src))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('./dist/js'));
    if (watching) {
        return stream.pipe(browserSync.stream({once:true}));
    }
    return stream;
}

var bundler = null, wBundler = null;
var watching = false;
gulp.task('js', () => {
    bundler = browserify('./src/',Object.assign({debug: true},(watching?watchify.args:{}))).transform(babelify, {presets: ['es2015']});
    if (watching) {
        wBundler = watchify(bundler);
    }
    return bundle_js('analytique.min.js');
});

gulp.task('html', () => {
    return gulp.src('./src/index.html')
        .pipe(gulp.dest('./dist'))
        .pipe(browserSync.stream({once:true}));
});

gulp.task('toggle-watching', () => {
    watching = true;
});

gulp.task('watch', ['html', 'toggle-watching', 'js'], () => {
    browserSync.init({
        ui: {
            port: 7080
        },
        port: 7000,
        notify: false,
        open: false,
        browser: 'google chrome',
        server: './dist/'
    });
    bundler.on('update', ()=>{
        bundle_js('analytique.min.js');
    });
    gulp.watch(['src**/*.html'], ['html']);
});

