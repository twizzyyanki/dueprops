console.log("hey now");

angular.module("DueProps", [])

  .run(['$rootScope', function($rootScope) {
  }])

	.controller('UserSettingsCtrl', function($scope) {
		$scope.tags = [];
		$scope.add = function(tag) {
			$scope.tags.push({name:tag});
		}
	})

  .directive('sideNav', function() {
	  return {
		  restrict: 'E',
		  templateUrl : '/sidenav.html',
		  controller : ['$attrs', '$scope', function($attrs, $scope) {
	  		$scope.mytags = $scope.$eval($attrs.tags);
	  	}]
	  };
	});
