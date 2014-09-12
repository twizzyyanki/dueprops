// todo: move all the firebase stuff into a service
var rootRef = new Firebase("https://scorching-torch-859.firebaseio.com/");
var feedRef = rootRef.child('feed');
var notificationsRef = rootRef.child('notifications');
var propsRef = rootRef.child('props');
var usersRef = rootRef.child('users');

window.DueProps = angular.module("DueProps", ['firebase','angularMoment','ngAnimate','ngMaterial','ui.bootstrap'])
  .run(['$rootScope', function($rootScope) {
    // set globals we want available in ng expressions
    $rootScope._ = window._;
    $rootScope.moment = window.moment;
  }])
  .directive('dueprops', function() {
    return {
      restrict: 'A',
      templateUrl : 'application.html',
      controller : 'Application'
    };
  });

DueProps.controller('Application', ['$rootScope','$scope', '$FirebaseArray', '$firebase', '$firebaseUtils', '$firebaseSimpleLogin', '$materialSidenav', '$materialToast', '$materialDialog',
               function($rootScope, $scope, $FirebaseArray, $firebase, $firebaseUtils, $firebaseSimpleLogin, $materialSidenav, $materialToast, $materialDialog) {

  // for debugging
  window.scope = $scope;

  PropCardFactory = $FirebaseArray.$extendFactory({
    $$added: function(snap, prevChild) {
      console.log(snap.val());
      // check to make sure record does not exist
      var i = this.$indexFor(snap.name());
      if( i === -1 ) {
        // parse data and create record
        var rec = snap.val();
        if( !angular.isObject(rec) ) {
          rec = { $value: rec };
        }
        rec.$id = snap.name();
        rec.$priority = snap.getPriority();
        rec.$ref = snap.ref();

        rec.love = function() {
          // todo: figure out why we can't get this bound properly
          this['lovers'] || (this.lovers = {}); // initialize if necessary
          this.lovers[$rootScope.currentUser.id] = true; // local instance
          this.$ref.child('lovers').child($rootScope.currentUser.id).set(true); // save remotely
        }

        rec.loved = function() {
          return this['lovers'] && this.lovers[$rootScope.currentUser.id];
        }

        $firebaseUtils.applyDefaults(rec, this.$$defaults);

        // add it to array and send notifications
        this._process('child_added', rec, prevChild);
      }
    }
  });

  // Upon successful login, set the user object
  // happens automatically when rememberMe is enabled
  $rootScope.$on("$firebaseSimpleLogin:login", function(event, user) {
    // load prop list
    $scope.props = $firebase(propsRef).$asArray();
    // load feed
    $scope.feed = $firebase(feedRef.child(escapeEmailAddress(user.email)).child('received'),{arrayFactory: PropCardFactory}).$asArray();
  });

  // Upon successful logout, reset the user object
  $rootScope.$on("$firebaseSimpleLogin:logout", function(event) {
    // load prop list
    $scope.props = null;
    // load feed
    $scope.feed = null;
  });

  $scope.openLeftMenu = function() {
    $materialSidenav('left').toggle();
  };

  $scope.openPropDialog = function(prop) {
    $materialDialog({
      templateUrl: 'propdialog.html',
      controller: ['$rootScope','$scope', '$hideDialog', function($rootScope, $scope, $hideDialog) {
        $scope.draft = {
          name: prop.name,
          description: prop.description,
          icon: prop.icon,
          thumb: prop.thumb,
          large: prop.large,
          habitat: prop.habitat,
          sent_by: $rootScope.currentUser,
          sent_at: Firebase.ServerValue.TIMESTAMP,
        };

        $scope.validate = function(draftProps) {
          return !!draftProps.to && !!draftProps.reason && draftProps.reason.length <= 140;
        }

        $scope.send = function(draftProps) {
          console.log('sending to', escapeEmailAddress(draftProps.to));
          feedRef.child(escapeEmailAddress(draftProps.to)).child('received').push(draftProps);
          $hideDialog();
        };

        $scope.close = function() {
          $hideDialog();
        };
      }]
    });
  };

}]);

function escapeEmailAddress(email) {
  if (!email) return false

  // Replace '.' (not allowed in a Firebase key) with ',' (not allowed in an email address)
  email = email.toLowerCase();
  email = email.replace(/\./g, ',');
  return email;
}

function importGoogleAddressBook() {
  addressBook = {};
  $.get("https://www.google.com/m8/feeds/contacts/default/full?alt=json&access_token=" + scope.user.accessToken + "&max-results=700&v=3.0",
    function(response) {
      console.log(response.feed.entry);
      _.each(response.feed.entry, function(contact) {
        name = contact.title.$t;
        email = contact.gd$email[0].address;
        if(name && email) {
          addressBook[escapeEmailAddress(email)] = {name: name, email: email};
        }
      });
      usersRef.child(scope.user.uid).child('addressbook').set(addressBook);
    }
  );
}

