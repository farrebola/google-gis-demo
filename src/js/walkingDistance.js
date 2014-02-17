googleGisDemo.controller("WalkingDistanceCtrl", function($scope, $http) {
	$scope.walkingMinutes = 20;
	$scope.tubeLinesUrl = 'https://www.googleapis.com/mapsengine/v1/tables/01048493643384141193-15363260755447510668/features';
	$scope.railwaysUrl = 'https://www.googleapis.com/mapsengine/v1/tables/01048493643384141193-04996796288385000359/features';
	$scope.placesUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

	$scope.resultsFound = "";

	$scope.allLinesOn = false;
	$scope.allPlacesOn = false;
	$scope.loadingLines = false;

	$scope.tubeLines = {};

	$scope.colors = ["#00F6FF", "#68E80C", "#FFAD00", "#E80E0C", "#3E02FF"];
	$scope.places = [];

	$scope.canvasLayer = null;
	$scope.context =null;
	$scope._displayGeometry =[];

	$scope.placeKinds = [{
		label: "Grocery",
		checked: false,
		type: "grocery_or_supermarket",
		shape: [],
		icon_url: "glyphicons/png/glyphicons_202_shopping_cart.png"
	}, {
		label: "Pharmacy",
		checked: false,
		type: "pharmacy",
		shape: [],
		icon_url: "glyphicons/png/glyphicons_298_hospital.png"
	}, {
		label: "High Schools",
		checked: false,
		type: "school",
		shape: [],
		icon_url: "glyphicons/png/glyphicons_351_book_open.png"
	}, {
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
			$scope.checkPlace($scope.placeKinds[i]);
		};
	};

	$scope.toggleLines = function() {
		$scope.loadingLines= true;
		setTimeout(function(){
			for(var el in $scope.tubeLines){
				if($scope.tubeLines[el].checked != $scope.allLinesOn){
					$scope.tubeLines[el].checked = $scope.allLinesOn;
					$scope.toggleLine($scope.tubeLines[el]);	
				}				
			}
			$scope.$apply(function(){
				$scope.loadingLines=false;
			});
		}, 10);
	};

	$scope.getTubeLines = function() {
		$http({
			method: 'GET',
			url: $scope.tubeLinesUrl,
			params: {
				key: $scope.googleAPIKey,
				version: "published"
			}
		}).success(function(data, status, header, config) {
			var option = {
				icon: {
					url: "glyphicons/png/glyphicons_014_train.png",
					scaledSize: new google.maps.Size(20, 20),
					anchor: new google.maps.Point(10, 10)
				}
			};
			var featureCollection = new GeoJSON(data, option);
			var lines = [];

			for (var i = 0; i < featureCollection.length; i++) {
				var lineNames = featureCollection[i].geojsonProperties.Line.split(";");

				angular.forEach(lineNames, function(lineName) {
					if (!$scope.tubeLines[lineName]) {
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
			params: {
				key: $scope.googleAPIKey,
				version: "published"
			}
		}).success(function(data, status, header, config) {
			var lineName = "Luton Railway Line";
			var option = {
				icon: { 
					url: "glyphicons/png/glyphicons_014_train.png",
					scaledSize: new google.maps.Size(20, 20),
					anchor: new google.maps.Point(10, 10)
				}
			};
			var featureCollection = new GeoJSON(data, option);
			var line = {
				label: lineName,
				checked: false,
				stations: [],
				color: $scope.colors[Object.keys($scope.tubeLines).length]
			};

			for(var i = 0; i < featureCollection.length; i++) {
				featureCollection[i].geojsonProperties.Line = lineName;
				line.stations.push(featureCollection[i]);
			}

			$scope.tubeLines[lineName] = line;
		});
	};
	$scope.initializePlaces = function() {
		var placesTypes = [];
		for (var i = 0; i < $scope.placeKinds.length; i++) {
			$scope.getPlaceShapes($scope.placeKinds[i].type);
			typePlace = $scope.placeKinds[i].type;
		}
	};
	$scope.timeChange = function() {
		// We use a timout to prevent launching to many filterings.
		
		if($scope.filterTimeout) {
			console.debug("filter skipped");
			clearTimeout($scope.filterTimeout)
		}
		
		$scope.filterTimeout= setTimeout(function(){
			$scope.filterTimeout = null;
			
			$scope.toolFilter.clear();
			angular.forEach($scope.tubeLines, function(line) {
				if (line.checked) {
					angular.forEach(line._displayGeometry, function(g) {
						g.setMap(null);
					});
	
					$scope.toggleLine(line);
				}
			});
		}, 200);
		
		
	};

	$scope.toggleLine = function(line) {

		if (line.checked) {
			line._circles = [];
			
			var minutes = $scope.walkingMinutes==0?1:$scope.walkingMinutes;
			
			var radius = 33.3 /*meters / minute*/ * minutes;

			for (var i = 0; i < line.stations.length; i++) {
				line.stations[i].setMap($scope.map);
				if(line.stations[i]._circle) {
					// If we have already a circle, we try to remove it from the filters, as we don't know
					// if it from a previous walking time change or has been added twice due to the station
					// appearing in several lines.
					$scope.toolFilter.remove(line.stations[i]._circle, true);
				}
				line._circles.push(this._createWalkingRadius(line.stations[i], radius));
			}

			// We add the separate "circles" to the filter.
			$scope.toolFilter.add(line._circles);

			// We create the shape we will use for display, uniting the several 
			// circles so it is prettier.			
			//line._displayGeometry = $scope._geometryUnion(line._circles);
			//line._displayGeometry = $scope._geometryBuffer(line.stations, radius);
			// angular.forEach(line._displayGeometry, function(g) {
			// 	g.setOptions({
			// 		fillColor: line.color
			// 	});
			// 	g.setMap($scope.map);
			// });

		} else {

			var removableCircles = [];

			angular.forEach(line.stations, function(station) {
				// As stations might be shared between lines, we need to check if the the 
				// station isn't active due any other line that is checked before removing it.
				var lines = station.geojsonProperties.Line.split(";");
				var removeStation = true;
				angular.forEach(lines, function(line) {
					if ($scope.tubeLines[line].checked) {
						removeStation = false;
					}
				});

				if (removeStation) {
					removableCircles.push(station._circle);
					station._circle = null;
					station.setMap(null);
				}
			});
			
			$scope.toolFilter.remove(removableCircles);

			// angular.forEach(line._displayGeometry, function(g) {
			// 	g.setMap(null);
			// });
		}

		$scope.updateCanvasOverlay();
	};
	
	$scope._geometryBuffer = function(markers, radius) {
		
		var sProj = proj4.defs['WGS84'];    //source coordinates will be in Longitude/Latitude
		var tProj = proj4.defs['EPSG:27700'];    //target coordinates will be in British National Grid coordinates
		
		var proj = proj4(sProj, tProj);
		//tProj.datum = {};
		
		console.time("buffer");

		var wkt = new Wkt.Wkt();
		var reader = new jsts.io.WKTReader();
		
		var jstsPoints = [];
		
		var markersProcessed =0;
		angular.forEach(markers, function(marker, idx) {
			var wktPoint = wkt.fromObject(marker);			

			var jstsPoint = reader.read(wktPoint.write());
			jstsPoint.coordinate = proj.forward(jstsPoint.coordinate);
			jstsPoints.push(jstsPoint);
			markersProcessed++;	
		});
		
		
		var jstsUnion = new jsts.geom.GeometryCollection(jstsPoints);
		jstsUnion = jstsUnion.buffer(Math.round(radius), 32);
		
		angular.forEach(jstsUnion.geometries, function(poly) {
			angular.forEach(poly.shell.points, function(coordinate) {
				var tcoord = proj.inverse(coordinate);
				coordinate.x = tcoord.x;
				coordinate.y = tcoord.y;
			});
		});

		var writer = new jsts.io.WKTWriter();
		var wktUnion = writer.write(jstsUnion);

		var result = (new Wkt.Wkt(wktUnion)).toObject();

		if (!angular.isArray(result)) {
			result = [result];
		}

		console.timeEnd("buffer");
		console.debug("markers: "+markers.length +" "+markersProcessed);
		if(markers.length != markersProcessed) {
			//throw new Error("Not all markers processed");
		}

		return result;	
	};

	$scope._geometryUnion = function(polygons) {

		console.time("union");

		var jstsUnion = null;
		var wkt = new Wkt.Wkt();
		var reader = new jsts.io.WKTReader();
		angular.forEach(polygons, function(poly) {
			var circleWkt = wkt.fromObject(poly);

			var jstsCircle = reader.read(circleWkt.write());

			if (jstsUnion) {
				jstsUnion = jstsUnion.union(jstsCircle);
			} else {
				jstsUnion = jstsCircle;
			}
		});

		var writer = new jsts.io.WKTWriter();
		var wktUnion = writer.write(jstsUnion);

		var result = (new Wkt.Wkt(wktUnion)).toObject();

		if (!angular.isArray(result)) {
			result = [result];
		}

		console.timeEnd("union");

		return result;
	};

	$scope._createWalkingRadius = function(marker, radius) {
		
		marker._circle = $scope._createPolygonCircle(marker.position, radius);

		/*marker._circle = new google.maps.Circle({
			center: marker.position,
			radius: radius
		});*/

		return marker._circle;
	};
	
	$scope._createPolygonCircle = function(latLng, radius) {
		var points = 60; // the amount of vertices the "circle" will have.
		var lat = latLng.d;
		var lng = latLng.e;

		// find the raidus in lat/lon
		var rlat = (radius / 6384400) * 180 / Math.PI;
		var rlng = rlat / Math.cos(lat * Math.PI / 180);

		var extp = [];
		for (var i = 0; i < points + 1; i++) // one extra here makes sure we connect the
		{
			var theta = Math.PI * (i / (points / 2));
			ey = lng + (rlng * Math.sin(theta)); // center a + radius x * cos(theta)
			ex = lat + (rlat * Math.cos(theta)); // center b + radius y * sin(theta)
			extp.push(new google.maps.LatLng(ex, ey));
		}

		// Add the circle for this city to the map.
		// Although it is actually a polygon, we include the radius and center properties,
		// so the filtering architecture handles it as a circle which is faster.
		return new google.maps.Polygon({
			paths: [extp],
			radius: radius,
			center: latLng
		});
	}

	$scope.clearAllCallback = function() {
		$scope.allLinesOn = false;
		$scope.toggleLines();
		$scope.allPlacesOn = false;
		$scope.togglePlaces();
	};

	$scope.checkPlace = function(placeKind) {
		var shape = placeKind.shape;
		if (!angular.isArray(shape)) {
			shape = [shape];
		}
		for (var i = 0; i < shape.length; i++) {
			shape[i].setMap(placeKind.checked ? $scope.map : null);
		}

	};
	$scope.getPlaceShapes = function(type, next_token) {
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
		service.nearbySearch(request, $scope.placesRetrieved);
	};


	$scope.placesRetrieved = function(results, status, pagination) {
		var indexPlace = -1;
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			for (var i = 0; i < results.length; i++) {
				$scope.createPlaceMarker(results[i], indexPlace);
			}
		}
		if (pagination.hasNextPage) {
			pagination.nextPage();
		}
	};

	$scope.createPlaceMarker = function(place, index) {
		var placeLoc = place.geometry.location;
		var marker = new google.maps.Marker({
			position: placeLoc
		});
		for (var i = 0; i < $scope.placeKinds.length; i++) {
			// We only add markers in one of the preset place types.
			if (place.types.indexOf($scope.placeKinds[i].type)>=0) {
				marker.setIcon({
					url: $scope.placeKinds[i].icon_url,
					scaledSize: new google.maps.Size(20, 20),
					anchor: new google.maps.Point(10, 10)
				});
				$scope.placeKinds[i].shape.push(marker);
				break;
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

	$scope.updateCanvasOverlay = function() {
		
		if(!$scope.canvasLayer) {
			$scope.canvasLayer =  new CanvasLayer({
				map: $scope.map,
			//	resizeHandler: function() {},
				animate: false,
				updateHandler: $scope.updateCanvasOverlay
			}); 

			$scope.context = $scope.canvasLayer.canvas.getContext('2d');
		}



		

		console.time("canvasOverlay");
		
		var canvasWidth = $scope.canvasLayer.canvas.width;
		var canvasHeight = $scope.canvasLayer.canvas.height;

		// We create a buffer to draw the lines circles separately, so we can use source-over compositing
		// for each line's circles, and a mixing composition mode for mixing lines.
		var buffer = document.createElement('canvas');
		//document.body.appendChild(buffer);
		buffer.width = canvasWidth;
		buffer.height = canvasHeight;
		var bufferCtx = buffer.getContext("2d");

		$scope.context.clearRect(0, 0, canvasWidth, canvasHeight);


		/* We need to scale and translate the map for current view.
		 * see https://developers.google.com/maps/documentation/javascript/maptypes#MapCoordinates
		 */
		var mapProjection = $scope.map.getProjection();

		/**
		 * Clear transformation from last update by setting to identity matrix.
		 * Could use context.resetTransform(), but most browsers don't support
		 * it yet.
		 */
		$scope.context.setTransform(1, 0, 0, 1, 0, 0);
		bufferCtx.setTransform(1, 0, 0, 1, 0, 0);

		// scale is just 2^zoom
		var scale = Math.pow(2, $scope.map.zoom);
		//$scope.context.scale(scale, scale);
		bufferCtx.scale(scale, scale);

		var offset
		/* If the map was not translated, the topLeft corner would be 0,0 in
		 * world coordinates. Our translation is just the vector from the
		 * world coordinate of the topLeft corder to 0,0.
		 */
		try{
			 offset = mapProjection.fromLatLngToPoint($scope.canvasLayer.getTopLeft());
		} catch(e) {
			return;
		}
		
		//$scope.context.translate(-offset.x, -offset.y);
		bufferCtx.translate(-offset.x, -offset.y);


		$scope.context.globalAlpha = 0.5;

		//$scope.context.globalCompositeOperation = "lighter";

		var filtersApplied = false;

		angular.forEach($scope.tubeLines, function(line) {
			if(!line.checked) {
				return;
			}

			filtersApplied = true;

			bufferCtx.fillStyle = line.color;

			bufferCtx.clearRect(0, 0, canvasWidth, canvasHeight);
			
			angular.forEach(line.stations, function(station)  {
				// project rectLatLng to world coordinates and draw
				bufferCtx.beginPath();
				
				angular.forEach(station._circle.latLngs.b[0].b, function(polyPoint, idx) {
					var worldPoint = mapProjection.fromLatLngToPoint(polyPoint);
					if(idx>0) {
						bufferCtx.lineTo(worldPoint.x, worldPoint.y);
					} else {
						bufferCtx.moveTo(worldPoint.x, worldPoint.y);
					}				
				});

				bufferCtx.closePath();
				bufferCtx.fill();
			});

			$scope.context.drawImage(buffer, 0,0, canvasWidth, canvasHeight);
		});

		
		
		// if(filtersApplied) {
		// 	$scope.context.globalAlpha = 0.2;
		// 	$scope.context.globalCompositeOperation = "xor";
		// 	$scope.context.fillStyle = 'rgba(0, 0, 0)';
		// 	$scope.context.fillRect(0, 0, canvasWidth, canvasHeight);
		// }

		delete buffer;

		
		console.timeEnd("canvasOverlay");
	}
	
	// We add the British National Grid Projection.
	proj4.defs("EPSG:27700",'PROJCS["OSGB 1936 / British National Grid",GEOGCS["OSGB 1936",DATUM["OSGB_1936",SPHEROID["Airy 1830",6377563.396,299.3249646,AUTHORITY["EPSG","7001"]],AUTHORITY["EPSG","6277"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.01745329251994328,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4277"]],UNIT["metre",1,AUTHORITY["EPSG","9001"]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",49],PARAMETER["central_meridian",-2],PARAMETER["scale_factor",0.9996012717],PARAMETER["false_easting",400000],PARAMETER["false_northing",-100000],AUTHORITY["EPSG","27700"],AXIS["Easting",EAST],AXIS["Northing",NORTH]]');
});