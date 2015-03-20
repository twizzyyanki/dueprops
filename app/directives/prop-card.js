angular.module('dueprops.directives')
  .directive('propCard', ['Props', function(Props) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: '/views/shared/prop-card.html'
    }
  }]);
