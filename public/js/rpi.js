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
                    RPiService.put(function(rpi) {});
                };

                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            })
            
            .service('RPiService', ['$http', function($http) {
                    
                this.rpis = [{id: 'd289df'}, {id: 'fdj2fs'}, {id: 'ab30dk'}];
        
                this.get = function(success, error) {};
                
                this.put = function(success, error) {
                    var id = Math.random().toString(36).substring(6);
                    var rpi = {id: id};
                    this.rpis.push(rpi);
                    success(rpi);
                };
            }]);
        }
    };
});