// Karma configuration

module.exports = function(config) {
  'use strict';

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    basePath: '',

    frameworks: ['jasmine'],

    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'src/*.js',
      'test/spec/*.js'
    ],

    exclude: [],

    // test results reporter to use
    // possible values: dots || progress || growl 
    reporters: ['progress'],

    // web server port
    port: 8080,

    // cli runner port
    runnerPort: 9100,

    logLevel: config.LOG_INFO,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],

    plugins: [
      'karma-jasmine',
      'karma-phantomjs-launcher'
    ],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true
  });
};