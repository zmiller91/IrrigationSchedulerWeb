define([], function() {
    return {
        init: function(app) {
            
            app.controller('LoginPageCtrl', function ($scope, LoginFactory, $location) {
                var success = function() {
                    $location.path("/schedules");
                };
                
                var factory = new LoginFactory($scope, success);
                $scope = factory.$scope;
            });
            
        }
    };
});