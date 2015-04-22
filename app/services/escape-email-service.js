angular.module('dueprops.services').factory('escapeEmail', function() {
  return function(email) {
    if(typeof email === 'string') {
      email = email.replace(/\./g, ',');
      email = email.toLowerCase();
      return email; 
    }
    else if(typeof email === 'object') {
      var newEmailList = [];
      for(var i = 0; i < email.length; i++) {
        email = email[i].text.replace(/\./g, ',');
        // email = email[i].text.toLowerCase();
        // Replace '.' (not allowed in a Firebase key) with ',' (not allowed in an email address)
        newEmailList.push(email);
      }
      return newEmailList;

    }
    
  };
});

