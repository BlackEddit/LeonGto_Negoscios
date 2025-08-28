// ===== UTILIDADES GENERALES =====
//  Funciones de utilidad general:
// Funciones helper que se usan en varios archivos
// Utilidades para el mapa
// Funciones auxiliares comunes
class Utils {
  // Escapar HTML
  static esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', 
      '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // URL segura
  static safeUrl(u) {
    try { 
      return new URL(u).href; 
    } catch { 
      return '#'; 
    }
  }

  // Descargar JSON
  static downloadJSON(obj, filename) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), {href: url, download: filename});
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Descargar CSV
  static downloadCSV(gj, filename) {
    const rows = (gj.features || []).map(f => {
      const n = f.properties?.__N || {};
      return [
        Utils.csvEscape(n.Nombre), Utils.csvEscape(n.Clase), Utils.csvEscape(n.TipoV), 
        Utils.csvEscape(n.Calle), Utils.csvEscape(n.NumExt), Utils.csvEscape(n.NumInt),
        Utils.csvEscape(n.Colonia), Utils.csvEscape(n.CP), Utils.csvEscape(n.Ubic), 
        Utils.csvEscape(n.Tel), Utils.csvEscape(n.Web), Utils.csvEscape(n.CLEE), 
        Utils.csvEscape(n.Id), f.geometry.coordinates[1], f.geometry.coordinates[0]
      ].join(',');
    });
    const head = 'Nombre,Clase,TipoV,Calle,NumExt,NumInt,Colonia,CP,Ubic,Tel,Web,CLEE,Id,Lat,Lon\n';
    const blob = new Blob([head + rows.join('\n')], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), {href: url, download: filename});
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Escapar CSV
  static csvEscape(v) {
    v = v == null ? '' : String(v);
    if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
    return v;
  }

  // Fit bounds de datos
  static fitToData(map, gj) {
    const pts = (gj.features || []).filter(f => f.geometry?.type === 'Point');
    if (!pts.length) return;
    const xs = pts.map(f => f.geometry.coordinates[0]);
    const ys = pts.map(f => f.geometry.coordinates[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    map.fitBounds([[minX, minY], [maxX, maxY]], { padding: 40, maxZoom: 15 });
  }

  // Esperar PMTiles
  static waitForPMTiles(ms = CONFIG.PMTILES_WAIT) {
    if (window.__pmtilesReady) return Promise.resolve(true);
    return new Promise(res => {
      const t = setTimeout(() => res(false), ms);
      if (window.__pmtilesReady) { clearTimeout(t); res(true); return; }
      // Simple polling fallback
      const check = setInterval(() => {
        if (window.__pmtilesReady) { clearTimeout(t); clearInterval(check); res(true); }
      }, 100);
    });
  }
}
