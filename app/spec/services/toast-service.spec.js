'use strict'

var toast;
var $mdToast;

describe('toast', function() {
  beforeEach(module('dueprops.services', 'ngMaterial'));

  beforeEach(inject(function(_toast_, _$mdToast_) {
    toast    = _toast_;
    $mdToast = _$mdToast_;
    spyOn($mdToast, 'show');
  }));

  describe('text', function() {
    it('gets a default value if not set', function() {
      toast('');
      expect($mdToast.show).toHaveBeenCalledWith({ 
        template:  '<md-toast>Toast Text Goes Here</md-toast>',
        hideDelay: undefined,
        position:  'bottom left'
      });
    });

    it('accepts the provided text value', function() {
      toast('hello');
      expect($mdToast.show).toHaveBeenCalledWith({ 
        template:  '<md-toast>hello</md-toast>',
        hideDelay: undefined,
        position:  'bottom left'
      });
    });
  });

});
