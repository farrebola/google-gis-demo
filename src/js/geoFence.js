googleGisDemo.controller("GeoFenceCtrl", function($scope) {
	$scope.resultsFound = "";
	$scope.active = false;

	var drawingManager = new google.maps.drawing.DrawingManager({
		//drawingMode: google.maps.drawing.OverlayType.POLYGON,
		drawingControl: false,
		drawingControlOptions: {
			position: google.maps.ControlPosition.TOP_CENTER,
			drawingModes: [
				google.maps.drawing.OverlayType.POLYGON
			]
		}
	});

	drawingManager.setMap($scope.map);

	$scope.drawArea = function(el){
		if(drawingManager.getDrawingMode()!= null){
			drawingManager.setDrawingMode(null);
			$scope.active = false;
		}else{
			drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
			$scope.active = true;
		}
	};
	var arrayFeatures = [];

	google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
		if (event.type == google.maps.drawing.OverlayType.POLYGON) {
			arrayFeatures.push(event.overlay);
		}
	});

	$scope.clearAll = function(el){
		for (var i = 0; i < arrayFeatures.length; i++) {
			arrayFeatures[i].setMap(null);
		};
		arrayFeatures = [];
	};
});