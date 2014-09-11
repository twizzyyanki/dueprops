DueProps.directive('siteHeader', function() {
  return {
    restrict: 'E',
    controller: 'SiteHeaderController',
    templateUrl: '/shared/header.html'
  }
})
;
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

DueProps.directive('propCard', function() {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: '/shared/prop-card.html'
  }
});
