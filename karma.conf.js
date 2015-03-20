module.exports = function(config){
  config.set({
    basePath : '',

    files : [
    ],

    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'public/js/index.js': 'coverage'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress','coverage'],

    // web server port
    port: 9876,

    //60 seconds timeout to accommodate time for callbacks, for firebase
    captureTimeout: 60000,

    autoWatch : true,

    singleRun : false,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    logLevel: config.LOG_INFO,

    colors: true,

    plugins : [
      'karma-coverage',
      'karma-chrome-launcher',
      'karma-jasmine',
    ],

    coverageReporter : {
      type : 'lcov',
      dir : 'coverage/'
    }

  });
};
