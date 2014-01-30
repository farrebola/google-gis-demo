googleGisDemo.controller("GeoFenceCtrl", function($scope) {
	$scope.resultsFound = "4";
	$scope.active = "";

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
			$scope.active = "";
		}else{
			drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
			$scope.active = "active";
		}
	};
});