window.DueProps = angular.module("DueProps", ['firebase','angularMoment','ngAnimate','ngMaterial','ui.bootstrap']);

DueProps.run(['$rootScope', function($rootScope) {
  // set globals we want available in ng expressions
  $rootScope._ = window._;
  $rootScope.moment = window.moment;
}]);

DueProps.directive('dueprops', function() {
  return {
    restrict: 'A',
    templateUrl : 'application.html',
    controller : 'Application'
  };
});

DueProps.controller('Application', ['$rootScope','$scope', '$materialSidenav', '$materialDialog', 'Props',
 function($rootScope, $scope, $materialSidenav, $materialDialog, Props) {
  $scope.Props = Props;

  $scope.openLeftMenu = function() {
    $materialSidenav('left').toggle();
  };

  $scope.openPropDialog = function(prop) {
    $materialDialog({
      templateUrl: 'propdialog.html',
      controller: ['$scope', '$hideDialog', function($scope, $hideDialog) {
        $scope.Props = Props;
        $scope.draft = Props.draft(prop);

        $scope.send = function(draftProps) {
          Props.send(draftProps);
          $hideDialog();
        };

        $scope.close = function() {
          $hideDialog();
        };
      }]
    });
  };
}]);
