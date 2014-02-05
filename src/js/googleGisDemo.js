var googleGisDemo = angular.module("googleGisDemo", ["scroll", "ui.bootstrap"]);

googleGisDemo.controller("AppCtrl", function($scope, $http, $filter) {
	$scope.showPanel = true;
	
	/**
	 * The results as are received from the request api.
	 */
	$scope.results = [];

	/**
	 * The results that comply with the geo filters.
	 */
	$scope.geoFilteredResults = [];

	/**
	 * The geometries used to filter the results.
	 */
	$scope.geometryFilters ={};

	$scope.selectedResult = null;
	$scope.propertiesUrl = 'https://www.googleapis.com/mapsengine/v1/tables/17054336369362646689-11613121305523030954/features';
	$scope.nextPageToken = null;

	$scope.filterIntersectionMode = true;

	$scope.statusLabels = {
		for_sale: "For Sale",
		for_rent: "For Rent"
	};

	var mapOptions = {
		zoom: 12,
		center: new google.maps.LatLng(51.507222, -0.1275),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	$scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

	$scope.mapsEngineLayer = new google.maps.visualization.DynamicMapsEngineLayer({
		layerId: '17054336369362646689-11613121305523030954',
		map: $scope.map
	});

	/**
	 * Watches for changes in the filters (done by the filter tool controllers)
 	 * add apply the filters on the results.
 	 */ 
	$scope.$watch("geometryFilters", function() {
		$scope.applyGeoFilters();
	});


	$scope.applyGeoFilters = function() {
		var filtered = [];

		angular.forEach($scope.results, function(result) {
			if($scope.checkGeoFilters(result)) {
				filtered.push(result);
			}
		});


		$scope.geoFilteredResults = filtered;		
	};

	$scope.checkGeoFilters = function(feature) {
		for(var toolFilterKey in $scope.geometryFilters) {
			var result = $scope.checkToolFilter(feature, $scope.geometryFilters[toolFilterKey]);

			if(!result && $scope.filterIntersectionMode) {
				// If we are intersecting filter results from the tools filters,
				// the first failure means the feature won't be in the result set.
				return false;
			} else if (result && !$scope.filterIntersectionMode) {
				// If we are making an union of the tools' filters result,
				// the first time we have a positive we will incluide the feature in the result set.
				return true;
			} 
		}

		// If we have reached the end without going out before, then we mean we have all successes if
		// intersecting, or all failures if making the union.
		if($scope.filterIntersectionMode) {
			return true;
		} else {
			return false;
		}
	};

	$scope.checkToolFilter = function(feature, geometries) {
		
		if(!geometries.length) {
			return true;
		}
		
		var latLng = new google.maps.LatLng(feature.geometry.coordinates[1],feature.geometry.coordinates[0]);
		for(var i = 0; i < geometries.length; i++) {
			if(!geometries[i]) {
				continue;
			}

			if(google.maps.geometry.poly.containsLocation(latLng, geometries[i])) {
				return true;
			}
		}
		
		return false;
	};

	/**
	 * Adds an entry in the geometyFilter watched array for a tool so it can add geometries for use
	 * for filtering.
	 */ 
	$scope.registerGeometryFilter = function(filterToolId) {
		var toolFilter = [];
		$scope.geometryFilters[filterToolId] = toolFilter;


		toolFilter.add = function(feature) {
			toolFilter.push(feature);			
			$scope.applyGeoFilters();				
		};

		toolFilter.update = function(feature) {
			this.remove(feature);
			this.add(feature);			
			$scope.applyGeoFilters();				
		};

		toolFilter.remove = function(feature) {
			var index = this.indexOf(feature);
			toolFilter.splice(index,1);	
			$scope.applyGeoFilters();				
		};

		toolFilter.clear = function() {
			toolFilter.splice(0, toolFilter.length);					
			$scope.applyGeoFilters();			
		}

		return toolFilter;
	};

	$scope.$watchCollection("geoFilteredResults", function() {
		$scope.addMarkersToMap();
	});
	
	/**
	 * This function intercepts the filtered results and create markers form them.
	 */
	$scope.addMarkersToMap = function() {
		
		
		if($scope.map._markers) {
			angular.forEach($scope.map._markers, function(oldmarker) {
				oldmarker.setMap(null);
				oldmarker = null;
			})	
		}
		
		$scope.map._markers = [];
		
		angular.forEach($scope.geoFilteredResults, function(result) {
			var marker = new google.maps.Marker({
				position: {
					lat: result.geometry.coordinates[1],
					lng: result.geometry.coordinates[0]
				},
				title: result.properties.displayable_address,
				map: $scope.map
			});


			marker.showInfoWindow = function() {
				if(!this.popup) {
					this.popup = new google.maps.InfoWindow({
						content: "hello"
					});							
				}
				this.popup.open($scope.map, this);
			};

			marker.addListener("click", function(event){
				marker.showInfoWindow();
			});

			marker.toggleBounce = function (active) {
				
				if (active) {
					this.setAnimation(google.maps.Animation.BOUNCE);
					var m = this;
					setTimeout(function() {
						m.toggleBounce(false);
					}, 2000);
				} else {
					this.setAnimation(null);
				}
			};
			
			$scope.map._markers.push(marker);
		});
	};

	$scope.resultClicked = function(result) {
		// The current result is deselected.
		if ($scope.selectedResult) {
			$scope.selectedResult.active = false;
			
			$scope.selectedResult.marker.toggleBounce(false);
			if ($scope.selectedResult.marker.popup) {
				$scope.selectedResult.marker.popup.close();
				
			}
		}

		// We set the current selected result and highlight it.
		$scope.selectedResult = result;
		
		result.marker.toggleBounce(true);
		result.marker.setZIndex(1000);
		result.active = true;
		result.marker.showInfoWindow();

		$scope.map.panTo(result.marker.position);

	};

	$scope.loadNextPage = function() {
		$scope.doRequest();
	};

	$scope.doRequest = function() {
		var params = {
			key: "AIzaSyBkvm3UGVoIpBtGA_rw7THbnvXNcSp6W1k",
			version: "published",
			//maxResults: 75,
			limit: 1000,
			//orderBy: "price DESC",
			//select: "geometry, displayable_address, agent_phone, price",
			//where: "price>10" // This doesn't seem to work.
		};

		if ($scope.nextPageToken) {
			params["pageToken"] = $scope.nextPageToken;
		}

		$http({
			method: 'GET',
			url: $scope.propertiesUrl,
			params: params
		})
			.success(function(data, status, header, config) {
				if (data.nextPageToken &&  data.nextPageToken!=$scope.nextPageToken) {
					$scope.nextPageToken = data.nextPageToken;
				} else {
					$scope.nextPageToken = null;
				}

				angular.forEach(data.features, function(feature) {
					$scope.results.push({
						geometry: feature.geometry,
						properties: feature.properties,
						id: feature.properties.listing_id
					});
				});

				$scope.applyGeoFilters();
			})
			.error(function(data, status, headers, errors) {
				//alert("error!");
				console.log(data);
			});
	};

	$scope.filter = function(result) {
		return result.properties.price > 0;
	};

	$(document).ready(function() {
		$scope.doRequest(1);
	});

});