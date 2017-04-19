define([], function() {
    return {
        init: function(app) {
            
            app.controller('RegistrationPageCtrl', function ($scope, RegistrationFactory, $location) {
                var success = function() {
                    $location.path("/schedules");
                };
                
                var factory = new RegistrationFactory($scope, success);
                $scope = factory.$scope;
            });
            
        }
    };
});