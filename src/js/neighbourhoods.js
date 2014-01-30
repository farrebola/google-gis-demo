googleGisDemo.controller("NeighbourhoodsCtrl", function($scope) {
	$scope.resultsFound ="";

	$scope.allNeighbourhoodsOn = false;
	$scope.neighbourhoodsNames = [
		{ label: "Neighbourhood 1", checked: false},
		{ label: "Neighbourhood 2", checked: false},
		{ label: "Neighbourhood 3", checked: false},
		{ label: "Neighbourhood 4", checked: false}
	];

	$scope.toggleNeighbourhoods = function() {
		alert("Click the map to select neighbourhood");
	};

});