googleGisDemo.controller("WalkingDistanceCtrl", function($scope, $http) {
	$scope.minvalue=0;
	$scope.maxvalue=60;
	$scope.walkingMinutes=20;
	$scope.tubeLinesUrl = 'https://www.googleapis.com/mapsengine/v1/tables/01048493643384141193-15363260755447510668/features';
	$scope.railwaysUrl = 'https://www.googleapis.com/mapsengine/v1/tables/01048493643384141193-04996796288385000359/features';
	$scope.placesUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

	$scope.resultsFound ="";

	$scope.allLinesOn = false;
	$scope.allPlacesOn = false;

	$scope.tubeLines = {};
	
	$scope.colors = ["#00F6FF","#68E80C","#FFAD00","E80E0C","3E02FF"];
	$scope.places = [];

	$scope.placeKinds = [{ 
		label: "Grocery", 
		checked: false, 
		type: "grocery_or_supermarket", 
		shape: [], 
		icon_url: "glyphicons/png/glyphicons_202_shopping_cart.png"
	},{ 
		label: "Pharmacy", 
		checked: false, 
		type: "pharmacy", 
		shape: [],
		icon_url: "glyphicons/png/glyphicons_298_hospital.png"
	},{ 
		label: "High Schools", 
		checked: false, 
		type: "school", 
		shape: [],
		icon_url: "glyphicons/png/glyphicons_351_book_open.png"
	},{ 
		label: "Hospital", 
		checked: false, 
		type: "hospital", 
		shape: [],
		icon_url: "glyphicons/png/glyphicons_299_hospital_h.png"
	}];

	var typePlace = null;

	$scope.togglePlaces = function() {
		
		for (var i = 0; i < $scope.placeKinds.length; i++) {
			$scope.placeKinds[i].checked = $scope.allPlacesOn;
		};
	};

	$scope.toggleLines = function() {
		for (var i = 0; i < $scope.tubeLines.length; i++) {
			$scope.tubeLines[i].checked = $scope.allLinesOn;
		};
	};

	$scope.getTubeLines = function(){
		$http({
			method: 'GET',
			url: $scope.tubeLinesUrl,
			params:  {
				key: $scope.googleAPIKey,
				version: "published"
			}
		}).success(function(data, status, header, config){
			var option = {
				icon: {
					url: "glyphicons/png/glyphicons_014_train.png",
					scaledSize: new google.maps.Size(20,20),
					anchor: new google.maps.Point(10,10)
				}
			};
			var featureCollection = new GeoJSON(data, option);
			var lines = [];
			
			for(var i=0; i<featureCollection.length; i++){
				var lineNames = featureCollection[i].geojsonProperties.Line.split(";");
				
				angular.forEach(lineNames, function(lineName) {
					if(!$scope.tubeLines[lineName]) {
						$scope.tubeLines[lineName] = {
							label: lineName,
							checked: false,
							stations: [],
							color: $scope.colors[Object.keys($scope.tubeLines).length]
						};
					}
					
					$scope.tubeLines[lineName].stations.push(featureCollection[i]);					
				});
			}
		});
		
		
		$http({
			method: 'GET',
			url: $scope.railwaysUrl,
			params:  {
				key: $scope.googleAPIKey,
				version: "published"
			}
		}).success(function(data, status, header, config){
			var lineName = "Luton Railway Line";
			var option = {
				icon: {
					url: "glyphicons/png/glyphicons_014_train.png",
					scaledSize: new google.maps.Size(20,20),
					anchor: new google.maps.Point(10,10)
				}
			};
			var featureCollection = new GeoJSON(data, option);
			var line = {
				label: lineName,
				checked: false,
				stations: [],
				color: $scope.colors[Object.keys($scope.tubeLines).length]
			}
			
			for(var i=0; i<featureCollection.length; i++){
				featureCollection[i].geojsonProperties.Line = lineName;
				line.stations.push(featureCollection[i]);					
			}
			
			$scope.tubeLines[lineName] = line;
		});
	};
	$scope.initializePlaces = function(){
		var placesTypes = [];
		for(var i=0; i<$scope.placeKinds.length; i++){
			$scope.getPlaceShapes($scope.placeKinds[i].type);
			typePlace = $scope.placeKinds[i].type;
		}
	};
	$scope.timeChange = function() {
		$scope.toolFilter.clear();
		angular.forEach($scope.tubeLines, function(line){
			if(line.checked) {
				angular.forEach(line._displayGeometry, function(g){
					g.setMap(null);
				});
					
				$scope.toggleLine(line);
			}
		})
	};
	
	$scope.toggleLine = function(line){
		
		if(line.checked) {
			line._circles = [];
			
			for(var i=0; i<line.stations.length; i++){
				line.stations[i].setMap($scope.map);					
				line._circles.push(this._createWalkingRadius(line.stations[i]));				
			}	
			
			// We add the separate "circles" to the filter.
			$scope.toolFilter.add(line._circles);
			
			// We create the shape we will use for display, uniting the several 
			// circles so it is prettier.			
			line._displayGeometry = $scope._geometryUnion(line._circles);		
			angular.forEach(line._displayGeometry, function(g){
				g.setOptions({
					fillColor: line.color
				})
				g.setMap($scope.map);
			});
			
		} else {
			
			var removableCircles = [];
			
			angular.forEach(line.stations, function(station){
				// As stations might be shared between lines, we need to check if the the 
				// station isn't active due any other line that is checked before removing it.
				var lines = station.geojsonProperties.Line.split(";");
				var removeStation = true;
				angular.forEach(lines, function(line){
					if($scope.tubeLines[line].checked) {
						removeStation=false;
					}
				});
				
				if(removeStation) {
					removableCircles.push(station._circle);
					station.setMap(null);
				}
			});
			
			$scope.toolFilter.remove(removableCircles);
			
			angular.forEach(line._displayGeometry, function(g){
				g.setMap(null);
			});		
		}
	};
	
	$scope._geometryUnion = function(polygons) {
		
		console.time("union")
		
		var jstsUnion = null;
		var wkt = new Wkt.Wkt();
		var reader = new jsts.io.WKTReader();
		angular.forEach(polygons, function(poly) {
			var circleWkt = wkt.fromObject(poly);
		
			var jstsCircle = reader.read(circleWkt.write());
			
			if(jstsUnion) {
				jstsUnion = jstsUnion.union(jstsCircle);
			} else {
				jstsUnion = jstsCircle;
			}
		});
		
		var writer = new jsts.io.WKTWriter();
		var wktUnion = writer.write(jstsUnion);
		
		var result= (new Wkt.Wkt(wktUnion)).toObject();	
		
		if(!angular.isArray(result)) {
			result = [result];
		}
		
		console.timeEnd("union");
		
		return result;
	};
	
	$scope._createWalkingRadius = function(station) {
		
		
	   var points = 26; // the amount of vertices the "circle" will have.
	   var radius = 33.3 /*meters / minute*/ * $scope.walkingMinutes; 
	
	 	var lat = station.position.d;
		var lng = station.position.e;
	
	   // find the raidus in lat/lon
	   var rlat = (radius / 6384400 ) * 180 / Math.PI;
	   var rlng = rlat / Math.cos(lat * Math.PI / 180);
	
	   var extp = new Array();
	   for (var i=0; i < points+1; i++) // one extra here makes sure we connect the
	   {
		  var theta = Math.PI * (i / (points/2));
		  ex = lng + (rlng * Math.cos(theta)); // center a + radius x * cos(theta)
		  ey = lat + (rlat * Math.sin(theta)); // center b + radius y * sin(theta)
		  extp.push(new google.maps.LatLng(ey, ex));
	   }
	
	   // Add the circle for this city to the map.
	   // Although it is actually a polygon, we include the radius and center properties,
	   // so the filtering architecture handles it as a circle which is faster.
		station._circle = new google.maps.Polygon({		  
		  paths: [extp],
		  radius: radius,
		  center: station.position
		});
		
		return station._circle;
	};
	
	$scope.clearAllCallback = function() {
		$scope.toggleLines();	
		$scope.togglePlaces();
	};
	$scope.checkPlace = function(el){
		for(var i=0; i<$scope.placeKinds.length; i++){
			if($scope.placeKinds[i].type == el.type){
				if(el.checked){
					if(Array.isArray($scope.placeKinds[i].shape)){
						handlerArrayShape($scope.placeKinds[i].shape, $scope.map);
					}else{
						$scope.placeKinds[i].shape.setMap($scope.map);
					}
				}else{
					if(Array.isArray($scope.placeKinds[i].shape)){
						handlerArrayShape($scope.placeKinds[i].shape, null);
					}else{
						$scope.placeKinds[i].shape.setMap(null);
					}
				}
			}
		}
	};
	$scope.getPlaceShapes = function(type, next_token){
		var lat = $scope.map.getCenter().lat();
		var lng = $scope.map.getCenter().lng();
		var location = new google.maps.LatLng(lat, lng);
		var service = new google.maps.places.PlacesService($scope.map);
		var request = {
			location: location,
			radius: "50000",
			rankby: "distance",
			types: [type],
			sensor: false
		};
		service.nearbySearch(request, callback);
	};
	// Method to add/remove marker to map
	var handlerArrayShape = function(shape, map){
		for(var i=0; i<shape.length; i++){
			shape[i].setMap(map);
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
	var callback = function(results, status, pagination){
		var indexPlace = -1;
		if (status == google.maps.places.PlacesServiceStatus.OK) {
    		for (var i = 0; i < results.length; i++) {
      			createMarker(results[i], indexPlace);
    		}
  		}
  		if (pagination.hasNextPage){
  			pagination.nextPage();
  		}
	};
	var contains = function(a, obj) {
    	for (var i = 0; i < a.length; i++) {
        	if (a[i] === obj) {
         	   return true;
        	}
    	}
    	return false;
	};
	var createMarker = function(place, index) {
		var placeLoc = place.geometry.location;
  		var marker = new google.maps.Marker({
    		position: placeLoc
  		});
		for(var i=0; i<$scope.placeKinds.length; i++){
			if(contains(place.types, $scope.placeKinds[i].type)){
				marker.setIcon({
  					url: $scope.placeKinds[i].icon_url,
  					scaledSize: new google.maps.Size(20,20),
					anchor: new google.maps.Point(10,10)
  				});
				$scope.placeKinds[i].shape.push(marker);
			}
		}
  	};
	// Stop the propagation of the click event
	$('.dropdown-menu').on('click', function(e) {
        e.stopPropagation();
    });
    // Initialize tube lines
  	$scope.getTubeLines();
	// Initialize places
  	$scope.initializePlaces();
	$scope.toolFilter = $scope.registerGeometryFilter("WalkingDistanceCtrl", $scope.clearAllCallback);
});