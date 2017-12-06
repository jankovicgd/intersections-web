$('#mainsubmit').click(function() {
    var features = getMapFeatures();
    $("#features").val(features);
    $("#xtentpoly").val(selector);
    $("#extent").val(getMapExtent());
});
