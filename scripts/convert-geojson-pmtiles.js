/**
 * Script para convertir archivos GeoJSON a PMTiles usando Docker
 * 
 * Este script contiene los comandos necesarios para la conversión en dos pasos:
 * 1. GeoJSON → MBTiles (usando tippecanoe)
 * 2. MBTiles → PMTiles (usando go-pmtiles)
 */
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Obtener el directorio actual usando módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rutas de archivos
const geojsonFile = path.resolve(__dirname, '../data/denue_leon_full_2025-08-23T09-24-59-110Z.geojson');
const mbtiles = path.resolve(__dirname, '../data/denue.mbtiles');
const pmtiles = path.resolve(__dirname, '../data/denue.pmtiles');

try {
    console.log('=== Conversión GeoJSON → PMTiles ===');
    
    // Paso 1: Convertir GeoJSON a MBTiles usando tippecanoe
    console.log('\n1. Convirtiendo GeoJSON a MBTiles usando tippecanoe...');
    execSync(`docker run -v "D:/Proyectos/Mapa/data:/data" klokantech/tippecanoe tippecanoe -o /data/denue.mbtiles -zg --drop-densest-as-needed /data/denue_leon_full_2025-08-23T09-24-59-110Z.geojson`, { 
        stdio: 'inherit'
    });
    
    // Paso 2: Convertir MBTiles a PMTiles usando go-pmtiles
    console.log('\n2. Convirtiendo MBTiles a PMTiles usando go-pmtiles...');
    execSync(`docker run --rm -v "D:/Proyectos/Mapa/data:/data" protomaps/go-pmtiles:latest convert /data/denue.mbtiles /data/denue.pmtiles`, { 
        stdio: 'inherit'
    });
    
    // Verificar resultado
    if (fs.existsSync(pmtiles)) {
        const stats = fs.statSync(pmtiles);
        console.log(`\n✅ Proceso completado con éxito!`);
        console.log(`Archivo PMTiles creado: ${pmtiles}`);
        console.log(`Tamaño: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    } else {
        console.error('\n❌ Error: No se pudo crear el archivo PMTiles.');
    }
} catch (error) {
    console.error('\n❌ Error durante el proceso de conversión:', error.message);
    process.exit(1);
}
