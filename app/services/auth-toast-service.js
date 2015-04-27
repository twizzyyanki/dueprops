angular.module('dueprops.services').factory('toast', ['$mdToast', '$timeout',function($mdToast, $timeout) {
  return function(text, hideDelay, position, cb) {
    text = text || 'Toast Text Goes Here';
    position = position || 'bottom left';

    $mdToast.show({
      template: '<md-toast>' + text + '</md-toast>',
      hideDelay: hideDelay,
      position: position
    });

    if (cb) {
      $timeout(function() {
        cb();
      });
    }
  };
}]);