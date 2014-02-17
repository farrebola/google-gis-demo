googleGisDemo.directive('slider', function($parse){
	return {
		restrict: "E",
		replace: true,
		transclude: false,
		compile: function (element, attrs) {
			var modelAccessor = $parse(attrs.ngModel);
			var mindataAccessor = $parse(attrs.sliderMin);

			var html = "<input id='wds' type='text'/>"

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
					tooltip: 'hide',
					min: scope.$eval(attrs.sliderMin),
					max: scope.$eval(attrs.sliderMax),
					step: scope.$eval(attrs.sliderStep)
				}).on('slide', processChange);
				
				scope.$watch(modelAccessor, function (val) {
               		element.slider("setValue", val);
               	});
        	};
    	}
	};
});