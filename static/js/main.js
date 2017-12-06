// On page load show modal for instructions
// $(window).on('load',function(){
//   $('#myModal').modal('show');
// });

var selector = "polygon";

$(document).ready(function() {
  // Highlighting for different options within dropdowns
  $('.dropdown-menu li a').click(function() {
    $(this).parent().parent().children().removeClass('active');
    $(this).parent().addClass('active');
  });

  // Remove interaction from drawing and show different options depending
  // on the option selected
  $("#extent").click(function(){
    $("#draw").hide();
    $(".input-group").hide();
    map.removeInteraction(draw);
    selector = "extent";
  });

  $("#polygon").click(function(){
    $("#draw").show();
    $(".input-group").hide();
    map.removeInteraction(draw);
    selector = "polygon";
  });

  $("#search").click(function(){
    $(".input-group").show();
    map.removeInteraction(draw);
  });

  // Function that triggers when clicked on button Draw Polygon
  $("#drawpoly").on("click", function() {
    if (dataSearched.geojson.type === 'Polygon') {
      coords = transformArray(dataSearched.geojson.coordinates);
      drawPolySearch(coords);
    } else if (dataSearched.geojson.type === 'MultiPolygon') {
      dataSearched.geojson.coordinates.forEach(function(element) {
        coords = transformArray(element);
        drawPolySearch(coords);
      });
    } else {
      return
    }
    zoomToResult(dataSearched.boundingbox);
  });
});

var dataSearched;

var options = {

  url: function(phrase){
    return "https://open.mapquestapi.com/nominatim/v1/search.php?q=" + phrase
  },

  getValue: function(element){
    if (element.geojson.type === "Polygon" || element.geojson.type === "MultiPolygon") {
      return element.display_name + " - " + element.geojson.type;
    } else {
      return "";
    }
  },

  ajaxSettings: {
    dataType: "json",
    method: "GET",
    data: {
      key: "ulnELEJ6G7YEs0qvbjD04YDO8B9V1NyP",
      format: "json",
      polygon_geojson: 1
    }
  },

  list: {
    match: {
      enabled: true
    },
    onChooseEvent: function(element) {
			dataSearched = $("#searchstring").getSelectedItemData();
		}
  },

  theme: "square"
};

$("#searchstring").easyAutocomplete(options);
