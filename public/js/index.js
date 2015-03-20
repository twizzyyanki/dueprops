(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* define our modules */
angular.module('dueprops.services', ['angularMoment','firebase','ngCookies']);
angular.module('dueprops.filters', []);
angular.module("dueprops.directives", []);
angular.module('dueprops.controllers', []);

require('./services/authentication-service.js');
require('./services/props-service.js');
require('./services/refs-service.js');
require('./services/toast-service.js');
require('./services/users-service.js');

require('./controllers/header-controller.js');

require('./directives/dueprops-directives.js');
require('./directives/prop-card.js');

window.DueProps = angular.module("DueProps", [
  'dueprops.services',
  'dueprops.directives',
  'dueprops.controllers',
  'ngAnimate',
  'ngMaterial',
  'ui.router'
]);

DueProps.config(['$stateProvider','$locationProvider',
  function($stateProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $stateProvider
      .state('default', {
        url: '/home',
        templateUrl: 'views/application.html',
        controller: 'HomeCtrl'
      });
  }
]);

DueProps.run(['$rootScope', function($rootScope) {
  // set globals we want available in ng expressions
  $rootScope._ = window._;
  $rootScope.moment = window.moment;
}]);

DueProps.controller('Application', ['$rootScope','$scope', '$mdSidenav', '$mdDialog', 'Authentication', 'Props','Refs',
 function($rootScope, $scope, $mdSidenav, $mdDialog, Authentication, Props, Refs) {
  $scope.Props = Props;

  Refs.root.onAuth(function(authData) {
    Authentication.auth(authData, function(user) {
      console.log('authenticated as', user);
      Props.init(user);
    });
  });

  $scope.openLeftMenu = function() {
    $mdSidenav('left').toggle();
  };

  $scope.openPropDialog = function(prop) {
    $mdDialog.show({
      templateUrl: '/views/propdialog.html',
      controller: ['$scope', function($scope) {
        $scope.Props = Props;
        $scope.draft = Props.draft(prop);

        $scope.send = function(draftProps) {
          Props.send(draftProps);
          $mdDialog.hide();
        };

        $scope.close = function() {
          $mdDialog.hide();
        };
      }]
    });
  };
}]);

window.escapeEmailAddress = function(email) {
  if (!email)
    return false;

  // Replace '.' (not allowed in a Firebase key) with ',' (not allowed in an email address)
  email = email.toLowerCase();
  email = email.replace(/\./g, ',');
  return email;
};

},{"./controllers/header-controller.js":2,"./directives/dueprops-directives.js":3,"./directives/prop-card.js":4,"./services/authentication-service.js":5,"./services/props-service.js":6,"./services/refs-service.js":7,"./services/toast-service.js":8,"./services/users-service.js":9}],2:[function(require,module,exports){
angular.module('dueprops.controllers')
  .controller('SiteHeaderController', ['$scope', 'Authentication',
    function($scope, Authentication) {
      $scope.login = Authentication.login;
      $scope.logout = Authentication.logout;
    }
  ]);

},{}],3:[function(require,module,exports){
angular.module("dueprops.directives")
  .directive('dueprops', function() {
    return {
      restrict: 'A',
      templateUrl : '/views/application.html',
      controller : 'Application'
    };
  });

angular.module("dueprops.directives")
  .directive('siteHeader', function() {
    return {
      restrict: 'E',
      controller: 'SiteHeaderController',
      templateUrl: '/views/shared/header.html'
    };
  });

angular.module("dueprops.directives")
  .directive('draftInput', function() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        fid: '@',
        label: '@',
        draft: '=draft',
        limit: '@'
      },
      template:
        '<md-input-container>' +
          '<label ng-class="{invalid: draft[fid].length > limit}">{{label}}</label>' +
          '<input type="text" id="{{fid}}" ng-model="draft[fid]">' +
        '</md-input-container>'
    };
  });

},{}],4:[function(require,module,exports){
angular.module('dueprops.directives')
  .directive('propCard', ['Props', function(Props) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: '/views/shared/prop-card.html'
    }
  }]);

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
angular.module('dueprops.services').factory('Props', ['$rootScope', '$firebase', 'Refs',
 function($rootScope, $firebase, Refs) {
  var service = {
    // initialized below
    user: null,

    init: function(user) {
      this.user = user;
      this.user.feed = $firebase(Refs.feed(user.email)).$asArray();
      this.user.props = $firebase(Refs.props).$asArray();
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
angular.module('dueprops.services')
  .factory('toast',['$mdToast', function($mdToast){
    return function(text, hideDelay, position, cb) {
      text = text || 'Toast Text Goes Here';
      hideDelay = hideDelay || 2000;
      position = position || 'bottom left';

      $mdToast.show({
        template: '<md-toast>'+text+'</md-toast>',
        hideDelay: hideDelay,
        position: position
      });

      if(cb) {
        setTimeout(function() { cb(); }, hideDelay);
      }
    };
  }]);

},{}],9:[function(require,module,exports){
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

},{}]},{},[1]);
