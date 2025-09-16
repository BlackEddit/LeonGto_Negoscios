// server.js — sirve /public y /data (incluye .pmtiles bien configurado)
import express from "express";
import compression, { filter as compressionFilter } from "compression";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Configuración mejorada de CORS y seguridad
app.use((req, res, next) => {
  // Permitir todas las origenes en desarrollo
  res.header('Access-Control-Allow-Origin', '*');
  
  // Cabeceras necesarias para el mapa
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range');
  
  // Configuración de seguridad
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'require-corp');
  res.header('Cross-Origin-Opener-Policy', 'same-origin');
  
  // Manejo especial para solicitudes OPTIONS (necesario para CORS)
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// ⚠️ NO comprimir .pmtiles (rompe lecturas por rango)
app.use(
  compression({
    filter: (req, res) => {
      if (req.originalUrl?.toLowerCase().endsWith(".pmtiles")) return false;
      return compressionFilter(req, res);
    },
  })
);

app.use(express.json());

const PUB = path.join(__dirname, "public");
const DATA = path.join(__dirname, "data");

// Servir archivos estáticos de /public con cache y tipos MIME correctos
app.use(express.static(PUB, {
  maxAge: '1h',
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    // Asegurar que las fuentes se sirvan correctamente
    if (path.endsWith('.woff2')) {
      res.setHeader('Content-Type', 'font/woff2');
    }
  }
}));

// /data estático con cabeceras para PMTiles
app.use(
  "/data",
  express.static(DATA, {
    fallthrough: true,
    etag: true,
    maxAge: "1h",
    setHeaders: (res, filePath) => {
      const f = filePath.toLowerCase();
      if (f.endsWith(".pmtiles")) {
        res.setHeader("Content-Type", "application/octet-stream");
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Cache-Control", "public, max-age=3600, no-transform");
      }
    },
  })
);

// App estática
app.use("/", express.static(PUB, { fallthrough: true, etag: true, maxAge: 0 }));

// Lista de archivos dentro de /data (incluye .pmtiles)
app.get("/api/data/list", async (_req, res) => {
  try {
    await fs.mkdir(DATA, { recursive: true });
    const all = await fs.readdir(DATA, { withFileTypes: true });
    const items = [];
    for (const d of all) {
      if (!d.isFile()) continue;
      const ext = path.extname(d.name).toLowerCase();
      if (![".geojson", ".json", ".pmtiles"].includes(ext)) continue;
      const p = path.join(DATA, d.name);
      const st = await fs.stat(p);
      items.push({ name: d.name, size: st.size, mtimeMs: st.mtimeMs });
    }
    items.sort((a, b) => b.mtimeMs - a.mtimeMs);
    res.json({ ok: true, count: items.length, items });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Información específica de un archivo
app.get("/api/data/info/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(DATA, filename);
    
    // Verificar que el archivo exista y sea permitido
    const ext = path.extname(filename).toLowerCase();
    if (![".geojson", ".json", ".pmtiles"].includes(ext)) {
      return res.status(400).json({ ok: false, error: "Tipo de archivo no permitido" });
    }

    const stats = await fs.stat(filePath);
    
    res.json({
      ok: true,
      name: filename,
      size: stats.size,
      sizeMB: Math.round(stats.size / (1024 * 1024) * 100) / 100,
      lastModified: stats.mtimeMs,
      isLarge: stats.size > 50 * 1024 * 1024, // 50MB
      recommendChunking: stats.size > 30 * 1024 * 1024 // 30MB
    });
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ ok: false, error: "Archivo no encontrado" });
    } else {
      res.status(500).json({ ok: false, error: String(error) });
    }
  }
});

// SPA fallback
app.get("*", (_req, res) => res.sendFile(path.join(PUB, "index.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listo en http://localhost:${PORT}`));
