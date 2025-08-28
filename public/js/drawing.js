// ===== SISTEMA DE DIBUJO =====
// drawing.js - Maneja las funcionalidades de dibujo:
// Permite dibujar polígonos para recortar regiones
// Gestiona la interacción del usuario al dibujar en el mapa
class DrawingSystem {
  constructor(map, statusEl, clipCount) {
    this.map = map;
    this.statusEl = statusEl;
    this.clipCount = clipCount;
    this.isDrawing = false;
    this.drawPoints = [];
    this.onDrawClick = this.onDrawClick.bind(this);
    this.onDrawKeydown = this.onDrawKeydown.bind(this);
  }

  initDrawLayers() {
    if (!this.map.getSource('draw-polygon')) {
      // Fuente para el polígono
      this.map.addSource('draw-polygon', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });
      
      // Capas del polígono
      this.map.addLayer({
        id: 'draw-polygon-fill',
        type: 'fill',
        source: 'draw-polygon',
        paint: { 'fill-color': CONFIG.COLORS.DRAW_FILL, 'fill-opacity': 0.2 }
      });
      
      this.map.addLayer({
        id: 'draw-polygon-stroke',
        type: 'line',
        source: 'draw-polygon',
        paint: { 'line-color': CONFIG.COLORS.DRAW_STROKE, 'line-width': 2 }
      });
      
      // Fuente para los puntos
      this.map.addSource('draw-points', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });
      
