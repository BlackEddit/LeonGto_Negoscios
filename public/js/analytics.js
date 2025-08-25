/**
 * Sistema de Analytics y Métricas
 * Proporciona análisis estadístico avanzado de datos empresariales
 */
class Analytics {
  constructor() {
    this.data = null;
    this.charts = {};
    this.currentFilter = null; // Para track del filtro activo
  }

  /**
   * Inicializar el sistema de analytics con datos
   */
  initialize(geoJsonData) {
    console.log('🚀 Iniciando Analytics con', geoJsonData.features?.length, 'registros');
    console.log('🔍 Filtro actual al inicializar:', this.currentFilter);
    console.log('📊 Muestra de datos:', geoJsonData.features?.slice(0, 2));
    this.data = geoJsonData;
    this.createDashboard();
  }

  /**
   * Crear dashboard principal de analytics
   */
  createDashboard() {
    if (!this.data) return;
    
    console.log('🚀 Creando dashboard con', this.data.features?.length, 'registros');

    const stats = this.calculateBasicStats();
    const sectorStats = this.calculateSectorStats();
    const geographicStats = this.calculateGeographicStats();

    this.renderKPIs(stats);
    this.renderSectorChart(sectorStats);
    this.renderGeographicChart(geographicStats);
    this.renderTrendAnalysis();
  }

  /**
   * Crear dashboard básico sin Chart.js (fallback)
   */
  createBasicDashboard() {
    if (!this.data) return;

    const stats = this.calculateBasicStats();
    const sectorStats = this.calculateSectorStats();
    
    this.renderKPIs(stats);
    this.renderBasicSectorChart(sectorStats);
    this.renderBasicMessage();
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
   * Obtener color consistente para un sector específico
   */
  getSectorColor(sectorName, index) {
    // Colores base
    const baseColors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ];
    
    // Si tenemos el sector en los datos originales, usar su color original
    if (this.originalSectorOrder) {
      const originalIndex = this.originalSectorOrder.findIndex(([name]) => name === sectorName);
      if (originalIndex >= 0 && originalIndex < baseColors.length) {
        return baseColors[originalIndex];
      }
    }
    
    // Fallback al índice actual
    return baseColors[index % baseColors.length];
  }

