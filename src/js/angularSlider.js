googleGisDemo.directive('slider', function($parse){
	return {
		restrict: "E",
		replace: true,
		transclude: false,
		compile: function (element, attrs) {
			var modelAccessor = $parse(attrs.ngModel);

			var html = "<input id='wds' type='text' data-slider-min='0' data-slider-max='60' data-slider-step='5' data-slider-value='10'/>"

			var newElem = $(html);
			element.replaceWith(newElem);

			return function (scope, element, attrs, controller) {

				var processChange = function (sliderEvt) {
					scope.$apply(function (scope) {
						// Change bound variable
						modelAccessor.assign(scope, sliderEvt.value);
						
						if(attrs.ngChange) {
							scope.$eval(attrs.ngChange);
						}
					});
            	};

            	element.slider({
					tooltip: 'hide'
				}).on('slide', processChange);

            	scope.$watch(modelAccessor, function (val) {
               		element.slider("setValue", val);
               	});
        	};
    	}
	};
});