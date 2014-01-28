googleGisDemo.controller("WalkingDistanceCtrl", function($scope) {
	$scope.minvalue=0;
	$scope.maxvalue=60;
	$scope.value=10;
	// Stop the propagation of the click event
	$('.dropdown-menu').on('click', function(e) {
        e.stopPropagation();
    });
});