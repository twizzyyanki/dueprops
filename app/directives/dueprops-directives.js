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

angular.module("dueprops.directives")
  .directive('multipleInput', function() {
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
          '<tags-input type="text" id="{{fid}}" ng-model="draft[fid]">' +
        '</md-input-container>'
    };
  });
