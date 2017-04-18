define([], function() {
    return {
        init: function(app) {
            app.controller("RPiCtrl", function ($scope, $uibModal, RPiService) {

                $scope.rpis = [];
                $scope.open = function () {
                    $uibModal.open({
                        templateUrl: 'html/rpi-modal.html',
                        controller: 'RPiModalCtrl',
                        size: 'sm'
                    });
                };  

                var update = function() {
                    $scope.rpis = RPiService.rpis;
                };
                
                angular.element(document).ready(update);
            })
                    
            .controller("RPiModalCtrl", function ($scope, $uibModalInstance, RPiService) {

                $scope.rpis = RPiService.rpis;

                $scope.create = function () {
                    RPiService.put(update);
                };

                $scope.remove = function (id) {
                    RPiService.delete(id, update);
                };

                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
                
                var update = function() {
                    $scope.rpis = RPiService.rpis;;
                };
                
                RPiService.get(update)
            })
            
            .service('RPiService', ['$http', function($http) {
                    
                this.rpis = [];
                this.get = function(userId, success, error) {
                    var $this = this;
                    $http.get('api/rpi')
                        .then(function(response) {
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
                
                this.delete = function(rpiId, success, error) {
                    var $this = this;
                    $http.delete('api/rpi', {data: {rpi_id: rpiId}})
                        .then(function(response) {
                            for(var i = 0; i < $this.rpis.length; i++) {
                                if($this.rpis[i]['id'] === rpiId) {
                                    $this.rpis.splice(i, 1);
                                    break;
                                }
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
            }]);
        }
    };
});