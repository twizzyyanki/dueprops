angular.module('dueprops.services').factory('escapeEmail', function() {
  var escapeSingleEmail = function(email) {
    return email.replace(/\./g, ',').toLowerCase();
  };

  return function(emails) {
    if (typeof emails === 'string') {
      return escapeSingleEmail(emails);
    }

    return _.map(emails, function(email) {
      return escapeSingleEmail(email.text);
    });
  };
});