// scripts/dump_denue_leon.js — León DENUE dump robusto
// - Timeout por request (AbortController)
// - Reintentos con backoff
// - Tolerante a respuestas no-JSON (cuenta como 0 filas y sigue)
// - Segunda vuelta para tiles no-JSON
// - Circuit breaker: si hay racha de fallos, pausa y baja el ritmo; además baraja el orden
// Uso:
//   node scripts/dump_denue_leon.js --mode=full         # cobertura amplia
//   node scripts/dump_denue_leon.js --mode=fast         # 3x3 rápido
//   node scripts/dump_denue_leon.js --mode=full --limit=10000
// .env:
//   INEGI_TOKEN=...           (requerido, sin comillas)
//   FETCH_TIMEOUT_MS=15000    (default 15000 ms)
//   THROTTLE_MS=350           (pausa base entre requests)

import 'dotenv/config';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----- Config base (León) -----
const CENTER = { lat: 21.12908, lon: -101.67374 };
const MAX_RADIUS_M = 5000; // Máximo permitido por INEGI DENUE API

// ----- CLI args -----
const args = Object.fromEntries(process.argv.slice(2).map(s => {
  const [k, v] = s.replace(/^--/, '').split('='); return [k, v ?? true];
}));
const MODE       = String(args.mode ?? 'fast');       // 'fast' | 'full'
const LIMIT      = args.limit ? Number(args.limit) : null;
const SECTOR     = args.sector ? String(args.sector) : '0';
const CITY_KM    = args.cityKm ? Number(args.cityKm) : (MODE === 'full' ? 18 : 8);
const STEP_KM    = args.stepKm ? Number(args.stepKm) : 5; // Reducimos paso de 7km a 5km
const BASE_THROTTLE_MS = Number(process.env.THROTTLE_MS ?? 500);  // Aumentar pausa entre llamadas
const TIMEOUT_MS = Number(process.env.FETCH_TIMEOUT_MS ?? 30000);  // Aumentar timeout a 30s
const FIRST_TRIES= 4;   // intentos en primera pasada
const RETRY_TRIES= 6;   // intentos en segunda pasada

// --- Circuit breaker / ritmo dinámico ---
const BREAKER_RACHA = 3;         // cuántos fallos seguidos detonan la pausa
const BREAKER_SLEEP_MS = 90_000; // pausa cuando se detona (90s)
let throttle = BASE_THROTTLE_MS; // ritmo actual (se podrá subir si hay problemas)

