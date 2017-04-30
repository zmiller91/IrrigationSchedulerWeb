define([], function() {
    return {
        init: function(app) {
            app.controller("ScheduleCtrl", function ($scope, $location, $timeout, ScheduleService, RPiService, User) {

                $scope.schedules = ScheduleService.schedules;
                $scope.zones = [1, 2, 3, 4];
                $scope.rpis = RPiService.rpis;
                $scope.dows = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
                
                $scope.edit = function(schedule) {
                    schedule.enabled = true;
                    schedule.clone = clone(schedule);
                };
                
                $scope.cancel = function(schedule) {
                    if(schedule.new) {
                        ScheduleService.remove(schedule);
                    }
                    else {
                        ScheduleService.replace(schedule, schedule.clone)
                        schedule.enabled = false;
                    }
                };
                
                $scope.update = function(schedule) {
                    if(schedule.new) {
                        ScheduleService.put(schedule, function(){
                            schedule.clone = null;
                            schedule.enabled = false;
                            schedule.new = false;
                        });
                    }
                    else {
                        ScheduleService.patch(schedule, function(){
                            schedule.clone = null;
                            schedule.enabled = false;
                            schedule.new = false;
                        });
                    }
                };
                
                $scope.create = function() {
                    ScheduleService.createNew();
                    $scope.schedules[0]['new'] = true;
                    $scope.edit($scope.schedules[0]);
                };
                
                $scope.refresh = function() {
                    ScheduleService.post({method: "refresh"}, null);
                };
                
                $scope.delete = function(schedule) {
                    ScheduleService.delete(schedule, function() {
                        ScheduleService.remove(schedule);
                        $scope.schedules = ScheduleService.schedules;
                    }, function() {
                        $timeout(function () { schedule.errors = [] }, 5000);   
                    });
                };
                
                $scope.play = function(schedule) {
                    schedule.method = "play";
                    ScheduleService.post(schedule, null, function() {
                        $timeout(function () { schedule.errors = [] }, 5000);   
                    });
                };
                
                $scope.showConfirmation = function(text, confirm, schedule) {
                    
                    schedule.confirm = confirm;
                    schedule.text = text;
                    schedule.confirming = true;
                };
                
                $scope.hideConfirmation = function(schedule) {
                    schedule.confirm = null;
                    schedule.text = null;
                    schedule.confirming = false;
                };
                
                $scope.confirm = function(schedule) {
                    schedule.confirm(schedule);
                    schedule.confirming = false;
                };
                
                $scope.pause = function(schedule) {
                    ScheduleService.patch(schedule);
                };
                
                $scope.stop = function(schedule) {
                    schedule.method = "stop";
                    ScheduleService.post(schedule, null, function() {
                        $timeout(function () { schedule.errors = [] }, 5000);   
                    });
                };
                
                var clone = function(object) {
                    return JSON.parse(JSON.stringify(object));
                };
                
                var setData = function() {
                    $scope.schedules = ScheduleService.schedules;
                    $scope.rpis = RPiService.rpis;
                };
                
                var setData = function() {
                    $scope.schedules = ScheduleService.schedules;
                    $scope.rpis = RPiService.rpis;
                };
                
                var logout = function() {
                    $scope.schedules = [];
                    $scope.rpis = [];
                    goToLogin();
                };
                
                var getData = function() {
                    ScheduleService.get(setData, null);
                    RPiService.get(setData, null);
                };
                
                var goToLogin = function() {
                    $location.path('/login');
                };

                $scope.$on('user:loggedout', logout);
                if(!User.loggedIn) {
                    User.authorizeCookie(function(user) {
                        user.loggedIn && getData();
                        !user.loggedIn && goToLogin();
                    }, goToLogin);
                }
                else {
                    getData();
                }
            })

            .directive("schedulesForm", function() {
              return {
                templateUrl: 'html/schedules-form.html'
              };
            })
            
            .service('ScheduleService', ['$http', '$rootScope', function($http, $rootScope) {
                    
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
                    for(var k in oldSchedule) {
                        oldSchedule[k] = newSchedule[k];
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
                            
                            $rootScope.$broadcast('schedules:refreshed',$this.data);
                            success && success(response);
                        }, 

                        function(response) {
                            error && error(response);
                        }
                    );
                };
                
                this.post = function(schedule, success, error) {
                    
                    var $this = this;
                    schedule.loading = true;
                    $http.post('api/schedule', schedule).then(
                            
                        function(response) {
                            schedule.loading = false;
                            schedule.errors = [];
                            success && success(response);
                        }, 

                        function(response) {
                            schedule.loading = false;
                            if(response.data.errors) {
                                schedule.errors = response.data.errors;
                            }
                            error && error(response);
                        }
                    );
                };
                
                this.delete = function(schedule, success, error) {
                    
                    var $this = this;
                    schedule.loading = true;
                    $http.delete('api/schedule', {data: schedule}).then(
                            
                        function(response) {
                            schedule.loading = false;
                            schedule.errors = [];
                            success && success(response);
                        }, 

                        function(response) {
                            schedule.loading = false;
                            if(response.data.errors) {
                                schedule.errors = response.data.errors;
                            }
                            error && error(response);
                        }
                    );
                };
                
                this.patch = function(schedule, success, error) {
                    
                    var $this = this;
                    schedule.loading = true;
                    $http.patch('api/schedule', schedule).then(
                            
                        function(response) {
                            schedule.loading = false;
                            schedule.errors = [];
                            success && success(response);
                        }, 

                        function(response) {
                            schedule.loading = false;
                            if(response.data.errors) {
                                schedule.errors = response.data.errors;
                            }
                            error && error(response);
                        }
                    );
                };
                
                this.put = function(schedule, success, error) {
                    
                    var $this = this;
                    schedule.loading = true;
                    $http.put('api/schedule', schedule).then(
                            
                        function(response) {
                            schedule.loading = false;
                            schedule["id"] = response["data"]["id"];
                            schedule.errors = [];
                            success && success(response);
                        }, 

                        function(response) {
                            schedule.loading = false;
                            if(response.data.errors) {
                                schedule.errors = response.data.errors;
                            }
                            error && error(response);
                        }
                    );
                };
            }]);
        }
    };
});