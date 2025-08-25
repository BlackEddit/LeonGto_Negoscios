// Chart.js Simple - Fallback básico funcional
window.Chart = {
  version: '4.4.0-fallback',
  register: () => {},
  defaults: { responsive: true }
};

// Constructor básico que funciona
window.Chart = function(ctx, config) {
  this.ctx = ctx;
  this.config = config;
  this.data = config.data;
  this.options = config.options || {};
  
  // Crear gráfico básico funcional
  this.render();
  
  return this;
};

window.Chart.prototype = {
  render() {
    const canvas = this.ctx.canvas;
    const container = canvas.parentElement;
    
    // Si es gráfico de barras, crear versión HTML
    if (this.config.type === 'bar') {
      this.renderBarChart(container);
    } else if (this.config.type === 'doughnut') {
      this.renderDoughnutChart(container);
    } else if (this.config.type === 'line') {
      this.renderLineChart(container);
    }
  },
  
  renderBarChart(container) {
    const data = this.data.datasets[0].data;
    const labels = this.data.labels;
    const maxValue = Math.max(...data);
    const onClick = this.options.onClick;
    
    let html = `
      <div class="chart-bars" style="display: flex; flex-direction: column; gap: 8px; padding: 20px;">
    `;
    
    data.forEach((value, index) => {
      const width = (value / maxValue) * 100;
      const color = this.data.datasets[0].backgroundColor[index] || '#3b82f6';
      
      html += `
        <div class="bar-item" style="display: flex; align-items: center; gap: 12px; cursor: pointer; padding: 8px; border-radius: 6px; transition: all 0.2s;" 
             data-index="${index}"
             onmouseover="this.style.backgroundColor='#f3f4f6'"
             onmouseout="this.style.backgroundColor='transparent'">
          <div style="min-width: 30px; font-size: 12px; font-weight: bold; color: white; background: ${color}; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
            ${index + 1}
          </div>
          <div style="flex: 1; font-size: 13px; color: #374151;">
            ${labels[index]}
          </div>
          <div style="font-weight: bold; color: ${color}; min-width: 60px; text-align: right;">
            ${value.toLocaleString()}
          </div>
          <div style="width: 120px; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
            <div style="width: ${width}%; height: 100%; background: ${color}; transition: width 0.3s;"></div>
          </div>
        </div>
      `;
    });
    
    html += `</div>`;
    
    container.innerHTML = html;
    
    // Agregar event listeners para clicks
    if (onClick) {
      const barItems = container.querySelectorAll('.bar-item');
      barItems.forEach((item, index) => {
        item.addEventListener('click', (e) => {
          onClick(e, [{ index }]);
        });
      });
    }
  },
  
  renderDoughnutChart(container) {
    const data = this.data.datasets[0].data;
    const labels = this.data.labels;
    const colors = this.data.datasets[0].backgroundColor;
    const total = data.reduce((sum, val) => sum + val, 0);
    
    let html = `
      <div class="chart-legend" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; padding: 20px;">
    `;
    
    data.forEach((value, index) => {
      const percent = ((value / total) * 100).toFixed(1);
      
      html += `
        <div style="display: flex; align-items: center; gap: 8px; padding: 8px; border-radius: 6px; background: #f9fafb;">
          <div style="width: 16px; height: 16px; border-radius: 4px; background: ${colors[index]};"></div>
          <div style="flex: 1; font-size: 12px; color: #374151;">
            ${labels[index]}
          </div>
          <div style="font-weight: bold; color: #1f2937;">
            ${percent}%
          </div>
        </div>
      `;
    });
    
    html += `</div>`;
    container.innerHTML = html;
  },
  
  renderLineChart(container) {
    container.innerHTML = `
      <div style="padding: 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
        <h3 style="margin: 0 0 16px 0;">📈 Análisis de Tendencias</h3>
        <div style="font-size: 48px; margin: 20px 0;">📊</div>
        <p style="margin: 0; opacity: 0.9;">Gráfico de tendencias simulado</p>
      </div>
    `;
  },
  
  update() {
    this.render();
  },
  
  destroy() {
    // Limpiar si es necesario
  }
};

console.log('✅ Chart.js Fallback cargado');
