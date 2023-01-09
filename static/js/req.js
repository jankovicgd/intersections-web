function nominatimCORS(search) {
  var returndata;
  $.ajax({
    async: true,
    type: 'GET',
    jsonp: "callback",
    url: 'https://open.mapquestapi.com/nominatim/v1/search.php',
    data: {
      key: 'key',
      q: search,
      format: "json",
      polygon_geojson: 1,
      limit: 1
    },

    success: function(data) {
      returndata = data;
    },

    error: function(jq, text, err) {
      console.log("Error" + err);
      return 0;
    }
  });
  return returndata
}