  /**
   * Renderizar gráfico de sectores con Chart.js
   */
  renderSectorChart(sectorStats) {
    console.log('📊 Creando gráfico de sectores con Chart.js');
    
    // Guardar sectorStats para búsquedas posteriores
    this.lastSectorStats = sectorStats;
    
    // Guardar orden original de sectores la primera vez
    if (!this.originalSectorOrder) {
      this.originalSectorOrder = [...sectorStats];
      console.log('💾 Guardando orden original de sectores:', this.originalSectorOrder.slice(0, 5).map(([name]) => name));
    }
    
    const chartContainer = document.getElementById('sector-chart');
    if (!chartContainer) {
      console.error('❌ No se encontró container sector-chart');
      return;
    }

    // Destruir gráfico existente si existe
    if (this.charts.sectors) {
      this.charts.sectors.destroy();
    }

    // Preparar datos para Chart.js
    const top10 = sectorStats.slice(0, 10);
    const labels = top10.map(([sector]) => {
      // Acortar nombres muy largos
      return sector.length > 40 ? sector.substring(0, 37) + '...' : sector;
    });
    const data = top10.map(([, count]) => count);
    const total = sectorStats.reduce((sum, [, count]) => sum + count, 0);
    
    // 🎨 Generar colores consistentes para cada sector
    const sectorColors = top10.map(([sectorName], index) => {
      return this.getSectorColor(sectorName, index);
    });
    
    console.log('🎨 Colores asignados:', top10.map(([name], i) => `${name.substring(0, 20)}: ${sectorColors[i]}`));

    chartContainer.innerHTML = `
      <div class="chart-placeholder">
        <h3>📊 Top 10 Sectores Empresariales</h3>
        <canvas id="sectorsChart" width="350" height="280"></canvas>
        <div class="chart-stats">
          <small>Total analizado: ${total.toLocaleString()} negocios • Clic en barras para filtrar</small>
        </div>
      </div>
    `;

    const canvas = document.getElementById('sectorsChart');
    if (!canvas) {
      console.error('❌ No se pudo crear canvas sectorsChart');
      return;
    }
    
    const ctx = canvas.getContext('2d');

    // Crear gráfico de barras horizontales CON CLICK INTERACTIVO
    this.charts.sectors = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Cantidad de Negocios',
          data: data,
          backgroundColor: sectorColors, // Usar colores consistentes
          borderColor: '#ffffff',
          borderWidth: 2,
          borderRadius: 6,
        }]
      },
      options: {
        indexAxis: 'y', // Barras horizontales
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: (context) => {
                const fullName = sectorStats[context[0].dataIndex][0];
                return fullName;
              },
              label: (context) => {
                const count = context.parsed.x.toLocaleString();
                const percent = ((context.parsed.x / total) * 100).toFixed(1);
                return `${count} negocios (${percent}%) • Clic para filtrar`;
              }
            },
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 11 }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value >= 1000 ? (value/1000).toFixed(1) + 'K' : value;
              },
              font: { size: 10 }
            },
            grid: {
              color: '#e5e7eb'
            }
          },
          y: {
            ticks: {
              font: { size: 9 },
              maxRotation: 0
            },
            grid: {
              display: false
            }
          }
        },
        layout: {
          padding: {
            top: 10,
            bottom: 10
          }
        },
        // 🎯 INTERACCIÓN: Click en barras para filtrar
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const elementIndex = elements[0].index;
            const sectorName = sectorStats[elementIndex][0];
            
            console.log('🎯 CLICK DEBUG:');
            console.log('  - Índice clickeado:', elementIndex);
            console.log('  - Sector en ese índice:', sectorName);
            console.log('  - sectorStats[0-4]:', sectorStats.slice(0, 5).map(([name, count]) => `${name}: ${count}`));
            console.log('  - Labels del gráfico:', labels);
            
            // Guardar el índice clickeado para highlighting
            this.lastClickedIndex = elementIndex;
            
            // Filtrar por este sector (con toggle)
            this.filterBySector(sectorName);
          }
        },
        onHover: (event, elements) => {
          event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
        }
      }
    });
    
    // 🎨 Destacar barra activa si hay filtro
    if (this.currentFilter) {
      this.highlightActiveFilter();
    }
    
    console.log('✅ Gráfico de sectores Chart.js creado');
  }

  /**
   * Destacar visualmente la barra del filtro activo
   */
  highlightActiveFilter() {
    if (!this.charts.sectors) return;
    
    const chart = this.charts.sectors;
    const data = chart.data;
    
    // Obtener colores originales del gráfico actual
    const currentColors = [...chart.data.datasets[0].backgroundColor];
    
    // Si NO hay filtro activo, mantener colores originales
    if (!this.currentFilter) {
      console.log('🎨 Sin filtro activo - manteniendo colores originales');
      // Los colores ya están correctos, no hacer nada
      return;
    }
    
    // Encontrar el índice del filtro activo y destacarlo
    const labels = data.labels;
    console.log('🔍 Buscando sector activo:', this.currentFilter);
    console.log('🔍 Labels disponibles:', labels);
    console.log('🔍 Último índice clickeado:', this.lastClickedIndex);
    
    // Usar el índice del último click si está disponible
    let activeIndex = -1;
    if (this.lastClickedIndex !== undefined && this.lastSectorStats) {
      const clickedSector = this.lastSectorStats[this.lastClickedIndex]?.[0];
      if (clickedSector === this.currentFilter) {
        activeIndex = this.lastClickedIndex;
        console.log('🔍 Usando índice del último click:', activeIndex);
      }
    }
    
    // Fallback: buscar en sectorStats original
    if (activeIndex === -1 && this.lastSectorStats) {
      activeIndex = this.lastSectorStats.findIndex(([sectorName]) => sectorName === this.currentFilter);
      console.log('🔍 Índice encontrado en sectorStats:', activeIndex, 'para sector:', this.currentFilter);
    }
    
    if (activeIndex >= 0) {
      console.log('🎨 Destacando sector activo en índice:', activeIndex, '-', labels[activeIndex]);
      // Crear nueva paleta: atenuar todos excepto el activo
      const newColors = currentColors.map((color, index) => {
        if (index === activeIndex) {
          return '#dc2626'; // Rojo brillante para el activo
        } else {
          return color + '40'; // 25% opacity para los demás
        }
      });
      
      chart.data.datasets[0].backgroundColor = newColors;
      chart.update();
    } else {
      console.log('🎨 No se encontró sector activo, manteniendo colores');
    }
  }

  /**
   * Renderizar gráfico geográfico con Chart.js
   */
  renderGeographicChart(geographicStats) {
    console.log('🗺️ Creando gráfico geográfico con Chart.js');
    
    const chartContainer = document.getElementById('geographic-chart');
    if (!chartContainer) return;

    // Destruir gráfico existente si existe
    if (this.charts.geographic) {
      this.charts.geographic.destroy();
    }

    // Preparar datos para Chart.js - Top 10 ubicaciones
    const sortedData = geographicStats.byColony.slice(0, 10);
    const labels = sortedData.map(([location]) => {
      // Limpiar y acortar nombres de ubicación
      const cleanLocation = location.replace(/[^\w\s]/gi, '').trim();
      return cleanLocation.length > 25 ? cleanLocation.substring(0, 22) + '...' : cleanLocation;
    });
    const data = sortedData.map(([, count]) => count);
    const total = geographicStats.byColony.reduce((sum, [, count]) => sum + count, 0);

    chartContainer.innerHTML = `
      <div class="chart-placeholder">
        <h3>🗺️ Distribución Geográfica</h3>
        <canvas id="geographicChart" width="350" height="280"></canvas>
        <div class="chart-stats">
          <small>Mostrando top 10 de ${geographicStats.byColony.length} ubicaciones</small>
        </div>
      </div>
    `;

    const canvas = document.getElementById('geographicChart');
    const ctx = canvas.getContext('2d');

    // Crear gráfico de dona
    this.charts.geographic = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
            '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
          ],
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverBorderWidth: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: { size: 10 },
              generateLabels: (chart) => {
                const data = chart.data;
                return data.labels.map((label, i) => ({
                  text: `${label} (${data.datasets[0].data[i].toLocaleString()})`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor,
                  lineWidth: data.datasets[0].borderWidth,
                  index: i
                }));
              }
            }
          },
          tooltip: {
            callbacks: {
              title: (context) => {
                const fullName = sortedData[context[0].dataIndex][0];
                return fullName;
              },
              label: (context) => {
                const count = context.parsed.toLocaleString();
                const percent = ((context.parsed / total) * 100).toFixed(1);
                return `${count} negocios (${percent}%)`;
              }
            },
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 11 }
          }
        },
        layout: {
          padding: {
            top: 10,
            bottom: 10
          }
        }
      }
    });
  }

  /**
   * Renderizar análisis de tendencias con Chart.js
   */
  renderTrendAnalysis() {
    console.log('📈 Creando gráfico de tendencias con Chart.js');
    
    const chartContainer = document.getElementById('trend-analysis');
    if (!chartContainer) return;

    // Destruir gráfico existente si existe
    if (this.charts.trends) {
      this.charts.trends.destroy();
    }

    // Simular datos de tendencias por sectores principales
    const sectorStats = this.calculateSectorStats();
    const topSectors = sectorStats.slice(0, 5);
    
    // Generar datos de tendencia simulada (en un caso real vendrían de datos históricos)
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const datasets = topSectors.map(([sector, baseCount], index) => {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
      const variation = 0.1; // 10% de variación máxima
      
      return {
        label: sector.length > 30 ? sector.substring(0, 27) + '...' : sector,
        data: months.map(() => {
          const variance = (Math.random() - 0.5) * variation;
          return Math.max(0, Math.round(baseCount * (1 + variance)));
        }),
        borderColor: colors[index],
        backgroundColor: colors[index] + '20',
        borderWidth: 2,
        fill: false,
        tension: 0.4
      };
    });

    chartContainer.innerHTML = `
      <div class="chart-placeholder">
        <h3>📈 Tendencias por Sector</h3>
        <canvas id="trendsChart" width="400" height="250"></canvas>
        <div class="chart-stats">
          <small>Datos simulados - Top 5 sectores últimos 6 meses</small>
        </div>
      </div>
    `;

    const canvas = document.getElementById('trendsChart');
    const ctx = canvas.getContext('2d');

    // Crear gráfico de líneas
    this.charts.trends = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 12,
              font: { size: 9 },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} negocios`;
              }
            },
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 11 }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Mes',
              font: { size: 11 }
            },
            grid: {
              color: '#e5e7eb'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Cantidad de Negocios',
              font: { size: 11 }
            },
            ticks: {
              callback: function(value) {
                return value >= 1000 ? (value/1000).toFixed(1) + 'K' : value;
              },
              font: { size: 10 }
            },
            grid: {
              color: '#e5e7eb'
            }
          }
        },
        layout: {
          padding: {
            top: 10,
            bottom: 10
          }
        }
      }
    });
  }

  /**
   * Mostrar gráfico de sectores básico sin Chart.js
   */
  renderBasicSectorChart(sectorStats) {
    const chartContainer = document.getElementById('sector-chart');
    if (!chartContainer) return;

    chartContainer.innerHTML = `
      <div class="chart-placeholder">
        <h3>📊 Top Sectores Empresariales</h3>
        <div class="sector-list">
          ${sectorStats.slice(0, 10).map(([sector, count], index) => `
            <div class="sector-item">
              <span class="sector-rank">#${index + 1}</span>
              <span class="sector-name">${sector.length > 50 ? sector.substring(0, 47) + '...' : sector}</span>
              <span class="sector-count">${count.toLocaleString()}</span>
              <div class="sector-bar">
                <div class="sector-fill" style="width: ${(count / sectorStats[0][1]) * 100}%"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Mostrar mensaje sobre gráficos interactivos
   */
  renderBasicMessage() {
    const trendContainer = document.getElementById('trend-analysis');
    if (!trendContainer) return;

    trendContainer.innerHTML = `
      <div class="chart-placeholder">
        <h3>📊 Analytics Básicos Activos</h3>
        <div class="trend-insights">
          <div class="insight">
            <span class="insight-icon">📈</span>
            <span>KPIs y estadísticas disponibles</span>
          </div>
          <div class="insight">
            <span class="insight-icon">📊</span>
            <span>Ranking de sectores empresariales</span>
          </div>
          <div class="insight">
            <span class="insight-icon">💡</span>
            <span>Recarga la página para gráficos interactivos</span>
          </div>
        </div>
      </div>
    `;
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

  /**
   * Filtrar datos por sector específico (con toggle inteligente)
   */
  filterBySector(sectorName) {
    console.log('🎯 === INICIO filterBySector ===');
    console.log('🎯 Sector recibido:', sectorName);
    console.log('🎯 Tipo:', typeof sectorName, 'Longitud:', sectorName?.length);
    console.log('🔍 Filtro actual ANTES:', this.currentFilter);
    
    if (!window.__fullGJ || typeof window.applyFilter !== 'function') {
      console.error('❌ Sistema de filtros no disponible');
      return;
    }

    // � VERIFICAR el filtro REAL activo en la UI
    const classSel = document.getElementById('classSel');
    let realActiveFilter = null;
    if (classSel) {
      const selectedOptions = Array.from(classSel.options).filter(opt => opt.selected);
      if (selectedOptions.length === 1) {
        realActiveFilter = selectedOptions[0].value;
      }
    }
    
    console.log('🔍 Filtro REAL en UI:', realActiveFilter);
    console.log('🔍 ¿Click en mismo sector activo?', realActiveFilter === sectorName);

    // 🔄 TOGGLE OFF: Si el sector clickeado es el que está REALMENTE activo
    if (realActiveFilter === sectorName) {
      console.log('🔄 TOGGLE OFF - Quitando filtro del sector activo:', sectorName);
      
      // Limpiar filtro activo PRIMERO
      this.currentFilter = null;
      this.lastClickedIndex = undefined; // Limpiar índice clickeado
      
      // Limpiar todos los elementos de filtro
      const classSearch = document.getElementById('classSearch');
      const classSel = document.getElementById('classSel');
      const nameSearch = document.getElementById('nameSearch');
      
      if (classSearch) classSearch.value = '';
      if (nameSearch) nameSearch.value = '';
      
      // Deseleccionar todas las opciones
      if (classSel) {
        for (const option of classSel.options) {
          option.selected = false;
        }
      }
      
      // 🔥 IMPORTANTE: Limpiar región
      window.__region = null;
      const clipCount = document.getElementById('clipCount');
      if (clipCount) clipCount.textContent = '—';
      
      // Limpiar polígono visual del mapa
      if (window.map && window.map.getSource && window.map.getSource('draw-polygon')) {
        window.map.getSource('draw-polygon').setData({ type: 'FeatureCollection', features: [] });
      }
      
      // 🚀 FORZAR DATOS COMPLETOS
      console.log('🔄 Restaurando datos completos:', window.__fullGJ.features.length, 'puntos');
      window.__currentGJ = window.__fullGJ;
      
      // 🔥 DESACTIVAR auto-actualización temporalmente
      const analyticsPanel = document.getElementById('analyticsPanel');
      const wasOpen = analyticsPanel && analyticsPanel.classList.contains('show');
      if (wasOpen) {
        analyticsPanel.classList.remove('show');
      }
      
      // Aplicar filtro vacío
      if (window.applyFilter) {
        window.applyFilter();
      }
      
      // 🔥 REACTIVAR analytics después de aplicar filtro
      if (wasOpen) {
        analyticsPanel.classList.add('show');
        // Regenerar con datos completos SIN preservar filtro
        setTimeout(() => {
          this.initialize(window.__fullGJ);
          // 🎨 IMPORTANTE: Restaurar colores después de quitar filtro
          setTimeout(() => {
            this.highlightActiveFilter();
          }, 50);
        }, 100);
      }
      
      // Actualizar status
      const statusEl = document.getElementById('status');
      if (statusEl) {
        statusEl.textContent = `🔄 FILTRO REMOVIDO - Mostrando ${window.__fullGJ.features.length.toLocaleString()} puntos totales`;
      }
      
      return;
    }

    // 🎯 CAMBIO DE FILTRO: Si hay un filtro activo pero es DIFERENTE
    if (realActiveFilter && realActiveFilter !== sectorName) {
      console.log('🔄 CAMBIO DE FILTRO:', realActiveFilter, '→', sectorName);
    } else if (!realActiveFilter) {
      console.log('🎯 NUEVO FILTRO:', sectorName);
    }
    
    // 🎯 APLICAR FILTRO (nuevo o cambio)
    console.log('🎯 APLICANDO FILTRO:', sectorName);
    
    // Acceder a los elementos del filtro
    const classSearch = document.getElementById('classSearch');
    const classSelFinal = document.getElementById('classSel');
    const nameSearch = document.getElementById('nameSearch');
    
    if (!classSearch || !classSelFinal) {
      console.error('❌ Elementos de filtro no encontrados');
      return;
    }
    
    // Limpiar filtros existentes
    classSearch.value = '';
    if (nameSearch) nameSearch.value = '';
    
    // Deseleccionar todas las opciones
    for (const option of classSelFinal.options) {
      option.selected = false;
    }
    
    // Buscar y seleccionar el sector específico
    let found = false;
    for (const option of classSelFinal.options) {
      if (option.value === sectorName) {
        option.selected = true;
        found = true;
        console.log('✅ Sector seleccionado en lista:', sectorName);
        break;
      }
    }
    
    if (!found) {
      console.error('❌ Sector no encontrado en lista:', sectorName);
      console.log('📋 Opciones disponibles:', Array.from(classSelFinal.options).map(o => o.value));
      return;
    }
    
    // Guardar filtro activo
    this.currentFilter = sectorName;
    console.log('💾 Filtro guardado:', this.currentFilter);
    
    // Aplicar el filtro - el analytics se actualizará automáticamente
    // y el filtro se preservará gracias al código en index.html
    window.applyFilter();
    
    // 🎨 IMPORTANTE: Actualizar colores después de aplicar filtro
    setTimeout(() => {
      this.highlightActiveFilter();
    }, 150);
    
    // Mostrar mensaje de confirmación
    const statusEl = document.getElementById('status');
    if (statusEl) {
      statusEl.textContent = `🎯 Filtrado por: ${sectorName.substring(0, 50)}... (clic de nuevo para quitar)`;
    }
  }
}

// Hacer disponible globalmente
window.Analytics = Analytics;
