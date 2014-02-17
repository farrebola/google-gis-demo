googleGisDemo.controller("CommuteTimeCtrl", function($scope, $http) {
	$scope.minvalue=0;
	$scope.maxvalue=60;
	$scope.value=10;
	$scope.propertiesUrl = 'https://www.googleapis.com/mapsengine/v1/tables/01048493643384141193-15363260755447510668/features';

	$scope.resultsFound ="";

	$scope.search="";

	var input = (document.getElementById('pac-input'));
	  
	//$scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  	var searchBox = new google.maps.places.SearchBox((input));
  	var markers = [];

  	// Listen for the event fired when the user selects an item from the
  	// pick list. Retrieve the matching places for that item.
  	google.maps.event.addListener(searchBox, 'places_changed', function() {
    	var places = searchBox.getPlaces();

	    for (var i = 0, marker; marker = markers[i]; i++) {
	      marker.setMap(null);
	    }

	    // For each place, get the icon, place name, and location.
	    markers = [];
	    var bounds = new google.maps.LatLngBounds();
	    for (var i = 0, place; place = places[i]; i++) {
	      var image = {
	        url: place.icon,
	        size: new google.maps.Size(71, 71),
	        origin: new google.maps.Point(0, 0),
	        anchor: new google.maps.Point(17, 34),
	        scaledSize: new google.maps.Size(25, 25)
	      };

	      // Create a marker for each place.
	      var marker = new google.maps.Marker({
	        map: $scope.map,
	        icon: image,
	        title: place.name,
	        position: place.geometry.location
	      });

	      markers.push(marker);

	      bounds.extend(place.geometry.location);
	    }

    $scope.map.fitBounds(bounds);
  });

	// Bias the SearchBox results towards places that are within the bounds of the
	// current map's viewport.
	google.maps.event.addListener(map, 'bounds_changed', function() {
		var bounds = map.getBounds();
		searchBox.setBounds(bounds);
	});

	var listhandler = null;

	var handlerClickReverseGeo = function(event){
	    var geocoder = new google.maps.Geocoder();
   		geocoder.geocode({ 'latLng': event.latLng }, function (results, status) {
        if (status !== google.maps.GeocoderStatus.OK) {
            alert(status);
        }
        // This is checking to see if the Geoeode Status is OK before proceeding
        if (status == google.maps.GeocoderStatus.OK) {
            var address = (results[0].formatted_address);
            document.getElementById('selectedComm').value = address;
        }
    });

		google.maps.event.removeListener(listhandler);
	}


	$scope.revGeoSearch = function (){
		listhandler = google.maps.event.addListener($scope.map, 'click', handlerClickReverseGeo);
	};

	// Stop the propagation of the click event
	$('.dropdown-menu').on('click', function(e) {
        e.stopPropagation();
    });
});