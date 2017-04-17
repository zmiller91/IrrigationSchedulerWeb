define([
    'schedules',
    'rpi',
    'lib/js-common/user/user'
],

  function(schedules, rpi, user){
      
    // Create the base module for the page
    var is = angular.module('irrigation-schedule', ['ui.bootstrap']);
    
    // Init the controllers, directives, and services for all the components
    // on the page
    schedules.init(is);
    user.init(is);
    rpi.init(is);
    
    // Bootstrap the page
    angular.bootstrap(document, ['irrigation-schedule']);
});