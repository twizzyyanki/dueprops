module.exports = function(config){
  config.set({
    basePath : '',

    files : [
      'public/bower_components/angular/angular.js',
      'public/bower_components/angular-mocks/angular-mocks.js',
      'public/bower_components/angular-moment/angular-moment.js',
      'public/bower_components/angular-ui-router/release/angular-ui-router.js',
      'public/bower_components/angular-cookies/angular-cookies.js',
      'public/bower_components/angular-elastic/elastic.js',
      'public/bower_components/jquery/dist/jquery.min.js',
      'public/bower_components/angular-aria/angular-aria.js',
      'public/bower_components/angular-material/angular-material.js',
      'public/bower_components/angular-animate/angular-animate.js',
      'public/bower_components/angularfire/dist/angularfire.js',
      'public/bower_components/moment/moment.js',
      'public/bower_components/firebase/firebase.js',
      'public/bower_components/lodash/lodash.min.js',
      'public/bower_components/angular-sortable-view/src/angular-sortable-view.js',
      'app/application.js',
      'app/services/toast-service.js',
      'app/**/*.spec.js'
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
