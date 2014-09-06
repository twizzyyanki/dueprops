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

  .controller('Application', ['$rootScope','$scope', '$firebase', '$firebaseSimpleLogin', '$materialSidenav', '$materialToast', '$materialDialog',
               function($rootScope, $scope, $firebase, $firebaseSimpleLogin, $materialSidenav, $materialToast, $materialDialog) {

    // for debugging
    window.scope = $scope;

    // Create a Firebase Simple Login object
    $scope.auth = $firebaseSimpleLogin(rootRef);

    // Start with no user logged in
    $scope.user = null;

    // Upon successful login, set the user object
    // happens automatically when rememberMe is enabled
    $rootScope.$on("$firebaseSimpleLogin:login", function(event, user) {
      $scope.user = user;
      console.log("Logged in as", user);

      // todo: not sure how to make it disappear
      // $materialToast({
      //   template: '<material-toast>Welcome' + user.displayName + '</material-toast>',
      //   duration: 2000,
      //   position: 'bottom'
      // });

      // site presence
      user.active = true;
      user.provider_id = user.id;
      usersRef.child(user.uid).set(user);

      // set user to inactive on disconnect
      usersRef.child($scope.user.uid).child('active').onDisconnect().set(false);

      // load people into sidebar
      $scope.users = $firebase(usersRef).$asArray();

      // load props
      $scope.props = $firebase(propsRef).$asArray();

      // load notifications
      $scope.notifications = $firebase(notificationsRef.child(user.uid)).$asObject();
    });

    // Upon successful logout, reset the user object
    $rootScope.$on("$firebaseSimpleLogin:logout", function(event) {
      $scope.user = null;
    });

    $scope.login = function(provider) {
      $scope.auth.$login(provider, { preferRedirect: true, rememberMe: true } ).then(function(user) {
        console.log('login successful');
      }, function(err) {
        console.log('error logging in', err);
      });
    }

    $scope.logout = function() {
      $scope.auth.$logout();
    };

    $scope.openLeftMenu = function() {
      $materialSidenav('left').toggle();
    }

    $scope.openPropDialog = function(prop) {
      $materialDialog({
        templateUrl: 'propdialog.html',
        controller: ['$scope', '$hideDialog', function($scope, $hideDialog) {
          $scope.prop = prop;

          $scope.close = function() {
            $hideDialog();
          };

          $scope.draftRequest = function(prop) {
            $scope.draft = $.extend({request: true}, prop);
            window.draft = $scope.draft;
            $scope.draft.valid = function() {
              return !!this.reason && this.reason.length <= 140;
            }
          }

          $scope.draftSend = function(prop) {
            $scope.draft = $.extend({gift: true}, prop);
            window.draft = $scope.draft;
            $scope.draft.valid = function() {
              return !!this.to && !!this.reason && this.reason.length <= 140;
            }
          }
        }]
      });
    }
  }])

  .directive('ig', function() {
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
