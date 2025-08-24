# 🗺️ León GTO - Análisis Empresarial DENUE

Un sistema avanzado de análisis geoespacial para visualizar y analizar datos empresariales de León, Guanajuato usando la API del Directorio Estadístico Nacional de Unidades Económicas (DENUE) del INEGI.

## 🚀 Características Principales

- **📊 Visualización Dinámica**: Múltiples modos de visualización (puntos individuales, clusters, heatmap)
- **🎯 Análisis Regional**: Dibuja polígonos para analizar negocios en áreas específicas
- **🔍 Filtrado Avanzado**: Busca por nombre, tipo de negocio, o clase de actividad económica
- **⚡ Alto Rendimiento**: Soporte para PMTiles (vector tiles) para datasets masivos
- **💾 Gestión de Datos**: Exportación en GeoJSON y CSV
- **📱 Responsive**: Interfaz adaptada para diferentes dispositivos

## 📈 Capacidades de Análisis

- **97,400+ registros** de empresas en León, GTO
- **Análisis sectorial** por clase de actividad económica
- **Distribución geográfica** de negocios
- **Insights de concentración** empresarial
- **Análisis de densidad** por región

## 🛠️ Stack Tecnológico

### Frontend
- **MapLibre GL JS** v5.6.2 - Renderizado de mapas
- **PMTiles** v3.0.6 - Vector tiles optimizados
- **Turf.js** v7.1.0 - Análisis geoespacial
- **HTML5/CSS3/JavaScript** - UI moderna y responsiva

### Backend
- **Node.js** - Servidor de desarrollo
- **INEGI DENUE API** - Fuente de datos empresariales

### Datos
- **GeoJSON** - Formato principal de datos
- **PMTiles** - Formato optimizado para grandes datasets
- **CSV** - Exportación tabular

## 📂 Estructura del Proyecto

```
Mapa/
├── public/
│   ├── index.html          # Dashboard principal
│   ├── js/
│   │   ├── config.js       # Configuraciones globales
│   │   ├── utils.js        # Utilidades generales
│   │   ├── data.js         # Procesamiento de datos
│   │   └── drawing.js      # Sistema de dibujo de polígonos
│   └── data/               # Archivos de datos (.geojson, .pmtiles)
├── scripts/
│   └── dump_denue_leon.js  # Script de extracción de datos DENUE
└── package.json            # Dependencias del proyecto
```

## 🚦 Instalación y Uso

### 1. Clonar el repositorio
```bash
git clone [tu-repo-url]
cd Mapa
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Ejecutar servidor de desarrollo
```bash
# Opción 1: Node.js
npm start

# Opción 2: Python
python -m http.server 3000

# Opción 3: VS Code Live Server
# Click derecho en index.html > "Open with Live Server"
```

### 4. Acceder a la aplicación
```
http://localhost:3000
```

## 📊 Extracción de Datos

Para actualizar los datos empresariales:

```bash
cd scripts
node dump_denue_leon.js
```

Esto extraerá datos actualizados de la API DENUE del INEGI con:
- **Cobertura completa** de León metropolitano
- **Grid optimizado** de 5km x 5km
- **97,400+ registros** únicos
- **Deduplicación automática**
- **Manejo robusto de timeouts**

## 🎯 Casos de Uso

### Para Análisis Empresarial
- Identificar zonas de alta concentración comercial
- Analizar competencia por sector
- Estudiar distribución geográfica de negocios
- Detectar oportunidades de mercado

### Para Desarrollo Urbano
- Planificación de zonas comerciales
- Análisis de infraestructura comercial
- Estudios de impacto territorial
- Mapeo de actividad económica

### Para Investigación
- Estudios socioeconómicos
- Análisis de patrones comerciales
- Investigación de mercado geolocalizada
- Datos para machine learning geoespacial

## 🔧 Funcionalidades Avanzadas

### Modos de Visualización
1. **Puntos Individuales**: Vista detallada de cada negocio
2. **Clusters**: Agrupación inteligente para mejor performance
3. **Heatmap**: Análisis de densidad térmica

### Análisis Regional
- **Dibujo libre** de polígonos de análisis
- **Estadísticas automáticas** de la región seleccionada
- **Modal informativo** con breakdown por sector
- **Exportación** de datos filtrados

### Sistema de Filtros
- **Búsqueda textual** por nombre de negocio
- **Filtrado por clase** de actividad económica
- **Combinación** de múltiples filtros
- **Búsqueda en tiempo real**

## 📱 Controles y Atajos

| Tecla | Acción |
|-------|---------|
| `F` | Toggle panel de filtros |
| `H` | Ciclar entre modos de visualización |
| `I` | Ir a panel de información |
| `C` | Centrar mapa en datos |
| `/` | Enfocar búsqueda por nombre |
| `Enter` | Aplicar filtros |

## 🚀 Roadmap

### Próximas Mejoras
- [ ] **Dashboard de Analytics**: Gráficos y métricas avanzadas
- [ ] **API REST**: Endpoints para análisis programático
- [ ] **Exportación avanzada**: PDF reports, Excel con gráficos
- [ ] **Comparación temporal**: Análisis de crecimiento empresarial
- [ ] **Machine Learning**: Predicción de zonas comerciales
- [ ] **Integración con otros APIs**: Google Places, Foursquare

### Optimizaciones Técnicas
- [ ] **PWA**: App web progresiva offline
- [ ] **WebGL**: Renderizado de alto rendimiento
- [ ] **Service Workers**: Cache inteligente
- [ ] **Docker**: Containerización para deployment
- [ ] **CI/CD**: Pipeline automatizado
- [ ] **Testing**: Unit tests y E2E tests

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🙏 Agradecimientos

- **INEGI** - Por proporcionar la API DENUE
- **MapLibre** - Por el excelente motor de mapas open source
- **Protomaps** - Por el formato PMTiles innovador

---

**Desarrollado con ❤️ para análisis empresarial en León, Guanajuato** 🦁
