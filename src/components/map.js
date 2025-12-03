import React, { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';

export default function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const API_KEY = 'AGMBRAsSD2L65HSvLA4i';

  // ================= GEE Raster Layers =================
  const layers = [
    { id: "teaHealth", mapid: "d7b409f5914ed5735651fee34fb5678d-64c29149b893899ba0a6706c13b877f1", label: "Tea Health" },
    { id: "meanNDVI", mapid: "812cc2491e957c1106082c3b00f69271-1fbf791bb29491d2b9036d9b0acc6191", label: "Mean NDVI" },
    { id: "meanNDRE", mapid: "9042c0c1e3b43ba9752c37b9307834c9-69c579e14e022a4ca430696e5ebe714e", label: "Mean NDRE" },
    { id: "daysPrune", mapid: "a3fce59d1462a08c06ec85466c136988-3bac13757ce201ad92f91f23d57d215d", label: "Days Since Prune" },
    { id: "s1VV", mapid: "b9d0cf266c4b018a3c06e485dad36385-48a2127152928477378ab4e1e0f1ca2a", label: "Sentinel-1 VV" },
    { id: "rainfall", mapid: "d10115627b62fcc69dbfaa04491fa533-a52c41bc6ceb4b322e1b81a6e5b2ea60", label: "Rainfall" }
  ];

  // ========== Pick layer from URL param ?layer= ==========
  const selectedLayerId = (() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const p = params.get('layer');
      if (p && layers.some(l => l.id === p)) {
        return p;
      }
    } catch (e) {
      console.warn('Could not read URLSearchParams', e);
    }
    // fallback default
    return "teaHealth";
  })();

  useEffect(() => {
    if (map.current) return; // prevent re-init

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/hybrid/style.json?key=${API_KEY}`
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    // ============== Add GEE tile layers + AOI on load ==============
    map.current.on("load", () => {
      // Add all raster sources & layers, only 1 visible (from URL)
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

      // Auto-zoom to AOI bounds (tea estate)
      map.current.fitBounds(
        [
          [94.8380, 26.9750], // southwest corner
          [94.8426, 26.9801]  // northeast corner
        ],
        { padding: 40, animate: true }
      );

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
  }, [API_KEY, selectedLayerId, layers]);

  return (
    <div className="map-page">
      {/* Left: Map */}
      <div
        ref={mapContainer}
        className="map-container"
      />

      {/* Right: Static info panel (like GEE ui.Panel, but no buttons) */}
      <div className="side-panel">
        <h1 className="panel-title">Tea Plantation Monitoring Dashboard</h1>
        <p className="panel-text">
          This dashboard shows plantation-scale layers derived from
          Sentinel-2, Sentinel-1 and CHIRPS rainfall data over the main tea
          estate. Each view is controlled via the URL parameter
          <code>?layer=</code> (e.g. <code>?layer=meanNDVI</code>,
          <code>?layer=s1VV</code>, <code>?layer=rainfall</code>).
        </p>

        <p className="panel-text">
          The map is centered on the estate boundary (red outline). Depending
          on the active layer, colours represent vegetation health,
          structural strength, moisture stress, or cumulative rainfall.
        </p>

        <hr className="panel-separator" />

        {/* NDVI legend block */}
        <div className="legend-block">
          <h2 className="legend-title">NDVI (Tea Health)</h2>
          <div className="legend-bar legend-ndvi" />
          <div className="legend-label-row">
            <span>Low</span>
            <span>High</span>
          </div>
          <p className="legend-caption">
            NDVI is a vegetation index: higher values usually indicate
            denser, healthier tea canopy; lower values can flag weak or
            stressed patches.
          </p>
        </div>

        {/* Plucking readiness legend block */}
        <div className="legend-block">
          <h2 className="legend-title">Plucking Readiness Score</h2>
          <div className="legend-bar legend-pluck" />
          <div className="legend-label-row">
            <span>Just plucked</span>
            <span>Ready / overdue</span>
          </div>
          <p className="legend-caption">
            This score blends recent NDVI changes over ~90 days with an
            estimated average plucking round. Higher scores point to areas
            that are approaching or past their next ideal plucking date.
          </p>
        </div>

        <hr className="panel-separator" />

        <p className="panel-footnote">
          This is a static summary panel for the web app version; interactive
          point inspection and charts are available in the Earth Engine
          prototype.
        </p>
      </div>
    </div>
  );
}
