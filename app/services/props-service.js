angular.module('dueprops.services').factory('Props', ['$rootScope', '$firebase', 'Refs',
 function($rootScope, $firebase, Refs) {
  var service = {
    // initialized below
    user: null,

    init: function(user) {
      this.user = user;
      if (user) {
        this.user.feed = $firebase(Refs.feed(user.email)).$asArray();
        this.user.props = $firebase(Refs.props).$asArray();
      }
    },

    draft: function(prop) {
      return {
        name: prop.name,
        description: prop.description,
        icon: prop.icon,
        thumb: prop.thumb,
        large: prop.large,
        habitat: prop.habitat,
        sender: {
          uid: this.user.uid,
          name: this.user.name,
          email: this.user.email,
          picture: this.user.picture
        },
        sent_at: Firebase.ServerValue.TIMESTAMP,
      };
    },

    love: function(prop) {
      prop.$ref.child('lovers').child(this.user.id).set(true); // save remotely
    },

    loved: function(prop) {
      return prop.lovers && !!prop.lovers[this.user.id];
    },

    send: function(draftProps) {
      Refs.feed(draftProps.to).child('received').push(draftProps);
    },

    validate: function(draftProps) {
      return !!draftProps.to && !!draftProps.reason && draftProps.reason.length <= 140;
    }
  };

  return service;
}]);
