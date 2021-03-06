'use strict'

var escapeEmail;

describe('escapeEmail', function() {
  beforeEach(module('dueprops.services'));

  beforeEach(inject(function(_escapeEmail_) {
    escapeEmail = _escapeEmail_;
  }));

  describe('single email address', function() {
    it('converts dots to commas', function() {
      expect(escapeEmail('rukayat.sadiq@andela.co')).toEqual('rukayat,sadiq@andela,co');    
    });

    it('converts uppercase email to lowercase', function() {
      expect(escapeEmail('RUKAYAT.SADIQ@ANDELA.CO')).toEqual('rukayat,sadiq@andela,co');
    });
  });

  describe('multiple email addresses', function() {
    it('converts dots to commas', function() {
      expect(escapeEmail([
        {text: 'blessing.orazulume@andela.co'},
        {text: 'rukayat.sadiq@andela.co'}
      ])).toEqual(['blessing,orazulume@andela,co', 'rukayat,sadiq@andela,co']);   
    });

    it('converts uppercase email to lowercase', function() {
      expect(escapeEmail([
        {text: 'BLESSING.ORAZULUME@ANDELA.CO'},
        {text: 'RUKAYAT.SADIQ@ANDELA.CO'}
      ])).toEqual(['blessing,orazulume@andela,co', 'rukayat,sadiq@andela,co']);
    });
  });
});
