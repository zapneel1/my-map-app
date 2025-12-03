.map-page {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.map-container {
  flex: 1;
}

.side-panel {
  width: 320px;
  background: rgba(15, 23, 42, 0.92); /* dark-ish */
  color: #f9fafb;
  padding: 16px 18px;
  box-sizing: border-box;
  overflow-y: auto;
}

.panel-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px;
}

.panel-text {
  font-size: 13px;
  line-height: 1.4;
  margin: 4px 0 8px;
}

.panel-separator {
  border: none;
  border-top: 1px solid rgba(148, 163, 184, 0.5);
  margin: 10px 0;
}

.legend-block {
  margin-top: 8px;
}

.legend-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.legend-bar {
  height: 14px;
  border-radius: 999px;
  margin: 4px 0;
}

.legend-ndvi {
  background: linear-gradient(to right, #654321, #facc15, #16a34a); /* brown → yellow → green */
}

.legend-pluck {
  background: linear-gradient(to right, #1e3a8a, #0284c7, #22c55e, #facc15, #ea580c, #b91c1c);
}

.legend-label-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  opacity: 0.8;
}

.legend-caption {
  font-size: 11px;
  line-height: 1.4;
  margin-top: 4px;
  opacity: 0.9;
}

.panel-footnote {
  font-size: 11px;
  opacity: 0.7;
  margin-top: 8px;
}
