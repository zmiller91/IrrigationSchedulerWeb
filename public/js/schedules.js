define([], function() {
    return {
        init: function(app) {
            app.controller("ScheduleCtrl", function ($scope, ScheduleService, RPiService) {

                $scope.activeSchedules = ScheduleService.activeSchedules;
                $scope.rpis = RPiService.rpis;
                $scope.dows = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
                $scope.zones = [1, 2, 3, 4];
                
                var update = function() {
                    $scope.activeSchedules = ScheduleService.activeSchedules;
                    $scope.rpis = RPiService.rpis;
                };
                
                $scope.toggle = function(schedule) {
                    schedule.enabled = !schedule.enabled;
                }
                
                $scope.create = function() {
                    $scope.activeSchedules = ScheduleService.addNew();
                    $scope.activeSchedules[0].enabled = true;
                }
                
                ScheduleService.get(update);
                RPiService.get(update);
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
                            rpi: {id: "ck83jl"},
                            zone: "1",
                            dow: ["MON", "WED", "FRI"],
                            start: "7:45PM",
                            duration: "0:20"
                        },
                        {
                            name: "Front Lawn AM",
                            rpi: {id: "ck83jl"},
                            zone: "1",
                            dow: ["MON", "FRI"],
                            start: "6:45Am",
                            duration: "0:20"
                        },
                        {
                            name: "Garden",
                            rpi: {id: "ck83jl"},
                            zone: "2",
                            dow: ["MON", "FRI"],
                            start: "6:45PM",
                            duration: "1:00"
                        }
                    ];
                    
                };
                
                this.addNew = function(){
                    this.activeSchedules.unshift({});
                    return this.activeSchedules;
                };
                
                this.post = function(entry, success, error) {};
                this.delete = function(entry, success, error) {};
                this.patch = function(entry, success, error) {};
            }]);
        }
    };
});