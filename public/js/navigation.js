define([], function() {
    return {
        init: function(app) {
            app.controller("NavigationCtrl", function ($scope, User) {
                $scope.collapsed = true;
                $scope.path = "";

                $scope.toggleCollapse = function() {
                    $scope.collapsed = !$scope.collapsed;
                }
                
                $scope.navLogout = function() {
                    $scope.path = "/logout";
                    User.logout();
                };
                
                $scope.getNavClass = function() {
                    return $scope.collapsed ? 'nav-sm' : 'nav-md';
                }
                
                $scope.getTabClass = function(activeRoute) {
                    if(activeRoute !== $scope.path) {
                        return ""
                    }
                    
                    return $scope.collapsed ? 'active-sm' : 'active';
                }

                $scope.$on('$routeChangeStart', function(event, next, current) { 
                    $scope.path = next.originalPath;
                });
            });
        }
    };
});