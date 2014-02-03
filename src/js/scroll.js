angular.module('scroll', []).directive('whenScrolled', function() {
    return function(scope, elm, attr) {
        var raw = elm[0];
        
        elm.parent().bind('scroll', function() {
            if (raw.offsetTop + raw.offsetHeight <= raw.parentNode.scrollTop+raw.parentNode.offsetHeight) {
                scope.$apply(attr.whenScrolled);
            }
        });
    };
});
