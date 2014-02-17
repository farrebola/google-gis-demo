googleGisDemo.controller("searchbarCommCtrl", function($scope, $http) {
  $scope.loadingPlaces = false;
  $scope.selectedComm = undefined;
  $scope.getLocation = function(val) {
    $scope.loadingPlaces =true;
    return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: val+", Greater London, UK",
        bounds: new google.maps.LatLngBounds(
          new google.maps.LatLng(51.280430, -0.563160),
          new google.maps.LatLng(51.683979, 0.278970)),
        region: "gb",
        language:"en_GB",
        sensor: false
      }
    }).then(function(res){
      $scope.loadingPlaces =false;
      return res.data.results;
    });
  };
  $scope.select = function(val){
    $scope.selectedResult = val;
    $scope._centerView(val.geometry);
    
    var marker = new google.maps.Marker({
      position: val.geometry.location,
      title: val.formatted_address,
      clickable: true,
      icon: './glyphicons/png/glyphicons_089_building.png' ,
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
  
  $scope._centerView = function(geometry) { 
    if(geometry.bounds) {
      $scope.map.fitBounds(new google.maps.LatLngBounds(
        new google.maps.LatLng(geometry.bounds.southwest.lat,geometry.bounds.southwest.lng),
        new google.maps.LatLng(geometry.bounds.northeast.lat,geometry.bounds.northeast.lng)));  
    } else {
      $scope.map.panTo(geometry.location);        
    }
  };
  
  $scope.clearSearch = function() {
    $scope.selectedComm = null;    
  };
  
  $scope.goTo = function() {
     $scope._centerView($scope.selectedResult.geometry);
  };
  
});