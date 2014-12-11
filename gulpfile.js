'use strict';

//////////////////////
// Load Gulp
var gulp = require('gulp');


//////////////////////
// Load Plugins
var $ = require('gulp-load-plugins')(),
    server = $.livereload(),
    colors = require('colors');


//////////////////////
// Global Variables
var buildFolder = 'dist',
    serverPort,
    onError = function(error) {
        $.notify.onError({
            title:    'Error',
            message:  '<%= error.message %>'   
        })(error);
    };


//////////////////////
// Buld Temporary Styles
gulp.task('styles', function () {

    var processors = [
        require('autoprefixer')({browsers:['last 2 versions', 'ie >= 9']}),
        require('pixrem')
    ];

    return gulp.src('app/styles/main.scss')
        .pipe($.changed('.tmp/styles'))
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.rubySass({
            precision: 10,
            loadPath: ['app/bower_components/']
        }))
        .pipe($.postcss(processors))
        .pipe(gulp.dest('.tmp/styles'))
        .pipe($.size());
});


//////////////////////
// Build Scripts
gulp.task('scripts', function () {
    return gulp.src('app/scripts/**/*.js')
          .pipe($.size());
});


/////////////////////
// Handle HTML
gulp.task('html', function () {
    gulp.src('./app/*.html')
        //.pipe($.w3cjs())
        //.pipe($.size())
        .pipe($.fileInclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('app/views'));

        server.changed('./app/views/*.html');
});


/////////////////////
// Start Server
gulp.task('connect', function () {

    var portfinder = require('portfinder'),
        connect = require('connect'),
        app = connect()
        .use(require('connect-livereload')({ port: 35729 }))
        .use(connect.static('app/views'))
        .use(connect.static('app'))
        .use(connect.static('.tmp'));

    portfinder.getPort(function (err, port) { 
        
        serverPort = port;

        require('http').createServer(app)
            .listen(port)
            .on('listening', function () {
                console.log('Started web server on ' + 'http://localhost:'.green + colors.green(port));
            });
    });
});


/////////////////////
// Watch Files
gulp.task('watch', function () {

    gulp.watch([
        '.tmp/styles/**/*.css',
        'app/scripts/**/*.js',
        'app/images/**/*'
    ]).on('change', function (file) {
        server.changed(file.path);
    });
    
    gulp.watch('app/*.html', ['html']);
    gulp.watch('app/styles/**/*.scss', ['styles']);
});


/////////////////////
// Connect & Watch Files
gulp.task('default', ['connect', 'watch']);