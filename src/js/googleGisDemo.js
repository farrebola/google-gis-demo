var googleGisDemo = angular.module("googleGisDemo", ["scroll"]);

googleGisDemo.controller("AppCtrl", function($scope, $http) {
	$scope.showPanel = true;
	$scope.results = [];
	$scope.selectedResult = null;
	$scope.propertiesUrl = 'https://www.googleapis.com/mapsengine/v1/tables/17054336369362646689-11613121305523030954/features';
	$scope.nextPageToken = null;


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
			select: "geometry, displayable_address, agent_phone, price",
			orderBy: "price DESC",
			maxResults: 75,
			limit: 75
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

					var marker = new google.maps.Marker({
						position: {
							lat: feature.geometry.coordinates[1],
							lng: feature.geometry.coordinates[0]
						},
						title: feature.properties.displayable_address,
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

					$scope.results.push({
						properties: feature.properties,
						marker: marker
					});
				});
			})
			.error(function(data, status, headers, errors) {
				alert("error!");
				console.log(data);
			});
	};

	$(document).ready(function() {
		$scope.doRequest(1);
	});

});