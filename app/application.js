var rootRef = new Firebase("https://scorching-torch-859.firebaseio.com/");
var propsRef = rootRef.child('props');
var notificationsRef = rootRef.child('notifications');
var usersRef = rootRef.child('users');

angular.module("DueProps", ['firebase','angularMoment','ngMaterial'])
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
	})

	.controller('Application', ['$scope', '$firebase', '$firebaseSimpleLogin', '$materialSidenav', function($scope, $firebase, $firebaseSimpleLogin, $materialSidenav) {
		$scope.login = function() {
		  $firebaseSimpleLogin(rootRef).$login('google',{rememberMe: true}).then(function(user){
		    $scope.user = user;
		    console.log("Logged in as", user);

		    // load props
		    $scope.props = $firebase(propsRef).$asArray();

		    // load notifications
		    $scope.notifications = $firebase(notificationsRef.child(user.uid)).$asObject();

		    // site presence
		    $scope.user.active = true;
		    usersRef.child($scope.user.uid).set($scope.user);

		    // set user to inactive on disconnect
		    usersRef.child($scope.user.uid).child('active').onDisconnect().set(false);

		    // load people into sidebar
		    $scope.users = $firebase(usersRef).$asArray();
		  });
		}

		$scope.openLeftMenu = function() {
		  $materialSidenav('left').toggle();
		}

	}]);
