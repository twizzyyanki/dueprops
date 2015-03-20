angular.module('dueprops.controllers')
  .controller('SiteHeaderController', ['$scope', 'Authentication',
    function($scope, Authentication) {
      $scope.login = Authentication.login;
      $scope.logout = Authentication.logout;
    }
  ]);
