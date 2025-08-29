// ===== CONFIGURACIÓN =====
const CONFIG = {

    // Archivo por defecto a cargar cuando no hay UI de selección
  DEFAULT_FILE: 'denue.pmtiles',

  // Coordenadas de León GTO
  DEFAULT_CENTER: [-101.67374, 21.12908],
  DEFAULT_ZOOM: 12,
  
  // Claves de localStorage
  PANEL_KEY: 'leon_panel_hidden',
  SAVED_KEY: 'leon_saved_aliases',
  
  // Timeouts
  PMTILES_TIMEOUT: 10000,
  PMTILES_WAIT: 5000,
  
  // Colores
  COLORS: {
    BRAND: '#1d4ed8',
    SUCCESS: '#10b981',
    DRAW_FILL: '#3b82f6',
    DRAW_STROKE: '#1d4ed8'
  },

};

// ===== BASEMAPS =====
const BASEMAPS = {
  OSM: { 
    version: 8, 
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    sources: { 
      osm: { 
        type: "raster", 
        tiles: [
          "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
          "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
          "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
        ], 
        tileSize: 256, 
        attribution: "© OpenStreetMap contributors" 
      }
    }, 
    layers: [{ id: "osm", type: "raster", source: "osm" }] 
  },

  CARTO: { 
    version: 8, 
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    sources: { 
      carto: { 
        type: "raster", 
        tiles: [
          "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
          "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
          "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
        ], 
        tileSize: 256, 
        attribution: "© OpenStreetMap, © CARTO" 
      }
    }, 
    layers: [{ id: "carto", type: "raster", source: "carto" }] 
  }
};
