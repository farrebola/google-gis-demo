googleGisDemo.controller("NeighbourhoodsCtrl", function($scope, $http) {

	$scope.toolFilter = $scope.registerGeometryFilter("NeighbourhoodsCtrl");

	$scope.clickOnShape = false;
	$scope.allNeighbourhoodsOn = false;
	
	$scope.neighbourhoodsNames = [];
		
	/**
	 * Enables showing the neighbourhoods on mouse hover.
	 */
 	$scope.toggleNeighbourhoods = function(el) {
		for(var i =0; i< $scope.neighbourhoodsNames.length; i++) {
			var n = $scope.neighbourhoodsNames[i];

			// The condition is inverted because the model isn't updated by angular yet.
			if($scope.allNeighbourhoodsOn) {
				$scope.setPolygonVisible(n.geometry,true);
			} else if (!n.checked) {
				$scope.setPolygonVisible(n.geometry,false);
			}
		}
	};
	
	$scope.setPolygonVisible = function(geometry, visible) {
		
		var map = visible?$scope.map:null;
		for(var i=0; i < geometry.length; i++) {
			geometry[i].setMap(map);
		}		
	};
	
	$scope.setPolygonOptions = function(geometry, options) {
		for(var i=0; i< geometry.length; i++) {
			geometry[i].setOptions(options);
		}
	}
	
	$scope.check = function(id){
		var index = $scope.getNeighbourhoodIndex(id);
		var geom = $scope.neighbourhoodsNames[index].geometry;
		
		if( $scope.neighbourhoodsNames[index].checked) {
			$scope.toolFilter.add(geom);
			
			$scope.setPolygonOptions(geom, {
				"strokeOpacity":1,
				"fillOpacity": 0.1
			});
			$scope.setPolygonVisible(geom, true);
			
		} else {
			$scope.toolFilter.remove(geom);
			$scope.setPolygonOptions(geom, {
				"strokeOpacity":0,
				"fillOpacity": 0
			});
			
			if(!$scope.allNeighbourhoodsOn) {
				$scope.setPolygonVisible(geom, false);
			}
		}
	};
	
	$scope.getNeighbourhoods = function(){
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
				"strokeOpacity": 0,
				"fillColor": "#AB82FF",
				"fillOpacity": 0,
				"geodesic": true
			};
			var featureCollection = new GeoJSON(data, option);
			for(var i=0; i<featureCollection.length; i++){
				if(Array.isArray(featureCollection[i])){
					var idx = $scope.neighbourhoodsNames.push({
						label: featureCollection[i][0].geojsonProperties.CTYUA12NM, 
						checked: false,
						id: featureCollection[i][0].geojsonProperties.gx_id,
						geometry: featureCollection[i]
					});
					
					for(var j=0; j<featureCollection[i].length;j++) {						
						$scope.addPolygonEvents($scope.neighbourhoodsNames[idx-1],featureCollection[i][j]);						
					}
				}else{
					var idx = $scope.neighbourhoodsNames.push({
						label: featureCollection[i].geojsonProperties.CTYUA12NM, 
						checked: false,
						id: featureCollection[i].geojsonProperties.gx_id,
						geometry: [featureCollection[i]]
					});
					
					$scope.addPolygonEvents($scope.neighbourhoodsNames[idx-1],featureCollection[i]);
				}
				
				
			}
		});
	};
	
	$scope.addPolygonEvents = function(neigbourhood, geometry) {
		google.maps.event.addListener(geometry,"click", function(){
			$scope.$apply(function(){
				neigbourhood.checked= !neigbourhood.checked;	
				$scope.check(neigbourhood.id);
			});
		});						
		
		google.maps.event.addListener(geometry,"mouseover", function(){
			if($scope.allNeighbourhoodsOn) {
					geometry.setOptions({
					"strokeOpacity": 1,
					"fillOpacity": 0.1
				});
			}
				
		});
				
		google.maps.event.addListener(geometry,"mouseout", function(){
			if(!neigbourhood.checked) {
				geometry.setOptions({
					"strokeOpacity": 0,
					"fillOpacity": 0
				})
			}
		});
	};

	$scope.getNeighbourhoodIndex = function(id){
		var index = null;
		for(var i=0; i<$scope.neighbourhoodsNames.length; i++){
			if($scope.neighbourhoodsNames[i].id == id){
				index = i;
			}
		}
		return index;
	};
	$scope.checkedNeighbourhoods = function(id){
		var index = $scope.getNeighbourhoodIndex(id);
		if($scope.neighbourhoodsNames[index].checked == false){
			$scope.neighbourhoodsNames[index].checked = true;
		}else{
			$scope.neighbourhoodsNames[index].checked = false;
		}
	};

  	// Initialize neighbourhoods name checkbox
  	$scope.getNeighbourhoods();
});