$(document).ready(function() {
	$("#wds").slider();
	$("#wds").on('slide', function(slideEvt) {
		$("#wdsSliderVal").text(slideEvt.value);
	});
});