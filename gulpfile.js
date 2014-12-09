'use strict';

//////////////////////
// Load Gulp
var gulp = require('gulp');


//////////////////////
// Load Gulp Plugins
var $ = require('gulp-load-plugins')();


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


/////////////////////
// Handle HTML
gulp.task('html', function () {
    gulp.src('./app/*.html')
        .pipe($.connect.reload());
});


/////////////////////
// Start Server
gulp.task('connect', function () {

    var portfinder = require('portfinder'),
        connect = require('connect'),
        app = connect()
        .use(require('connect-livereload')({ port: 35729 }))
        .use(connect.static('app'))
        .use(connect.static('.tmp'))
        .use(connect.directory('app'));

    portfinder.getPort(function (err, port) { 
        
        serverPort = port;

        require('http').createServer(app)
            .listen(port)
            .on('listening', function () {
                console.log('Started connect web server on http://localhost:' + port);
            });
    });
});


/////////////////////
// Watch Files
gulp.task('watch', function () {

    var server = $.livereload();

    gulp.watch([
        './app/*.html'
    ]).on('change', function (file) {
        server.changed(file.path);
    });
});


/////////////////////
// Connect & Watch Files
gulp.task('default', ['connect', 'watch']);