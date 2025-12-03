import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { GeocodingControl } from "@maptiler/geocoding-control/react";
import { createMapLibreGlMapController } from "@maptiler/geocoding-control/maplibregl-controller";
import "@maptiler/geocoding-control/style.css";
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';

export default function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const lat = 22.318257299063653;
  const lng = 87.30583186511298;
  const zoom = 15;
  const API_KEY = 'AGMBRAsSD2L65HSvLA4i';

  const [mapController, setMapController] = useState();

  // ================= GEE Raster Layers =================
  const layers = [
    { id: "teaHealth",   mapid: "d7b409f5914ed5735651fee34fb5678d-64c29149b893899ba0a6706c13b877f1", label: "Tea Health" },
    { id: "meanNDVI",    mapid: "812cc2491e957c1106082c3b00f69271-1fbf791bb29491d2b9036d9b0acc6191", label: "Mean NDVI" },
    { id: "meanNDRE",    mapid: "9042c0c1e3b43ba9752c37b9307834c9-69c579e14e022a4ca430696e5ebe714e", label: "Mean NDRE" },
    { id: "daysPrune",   mapid: "a3fce59d1462a08c06ec85466c136988-3bac13757ce201ad92f91f23d57d215d", label: "Days Since Prune" },
    { id: "s1VV",        mapid: "b9d0cf266c4b018a3c06e485dad36385-48a2127152928477378ab4e1e0f1ca2a", label: "Sentinel-1 VV" },
    { id: "rainfall",    mapid: "d10115627b62fcc69dbfaa04491fa533-a52c41bc6ceb4b322e1b81a6e5b2ea60", label: "Rainfall" }
  ];

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/hybrid/style.json?key=${API_KEY}`
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    setMapController(createMapLibreGlMapController(map.current, maplibregl));

    // ============== Add GEE tile layers + AOI on load ==============
    map.current.on("load", () => {

      layers.forEach(layer => {
        map.current.addSource(layer.id, {
          type: "raster",
          tiles: [
            `https://earthengine.googleapis.com/v1/projects/exalted-cogency-474817-i7/maps/${layer.mapid}/tiles/{z}/{x}/{y}`
          ],
          tileSize: 256
        });

      // Auto-zoom to AOI bounds
        map.current.fitBounds([
          [94.8380, 26.9750],  // southwest corner
          [94.8426, 26.9801]   // northeast corner
        ], {
          padding: 40,
          animate: true
        });


        map.current.addLayer({
          id: layer.id,
          type: "raster",
          source: layer.id,
          layout: { visibility: layer.id === "teaHealth" ? "visible" : "none" },
          paint: { "raster-opacity": 0.85 }
        });
      });

      // AOI Polygon Boundary
      map.current.addSource("teaAOI", {
        type: "geojson",
        data: {
          "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [94.83864556897615,26.97519455059941],
              [94.84019052136873,26.97539534340659],
              [94.84024416554902,26.976227195506503],
              [94.84166037190889,26.975892543101914],
              [94.8414081668782,26.977373231618724],
              [94.84000268935439,26.97777480910225],
              [94.84032455443618,26.978644888734845],
              [94.84139743804214,26.9784249791332],
              [94.84242740630386,26.97892216544626],
              [94.8423093891072,26.98002170430074],
              [94.84060350417373,26.979964337321753],
              [94.84050694464919,26.979304614961823],
              [94.83926239966628,26.978692695113146],
              [94.83885470389602,26.978969971706775],
              [94.83848992347,26.979275931293238],
              [94.83806077002761,26.979180319011814],
              [94.83805004119155,26.97892216544626],
              [94.83842555045364,26.97861620489815],
              [94.83840409278152,26.9783293661289],
              [94.83824316024062,26.978099894587174],
              [94.83852210997817,26.97776524775024],
              [94.83835044860122,26.977296740507043],
              [94.83809295653579,26.977048144035066],
              [94.83817878722427,26.97603462965962],
              [94.83864556897615,26.97519455059941]
            ]]
          }
        }
      });

      map.current.addLayer({
        id: "teaAOI-outline",
        type: "line",
        source: "teaAOI",
        paint: {
          "line-color": "#ff0000",
          "line-width": 3
        }
      });
    });

  }, [API_KEY, lng, lat, zoom]);


  // ============ Layer Toggle Function ============
  const toggleLayer = (id) => {
    layers.forEach(layer =>
      map.current.setLayoutProperty(layer.id, "visibility", layer.id === id ? "visible" : "none")
    );
  };

  return (
    <div className="map-wrap">

      <div className="layer-buttons">
        {layers.map(layer => (
          <button key={layer.id} onClick={() => toggleLayer(layer.id)}>
            {layer.label}
          </button>
        ))}
      </div>

      <div className="geocoding">
        <GeocodingControl apiKey={API_KEY} mapController={mapController} />
      </div>

      <div ref={mapContainer} className="map" />
    </div>
  );
}
