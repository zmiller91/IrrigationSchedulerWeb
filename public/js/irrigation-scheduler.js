define([
    'schedules'
],

  function(schedules){
      
    // Create the base module for the page
    var is = angular.module('irrigation-schedule', []);
    schedules.init(is);
    
    // Init the controllers, directives, and services for all the components
    // on the page
    
    // Bootstrap the page
    angular.bootstrap(document, ['irrigation-schedule']);
});