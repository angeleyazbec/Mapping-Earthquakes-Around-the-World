// default map layer
var defaultMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });

// creating the ERIS World Imagery Layer
var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
})

var NatGeo = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
  maxZoom: 16
});

// creating a basemap object
let basemaps = {
    Default: defaultMap,
    "Street": street,
    "Topgraphic": topo,
    "ESRI NatGeo": NatGeo
};

// creating a map object
var myMap = L.map("map", {
    center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [defaultMap, street, topo, NatGeo]
    });

// add the default map to the map
defaultMap.addTo(myMap);


//get the data for the tectonic plates and draw on the map
// variable to hold the tectonic plates layer
let tectonicplates = new L.layerGroup();

// call the API to obtain information for tectonic plates
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
.then(function(plateData){
    // console log to make sure the data loads
    // console.log(plateData);

    //load the data using geoJson and add to the tectonic plates layer
    L.geoJson(plateData, {
        // add styling to make the lines visible
        color : "yellow",
        weight: "3"
    }).addTo(tectonicplates);
});

// add the tectonic plates to the map
tectonicplates.addTo(myMap);

//get the data for the tectonic plates and draw on the map
// variable to hold the earthquake layer
let earthquakes = new L.layerGroup();

// get the data for the earthquakes from teh USGS API and populate the layergroup
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson")
.then(function(earthquakeData){
    // console log to check if the data loaded
    // console.log(earthquakeData);

    // make a function that chooses the color of the data point
    function getColor(depth){
      if (depth > 90)
        return "#880E4F"
      else if (depth > 70)
        return "#C2185B"
      else if (depth > 50)
        return "#E91E63"
      else if (depth > 30)
        return "#F06292"
      else 
        return "#F8BBD0"
    }

    // make a function that determines the size of the radius
    function getRadius(mag){
        if (mag == 0)
            return 1;
        else    
            return mag * 3;
    }

    // add on to the style for each data point
    function dataStyle(feature)
    {
        return{
            opacity: 1,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: getColor(feature.geometry.coordinates[2]),
            radius: getRadius(feature.properties.mag),
            stroke: true
        }
    }

    //add the GeoJson data to the earthquake layer group
    L.geoJson(earthquakeData, {
        // make each feature marker a circle
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        // set the style for each marker
        style: dataStyle, 
        // add Popups
        onEachFeature: function(feature, layer){
            layer.bindPopup(`<h2>${feature.properties.place}</h2>
                            <hr>
                            <p>${new Date(feature.properties.time)}</p>
                            <hr>
                            <b>Magnitude: </b> ${feature.properties.mag}
                            <br>
                            <b>Depth: </b> ${feature.geometry.coordinates[2]}`)
        }
        }).addTo(earthquakes);

    // add the earthquake layer to the map
    earthquakes.addTo(myMap);
  }

);
// add the overlap for the tectonic plates and for the earthquakes
let overlays = {
    "Tectonic Plates" : tectonicplates,
    "Earthquakes" : earthquakes
};

// add the layer control
L.control
    .layers(basemaps, overlays)
    .addTo(myMap);

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