function shuffle(arr) {          // barajar centros (evita golpear secuencia "mala")
  return arr.map(v => [Math.random(), v]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
}

// ----- Utilidades geo -----
const KM_PER_DEG_LAT = 111;
const KM_PER_DEG_LON = 111 * Math.cos(CENTER.lat * Math.PI/180);
const kmToDegLat = km => km / KM_PER_DEG_LAT;
const kmToDegLon = km => km / KM_PER_DEG_LON;

// ----- Helpers de parsing -----
function getLonLat(row){
  if (Array.isArray(row)) return { lon: Number(row[17]), lat: Number(row[18]) };
  const lon = Number(row.longitud ?? row.Longitud ?? row.lon ?? row.lng ?? row.Lon ?? row.LNG);
  const lat = Number(row.latitud ?? row.Latitud ?? row.lat ?? row.Lat ?? row.latitude ?? row.Latitude);
  return { lon, lat };
}
function getName(row){ return Array.isArray(row) ? (row[2] ?? '') : (row.Nombre ?? row.nombre ?? ''); }
function matchSectorByText(row, wanted){
  if (!wanted || wanted === '0') return true;
  let a=''; if (Array.isArray(row)) a=String(row[4]??'').toLowerCase();
  else a=String(row.Clase_actividad ?? row.Sector_actividad ?? row.Subsector_actividad ?? '').toLowerCase();
  const map={'46':'comercio al por menor','43':'comercio al por mayor','72':'servicios de alojamiento temporal y de preparación de alimentos y bebidas','62':'servicios de salud y de asistencia social','61':'servicios educativos','31':'industrias manufactureras'};
  const n = map[wanted]; if(!n) return true;
  return a.startsWith(n)||a.includes(n)||(wanted==='31'&&(a.includes('manufactur')||a.startsWith('fabricación')));
}
function rowsToGeoJSON(rows){
  const feats = rows.map(r=>{
    const {lon,lat}=getLonLat(r); if(!isFinite(lon)||!isFinite(lat)) return null;
    const nombre=getName(r);
    const clase = Array.isArray(r) ? (r[4] ?? '') : (r.Clase_actividad ?? r.clase ?? r.Subsector_actividad ?? '');
    return { type:'Feature', geometry:{ type:'Point', coordinates:[lon,lat] }, properties:{ nombre, clase } };
  }).filter(Boolean);
  return { type:'FeatureCollection', features:feats };
}

// ----- Token / URL -----
const TOKEN = process.env.INEGI_TOKEN;
if (!TOKEN) { console.error('❌ Falta INEGI_TOKEN en .env (sin comillas)'); process.exit(1); }
const denueURL=(lat,lon,distM)=>`https://www.inegi.org.mx/app/api/denue/v1/consulta/Buscar/todos/${lat},${lon}/${distM}/${TOKEN}`;

// ----- fetch con timeout -----
async function fetchWithTimeout(url, ms){
  const ctrl = new AbortController();
  console.log(`🌐 Iniciando fetch con timeout de ${ms}ms...`);
  const id = setTimeout(() => {
    console.log(`⏰ TIMEOUT: Abortando después de ${ms}ms`);
    ctrl.abort();
  }, ms);
  try {
    const resp = await fetch(encodeURI(url), { signal: ctrl.signal, headers:{ 'User-Agent':'leon-dump/1.2' }});
    console.log(`✅ Respuesta HTTP: ${resp.status} ${resp.statusText}`);
    const text = await resp.text();
    console.log(`📄 Texto recibido: ${text.length} caracteres`);
    return { ok: true, status: resp.status, text };
  } catch (e) {
    if (e.name === 'AbortError') {
      console.log(`❌ TIMEOUT: La llamada tardó más de ${ms}ms`);
    } else {
      console.log(`❌ ERROR DE RED: ${e.message}`);
    }
    return { ok: false, error: String(e) };
  } finally {
    clearTimeout(id);
  }
}

// ----- Llamada robusta: timeout + reintentos + tolerancia no-JSON -----
async function callDenue(lat, lon, distM, tries=FIRST_TRIES){
  console.log(`🎯 Llamando DENUE: lat=${lat}, lon=${lon}, radio=${distM}m, intentos=${tries}`);
  const url = denueURL(lat, lon, distM);
  console.log(`🔗 URL generada: ${url}`);
  let lastErr = null;
  for (let a=1; a<=tries; a++){
    const t0 = Date.now();
    const r  = await fetchWithTimeout(url, TIMEOUT_MS);
    const ms = Date.now() - t0;

    if (!r.ok) {
      lastErr = r.error;
      if (a < tries) { await wait(400 * a); continue; }
      return { ok:false, rows:[], ms, status:0, url, err:lastErr, note:'timeout_or_network' };
    }

    // ¿JSON?
    let parsed=null;
    try { parsed = JSON.parse(r.text); } catch {}
    if (Array.isArray(parsed)) {
      return { ok:true, rows: parsed, ms, status:200, url };
    }

    // Texto: ¿benigno? (sin datos / HTML / servicio temporalmente no disponible)
    const t = (r.text || '').trim();
    const looksHTML = /^</.test(t) || /<!doctype html/i.test(t);
    const benign = !t || /no hay resultados/i.test(t) || looksHTML ||
                   /servicio no disponible|tempor/i.test(t) || /error/i.test(t);
    if (benign) {
      return { ok:true, rows:[], ms, status:200, url, note:'non_json_empty', preview:t.slice(0,120) };
    }

    // Texto raro: reintenta
    if (a < tries) { await wait(400 * a); continue; }
    return { ok:true, rows:[], ms, status:200, url, note:'non_json_last_try_empty', preview:t.slice(0,120) };
  }
  return { ok:false, rows:[], ms:0, status:0, url, err:String(lastErr) };
}

function wait(ms){ return new Promise(r => setTimeout(r, ms)); }

// ----- Mosaico -----
function buildCenters(){
  if (MODE === 'fast') {
    const dLat=kmToDegLat(STEP_KM), dLon=kmToDegLon(STEP_KM);
    return [-1,0,1].flatMap(i=>[-1,0,1].map(j=>({ lat:CENTER.lat+i*dLat, lon:CENTER.lon+j*dLon })));
  }
  const half=Math.ceil(CITY_KM/STEP_KM);
  const dLat=kmToDegLat(STEP_KM), dLon=kmToDegLon(STEP_KM);
  const idx=[]; for(let i=-half;i<=half;i++) for(let j=-half;j<=half;j++) idx.push({i,j});
  return idx.map(({i,j})=>({ lat:CENTER.lat+i*dLat, lon:CENTER.lon+j*dLon }));
}

// ----- Main -----
(async()=>{
  console.log(`▶️  Dump DENUE León — mode=${MODE} cityKm=${CITY_KM} stepKm=${STEP_KM} sector=${SECTOR} limit=${LIMIT ?? '∞'}`);
  console.log(`⏱️  TIMEOUT: ${TIMEOUT_MS} ms | Pausa base: ${BASE_THROTTLE_MS} ms`);

  // GARANTIZAR COBERTURA DEL CENTRO
  console.log(`🎯 Llamada especial al centro de León (${CENTER.lat}, ${CENTER.lon}, radio: ${MAX_RADIUS_M}m)...`);
  const centerCall = await callDenue(CENTER.lat, CENTER.lon, MAX_RADIUS_M, FIRST_TRIES);
  const all = [];
  if (centerCall.ok && centerCall.rows.length > 0) {
    all.push(...centerCall.rows);
    console.log(`✅ Centro: +${centerCall.rows.length} filas iniciales en ${centerCall.ms}ms`);
  } else if (centerCall.ok && centerCall.rows.length === 0) {
    console.log(`⚠️  Centro: 0 filas (${centerCall.note || 'vacío'}) en ${centerCall.ms}ms`);
  } else {
    console.log(`❌ Centro: ERROR - ${centerCall.err || 'desconocido'}`);
    console.log(`   ¿Continuar sin datos del centro? Presiona Ctrl+C para cancelar...`);
    await wait(3000); // Pausa para dar tiempo a cancelar
  }

  const centers = shuffle(buildCenters());
  const total   = centers.length;
  const retryQueue = []; // tiles con no-JSON para segunda vuelta

  let okCalls=0, emptyCalls=0, nonJsonCalls=0, errCalls=0;
  let consecutiveBad = 0;   // racha de "no-JSON" o errores
  let tStart = Date.now();

  // ---- Primera pasada
  for (let k=0; k<centers.length; k++){
    const { lat, lon } = centers[k];
    const out = await callDenue(lat, lon, MAX_RADIUS_M, FIRST_TRIES);

    if (out.ok) {
      if (out.rows.length === 0) {
        emptyCalls++;
        if (out.note && out.note.startsWith('non_json')) {
          nonJsonCalls++;
          consecutiveBad++;
          retryQueue.push({ lat, lon });
          console.log(`  [${k+1}/${total}] ${lat.toFixed(5)},${lon.toFixed(5)}  (no JSON → vacío)  ${out.ms}ms`);
        } else {
          consecutiveBad = 0;
          console.log(`  [${k+1}/${total}] ${lat.toFixed(5)},${lon.toFixed(5)}  +0 filas  ${out.ms}ms`);
        }
      } else {
        consecutiveBad = 0;
        all.push(...out.rows);
        console.log(`  [${k+1}/${total}] ${lat.toFixed(5)},${lon.toFixed(5)}  +${out.rows.length} filas  ${out.ms}ms  (acum ${all.length})`);
      }
      okCalls++;
    } else {
      consecutiveBad++;
      errCalls++;
      console.log(`  [${k+1}/${total}] ${lat.toFixed(5)},${lon.toFixed(5)}  ERROR: ${out.err}`);
    }

    // CORTA-CIRCUITO
    if (consecutiveBad >= BREAKER_RACHA) {
      console.log(`⛔ Muchas fallas seguidas (${consecutiveBad}). Pausa de ${Math.round(BREAKER_SLEEP_MS/1000)}s y bajamos ritmo…`);
      await wait(BREAKER_SLEEP_MS);
      throttle = Math.min(throttle * 2, 2000);   // sube espera entre llamadas (máx 2s)
      consecutiveBad = 0;
    }

    await wait(throttle);
  }

  // ---- Segunda vuelta (solo no-JSON)
  if (retryQueue.length) {
    console.log(`\n🔁 Segunda vuelta sobre ${retryQueue.length} celdas no-JSON...`);
    for (let i = 0; i < retryQueue.length; i++) {
      const { lat, lon } = retryQueue[i];
      const out2 = await callDenue(lat, lon, MAX_RADIUS_M, RETRY_TRIES);
      if (out2.ok && out2.rows.length > 0) {
        all.push(...out2.rows);
        console.log(`  [retry ${i+1}/${retryQueue.length}] ${lat.toFixed(5)},${lon.toFixed(5)}  +${out2.rows.length} filas  ${out2.ms}ms  (acum ${all.length})`);
      } else if (out2.ok && out2.rows.length === 0) {
        console.log(`  [retry ${i+1}/${retryQueue.length}] ${lat.toFixed(5)},${lon.toFixed(5)}  0 filas (sigue vacío)`);
      } else {
        console.log(`  [retry ${i+1}/${retryQueue.length}] ${lat.toFixed(5)},${lon.toFixed(5)}  ERROR: ${out2.err || 'sin detalles'}`);
      }
      await wait(throttle * 2);
    }
  }

  // ---- Dedup por CLEE o lon|lat|nombre (mejorado)
  const seen = new Map();
  for (const r of all) {
    const { lon, lat } = getLonLat(r);
    if (!isFinite(lon) || !isFinite(lat)) continue; // Skip invalid coords
    
    const clee = Array.isArray(r) ? r[0] : (r.CLEE ?? null);
    const nombre = getName(r);
    
    // Prioridad: CLEE > coordenadas precisas > nombre+coords aproximadas
    let key;
    if (clee && clee.length > 10) {
      key = `clee:${clee}`;
    } else {
      // Redondear coordenadas para capturar duplicados cercanos
      const latRound = Math.round(lat * 100000) / 100000; // ~1.1m precisión
      const lonRound = Math.round(lon * 100000) / 100000;
      key = `coord:${lonRound}|${latRound}|${nombre.slice(0, 30).toLowerCase().trim()}`;
    }
    
    if (!seen.has(key)) {
      seen.set(key, r);
    } else {
      // Si ya existe, mantener el que tenga más información
      const existing = seen.get(key);
      const existingFields = Object.values(existing).filter(v => v && v !== '').length;
      const newFields = Object.values(r).filter(v => v && v !== '').length;
      if (newFields > existingFields) {
        seen.set(key, r);
      }
    }
  }
  let merged = Array.from(seen.values());
  if (SECTOR !== '0') merged = merged.filter(r => matchSectorByText(r, SECTOR));
  if (LIMIT) merged = merged.slice(0, LIMIT);

  // ---- Guardar
  const outDir = path.join(__dirname, '..', 'data');
  await fs.mkdir(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g,'-');
  const base  = `denue_leon_${MODE}${SECTOR!=='0'?`_sc${SECTOR}`:''}${LIMIT?`_lim${LIMIT}`:''}_${stamp}`;
  const rawPath = path.join(outDir, `${base}.json`);
  const gjPath  = path.join(outDir, `${base}.geojson`);

  await fs.writeFile(rawPath, JSON.stringify(merged, null, 2), 'utf8');
  await fs.writeFile(gjPath, JSON.stringify(rowsToGeoJSON(merged)), 'utf8');

  const secs = Math.round((Date.now()-tStart)/1000);
  console.log('—'.repeat(60));
  console.log(`✅ Listo. OK:${okCalls} vacíos:${emptyCalls} noJSON:${nonJsonCalls} errores:${errCalls}`);
  console.log(`   Registros (dedupe${SECTOR!=='0'?' + sector':''}${LIMIT?` + limit`:''}): ${merged.length}`);
  console.log(`   RAW:     ${rawPath}`);
  console.log(`   GeoJSON: ${gjPath}`);
  console.log(`   Tiempo total: ${secs}s`);
})();
