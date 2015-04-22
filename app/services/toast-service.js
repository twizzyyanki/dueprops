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
<<<<<<< HEAD
    }
  };
});
=======

      if(cb) {
        setTimeout(function() { cb(); }, hideDelay);
      }
    };
  }]);
>>>>>>> 652a80b109a050ba20c6f66f6819e297f1a2a24e
