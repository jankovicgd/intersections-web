$('#mainsubmit').click(function() {
    var features = getMapFeatures();
    var extent2 = getMapExtent();
    $("#features").val(features);
    $("#xtentpoly").val(selector);
    $("#selection").val(selector2);
    $("#sizeextent").val(extent2);
});
