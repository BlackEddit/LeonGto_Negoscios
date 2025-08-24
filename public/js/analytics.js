/**
 * Sistema de Analytics y Métricas
 * Proporciona análisis estadístico avanzado de datos empresariales
 */
class Analytics {
  constructor() {
    this.data = null;
    this.charts = {};
  }

  /**
   * Inicializar el sistema de analytics con datos
   */
  initialize(geoJsonData) {
    this.data = geoJsonData;
    this.createDashboard();
  }

  /**
   * Crear dashboard principal de analytics
   */
  createDashboard() {
    if (!this.data) return;

    const stats = this.calculateBasicStats();
    const sectorStats = this.calculateSectorStats();
    const geographicStats = this.calculateGeographicStats();

    this.renderKPIs(stats);
    this.renderSectorChart(sectorStats);
    this.renderDensityHeatmap(geographicStats);
    this.renderTrendAnalysis();
  }

  /**
   * Calcular estadísticas básicas
   */
  calculateBasicStats() {
    const features = this.data.features || [];
    const totalBusinesses = features.length;
    
    const sectors = new Set();
    const colonies = new Set();
    const businessTypes = new Map();

    features.forEach(feature => {
      const props = feature.properties?.__N || {};
      if (props.Clase) sectors.add(props.Clase);
      if (props.Colonia) colonies.add(props.Colonia);
      
      const type = props.Clase || '(sin clasificar)';
      businessTypes.set(type, (businessTypes.get(type) || 0) + 1);
    });

    return {
      totalBusinesses,
      uniqueSectors: sectors.size,
      uniqueColonies: colonies.size,
      businessTypes: Array.from(businessTypes.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      averageDensity: this.calculateAverageDensity(features)
    };
  }

  /**
   * Calcular estadísticas por sector
   */
  calculateSectorStats() {
    const features = this.data.features || [];
    const sectorMap = new Map();

    features.forEach(feature => {
      const sector = feature.properties?.__N?.Clase || '(sin clasificar)';
      sectorMap.set(sector, (sectorMap.get(sector) || 0) + 1);
    });

    return Array.from(sectorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
  }

  /**
   * Calcular estadísticas geográficas
   */
  calculateGeographicStats() {
    const features = this.data.features || [];
    const colonyMap = new Map();
    const coordinates = [];

    features.forEach(feature => {
      const colony = feature.properties?.__N?.Colonia || '(sin especificar)';
      colonyMap.set(colony, (colonyMap.get(colony) || 0) + 1);
      
      if (feature.geometry?.coordinates) {
        coordinates.push({
          lng: feature.geometry.coordinates[0],
          lat: feature.geometry.coordinates[1],
          sector: feature.properties?.__N?.Clase || 'Otro'
        });
      }
    });

    return {
      byColony: Array.from(colonyMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      coordinates
    };
  }

  /**
   * Calcular densidad promedio (simplificado)
   */
  calculateAverageDensity(features) {
    // Dividir en grid aproximado para calcular densidad
    const gridSize = 0.01; // ~1km
    const grid = new Map();

    features.forEach(feature => {
      if (feature.geometry?.coordinates) {
        const [lng, lat] = feature.geometry.coordinates;
        const gridKey = `${Math.floor(lng / gridSize)},${Math.floor(lat / gridSize)}`;
        grid.set(gridKey, (grid.get(gridKey) || 0) + 1);
      }
    });

    const densities = Array.from(grid.values());
    return densities.length > 0 
      ? Math.round(densities.reduce((a, b) => a + b, 0) / densities.length)
      : 0;
  }

  /**
   * Renderizar KPIs principales
   */
  renderKPIs(stats) {
    const kpiContainer = document.getElementById('analytics-kpis');
    if (!kpiContainer) return;

    kpiContainer.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-value">${stats.totalBusinesses.toLocaleString()}</div>
          <div class="kpi-label">Total Negocios</div>
          <div class="kpi-icon">🏢</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${stats.uniqueSectors}</div>
          <div class="kpi-label">Sectores Únicos</div>
          <div class="kpi-icon">📊</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${stats.uniqueColonies}</div>
          <div class="kpi-label">Colonias</div>
          <div class="kpi-icon">🏘️</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${stats.averageDensity}</div>
          <div class="kpi-label">Densidad Promedio</div>
          <div class="kpi-icon">📍</div>
        </div>
      </div>
    `;
  }

  /**
   * Renderizar gráfico de sectores (placeholder para Chart.js)
   */
  renderSectorChart(sectorStats) {
    console.log('📊 Top 15 Sectores:', sectorStats);
    
    // TODO: Implementar con Chart.js
    const chartContainer = document.getElementById('sector-chart');
    if (chartContainer) {
      chartContainer.innerHTML = `
        <div class="chart-placeholder">
          <h3>📊 Top Sectores Empresariales</h3>
          <div class="sector-list">
            ${sectorStats.slice(0, 8).map(([sector, count], index) => `
              <div class="sector-item">
                <span class="sector-rank">#${index + 1}</span>
                <span class="sector-name">${sector}</span>
                <span class="sector-count">${count.toLocaleString()}</span>
                <div class="sector-bar">
                  <div class="sector-fill" style="width: ${(count / sectorStats[0][1]) * 100}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="chart-note">🚀 Chart.js implementation coming soon</div>
        </div>
      `;
    }
  }

  /**
   * Renderizar mapa de calor de densidad
   */
  renderDensityHeatmap(geographicStats) {
    console.log('🗺️ Distribución Geográfica:', geographicStats);
    
    // TODO: Implementar heatmap con MapLibre o D3.js
    const heatmapContainer = document.getElementById('density-heatmap');
    if (heatmapContainer) {
      heatmapContainer.innerHTML = `
        <div class="chart-placeholder">
          <h3>🔥 Densidad por Colonia</h3>
          <div class="colony-list">
            ${geographicStats.byColony.slice(0, 6).map(([colony, count]) => `
              <div class="colony-item">
                <span class="colony-name">${colony}</span>
                <span class="colony-count">${count.toLocaleString()} negocios</span>
              </div>
            `).join('')}
          </div>
          <div class="chart-note">🗺️ Interactive heatmap coming soon</div>
        </div>
      `;
    }
  }

  /**
   * Análisis de tendencias (placeholder)
   */
  renderTrendAnalysis() {
    const trendContainer = document.getElementById('trend-analysis');
    if (trendContainer) {
      trendContainer.innerHTML = `
        <div class="chart-placeholder">
          <h3>📈 Análisis de Tendencias</h3>
          <div class="trend-insights">
            <div class="insight">
              <span class="insight-icon">🏪</span>
              <span>Mayor concentración en Centro Histórico</span>
            </div>
            <div class="insight">
              <span class="insight-icon">🛒</span>
              <span>Comercio al por menor domina el mercado</span>
            </div>
            <div class="insight">
              <span class="insight-icon">🍕</span>
              <span>Restaurantes en constante crecimiento</span>
            </div>
          </div>
          <div class="chart-note">📊 Temporal analysis coming soon</div>
        </div>
      `;
    }
  }

  /**
   * Exportar datos de analytics
   */
  exportAnalytics() {
    const stats = this.calculateBasicStats();
    const sectors = this.calculateSectorStats();
    const geographic = this.calculateGeographicStats();

    const analyticsData = {
      timestamp: new Date().toISOString(),
      overview: stats,
      sectors: sectors,
      geographic: geographic.byColony,
      metadata: {
        totalRecords: this.data?.features?.length || 0,
        analysisType: 'comprehensive',
        city: 'León, Guanajuato'
      }
    };

    // Descargar como JSON
    const blob = new Blob([JSON.stringify(analyticsData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leon-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
}

// Hacer disponible globalmente
window.Analytics = Analytics;
