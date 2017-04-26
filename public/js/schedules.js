define([], function() {
    return {
        init: function(app) {
            app.controller("ScheduleCtrl", function ($scope, $location, ScheduleService, RPiService, User) {

                var confirmSchedule = null;
                var confirmCallBack = null;

                $scope.loading = "";
                $scope.schedules = ScheduleService.schedules;
                $scope.zones = [1, 2, 3, 4];
                $scope.rpis = RPiService.rpis;
                $scope.dows = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
                $scope.isConfirming = false;
                
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
                    $scope.loading = "update";
                    if(schedule.new) {
                        ScheduleService.put(schedule, function(){
                            schedule.clone = null;
                            schedule.enabled = false;
                            schedule.new = false;
                            stopLoading();
                        }, stopLoading);
                    }
                    else {
                        ScheduleService.patch(schedule, function(){
                            schedule.clone = null;
                            schedule.enabled = false;
                            schedule.new = false;
                            stopLoading();
                        }, stopLoading);
                    }
                };
                
                $scope.create = function() {
                    ScheduleService.createNew();
                    $scope.schedules[0]['new'] = true;
                    $scope.edit($scope.schedules[0]);
                };
                
                $scope.delete = function(schedule) {
                    $scope.loading = "delete";
                    ScheduleService.delete(schedule, function() {
                        ScheduleService.remove(schedule);
                        $scope.schedules = ScheduleService.schedules;
                        stopLoading();
                    }, stopLoading);
                };
                
                $scope.play = function(schedule) {
                    $scope.loading = "play";
                    schedule.method = "play";
                    ScheduleService.post(schedule, stopLoading, stopLoading);
                };
                
                $scope.showConfirmation = function(confirm, schedule) {
                    confirmCallBack = confirm;
                    confirmSchedule = schedule;
                    $scope.isConfirming = true;
                };
                
                $scope.clearConfirmation = function() {
                    confirmCallBack = null;
                    confirmSchedule = null;
                    $scope.isConfirming = false;
                };
                
                $scope.confirm = function() {
                    confirmCallBack(confirmSchedule);
                    confirmCallBack = null;
                    confirmSchedule = null;
                };
                
                $scope.pause = function(schedule) {
                    $scope.loading = "pause"
                    ScheduleService.patch(schedule, stopLoading, stopLoading);
                };
                
                $scope.stop = function(schedule) {
                    $scope.loading = "stop";
                    schedule.method = "stop";
                    ScheduleService.post(schedule, stopLoading, stopLoading);
                };
                
                var stopLoading = function() {
                    $scope.loading = "";
                    $scope.clearConfirmation();
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