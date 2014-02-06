googleGisDemo.controller("searchbarCtrl", function($scope, $http) {
  $scope.selected = undefined;
  $scope.getLocation = function(val) {
    return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: val,
        bounds: new google.maps.LatLngBounds(
          new google.maps.LatLng(51.280430, -0.563160),
          new google.maps.LatLng(51.683979, 0.278970)),
        region: "gb",
        sensor: false
      }
    }).then(function(res){
      var addresses = [];
      angular.forEach(res.data.results, function(item){
        var viewport = new google.maps.LatLngBounds(
          new google.maps.LatLng(51.280430, -0.563160),
          new google.maps.LatLng(51.683979, 0.278970));
        if(viewport.contains(
          new google.maps.LatLng(
            item.geometry.location.lat, 
            item.geometry.location.lng))){
          addresses.push(item);
        }
      });
      return addresses;
    });
  };
  $scope.select = function(val){
    $scope.map.panTo(val.geometry.location);
    $scope.map.setZoom($scope.map.zoom + 10);
    marker = new google.maps.Marker({
      position: val.geometry.location,
      title: val.formatted_address,
      clickable: true,
      map: $scope.map
    });
    marker.showInfoWindow = function() {
      if(!marker.popup) {
        marker.popup = new google.maps.InfoWindow({
          content: val.formatted_address
        });             
      }
      marker.popup.open($scope.map, this);
    };
    marker.addListener("click", function(event){
        marker.showInfoWindow();
    });
  };
  google.maps.event.addDomListener(window, 'load', function(){
    $scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push($('.input-group')[0]);
    $('.input-group')[0].style.removeProperty("display");
  });
});