angular.module('dueprops.services').factory('Feed', ['$firebaseArray','Refs',function($firebaseArray, Refs) {
  return {
    forUser: function(user) {
      return $firebaseArray(Refs.receivedProps(user.email)).$loaded();
    },
    
  };
}]);