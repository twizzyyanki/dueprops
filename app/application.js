/* define our modules */
angular.module('dueprops.services', ['angularMoment','firebase','ngCookies']);
angular.module('dueprops.filters', []);
angular.module("dueprops.directives", []);
angular.module('dueprops.controllers', []);

require('./services/authentication-service.js');
require('./services/props-service.js');
require('./services/refs-service.js');
require('./services/toast-service.js');
require('./services/users-service.js');
require('./services/feed-service.js');

require('./controllers/header-controller.js');

require('./directives/dueprops-directives.js');
require('./directives/prop-card.js');

window.DueProps = angular.module("DueProps", [
  'dueprops.services',
  'dueprops.directives',
  'dueprops.controllers',
  'ngAnimate',
  'ngMaterial',
  'ui.router'
]);

DueProps.config(['$stateProvider','$locationProvider',
  function($stateProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $stateProvider
      .state('default', {
        url: '/home',
        templateUrl: 'views/application.html',
        controller: 'HomeCtrl'
      });
  }
]);

DueProps.run(['$rootScope', function($rootScope) {
  // set globals we want available in ng expressions
  $rootScope._ = window._;
  $rootScope.moment = window.moment;
}]);

DueProps.controller('Application', ['$rootScope','$scope', '$mdSidenav', '$mdDialog', 'Authentication', 'Props','Refs',
 function($rootScope, $scope, $mdSidenav, $mdDialog, Authentication, Props, Refs) {
  $scope.Props = Props;

  Refs.root.onAuth(function(authData) {
    Authentication.auth(authData, function(user) {
      console.log('authenticated as', user);
      Props.init(user);
    });
  });

  $scope.openLeftMenu = function() {
    $mdSidenav('left').toggle();
  };

  $scope.openPropDialog = function(prop) {
    $mdDialog.show({
      templateUrl: '/views/propdialog.html',
      controller: ['$scope', function($scope) {
        $scope.Props = Props;
        $scope.draft = Props.draft(prop);

        $scope.send = function(draftProps) {
          Props.send(draftProps);
          $mdDialog.hide();
        };

        $scope.close = function() {
          $mdDialog.hide();
        };
      }]
    });
  };
}]);

window.escapeEmailAddress = function(email) {
  if (!email)
    return false;

  // Replace '.' (not allowed in a Firebase key) with ',' (not allowed in an email address)
  email = email.toLowerCase();
  email = email.replace(/\./g, ',');
  return email;
};
