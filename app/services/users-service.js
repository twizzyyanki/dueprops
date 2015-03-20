angular.module('dueprops.services')
  .factory('Users', ['$firebase', 'Refs',
    function($firebase, AuditTrail, Refs) {
      return {
        all: function(cb) {
          if(!cb) {
            return $firebase(Refs.users).$asArray();
          }
          else {
            Refs.users.once('value', function(snap) {
              cb(snap.val());
            });
          }
        },
        find: function(uid, cb) {
          if(!cb) {
            return $firebase(Refs.users.child(uid)).$asObject();
          }
          else {
            Refs.users.child(uid).once('value', function(snap) {
              cb(snap.val());
            });
          }
        }
      };
    }
  ]);
