angular.module('dueprops.services').factory('Feed', function($firebaseArray, Refs) {
  return {
    forUser: function(user) {
      var receivedPropsRef = Refs.feed.child(escapeEmailAddress(user.email)).child('received');
      return $firebaseArray(receivedPropsRef).$loaded();
    }
  };
});