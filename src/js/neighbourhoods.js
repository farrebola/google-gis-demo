googleGisDemo.controller("NeighbourhoodsCtrl", function($scope, $http) {
	$scope.resultsFound ="";
	$scope.clickOnShape = false;
	$scope.allNeighbourhoodsOn = false;
	$scope.propertiesUrl = 'https://www.googleapis.com/mapsengine/v1/tables/01048493643384141193-17488941626782682984/features/';
	$scope.neighbourhoodsNames = [
		{ label: "Neighbourhood 1", checked: false},
		{ label: "Neighbourhood 2", checked: false},
		{ label: "Neighbourhood 3", checked: false},
		{ label: "Neighbourhood 4", checked: false}
	];
	$scope.mapsEngineLayer = new google.maps.visualization.DynamicMapsEngineLayer({
		layerId: '01048493643384141193-00161330875310406093',
		map: null,
		suppressInfoWindows: true
 	});
 	$scope.toggleNeighbourhoods = function(el) {
		if(!$scope.allNeighbourhoodsOn){
			$scope.mapsEngineLayer.setMap($scope.map);
		}else{
			$scope.mapsEngineLayer.setMap(null);
		}
	};

	var shapesClicked = [];

 	google.maps.event.addListener($scope.mapsEngineLayer, 'mouseover', function(event) {
    	var style = $scope.mapsEngineLayer.getFeatureStyle(event.featureId);
    	style.strokeColor = "#380474";
    	style.fillColor = "#AB82FF";
    	style.fillOpacity = '0.1';
    	style.strokeOpacity = '1';
  	});
  	google.maps.event.addListener($scope.mapsEngineLayer, 'mouseout', function(event) {
  		if(!$scope.clickOnShape){
  			var style = $scope.mapsEngineLayer.getFeatureStyle(event.featureId).resetAll();
  		}
  	});
  	google.maps.event.addListener($scope.mapsEngineLayer, 'click', function(event) {
  		var url = $scope.propertiesUrl + event.featureId;
  		var params = {
			key: "AIzaSyBkvm3UGVoIpBtGA_rw7THbnvXNcSp6W1k",
			version: "published"
		};
		$http({
			method: 'GET',
			url: url,
			params: params
		}).success(function(data, status, header, config){
			var option = {
				"strokeColor": "#380474",
				"strokeOpacity": 1,
				"fillColor": "#AB82FF",
				"fillOpacity": 0.1
			};
			var myGoogleVector = new GeoJSON(data.geometry, option);
			myGoogleVector.setMap($scope.map);
		});
  	});
});