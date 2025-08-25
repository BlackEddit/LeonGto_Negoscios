/**
 * Script de Exploración de Datos
 * Para entender qué campos tenemos disponibles en nuestros datos DENUE
 */

function exploreDataStructure() {
  console.log('🔍 EXPLORANDO ESTRUCTURA DE DATOS DENUE');
  
  if (!window.__fullGJ || !window.__fullGJ.features) {
    console.log('❌ No hay datos cargados');
    return;
  }

  const features = window.__fullGJ.features;
  console.log(`📊 Total de registros: ${features.length.toLocaleString()}`);
  
  // Tomar una muestra de los primeros registros
  const sample = features.slice(0, 10);
  
  console.log('\n🔍 MUESTRA DE PROPIEDADES DISPONIBLES:');
  sample.forEach((feature, index) => {
    const props = feature.properties || {};
    const normalized = feature.properties?.__N || {};
    
    console.log(`\n--- Registro #${index + 1} ---`);
    console.log('Props raw:', Object.keys(props));
    console.log('Props normalized:', Object.keys(normalized));
    console.log('Ejemplo values:', {
      Nombre: normalized.Nombre || props.Nombre,
      Clase: normalized.Clase || props.Clase_actividad,
      Colonia: normalized.Colonia || props.Colonia,
      TipoV: normalized.TipoV || props.Tipo_vialidad,
      Calle: normalized.Calle || props.Calle,
      CP: normalized.CP || props.CP,
      Ubicacion: normalized.Ubic || props.Ubicacion
    });
  });

  // Análisis de campos únicos
  console.log('\n📈 ANÁLISIS DE CAMPOS ÚNICOS:');
  
  const allProps = new Set();
  const allNormalized = new Set();
  const colonias = new Set();
  const clases = new Set();
  const cps = new Set();
  
  features.forEach(feature => {
    const props = feature.properties || {};
    const norm = feature.properties?.__N || {};
    
    Object.keys(props).forEach(key => allProps.add(key));
    Object.keys(norm).forEach(key => allNormalized.add(key));
    
    if (norm.Colonia) colonias.add(norm.Colonia);
    if (norm.Clase) clases.add(norm.Clase);
    if (norm.CP) cps.add(norm.CP);
  });
  
  console.log('Campos raw disponibles:', Array.from(allProps).sort());
  console.log('Campos normalizados:', Array.from(allNormalized).sort());
  console.log(`Colonias únicas: ${colonias.size}`);
  console.log(`Clases únicas: ${clases.size}`);
  console.log(`Códigos Postales únicos: ${cps.size}`);
  
  // Top 10 colonias
  const coloniaCount = new Map();
  const claseCount = new Map();
  
  features.forEach(feature => {
    const norm = feature.properties?.__N || {};
    if (norm.Colonia) {
      coloniaCount.set(norm.Colonia, (coloniaCount.get(norm.Colonia) || 0) + 1);
    }
    if (norm.Clase) {
      claseCount.set(norm.Clase, (claseCount.get(norm.Clase) || 0) + 1);
    }
  });
  
  console.log('\n🏘️ TOP 10 COLONIAS:');
  Array.from(coloniaCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([colonia, count], index) => {
      console.log(`${index + 1}. ${colonia}: ${count.toLocaleString()} negocios`);
    });
    
  console.log('\n📊 TOP 10 TIPOS DE NEGOCIO:');
  Array.from(claseCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([clase, count], index) => {
      console.log(`${index + 1}. ${clase}: ${count.toLocaleString()} negocios`);
    });

  // Retornar resumen para uso programático
  return {
    totalRecords: features.length,
    availableFields: {
      raw: Array.from(allProps).sort(),
      normalized: Array.from(allNormalized).sort()
    },
    uniqueCounts: {
      colonias: colonias.size,
      clases: clases.size,
      codigosPostales: cps.size
    },
    topColonias: Array.from(coloniaCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
    topClases: Array.from(claseCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
  };
}

// Hacer función disponible globalmente
window.exploreData = exploreDataStructure;
