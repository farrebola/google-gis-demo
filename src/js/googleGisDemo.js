var googleGisDemo = angular.module("googleGisDemo",[]);

googleGisDemo.controller("AppCtrl", function($scope, $http) {
	$scope.showPanel = true;
	$scope.results = [];

	var mapOptions = {
		zoom: 8,
		center: new google.maps.LatLng(-34.397, 150.644),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	$scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

	$scope.doRequest = function(page) {
		$http({method: 'GET', url: 'https://www.googleapis.com/mapsengine/v1/tables/17054336369362646689-09507073323105492707/features?version=published&key=AIzaSyBkvm3UGVoIpBtGA_rw7THbnvXNcSp6W1k'})
			.success(function(data, status, header, config) {
				alert("success!");
			})
			.error(function(data, status, headers, errors) {
				alert("error!");
			});
	};

	$scope.doRequest(1);
});