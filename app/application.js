/* define our modules */
angular.module('dueprops.services', ['angularMoment', 'firebase', 'ngCookies']);
angular.module('dueprops.filters', []);
angular.module("dueprops.directives", []);
angular.module('dueprops.controllers', []);

window.DueProps = angular.module("DueProps", [
  'dueprops.services',
  'dueprops.directives',
  'dueprops.controllers',
  'ngAnimate',
  'ngMaterial',
  'ui.router',
  'ngTagsInput'
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

window.escapeEmailAddress = function(emailList) {
  if (!emailList)
    return false;
  else {
    var email = emailList.toLowerCase();
    email = emailList.replace(/\./g, ',');
    return email;
  }
};
