googleGisDemo.controller("GeoFenceCtrl", function($scope, $compile) {
	$scope.resultsFound = "";
	$scope.active = false;

	var featureOnAir = null;

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
	$scope.editArea = function(el){
		if(!featureOnAir.getEditable()){
			featureOnAir.setEditable(true);
			featureOnAir.$scope.drawing = true;
		}else{
			featureOnAir.setEditable(false);
			featureOnAir.$scope.drawing = false;
		}
		infowindow.close();
	};
	var arrayFeatures = [];
	var contentHtml = 
		'<div class="btn-group btn-group-justified">' + 
			'<a role="button" class="btn btn-default" ng-click="editArea()" ng-class="{active:drawing}"><span class="glyphicon glyphicon-pencil"></span></a>' + 
			'<a role="button" class="btn btn-default"><span class="glyphicon glyphicon-move"></a>' +
			'<a role="button" class="btn btn-default"><span class="glyphicon glyphicon-trash"></a>' + 
		'</div>';
	var infowindow = new google.maps.InfoWindow({
    	content: contentHtml,
    	maxWidth: 150
	});
	google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
		if (event.type == google.maps.drawing.OverlayType.POLYGON) {
			var feature = event.overlay;
			feature.$scope = $scope.$new();
			feature.$scope.drawing = false;
			google.maps.event.addListener(feature, 'click', function(evt){
          		if (evt) {
             		point = evt.latLng;
          		}
          		featureOnAir = feature;
          		var compile = $compile(contentHtml)(feature.$scope);
          		infowindow.setContent(compile[0]);
          		infowindow.setPosition(point);
          		infowindow.open($scope.map);
			});
			arrayFeatures.push(feature);
		}
	});
	google.maps.event.addListener($scope.map, 'click', function(event){
		infowindow.close();
	});

	$scope.clearAll = function(el){
		for (var i = 0; i < arrayFeatures.length; i++) {
			arrayFeatures[i].setMap(null);
		};
		arrayFeatures = [];
	};
});