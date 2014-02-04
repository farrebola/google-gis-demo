googleGisDemo.controller("NeighbourhoodsCtrl", function($scope, $http) {

	$scope.toolFilter = $scope.registerGeometryFilter("NeighbourhoodsCtrl");

	$scope.clickOnShape = false;
	$scope.allNeighbourhoodsOn = false;
	$scope.propertiesUrl = 'https://www.googleapis.com/mapsengine/v1/tables/01048493643384141193-17488941626782682984/features';
	$scope.neighbourhoodsNames = [];
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
	$scope.check = function(id){
		var index = getNeighbourhoodIndex(id);
		var geom = $scope.neighbourhoodsNames[index].geometry;
		
		if($scope.neighbourhoodsNames[index].checked == true){
			handlerShape(geom, $scope.map);
		}else{
			handlerShape(geom, null);
		}
	};
	/*var deselectAll = function(){
		for(var i=0; i<$scope.neighbourhoodsNames.length; i++){
			if($scope.neighbourhoodsNames[i].checked == true){
				$scope.neighbourhoodsNames[i].checked = false;
				handlerShape($scope.neighbourhoodsNames[i].geometry, null);
			}
		}
	};*/
	var handlerShape = function(shape, action){
		if (Array.isArray(shape)){
			for(var i=0; i<shape.length; i++){
				shape[i].setMap(action);
			}
		}else{
			shape.setMap(action);
		}

		if(action) {
			$scope.toolFilter.add(shape);
		} else {
			$scope.toolFilter.remove(shape);
		}
	};
	var getNeighbourhoods = function(){
		var url = $scope.propertiesUrl;
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
			var featureCollection = new GeoJSON(data, option);
			for(var i=0; i<featureCollection.length; i++){
				if(Array.isArray(featureCollection[i])){
					for(var j=0; j<featureCollection[i].length; j++){
						$scope.neighbourhoodsNames.push({
							label: featureCollection[i][j].geojsonProperties.CTYUA12NM, 
							checked: false,
							id: featureCollection[i][j].geojsonProperties.gx_id,
							geometry: featureCollection[i]
						});
						break;
					}
				}else{
					$scope.neighbourhoodsNames.push({
						label: featureCollection[i].geojsonProperties.CTYUA12NM, 
						checked: false,
						id: featureCollection[i].geojsonProperties.gx_id,
						geometry: featureCollection[i]
					});
				}
			}
		});
	};
	var getNeighbourhoodIndex = function(id){
		var index = null;
		for(var i=0; i<$scope.neighbourhoodsNames.length; i++){
			if($scope.neighbourhoodsNames[i].id == id){
				index = i;
			}
		}
		return index;
	};
	var checkedNeighbourhoods = function(id){
		var index = getNeighbourhoodIndex(id);
		if($scope.neighbourhoodsNames[index].checked == false){
			$scope.neighbourhoodsNames[index].checked = true;
		}else{
			$scope.neighbourhoodsNames[index].checked = false;
		}
	};
 	google.maps.event.addListener($scope.mapsEngineLayer, 'mouseover', function(event) {
 		var index = getNeighbourhoodIndex(event.featureId);
 		if($scope.neighbourhoodsNames[index].checked == false){
  			var style = $scope.mapsEngineLayer.getFeatureStyle(event.featureId);
    		style.strokeColor = "#380474";
    		style.fillColor = "#AB82FF";
    		style.fillOpacity = '0.1';
    		style.strokeOpacity = '1';
  		}
  	});
  	google.maps.event.addListener($scope.mapsEngineLayer, 'mouseout', function(event) {
  		if(!$scope.clickOnShape){
  			var style = $scope.mapsEngineLayer.getFeatureStyle(event.featureId).resetAll();
  		}
  	});
  	google.maps.event.addListener($scope.mapsEngineLayer, 'click', function(event) {
  		checkedNeighbourhoods(event.featureId);
  		$scope.check(event.featureId);
  	});
  	// Initialize neighbourhoods name checkbox
  	getNeighbourhoods();
});