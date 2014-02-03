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

	$scope.drawArea = function(el) {
		if (drawingManager.getDrawingMode() != null) {
			drawingManager.setDrawingMode(null);
			$scope.active = false;
		} else {
			drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
			$scope.active = true;
		}
	};
	$scope.editArea = function(el) {
		if (!featureOnAir.getEditable()) {
			featureOnAir.setEditable(true);
			featureOnAir.$scope.drawing = true;
		} else {
			featureOnAir.setEditable(false);
			featureOnAir.$scope.drawing = false;
		}
		infowindow.close();
	};
	$scope.dragArea = function(el) {
		if (!featureOnAir.getDraggable()) {
			featureOnAir.setDraggable(true);
			featureOnAir.$scope.dragging = true;
		} else {
			featureOnAir.setDraggable(false);
			featureOnAir.$scope.dragging = false;
		}
	};
	$scope.removeArea = function(el) {
		featureOnAir.setMap(null);
		google.maps.event.trigger(featureOnAir, 'remove');
	};
	var arrayFeatures = [];
	var contentHtml =
		'<div class="btn-group btn-group-justified">' +
		'<a role="button" class="btn btn-default" ng-click="editArea()" ng-class="{active:drawing}"><span class="glyphicon glyphicon-pencil"></span></a>' +
		'<a role="button" class="btn btn-default" ng-click="dragArea()" ng-class="{active:dragging}"><span class="glyphicon glyphicon-move"></a>' +
		'<a role="button" class="btn btn-default" ng-click="removeArea()"><span class="glyphicon glyphicon-trash"></a>' +
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
			feature.$scope.dragging = false;
			google.maps.event.addListener(feature, 'click', function(evt) {
				if (evt) {
					point = evt.latLng;
				}
				featureOnAir = feature;
				var compile = $compile(contentHtml)(feature.$scope);
				infowindow.setContent(compile[0]);
				infowindow.setPosition(point);
				infowindow.open($scope.map);
			});
			google.maps.event.addListener(feature, 'dragstart', function(evt) {
				infowindow.close($scope.map);
			});
			google.maps.event.addListener(feature, 'dragend', function(evt) {
				var bounds = new google.maps.LatLngBounds();
				var path = feature.getPath().getArray();
				for (var i = 0; i < path.length; i++) {
					bounds.extend(path[i]);
				}
				var center = bounds.getCenter();
				infowindow.setPosition(center);
				infowindow.open($scope.map);
			});
			google.maps.event.addListener(feature, 'remove', function(evt) {
				infowindow.close($scope.map);
			});
			arrayFeatures.push(feature);
		}
	});
	google.maps.event.addListener($scope.map, 'click', function(event) {
		infowindow.close();
	});

	$scope.clearAll = function(el) {
		for (var i = 0; i < arrayFeatures.length; i++) {
			arrayFeatures[i].setMap(null);
		};
		arrayFeatures = [];
		infowindow.close($scope.map);
	};
});