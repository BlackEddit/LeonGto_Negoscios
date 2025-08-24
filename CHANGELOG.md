# Changelog

Todas las modificaciones notables del proyecto serán documentadas en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-es/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planeado
- Dashboard de analytics con gráficos
- API REST para análisis programático  
- Exportación a PDF con reportes
- Análisis temporal/histórico
- Machine Learning para predicciones
- PWA con funcionalidad offline

## [1.0.0] - 2025-01-24

### Agregado
- Sistema completo de visualización geoespacial
- Soporte para múltiples modos de visualización (puntos, clusters, heatmap)
- Sistema de dibujo de polígonos para análisis regional
- Modal informativo con breakdown por sectores empresariales
- Filtrado avanzado por nombre y clase de actividad
- Exportación de datos en GeoJSON y CSV
- Soporte para PMTiles (vector tiles) de alto rendimiento
- Sistema de guardado de puntos de interés con alias
- Control de versiones con Git
- Extracción completa de 97,400+ registros DENUE León

### Características Técnicas
- MapLibre GL JS v5.6.2 para renderizado de mapas
- PMTiles v3.0.6 para vector tiles optimizados
- Turf.js v7.1.0 para análisis geoespacial
- Arquitectura modular JavaScript (4 módulos)
- API DENUE del INEGI con manejo robusto de timeouts
- Grid de cobertura optimizado (5km x 5km)
- Deduplicación automática de datos
- Interface responsiva y moderna

### Datos
- 97,400 registros únicos de empresas en León, GTO
- Cobertura completa del área metropolitana
- Información detallada: nombre, dirección, teléfono, clase económica
- Coordenadas geográficas precisas
- Datos actualizados de la API oficial DENUE

### Interface de Usuario
- Panel lateral con filtros y controles
- Panel de información detallada de puntos
- Modal de análisis regional con estadísticas
- Atajos de teclado para navegación rápida
- Sistema de guardado y exportación de favoritos
- Búsqueda en tiempo real
- Visualización de estadísticas de clases empresariales
