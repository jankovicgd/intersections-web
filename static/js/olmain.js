window.app = {};
var app = window.app;

app.CustomToolbarControl = function(opt_options) {

  var options = opt_options || {};

  var button1 = document.createElement('button');
  button1.innerHTML = '<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>';
  button1.className = "btn btn-default";
  button1.setAttribute('title', 'Draw Polygon');
  button1.id = "draw";

  var button2 = document.createElement('button');
  button2.innerHTML = '<span class="glyphicon glyphicon-hand-up" aria-hidden="true"></span>';
  button2.className = "btn btn-default";
  button2.setAttribute('title', 'Pan');
  button2.id = "pan";

  var this_ = this;

  var element = document.createElement('div');
  element.className = 'ol-unselectable ol-mycontrol';
  element.appendChild(button1);
  element.appendChild(button2);

  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });

};
ol.inherits(app.CustomToolbarControl, ol.control.Control);

// a source of features for vector layers. Suitable for editing
var source = new ol.source.Vector({wrapX: false});
var onlineSource = new ol.source.Vector({wrapX: false});

// vector data that is rendered client side
var vector = new ol.layer.Vector({
   source: source,
 });

 var onlineVector = new ol.layer.Vector({
    source: onlineSource,
  });

var map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    }),
    vector,
    onlineVector
  ],
  view: new ol.View({
          center: [0, 0],
          zoom: 3
  }),
  controls: ol.control.defaults({
    attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
      collapsible: false
    })
  }).extend([
    new app.CustomToolbarControl()
  ])
});

var draw; // global so we can remove it later
function addInteraction() {
  draw = new ol.interaction.Draw({
    source: source,
    maxPoints: 1000, // TODO: Subject to discussion not to draw a huge polygon with 100000000000000 points and feed it to server
    type: /** @type {ol.geom.GeometryType} */ ('Polygon')
  });
  map.addInteraction(draw);
};

$(document).ready(function() {
  $("#draw").click(function() {
    map.removeInteraction(draw);
    addInteraction();
  });

  $("#pan").click(function() {
    map.removeInteraction(draw);
  });

  // Function that clears the canvas
  $("#clear").click(function() {
    clearCanvas();
  });
});

// GET THE COORDINATES OF POLYGONS
function getMapFeatures() {
  var wktfeatures = new ol.format.WKT();

  var features = vector.getSource().getFeatures().concat(onlineVector.getSource().getFeatures());
  returnFeatures = wktfeatures.writeFeatures(features,
    {
      dataProjection: new ol.proj.Projection({code: 'EPSG:3857'})
    });
  return returnFeatures;
}

function clearCanvas() {
  var features = vector.getSource().getFeatures();
  features.forEach((feature) => {
      vector.getSource().removeFeature(feature);
  });
  var onlfeatures = onlineVector.getSource().getFeatures();
  onlfeatures.forEach((feature) => {
      onlineVector.getSource().removeFeature(feature);
  });
}

// GET COORDINATES OF MAP EXTENT
function getMapExtent() {
  return map.getView().calculateExtent(map.getSize());
}

// Function that transforms the array into an ol array with apropriate coords
function transformArray(array) {
  var polyCoords = [];
  for (var i = 0; i < array[0].length; i++) {
    polyCoords.push(ol.proj.transform([parseFloat(array[0][i][0]), parseFloat(array[0][i][1])], 'EPSG:4326', 'EPSG:3857'));
  }
  return polyCoords;
}

// Function that zooms to the resulting layer
function zoomToResult() {
  map.getView().fit(onlineSource.getExtent(), {duration: 900});
}

// Function that draws the polygon from search
function drawPolySearch(coords) {
  var feature = new ol.Feature({
    geometry: new ol.geom.Polygon([coords])
  });

  onlineSource.addFeature(feature);
}
