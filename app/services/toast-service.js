angular.module('dueprops.services')
  .factory('toast',['$mdToast', function($mdToast) {
    return function(text, hideDelay, position, cb) {
      text = text || 'Toast Text Goes Here';
      hideDelay = hideDelay || 2000;
      position = position || 'bottom left';

      $mdToast.show({
        template: '<md-toast>' + text + '</md-toast>',
        hideDelay: hideDelay,
        position: position
      });

      if(cb) {
        setTimeout(function() { cb(); }, hideDelay);
      }
    };
  }]);
