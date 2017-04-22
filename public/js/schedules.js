define([], function() {
    return {
        init: function(app) {
            app.controller("ScheduleCtrl", function ($scope, ScheduleService, RPiService, User) {

                $scope.schedules = ScheduleService.schedules;
                $scope.zones = [1, 2, 3, 4];
                $scope.rpis = RPiService.rpis;
                $scope.dows = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
                
                $scope.toggle = function(schedule) {
                    schedule.enabled = !schedule.enabled;
                };
                
                $scope.update = function(schedule) {
                    if(schedule.id) {
                        ScheduleService.patch(schedule, function(){
                            $scope.toggle(schedule);
                        });
                    }
                    else {
                        ScheduleService.put(schedule, function(){
                            $scope.toggle(schedule);
                        });
                    }
                };
                
                $scope.create = function() {
                    ScheduleService.createNew();
                    $scope.schedules[0].enabled = true;
                };
                
                $scope.delete = function(schedule) {
                    ScheduleService.delete(schedule);
                };
                
                $scope.play = function(schedule) {
                    schedule.method = "play";
                    ScheduleService.post(schedule);
                };
                
                $scope.pause = function(schedule) {
                    ScheduleService.patch(schedule);
                };
                
                $scope.stop = function(schedule) {
                    schedule.method = "stop";
                    ScheduleService.post(schedule);
                };
                
                var setData = function() {
                    $scope.schedules = ScheduleService.schedules;
                    $scope.rpis = RPiService.rpis;
                };
                
                var updateData = function() {
                    if(User.loggedIn) {
                        ScheduleService.get(setData);
                        RPiService.get(setData);
                    }
                    else {
                        ScheduleService.clear();
                    }
                };

                $scope.$on('user:loggedout', updateData);
                $scope.$on('user:authorized', updateData);
                updateData();
            })

            .directive("schedules", function() {
              return {
                templateUrl: 'html/active-schedules.html'
              };
            })
            
            .service('ScheduleService', ['$http', function($http) {
                    
                this.schedules = [];
        
                this.clear = function() {
                    this.schedules.splice(0, this.schedules.length);
                }
        
                this.createNew = function() {
                    this.schedules.unshift({});
                }
        
                this.get = function(success, error) {
                    
                    var $this = this;
                    $http.get('api/schedule').then(
                            
                        function(response) {
                            $this.schedules.splice(0, $this.schedules.length);
                            for(var i in response['data']) {
                                $this.schedules.push(response['data'][i]);
                            }
                            
                            success && success(response);
                        }, 

                        function(response) {
                            error && error(response);
                        }
                    );
                };
                
                this.post = function(schedule, success, error) {
                    
                    var $this = this;
                    $http.post('api/schedule', schedule).then(
                            
                        function(response) {
                            success && success(response);
                        }, 

                        function(response) {
                            error && error(response);
                        }
                    );
                };
                
                this.delete = function(schedule, success, error) {
                    
                    var $this = this;
                    $http.delete('api/schedule', {data: schedule}).then(
                            
                        function(response) {
                            success && success(response);
                        }, 

                        function(response) {
                            error && error(response);
                        }
                    );
                };
                
                this.patch = function(schedule, success, error) {
                    
                    var $this = this;
                    $http.patch('api/schedule', schedule).then(
                            
                        function(response) {
                            success && success(response);
                        }, 

                        function(response) {
                            error && error(response);
                        }
                    );
                };
                
                this.put = function(schedule, success, error) {
                    
                    var $this = this;
                    $http.put('api/schedule', schedule).then(
                            
                        function(response) {
                            // todo: update id with the returned value
                            success && success(response);
                        }, 

                        function(response) {
                            error && error(response);
                        }
                    );
                };
            }]);
        }
    };
});