define([
    'schedules',
    'rpi',
    'login',
    'registration',
    'routes',
    'navigation',
    'lib/js-common/user/user'
],

  function(schedules, rpi, login, registration, routes, navigation, user){
      
    // Create the base module for the page
    var lc = angular.module('irrigation-schedule', ['ui.bootstrap', 'ngRoute', 'ui.select']);
    
    // Init the controllers, directives, and services for all the components
    // on the page
    user.init(lc);
    routes.init(lc);
    schedules.init(lc);
    rpi.init(lc);
    login.init(lc);
    registration.init(lc);
    navigation.init(lc);
    
    // Bootstrap the page
    angular.bootstrap(document, ['irrigation-schedule']);
});