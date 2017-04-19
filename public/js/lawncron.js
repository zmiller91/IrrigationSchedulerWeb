define([
    'schedules',
    'rpi',
    'login',
    'registration',
    'routes',
    'lib/js-common/user/user',
    'lib/custom.min'
],

  function(schedules, rpi, login, registration, routes, user){
      
    // Create the base module for the page
    var lc = angular.module('irrigation-schedule', ['ui.bootstrap', 'ngRoute']);
    
    // Init the controllers, directives, and services for all the components
    // on the page
    user.init(lc);
    routes.init(lc);
    schedules.init(lc);
    rpi.init(lc);
    login.init(lc);
    registration.init(lc);
    
    // Bootstrap the page
    angular.bootstrap(document, ['irrigation-schedule']);
});