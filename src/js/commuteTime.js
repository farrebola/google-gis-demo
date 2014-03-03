googleGisDemo.controller("CommuteTimeCtrl", function($scope, $http) {
	$scope.minvalue=0;
	$scope.maxvalue=60;
	$scope.value=10;
	$scope.propertiesUrl = 'https://www.googleapis.com/mapsengine/v1/tables/01048493643384141193-15363260755447510668/features';

	$scope.resultsFound ="";

	$scope.search="";

	var listhandler = null;
	var marker = null;
	var circle = null;

	var handlerClickReverseGeo = function(event){
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({'latLng': event.latLng, 'region': 'GB', 'language':'en_GB'}, function (results, status) {
		if (status !== google.maps.GeocoderStatus.OK) {
			alert(status);
		}
		// This is checking to see if the Geoeode Status is OK before proceeding
		if (status == google.maps.GeocoderStatus.OK) {
			var address = (results[0].formatted_address);
			//document.getElementById('selectedComm').value = address;
			if (marker !== null){
				marker.setMap(null);
				circle.setMap(null);
				circle=null;
				$scope.value=10;
			}
			marker = new google.maps.Marker({
				position: event.latLng,
				title: results[0].formatted_address,
				clickable: true,
				icon: './glyphicons/png/glyphicons_089_building.png' ,
				map: $scope.map
			});
			marker.showInfoWindow = function() {
				if(!marker.popup) {
					marker.popup = new google.maps.InfoWindow({
					content: results[0].formatted_address
					});             
				}
				marker.popup.open($scope.map, this);
			};
			marker.showInfoWindow();
			$scope.map.panTo(event.latLng);
			marker.addListener("click", function(event){
				marker.showInfoWindow();
			});
			//creation of walking area
			circle = new google.maps.Circle({
				strokeColor: "#0000FF",
				strokeOpacity: 0.8,
				strokeWeight: 2,
				fillColor: "#0000FF",
				fillOpacity: 0.35,
				map: $scope.map,
				radius: $scope.value*100
			});
			circle.bindTo('center', marker, 'position');
		}
	});	

		google.maps.event.removeListener(listhandler);
	};

	$scope.revGeoSearch = function (){
		listhandler = google.maps.event.addListener($scope.map, 'click', handlerClickReverseGeo);
	};

	$scope.timeChange = function(elem) {
		//$scope.toolFilter.clear();
		if (marker !== null){
			if (circle !== null){
				circle.setRadius(elem.value*100);
			}
		}
	};

	// Stop the propagation of the click event
	$('.dropdown-menu').on('click', function(e) {
        e.stopPropagation();
    });
});