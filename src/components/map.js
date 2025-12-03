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
  const API_KEY = 'AGMBRAsSD2L65HSvLA4i';

  const layers = [
    { id: "teaHealth", mapid: "d7b409f5914ed5735651fee34fb5678d-64c29149b893899ba0a6706c13b877f1", label: "Tea Health" },
    { id: "meanNDVI", mapid: "812cc2491e957c1106082c3b00f69271-1fbf791bb29491d2b9036d9b0acc6191", label: "Mean NDVI" },
    { id: "meanNDRE", mapid: "9042c0c1e3b43ba9752c37b9307834c9-69c579e14e022a4ca430696e5ebe714e", label: "Mean NDRE" },
    { id: "daysPrune", mapid: "a3fce59d1462a08c06ec85466c136988-3bac13757ce201ad92f91f23d57d215d", label: "Days Since Prune" },
    { id: "s1VV", mapid: "b9d0cf266c4b018a3c06e485dad36385-48a2127152928477378ab4e1e0f1ca2a", label: "Sentinel-1 VV" },
    { id: "rainfall", mapid: "d10115627b62fcc69dbfaa04491fa533-a52c41bc6ceb4b322e1b81a6e5b2ea60", label: "Rainfall" }
  ];

  // Read layer param from URL
  const [selectedLayerId, setSelectedLayerId] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const p = params.get('layer');
      if (p && layers.some(l => l.id === p)) {
        return p;
      }
    } catch (e) {
      console.warn('Could not parse URL param', e);
    }
    // fallback to default
    return layers[0].id;
  });

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/hybrid/style.json?key=${API_KEY}`
    });
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    setMapController(createMapLibreGlMapController(map.current, maplibregl));

    map.current.on("load", () => {
      layers.forEach(layer => {
        map.current.addSource(layer.id, {
          type: "raster",
          tiles: [
            `https://earthengine.googleapis.com/v1/projects/exalted-cogency-474817-i7/maps/${layer.mapid}/tiles/{z}/{x}/{y}`
          ],
          tileSize: 256
        });
        map.current.addLayer({
          id: layer.id,
          type: "raster",
          source: layer.id,
          layout: {
            visibility: layer.id === selectedLayerId ? "visible" : "none"
          },
          paint: {
            "raster-opacity": 0.85
          }
        });
      });

      // Optionally: fit bounds if you want
      map.current.fitBounds(
        [
          [94.8380, 26.9750],
          [94.8426, 26.9801]
        ],
        { padding: 40, animate: true }
      );

      // Add AOI boundary as you have
      map.current.addSource("teaAOI", {
        type: "geojson",
        data: {
          "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              // ... your polygon coords
            ]
          }
        }
      });
      map.current.addLayer({
        id: "teaAOI-outline",
        type: "line",
        source: "teaAOI",
        paint: { "line-color": "#ff0000", "line-width": 3 }
      });
    });
  }, [API_KEY, selectedLayerId]);

  return <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />;
}
