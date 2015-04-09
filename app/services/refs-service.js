angular.module('dueprops.services')
  .factory('Refs', ['$firebase', '$cookies',
    function($firebase, $cookies) {
      var firebaseUrl = 'https://scorching-torch-859.firebaseio.com/';
      var rootRef = new Firebase($cookies.rootRef || firebaseUrl);
      window.rootRef = rootRef;

      // define every standard ref used in the application here
      // so that they are defined just once, not scattered throughout
      return {
        root: rootRef,
        membership: rootRef.child('index/membership'),
        notifications: rootRef.child('notifications'),
        props: new Firebase(firebaseUrl + '/props'),
        users: rootRef.child('users'),
        feed: function(email) {
          var feedVar = new Firebase(firebaseUrl + '/feed');
          return feedVar.child(escapeEmailAddress(email)).child('received');
        },
        isAdmin: function() {
          var auth = rootRef.getAuth()?rootRef.getAuth().auth:false;
          return auth && auth.isAdmin;
        }
      };
    }
  ]);
