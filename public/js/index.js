(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./app/application.js":[function(require,module,exports){
window.DueProps = angular.module("DueProps", ['firebase','angularMoment','ngAnimate','ngMaterial','ui.bootstrap']);

require('./directives.js');
require('./props.js');
require('./shared/header-controller.js');
require('./shared/prop-card.js');

DueProps.run(['$rootScope', function($rootScope) {
  // set globals we want available in ng expressions
  $rootScope._ = window._;
  $rootScope.moment = window.moment;
}]);

DueProps.directive('dueprops', function() {
  return {
    restrict: 'A',
    templateUrl : 'application.html',
    controller : 'Application'
  };
});

DueProps.controller('Application', ['$rootScope','$scope', '$materialSidenav', '$materialDialog', 'Props',
 function($rootScope, $scope, $materialSidenav, $materialDialog, Props) {
  $scope.Props = Props;

  $scope.openLeftMenu = function() {
    $materialSidenav('left').toggle();
  };

  $scope.openPropDialog = function(prop) {
    $materialDialog({
      templateUrl: 'propdialog.html',
      controller: ['$scope', '$hideDialog', function($scope, $hideDialog) {
        $scope.Props = Props;
        $scope.draft = Props.draft(prop);

        $scope.send = function(draftProps) {
          Props.send(draftProps);
          $hideDialog();
        };

        $scope.close = function() {
          $hideDialog();
        };
      }]
    });
  };
}]);

window.escapeEmailAddress = function(email) {
  if (!email) {
    return false;
  }

  // Replace '.' (not allowed in a Firebase key) with ',' (not allowed in an email address)
  email = email.toLowerCase();
  email = email.replace(/\./g, ',');
  return email;
};

},{"./directives.js":"/Users/obie/Projects/v2/dueprops.com/app/directives.js","./props.js":"/Users/obie/Projects/v2/dueprops.com/app/props.js","./shared/header-controller.js":"/Users/obie/Projects/v2/dueprops.com/app/shared/header-controller.js","./shared/prop-card.js":"/Users/obie/Projects/v2/dueprops.com/app/shared/prop-card.js"}],"/Users/obie/Projects/v2/dueprops.com/app/directives.js":[function(require,module,exports){
DueProps.directive('siteHeader', function() {
  return {
    restrict: 'E',
    controller: 'SiteHeaderController',
    templateUrl: '/shared/header.html'
  }
});

DueProps.directive('draftInput', function() {
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
      '<material-input-group>' +
        '<label for="{{fid}}" ng-class="{invalid: draft[fid].length > limit}">{{label}}</label>' +
        '<material-input id="{{fid}}" type="text" ng-model="draft[fid]">' +
      '</material-input-group>'
  };
});

},{}],"/Users/obie/Projects/v2/dueprops.com/app/props.js":[function(require,module,exports){
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

},{}],"/Users/obie/Projects/v2/dueprops.com/app/shared/header-controller.js":[function(require,module,exports){


DueProps.controller('SiteHeaderController', ['$rootScope', '$scope', '$firebase','$firebaseSimpleLogin',
 function($rootScope, $scope, $firebase, $firebaseSimpleLogin) {

  var rootRef = new Firebase("https://scorching-torch-859.firebaseio.com/");
  var usersRef = rootRef.child('users');

  // Create a Firebase Simple Login object
  $scope.auth = $firebaseSimpleLogin(rootRef);

  // Start with no user logged in
  $rootScope.currentUser = null;

  // Upon successful login, set the user object
  // happens automatically when rememberMe is enabled
  $rootScope.$on("$firebaseSimpleLogin:login", function(event, user) {
    console.log("Logged in as", user);

    // keep a reference to the user for the UI
    $rootScope.currentUser = user;

    // site presence
    user.active = true;
    user.id = escapeEmailAddress(user.email);

    var userRef = usersRef.child(user.id);
    userRef.on('value', function(snap){
      if(snap.val()) {
        userRef.child('active').set(true);
      }
      else {
        userRef.set(user);
      }
      // set user to inactive on disconnect
      userRef.child('active').onDisconnect().set(false);
    });
  });

  // Upon successful logout, reset the user object
  $rootScope.$on("$firebaseSimpleLogin:logout", function(event) {
    $rootScope.currentUser = null;
  });

  $scope.login = function() {
    options = {
      preferRedirect: true,
      rememberMe: true,
      scope: 'https://www.googleapis.com/auth/contacts.readonly'
    };
    $scope.auth.$login('google', options).then(function(user) {
      console.log('login successful');
      importGoogleAddressBook();
    }, function(err) {
      console.log('error logging in', err);
    });
  }

  $scope.logout = function() {
    $scope.auth.$logout();
  };

}]);

// function importGoogleAddressBook() {
//   addressBook = {};
//   $.get("https://www.google.com/m8/feeds/contacts/default/full?alt=json&access_token=" + scope.user.accessToken + "&max-results=700&v=3.0",
//     function(response) {
//       console.log(response.feed.entry);
//       _.each(response.feed.entry, function(contact) {
//         name = contact.title.$t;
//         email = contact.gd$email[0].address;
//         if(name && email) {
//           addressBook[escapeEmailAddress(email)] = {name: name, email: email};
//         }
//       });
//       usersRef.child(scope.user.uid).child('addressbook').set(addressBook);
//     }
//   );
// }


},{}],"/Users/obie/Projects/v2/dueprops.com/app/shared/prop-card.js":[function(require,module,exports){
DueProps.directive('propCard', ['Props', function(Props) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: '/shared/prop-card.html'
  }
}]);

},{}]},{},["./app/application.js"]);
