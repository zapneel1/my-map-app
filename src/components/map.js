import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';

export default function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const destMarkerRef = useRef(null);
  const [destCoords, setDestCoords] = useState(null); // [lng, lat]
  const API_KEY = 'AGMBRAsSD2L65HSvLA4i';

  // ----------------- GEE Layers -----------------
  const layers = [
    {
      id: "teaHealth",
      mapid: "d7b409f5914ed5735651fee34fb5678d-64c29149b893899ba0a6706c13b877f1"
    },
    {
      id: "meanNDVI",
      mapid: "812cc2491e957c1106082c3b00f69271-1fbf791bb29491d2b9036d9b0acc6191"
    },
    {
      id: "meanNDRE",
      mapid: "9042c0c1e3b43ba9752c37b9307834c9-69c579e14e022a4ca430696e5ebe714e"
    },
    {
      id: "daysPrune",
      mapid: "a3fce59d1462a08c06ec85466c136988-3bac13757ce201ad92f91f23d57d215d"
    },
    {
      id: "s1VV",
      mapid: "b9d0cf266c4b018a3c06e485dad36385-48a2127152928477378ab4e1e0f1ca2a"
    },
    {
      id: "rainfall",
      mapid: "d10115627b62fcc69dbfaa04491fa533-a52c41bc6ceb4b322e1b81a6e5b2ea60"
    },
    {
      id: "pluckReady",
      tileUrl:
        "https://earthengine.googleapis.com/v1/projects/exalted-cogency-474817-i7/maps/f00cdac132c1a19329e7ab9287e4acb4-ab2feff10d2172157a5e820177d19bf9/tiles/{z}/{x}/{y}"
    }
  ];

  // ----------------- URL Layer Selector -----------------
  const selectedLayerId = (() => {
    const params = new URLSearchParams(window.location.search);
    const layerParam = params.get("layer");
    return layers.some(l => l.id === layerParam) ? layerParam : "teaHealth";
  })();

  // ----------------- Map Init -----------------
  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/hybrid/style.json?key=${API_KEY}`
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      // --- Add GEE raster layers ---
      layers.forEach(layer => {
        const tileUrl = layer.tileUrl
          ? layer.tileUrl
          : `https://earthengine.googleapis.com/v1/projects/exalted-cogency-474817-i7/maps/${layer.mapid}/tiles/{z}/{x}/{y}`;

        map.current.addSource(layer.id, {
          type: "raster",
          tiles: [tileUrl],
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

      // --- Fit to estate bounds (same as before) ---
      map.current.fitBounds(
        [
          [94.8380, 26.9750],
          [94.8426, 26.9801]
        ],
        { padding: 40, animate: true }
      );

      // --- Click handler: set destination + marker ---
      map.current.on("click", (e) => {
        const dest = [e.lngLat.lng, e.lngLat.lat]; // [lng, lat]
        setDestCoords(dest);

        // Add / update destination marker
        if (destMarkerRef.current) {
          destMarkerRef.current.remove();
        }
        destMarkerRef.current = new maplibregl.Marker({ color: "#e11d48" })
          .setLngLat(dest)
          .addTo(map.current);
      });
    });
  }, [API_KEY, selectedLayerId]);

  // ----------------- Google Maps URL -----------------
  // destCoords is [lng, lat]; Google needs "lat,lng"
  const gmapsUrl = destCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${destCoords[1]},${destCoords[0]}&travelmode=walking`
    : null;

  // ----------------- UI: Panel (left) + Map (right) -----------------
  return (
    <div className="map-page">
      {/* LEFT: STATIC INFO PANEL */}
      <div className="side-panel">
        <h1>Tea Plantation Monitoring Dashboard</h1>

        <p>
          This dashboard visualizes multi-sensor satellite layers for tea
          estate monitoring. Change the active layer using the URL parameter{" "}
          <b>?layer=</b> (e.g. <b>meanNDVI</b>, <b>s1VV</b>, <b>rainfall</b>,{" "}
          <b>pluckReady</b>).
        </p>

        <p>
          <b>Navigation:</b> click anywhere on the map to set a destination.
          Then open walking directions in Google Maps from your current
          location to that point.
        </p>

        {/* Google Maps directions button */}
        <div style={{ marginTop: 10, marginBottom: 14 }}>
          <a
            href={gmapsUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!gmapsUrl) e.preventDefault();
            }}
            className={`gmaps-button ${!gmapsUrl ? "gmaps-button-disabled" : ""}`}
          >
            {gmapsUrl
              ? "get directions"
              : "Click on the map to set destination"}
          </a>
        </div>

        <hr className="panel-separator" />

        <div className="legend-block">
          <h2>NDVI (Tea Health)</h2>
          <div className="legend-bar legend-ndvi"></div>
          <div className="legend-label-row">
            <span>Low</span>
            <span>High</span>
          </div>
          <p className="legend-caption">
            Indicates canopy vigor and leaf density across the tea estate.
          </p>
        </div>

        <div className="legend-block">
          <h2>Plucking Readiness</h2>
          <div className="legend-bar legend-pluck"></div>
          <div className="legend-label-row">
            <span>Just plucked</span>
            <span>Ready / overdue</span>
          </div>
          <p className="legend-caption">
            Layer ID <b>pluckReady</b> shows NDVI-based readiness score from a
            separate Earth Engine model tuned for plucking cycles.
          </p>
        </div>
      </div>

      {/* RIGHT: MAP */}
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
