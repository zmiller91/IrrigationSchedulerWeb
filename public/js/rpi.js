define([], function() {
    return {
        init: function(app) {
            app.controller("RPiCtrl", function ($scope, $location, $timeout, RPiService, User) {

                $scope.rpis = RPiService.rpis;

                $scope.create = function () {
                    RPiService.put(update);
                };
                
                $scope.showConfirmation = function(pi) {
                    pi.confirming = true;
                };
                
                $scope.hideConfirmation = function(pi) {
                    pi.confirming = false;
                };
                
                $scope.confirm = function(pi) {
                    pi.confirming = false;
                    remove(pi);
                };

                var remove = function (pi) {
                    RPiService.delete(pi, update, function() {
                        $timeout(function () { pi.errors = [] }, 5000);   
                    });
                };
                
                var update = function() {
                    $scope.rpis = RPiService.rpis;
                };
                
                var logout = function() {
                    $scope.rpis = [];
                    goToLogin();
                };
                
                var goToLogin = function() {
                    $location.path('/login');
                };
                
                var getData = function() {
                    RPiService.get(update);
                };
                
                $scope.$on('user:loggedout', logout);
                if(!User.loggedIn) {
                    User.authorizeCookie(function(user) {
                        user.loggedIn && getData();
                        !user.loggedIn && goToLogin();
                    }, goToLogin);
                }
            })
            
            .service('RPiService', ['$http', function($http) {
                    
                this.rpis = [];
                this.get = function(success, error) {
                    var $this = this;
                    if(this.rpis.length > 0) {
                        if (success) {
                            success(null);
                        }
                        return;
                    }
                    
                    $http.get('api/rpi')
                        .then(function(response) {
                            $this.rpis.splice(0, $this.rpis.length);
                            for(var i in response['data']) {
                                $this.rpis.push(response['data'][i]);
                            }
                            if (success) {
                                success(response);
                            }
                        }, function(response) {
                            if (error) {
                                error(response);
                            }
                        }
                    );
                };
                
                this.put = function(success, error) {
                    var $this = this;
                    $http.put('api/rpi')
                        .then(function(response) {
                            $this.rpis.push(response['data']);
                            if (success) {
                                success(response);
                            }
                        }, function(response) {
                            if (error) {
                                error(response);
                            }
                        }
                    );
                };
                
                this.delete = function(pi, success, error) {
                    
                    var $this = this;
                    pi.loading = true;
                    $http.delete('api/rpi', {data: {rpi_id: pi.id}}).then(
                            
                        function(response) {
                            for(var i = 0; i < $this.rpis.length; i++) {
                                if($this.rpis[i]['id'] === pi.id) {
                                    $this.rpis.splice(i, 1);
                                    break;
                                }
                            }
                            
                            pi.loading = false;
                            pi.errors = [];
                            success && success(response);
                        }, 
                        
                        function(response) {
                            pi.loading = false;
                            if(response.data.errors) {
                                pi.errors = response.data.errors;
                            }
                            error && error(response);
                        }
                    );
                };
            }]);
        }
    };
});