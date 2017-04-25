define([], function() {
    return {
        init: function(app) {
             app.config(function($routeProvider, $locationProvider) {
                $routeProvider

                    .when('/schedules', {
                            templateUrl: 'html/schedules.html',
                            controller: 'ScheduleCtrl'
                    })

                    .when('/rpis', {
                            templateUrl: 'html/rpis.html',
                            controller: 'RPiCtrl'
                    })

                    .when('/login', {
                            templateUrl: 'html/login.html',
                            controller: 'LoginPageCtrl'
                    })

                    .when('/register', {
                            templateUrl: 'html/registration.html',
                            controller: 'RegistrationPageCtrl'
                    })

                    .otherwise({
                        redirectTo: '/schedules'
                    });

                $locationProvider.html5Mode(true);
            });
        }
    };
});