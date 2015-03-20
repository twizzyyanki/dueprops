angular.module('dueprops.services')
  .factory('Authentication', ['$firebase', '$rootScope','$state','Refs', 'toast', '$cookies',
    function($firebase, $rootScope, $state, Refs, toast, $cookies) {
      window.state = $state;

      return {
        login: function(cb) {
          var options = {
            rememberMe: true,
            scope: 'email,https://www.googleapis.com/auth/contacts.readonly'
          };
          Refs.root.authWithOAuthPopup("google", function(error, authData) {
            if(cb) cb(error, authData);
          }, options);
        },

        logout: function() {
          Refs.root.unauth();
          $rootScope.currentUser = null;
        },

        auth: function(authData, cb) {
          if(!authData) {
            // we're logged out. nothing else to do
            return cb(null);
          }

          var self = this;

          // are we dealing with a new user? find out by checking for a user record
          var userRef = Refs.users.child(authData.uid);
          userRef.once('value', function(snap) {
            var user = snap.val();
            if(user && !user.deleted) {
              if(authData.provider === "google") {
                // google user logging in, update their access token
                user.access_token = authData.token;
                userRef.update({
                  access_token: authData.token,
                  picture: authData.google.cachedUserProfile.picture
                });
              }

              // save the current user in the global scope
              $rootScope.currentUser = user;
              // handle default navigation, prevent non-org users from access
              Refs.membership.child(user.uid).child('org').once('value', function(snap) {
                if (snap.val() === null) {
                  $state.go('default');
                }
                else if($state.current.name === "login") {
                  $state.go('default');
                }
              });
            }
            else if(user && user.deleted) {
              $state.go('default');
              toast("Unauthorized! Sorry bro ¯\\_(ツ)_/¯");
            }
            else {
              // construct the user record the way we want it
              user = self.buildUserObjectFromGoogle(authData);
              // find the last user record to get its priority
              Refs.users.orderByPriority().limitToLast(1).once("child_added", function(snap) {
                var lastPriority = snap.getPriority();
                // save it to firebase collection of users
                userRef.setWithPriority(user, lastPriority+1, function(error) {
                  // and navigate to invite code page
                  $state.go('default');
                });
              });
            }

            // ...and we're done
            return cb(user);
          });
        },

        buildUserObjectFromGoogle: function(authData) {
          return {
            uid: authData.uid,
            name: authData.google.displayName,
            email: authData.google.email,
            access_token: authData.google.accessToken,
            first_name: authData.google.cachedUserProfile.given_name,
            known_as: authData.google.cachedUserProfile.given_name,
            last_name: authData.google.cachedUserProfile.family_name,
            picture: authData.google.cachedUserProfile.picture,
            created_at: Firebase.ServerValue.TIMESTAMP
          };
        }
      };
    }
  ]);
