angular.module('dueprops.services').factory('Feed', function($firebaseArray, Refs) {
  return {
    forUser: function(user) {
      return $firebaseArray(Refs.receivedProps(user.email)).$loaded();
    },
    
  };
});