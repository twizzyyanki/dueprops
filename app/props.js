// todo: move all the firebase stuff into a service
var rootRef = new Firebase("https://scorching-torch-859.firebaseio.com/");
var feedRef = rootRef.child('feed');
var notificationsRef = rootRef.child('notifications');
var propsRef = rootRef.child('props');
var usersRef = rootRef.child('users');


DueProps.factory('Props', ['$rootScope', '$firebase',
 function($rootScope, $firebase) {
  var service = {
    // initialized on login below
    user: null,
    feed: null,
    props: null,

    draft: function(prop) {
      return {
        name: prop.name,
        description: prop.description,
        icon: prop.icon,
        thumb: prop.thumb,
        large: prop.large,
        habitat: prop.habitat,
        sent_by: this.user,
        sent_at: Firebase.ServerValue.TIMESTAMP,
      };
    },

    love: function(prop) {
      prop.$ref.child('lovers').child(this.user.id).set(true); // save remotely
    },

    loved: function(prop) {
      return prop['lovers'] && !!prop.lovers[this.user.id];
    },

    send: function(draftProps) {
      feedRef.child(escapeEmailAddress(draftProps.to)).child('received').push(draftProps);
    },

    validate: function(draftProps) {
      return !!draftProps.to && !!draftProps.reason && draftProps.reason.length <= 140;
    }
  }

  $rootScope.$on("$firebaseSimpleLogin:login", function(event, user) {
    service.user = user;
    service.user.id = escapeEmailAddress(user.email); // needed as keys throughout
    service.feed = $firebase(feedRef.child(user.id).child('received')).$asArray();
    service.props = $firebase(propsRef).$asArray();
  });

  $rootScope.$on("$firebaseSimpleLogin:logout", function(event) {
    service.user = null;
    service.feed = null;
    service.props = null;
  });

  return service;
}]);
