var googleGisDemo = angular.module("googleGisDemo", ["scroll"]);

googleGisDemo.controller("AppCtrl", function($scope, $http) {
	$scope.showPanel = true;
	$scope.results = [];
	$scope.selectedResult = null;
	$scope.propertiesUrl = 'https://www.googleapis.com/mapsengine/v1/tables/17054336369362646689-16143158689603361093/features?version=published&key=AIzaSyBkvm3UGVoIpBtGA_rw7THbnvXNcSp6W1k&maxResults=20';
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

	$scope.resultClicked = function(result) {
		// The current result is deselected.
		if ($scope.selectedResult) {
			$scope.selectedResult.active = false;
		}

		// We set the current selected result and highlight it.
		$scope.selectedResult = result;
		result.active = true;
	};

	$scope.loadNextPage = function() {
		$scope.doRequest();
	};

	$scope.doRequest = function() {
		var url = $scope.propertiesUrl;
		if ($scope.nextPageToken) {
			url += "&pageToken=" + $scope.nextPageToken;
		}
		$http({
			method: 'GET',
			url: url
		})
			.success(function(data, status, header, config) {
				if (data.nextPageToken) {
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