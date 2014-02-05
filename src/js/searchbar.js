googleGisDemo.controller("searchbarCtrl", function($scope, $http) {
  $scope.selected = undefined;
  $scope.getLocation = function(val) {
    return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: val,
        sensor: false
      }
    }).then(function(res){
      var addresses = [];
      angular.forEach(res.data.results, function(item){
        addresses.push(item.formatted_address);
      });
      return addresses;
    });
  };
  google.maps.event.addDomListener(window, 'load', function(){
    $scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push($('.input-group')[0]);
    $('.input-group')[0].style.removeProperty("display");
  });
});