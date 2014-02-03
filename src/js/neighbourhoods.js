googleGisDemo.controller("NeighbourhoodsCtrl", function($scope) {
	$scope.resultsFound ="";
	$scope.clickOnShape = false;
	$scope.allNeighbourhoodsOn = false;
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
  		if(shapesClicked.indexOf(event.featureId) != -1){

  		}else{
  			shapesClicked.push(event.featureId);
  			
  		}
  	});
});