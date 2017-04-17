define([], function() {
    return {
        init: function(app) {
            app.controller("ScheduleCtrl", function ($scope) {

                var update = function() {}
                angular.element(document).ready(update);
            })

            .directive("journal", function() {
              return {
                templateUrl: 'html/journal/journal.html'
              };
            })
            
            .service('ScheduleService', ['$http', function($http) {
                    
                this.journal = [];
                    
                this.get = function(grow, success, error) {
                    $http.get('api/journal', {params: {grow: grow}})
                        .then(function(response) {
                            this.journal = response["data"];
                            if (success) {
                                success(this.journal);
                            }
                        }, function(response) {
                            if (error) {
                                error(response);
                            }
                        }
                    );
                };
                    
                this.post = function(entry, success, error) {
                    $http.post('api/journal', {text: entry})
                        .then(function(response) {
                            this.journal = response["data"];
                            if (success) {
                                success(this.journal);
                            }
                        }, function(response) {
                            if (error) {
                                error(response);
                            }
                        }
                    );
                };
                    
                this.delete = function(entry, success, error) {
                    $http.delete('api/journal', {data: {record: entry}})
                        .then(function(response) {
                            this.journal = response["data"];
                            if (success) {
                                success(this.journal);
                            }
                        }, function(response) {
                            if (error) {
                                error(response);
                            }
                        }
                    );
                };
                    
                this.patch = function(entry, success, error) {
                    $http.patch('api/journal', {record: entry})
                        .then(function(response) {
                            this.journal = response["data"];
                            if (success) {
                                success(this.journal);
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