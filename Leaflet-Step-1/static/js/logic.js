// Store our API endpoint as queryUrl.
// Obtaining data for earthquakes with a magnitude greater than 2.5 over the past 7 days
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";
// Perform a GET request to the query URL.
d3.json(queryUrl).then(function (data) {
  
  console.log(data.features);
  // Using the features array sent back in the API data, create a GeoJSON layer, and add it to the map.
  let earthquakeData = data.features;
  
  // Pass the features to a createFeatures() function:
  createFeatures(earthquakeData);
});
// createFeatures function
function createFeatures(earthquakeData) {

    //make a function that binds the popups
    function onEachFeature(feature, layer)
    {
      layer.bindPopup(`<h2>${feature.properties.place}</h2>
                      <hr>
                      <p>${new Date(feature.properties.time)}</p>
                      <hr>
                      <b>Magnitude: </b> ${feature.properties.mag}
                      <br>
                      <b>Depth: </b> ${feature.geometry.coordinates[2]}`);
    }

    //this function picks the colors for the circle data points
    function getColor(depth)
    {
      switch (true) {
        case depth > 90:
          return "#880E4F"
        case depth > 70:
          return "#C2185B"
        case depth > 50:
          return "#E91E63"
        case depth > 30:
          return "#F06292"
        default:
          return "#F8BBD0";
      }
      
    }

    //this function uses the magnitude to calculate the radis of the circle marker
    function getRadius(mag)
    {
      if (mag === 0)
        return 1;
      else
        return mag * 3;
    }

    //this function returns the style of the data based on the depth of the earthquake
    function styleInfo(feature)
    {
      return {
        opacity: 1,
        fillColor: getColor(feature.geometry.coordinates[2]),
        color: getColor(feature.geometry.coordinates[2]),
        radius: getRadius(feature.properties.mag),
        stroke: true
      };
    }
  // creates GeoJSON layer that contains the features array
  var earthquakes= L.geoJSON(earthquakeData, 
    {
      // turn each marker into a circle
      pointToLayer: function(feature, latlng){
          return L.circleMarker(latlng);
      },
      // to adjust the style for each circle marker
      style: styleInfo, 
      onEachFeature:onEachFeature
    });

  // Pass the earthquake data to a createMap() function
  createMap(earthquakes);

}

// createMap() takes the earthquake data and incorporates it into the visualization:

function createMap(earthquakes) {
  // Create the base layers.
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  })

  var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
})

var Esri_NatGeoWorldMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
	maxZoom: 16
});
  
  // Create a baseMaps object.
  var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo,
    "World Imagery" : Esri_WorldImagery,
    "NatGEO Map" : Esri_NatGeoWorldMap
  };

  // Create an overlays object.
  var overlays = {
    "Earthquakes" : earthquakes
  };

  // Create a new map.
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [Esri_WorldImagery, earthquakes]
  });

  // Create a layer control that contains our baseMaps
  L.control.layers(baseMaps, overlays, {
    collapsed: false
  }).addTo(myMap);

  //add the legend to the map
  let legend = L.control({
    position: "bottomright"
  });

  // add the properties for the legend
  legend.onAdd = function() {
  // div for the legend to appear in the page
  let div = L.DomUtil.create("div", "info legend");

  // set up the intervals
  let intervals = [10, 30, 50, 70, 90];

  // set the colors for the intervals
  let colors = [
      "#F8BBD0",
      "#F06292",
      "#E91E63",
      "#C2185B",
      "#880E4F",      
  ];

  // loop through the intervals and the colors and generate a label
  // with a colored square for each interval
  for(var i = 0; i < intervals.length; i++)
  {
      // inner html that sets the square for each interval and label
      div.innerHTML += "<i style='background': "
          + colors[i]
          + "'></i>"
          + intervals[i]
          + (intervals[i + 1] ? "km &ndash;" + intervals[i + 1] + "km<br>" : "km+");
  }
  return div;
};
// add the legend to the map
legend.addTo(myMap);
}
