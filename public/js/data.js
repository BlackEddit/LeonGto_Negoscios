// ===== SISTEMA DE DATOS GEOJSON =====
class DataProcessor {
  // Normalizar cualquier formato a GeoJSON
  static normalizeAnyToGeoJSON(any) {
    if (!any) return null;
    
    if (any.type === 'FeatureCollection' && Array.isArray(any.features)) {
      for (const f of any.features) { 
        f.properties = DataProcessor.normalizePropsGeneric(f.properties || {}); 
      }
      return any;
    }
    
    if (Array.isArray(any) && any[0] && any[0].type === 'Feature') {
      for (const f of any) { 
        f.properties = DataProcessor.normalizePropsGeneric(f.properties || {}); 
      }
      return { type: 'FeatureCollection', features: any };
    }
    
    if (Array.isArray(any)) {
      const features = [];
      for (const r of any) {
        const ll = DataProcessor.getLonLat(r); 
        if (!ll) continue;
        const props = Array.isArray(r) ? DataProcessor.mapArrayRowToProps(r) : {...r};
        features.push({ 
          type: 'Feature', 
          geometry: { type: 'Point', coordinates: [ll.lon, ll.lat] }, 
          properties: DataProcessor.normalizePropsGeneric(props) 
        });
      }
      return { type: 'FeatureCollection', features };
    }
    
    return null;
  }

  // Extraer coordenadas
  static getLonLat(obj) {
    const lon = Number(obj.Longitud ?? obj.longitud ?? obj.lon ?? obj.Lon ?? obj.lng ?? obj.LNG ?? (Array.isArray(obj) ? obj[17] : NaN));
    const lat = Number(obj.Latitud ?? obj.latitud ?? obj.lat ?? obj.Lat ?? obj.latitude ?? obj.Latitude ?? (Array.isArray(obj) ? obj[18] : NaN));
    if (isFinite(lon) && isFinite(lat)) return {lon, lat}; 
    return null;
  }

  // Mapear array a propiedades
  static mapArrayRowToProps(arr) {
    const p = {}; 
    p.CLEE = arr[0]; p.Id = arr[1]; p.Nombre = arr[2]; p.Razon_social = arr[3];
    p.Clase_actividad = arr[4]; p.Estrato = arr[5]; p.Tipo_vialidad = arr[6]; p.Calle = arr[7];
    p.Num_Exterior = arr[8]; p.Num_Interior = arr[9]; p.Colonia = arr[10]; p.CP = arr[11];
    p.Ubicacion = arr[12]; p.Telefono = arr[13]; p.Correo_e = arr[14]; p.Sitio_internet = arr[15];
    p.Tipo = arr[16]; p.Longitud = arr[17]; p.Latitud = arr[18]; 
    return p;
  }

  // Normalizar propiedades
  static normalizePropsGeneric(p) {
    const Nombre = p.__N?.Nombre ?? p.Nombre ?? p.nombre ?? '';
    const Clase = p.__N?.Clase ?? p.Clase_actividad ?? p.clase ?? p.Clase ?? p.Subsector_actividad ?? '';
    const TipoV = p.__N?.TipoV ?? p.Tipo_vialidad ?? '';
    const Calle = p.__N?.Calle ?? p.Calle ?? '';
    const NumExt = p.__N?.NumExt ?? p.Num_Exterior ?? '';
    const NumInt = p.__N?.NumInt ?? p.Num_Interior ?? '';
    const Colonia = p.__N?.Colonia ?? p.Colonia ?? '';
    const CP = p.__N?.CP ?? p.CP ?? '';
    const Ubic = p.__N?.Ubic ?? p.Ubicacion ?? p.Ubic ?? '';
    const Tel = p.__N?.Tel ?? p.Telefono ?? '';
    const Web = p.__N?.Web ?? p.Sitio_internet ?? '';
    const CLEE = p.__N?.CLEE ?? p.CLEE ?? p.clee ?? '';
    const Id = p.__N?.Id ?? p.Id ?? p.id ?? '';
    
    return { ...p, __N: {Nombre, Clase, TipoV, Calle, NumExt, NumInt, Colonia, CP, Ubic, Tel, Web, CLEE, Id} };
  }

  // Construir estadísticas de clases
  static buildClassStats(gj) {
    const map = new Map();
    for (const f of (gj.features || [])) {
      const c = (f.properties?.__N?.Clase || '').trim() || '(sin clase)';
      map.set(c, (map.get(c) || 0) + 1);
    }
    const list = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({k, v}));
    return { list, total: gj.features?.length || 0 };
  }
}
