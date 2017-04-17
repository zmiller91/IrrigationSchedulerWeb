define([], function() {
    return {
        init: function(app) {
            app.controller("ScheduleCtrl", function ($scope, ScheduleService) {

                $scope.activeSchedules = [];

                var update = function() {
                    ScheduleService.get();
                    $scope.activeSchedules = ScheduleService.activeSchedules;
                    $scope.$apply();
                };
                
                angular.element(document).ready(update);
            })

            .directive("activeSchedules", function() {
              return {
                templateUrl: 'html/active-schedules.html'
              };
            })
            
            .service('ScheduleService', ['$http', function($http) {
                    
                this.activeSchedules = [];
        
                this.get = function(success, error) {
                    this.activeSchedules = [
                        {
                            name: "Front Lawn PM",
                            controller: "ck83jl",
                            zone: "1",
                            dow: "MON, WED, FRI",
                            start: "7:45PM",
                            duration: "0:20"
                        },
                        {
                            name: "Front Lawn AM",
                            controller: "ck83jl",
                            zone: "1",
                            dow: "MON, FRI",
                            start: "6:45Am",
                            duration: "0:20"
                        },
                        {
                            name: "Garden",
                            controller: "ck83jl",
                            zone: "2",
                            dow: "MON, FRI",
                            start: "6:45PM",
                            duration: "1:00"
                        }
                    ];
                    
                };
                this.post = function(entry, success, error) {};
                this.delete = function(entry, success, error) {};
                this.patch = function(entry, success, error) {};
            }]);
        }
    };
});