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

  useEffect(() => {
    if (map.current) return; // stops map from intializing more than once

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${API_KEY}`,
      center: [lng, lat],
      zoom: zoom
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    setMapController(createMapLibreGlMapController(map.current, maplibregl));

  }, [API_KEY, lng, lat, zoom]);

  return (
    <div className="map-wrap">
      <div className="geocoding">
        <GeocodingControl apiKey={API_KEY} mapController={mapController} />
      </div>
      <div ref={mapContainer} className="map" />
    </div>
  );
}
