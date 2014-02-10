googleGisDemo.controller("CommuteTimeCtrl", function($scope, $http) {
	$scope.minvalue=0;
	$scope.maxvalue=60;
	$scope.value=10;
	$scope.propertiesUrl = 'https://www.googleapis.com/mapsengine/v1/tables/01048493643384141193-15363260755447510668/features';

	$scope.resultsFound ="";

	$scope.allLinesOn = false;
	$scope.allPlacesOn = false;

	$scope.tubeLines = [];
	$scope.tubeStations = [];

	$scope.placeKinds = [
		{ label: "Grocery", checked: false},
		{ label: "Coffe Shop", checked: false},
		{ label: "High Schools", checked: false},
		{ label: "Restaurants", checked: false}
	];

	$scope.togglePlaces = function() {
		for (var i = 0; i < $scope.placeKinds.length; i++) {
			// We need to negate allPlacesOn because the event gets fired
			// before the model is updated.
			$scope.placeKinds[i].checked = !$scope.allPlacesOn;
		};
	};

	$scope.toggleLines = function() {
		for (var i = 0; i < $scope.tubeLines.length; i++) {
			// We need to negate allLinesOn because the event gets fired
			// before the model is updated.
			$scope.tubeLines[i].checked = !$scope.allLinesOn;
		};
	};

	$scope.getTubeLines = function(){
		var url = $scope.propertiesUrl;
  		var params = {
			key: "AIzaSyBkvm3UGVoIpBtGA_rw7THbnvXNcSp6W1k",
			version: "published"
		};
		$http({
			method: 'GET',
			url: url,
			params: params
		}).success(function(data, status, header, config){
			var option = {
				icon: "http://www.google.com/mapfiles/ms/micons/subway.png"
			};
			var featureCollection = new GeoJSON(data, option);
			var lines = [];
			for(var i=0; i<featureCollection.length; i++){
				var line_str = featureCollection[i].geojsonProperties.Line;
				if(line_str.indexOf(";") == -1){
					if(lines.indexOf(line_str) == -1){
						lines.push(line_str);
					}
				}
				$scope.tubeStations.push(featureCollection[i]);
				/*if(line_str.indexOf(";") != -1){
					// There are more than one line
					var array_lines = line_str.split(";");
					for(var i=0; i<array_lines.length; i++){
						addStation(array_lines[i], 
							featureCollection[i].geojsonProperties.gx_id);
					}
				}else{
					// There are only one line
					addStation(line_str, 
						featureCollection[i].geojsonProperties.gx_id);
				}*/
			}
			for (var i=0; i<lines.length; i++){
				$scope.tubeLines.push({
					label: lines[i],
					checked: false
				});
			}
		});
	};
	$scope.check = function(el){
		for(var i=0; i<$scope.tubeStations.length; i++){
			if($scope.tubeStations[i].geojsonProperties.Line.indexOf(el.label) != -1){
				if(!el.checked){
					$scope.tubeStations[i].setMap(null);
				}else{
					$scope.tubeStations[i].setMap($scope.map);
				}
			}
		}
	};
	// Method to add a station into a line object
	var addStation = function(line, station){
		var index = pointInLine(line);
		if(index != -1){
			$scope.tubeLines[index].stations.push(station);
		}else{
			$scope.tubeLines.push({
				label: line,
				checked: false,
				stations: [station]
			});
		}
	};
	// Method to know if an objects array contains an id object
	var pointInLine = function(line){
		var contains = -1;
		for(var i=0; i<$scope.tubeLines.length; i++){
			if($scope.tubeLines[i].label == line){
				contains = i;
				break;
			}
		}
		return contains;
	};
	// Stop the propagation of the click event
	$('.dropdown-menu').on('click', function(e) {
        e.stopPropagation();
    });
    // Initialize tube lines
  	$scope.getTubeLines();
});