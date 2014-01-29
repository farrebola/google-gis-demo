googleGisDemo.controller("WalkingDistanceCtrl", function($scope) {
	$scope.minvalue=0;
	$scope.maxvalue=60;
	$scope.value=10;

	$scope.resultsFound ="";

	$scope.allLinesOn = false;
	$scope.allPlacesOn = false;

	$scope.tubeLines = [
		{ label: "Line 1", checked: false},
		{ label: "Line 2", checked: false},
		{ label: "Line 3", checked: false},
		{ label: "Line 4", checked: false}
	];

	$scope.placeKinds = [
		{ label: "Grocery", checked: false},
		{ label: "Coffe Shop", checked: false},
		{ label: "High Schools", checked: false},
		{ label: "Restaurants", checked: false}
	];

	$scope.togglePlaces = function() {
		for (var i = 0; i < $scope.placeKinds.length; i++) {
			// We need to negate allPlacesOn because the event gets fired
			// before the model is updated.
			$scope.placeKinds[i].checked = !$scope.allPlacesOn;
		};
	};

	$scope.toggleLines = function() {
		for (var i = 0; i < $scope.tubeLines.length; i++) {
			// We need to negate allLinesOn because the event gets fired
			// before the model is updated.
			$scope.tubeLines[i].checked = !$scope.allLinesOn;
		};
	};

	// Stop the propagation of the click event
	$('.dropdown-menu').on('click', function(e) {
        e.stopPropagation();
    });
});