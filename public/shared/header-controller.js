var rootRef = new Firebase("https://scorching-torch-859.firebaseio.com/");
var usersRef = rootRef.child('users');

DueProps.controller('SiteHeaderController', ['$rootScope', '$scope', '$firebase','$firebaseSimpleLogin',
  function($rootScope, $scope, $firebase, $firebaseSimpleLogin) {

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
    userRef = usersRef.child(user.id);
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

