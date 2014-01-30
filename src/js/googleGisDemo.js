var googleGisDemo = angular.module("googleGisDemo",[]);

googleGisDemo.controller("AppCtrl", function($scope, $http) {
	$scope.showPanel = true;
	$scope.results = [];
	
	$scope.statusLabels = {
		for_sale: "For Sale",
		for_rent: "For Rent"
	}

	var mapOptions = {
		zoom: 12,
		center: new google.maps.LatLng(51.507222,  -0.1275),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	$scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

	$scope.doRequest = function(page) {
		$http({method: 'GET', url: 'https://www.googleapis.com/mapsengine/v1/tables/17054336369362646689-16143158689603361093/features?version=published&key=AIzaSyBkvm3UGVoIpBtGA_rw7THbnvXNcSp6W1k'})
			.success(function(data, status, header, config) {			

				angular.forEach(data.features, function(feature) {

					var marker = new google.maps.Marker({
						position: {
							lat: feature.geometry.coordinates[1],
							lng: feature.geometry.coordinates[0]
						},
						title: feature.properties.displayable_address,
						map: $scope.map
					});

					$scope.results.push({
						properties: feature.properties,
						marker: marker
					});
				});
			})
			.error(function(data, status, headers, errors) {
				alert("error!");
			});
	};

	$(document).ready(function() {
		$scope.doRequest(1);
	});
	
});