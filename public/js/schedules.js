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
                    if(schedule.enabled) {
                        schedule.parent = null;
                        schedule.clone = null;
                        schedule.clone = clone(schedule);
                        schedule.clone.parent = schedule;
                    }
                    else {
                        if(schedule.new) {
                            ScheduleService.remove(schedule.parent);
                        }
                    }
                };
                
                $scope.update = function(schedule) {
                    
                    if(schedule.id) {
                        var parent = schedule.parent;
                        schedule.parent = null;
                        ScheduleService.patch(schedule, function(){
                            $scope.toggle(schedule);
                            ScheduleService.replace(parent, schedule);
                            schedule.enabled = false;
                        });
                    }
                    
                    else {
                        var parent = schedule.parent;
                        schedule.parent = null;
                        ScheduleService.put(schedule, function(){
                            schedule.new = false;
                            ScheduleService.replace(parent, schedule);
                            schedule.enabled = false;
                        });
                    }
                };
                
                $scope.create = function() {
                    ScheduleService.createNew();
                    $scope.schedules[0]['new'] = true;
                    $scope.toggle($scope.schedules[0]);
                };
                
                $scope.delete = function(schedule) {
                    ScheduleService.delete(schedule, function() {
                        ScheduleService.remove(schedule);
                        $scope.schedules = ScheduleService.schedules;
                    });
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
                
                var clone = function(object) {
                    return JSON.parse(JSON.stringify(object));
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

            .directive("schedulesForm", function() {
              return {
                templateUrl: 'html/schedules-form.html'
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
                
                this.remove = function(schedule) {
                    for(var s in this.schedules) {
                        if (this.schedules[s] === schedule) {
                            this.schedules.splice(s, 1);
                            break;
                        }
                    }
                }
                
                this.replace = function(oldSchedule, newSchedule) {
                    for(var s in this.schedules) {
                        if (this.schedules[s] === oldSchedule) {
                            this.schedules[s] = newSchedule;
                            break;
                        }
                    }
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
                            schedule["id"] = response["data"]["id"];
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