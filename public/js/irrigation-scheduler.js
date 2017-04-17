define([
    'schedules',
    'lib/js-common/user/user'
],

  function(schedules, user){
      
    // Create the base module for the page
    var is = angular.module('irrigation-schedule', ['ui.bootstrap']);
    schedules.init(is);
    user.init(is);
    
    // Init the controllers, directives, and services for all the components
    // on the page
    
    // Bootstrap the page
    angular.bootstrap(document, ['irrigation-schedule']);
});