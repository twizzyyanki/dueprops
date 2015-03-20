angular.module('dueprops.services')
  .factory('Refs', ['$firebase', '$cookies',
    function($firebase, $cookies) {
      var rootRef = new Firebase($cookies.rootRef || 'https://scorching-torch-859.firebaseio.com/');
      window.rootRef = rootRef;

      // define every standard ref used in the application here
      // so that they are defined just once, not scattered throughout
      return {
        root: rootRef,
        membership: rootRef.child('index/membership'),
        notifications: rootRef.child('notifications'),
        props: rootRef.child('props'),
        users: rootRef.child('users'),
        feed: function(email) {
          return rootRef.child('feed').child(escapeEmailAddress(email)).child('received');
        },
        isAdmin: function() {
          var auth = rootRef.getAuth()?rootRef.getAuth().auth:false;
          return auth && auth.isAdmin;
        }
      };
    }
  ]);