      this.map.addLayer({
        id: 'draw-points',
        type: 'circle',
        source: 'draw-points',
        paint: {
          'circle-radius': 5,
          'circle-color': CONFIG.COLORS.DRAW_STROKE,
          'circle-stroke-color': '#fff',
          'circle-stroke-width': 2
        }
      });
    }
  }

  startDrawing() {
    this.initDrawLayers();
    this.isDrawing = true;
    this.drawPoints = [];
    
    // UI feedback
    const drawBtn = document.getElementById('drawPoly');
    drawBtn.classList.add('btn-active');
    drawBtn.textContent = '✏️ Dibujando... (Enter=Terminar, Esc=Cancelar)';
    
    this.map.getCanvas().style.cursor = 'crosshair';
    document.body.classList.add('drawing-cursor');
    this.statusEl.textContent = 'MODO DIBUJO: Click para agregar puntos. Enter=Terminar, Escape=Cancelar.';
    
    // Event listeners
    this.map.on('click', this.onDrawClick);
    window.addEventListener('keydown', this.onDrawKeydown);
  }

  onDrawClick(e) {
    if (!this.isDrawing) return;
    
    const point = [e.lngLat.lng, e.lngLat.lat];
    this.drawPoints.push(point);
    
    // Actualizar puntos
    const pointsGJ = {
      type: 'FeatureCollection',
      features: this.drawPoints.map(coord => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: coord },
        properties: {}
      }))
    };
    this.map.getSource('draw-points').setData(pointsGJ);
    
    // Si tenemos 3+ puntos, mostrar polígono
    if (this.drawPoints.length >= 3) {
      const polygonCoords = [...this.drawPoints, this.drawPoints[0]];
      const polygonGJ = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [polygonCoords] },
          properties: {}
        }]
      };
      this.map.getSource('draw-polygon').setData(polygonGJ);
    }
    
    this.statusEl.textContent = `DIBUJANDO: ${this.drawPoints.length} puntos agregados. Enter=Terminar, Esc=Cancelar.`;
  }

  onDrawKeydown(e) {
    if (!this.isDrawing) return;
    
    if (e.key === 'Enter') {
      this.finishDrawing();
    } else if (e.key === 'Escape') {
      this.cancelDrawing();
    }
  }

  finishDrawing() {
    if (this.drawPoints.length < 3) {
      this.statusEl.textContent = 'ERROR: Necesitas al menos 3 puntos para hacer un polígono.';
      return;
    }
    
    // Crear el polígono final
    const polygonCoords = [...this.drawPoints, this.drawPoints[0]];
    window.__region = {
      type: 'Polygon',
      coordinates: [polygonCoords]
    };
    
    this.resetUI();
    this.cleanupDrawing();
    
    // Aplicar filtros según el modo
    this.applyRegionFilter();
  }

  cancelDrawing() {
    this.resetUI();
    this.cleanupDrawing();
    this.clearDrawingLayers();
    this.statusEl.textContent = '❌ Dibujo cancelado.';
  }

  clearRegion() {
    window.__region = null;
    this.clipCount.textContent = '—';
    this.clearDrawingLayers();
    this.resetUI();
    
    // Restaurar resumen original de clases
    const resumenDiv = document.getElementById('classStats');
    if (resumenDiv && window.__classList && window.__fullGJ) {
      resumenDiv.textContent = `Clases únicas: ${window.__classList.length} • Puntos totales: ${window.__fullGJ.features.length.toLocaleString()}`;
    }
    
    if (window.__MODE === 'geojson' && window.__fullGJ) {
      window.applyFilter();
      this.statusEl.textContent = '🗑️ Región eliminada. Mostrando todos los datos.';
    } else if (window.__MODE === 'pmtiles') {
      window.pmtilesSystem.clearRegionFilter();
      this.statusEl.textContent = '🗑️ Región eliminada. PMTiles sin filtro espacial.';
    } else {
      this.statusEl.textContent = '🗑️ Región eliminada.';
    }
  }

  resetUI() {
    this.isDrawing = false;
    const drawBtn = document.getElementById('drawPoly');
    drawBtn.classList.remove('btn-active');
    drawBtn.textContent = '✏️ Dibujar';
  }

  cleanupDrawing() {
    this.map.off('click', this.onDrawClick);
    window.removeEventListener('keydown', this.onDrawKeydown);
    this.map.getCanvas().style.cursor = '';
    document.body.classList.remove('drawing-cursor');
    
    // Limpiar puntos temporales
    if (this.map.getSource('draw-points')) {
      this.map.getSource('draw-points').setData({ type: 'FeatureCollection', features: [] });
    }
  }

  clearDrawingLayers() {
    if (this.map.getSource('draw-polygon')) {
      this.map.getSource('draw-polygon').setData({ type: 'FeatureCollection', features: [] });
    }
    if (this.map.getSource('draw-points')) {
      this.map.getSource('draw-points').setData({ type: 'FeatureCollection', features: [] });
    }
  }

  applyRegionFilter() {
    if (window.__MODE === 'geojson' && window.__fullGJ) {
      console.log('🎯 Aplicando filtro de región...', window.__region);
      
      // Llamar directamente a applyFilter del HTML
      window.applyFilter();
      
      // Análisis de la región - con timeout más largo y mejor logging
      setTimeout(() => {
        console.log('🔍 Analizando región...', window.__currentGJ);
        const filtered = window.__currentGJ;
        if (filtered && filtered.features && filtered.features.length > 0) {
          const total = filtered.features.length;
          const classes = new Map();
          
          filtered.features.forEach(f => {
            const clase = f.properties?.__N?.Clase || '(sin clase)';
            classes.set(clase, (classes.get(clase) || 0) + 1);
          });
          
          const topClasses = Array.from(classes.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([k, v]) => `${k} (${v})`)
            .join(', ');
            
          console.log('📊 Análisis completo:', { total, topClasses });
          this.statusEl.textContent = `🎯 REGIÓN ANALIZADA: ${total.toLocaleString()} puntos encontrados. Haz click para ver detalles.`;
          this.clipCount.textContent = `${total.toLocaleString()} puntos en región`;
          
          // MOSTRAR MODAL CON RESUMEN COMPLETO
          const totalGeneral = window.__fullGJ ? window.__fullGJ.features.length : total;
          window.mostrarResumenRegion(total, totalGeneral, classes);
          
          // También actualizar el indicador pequeño en el panel
          const resumenDiv = document.getElementById('classStats');
          if (resumenDiv) {
            resumenDiv.innerHTML = `
              <div style="background: #e0f2fe; padding: 12px; border-radius: 8px; margin: 8px 0; border-left: 4px solid #0277bd; cursor: pointer;" onclick="window.mostrarResumenRegion(${total}, ${totalGeneral}, new Map(${JSON.stringify(Array.from(classes.entries()))}))">
                <strong>🎯 RESUMEN DE LA REGIÓN</strong><br>
                <div style="font-size: 18px; color: #0277bd; font-weight: bold; margin: 6px 0;">
                  ${total.toLocaleString()} negocios encontrados
                </div>
                <div style="font-size: 12px; color: #0277bd;">
                  👆 Haz click para ver detalles completos
                </div>
              </div>
            `;
          }
        } else {
          console.log('⚠️ No hay datos filtrados disponibles');
          this.statusEl.textContent = `🎯 Región aplicada, pero no se encontraron puntos en esta área.`;
          this.clipCount.textContent = '0 puntos en región';
        }
      }, 200);
      
    } else if (window.__MODE === 'pmtiles') {
      window.pmtilesSystem.applyRegionFilter();
      this.statusEl.textContent = `🎯 PMTiles: Región aplicada. Solo se muestran puntos dentro del área dibujada.`;
      this.clipCount.textContent = 'Filtro PMTiles activo';
      
    } else {
      console.log('⚠️ No hay datos cargados para filtrar');
      this.statusEl.textContent = `✅ Región dibujada con ${this.drawPoints.length} puntos. Carga datos para filtrar.`;
      this.clipCount.textContent = 'Región lista';
    }
  }
}
