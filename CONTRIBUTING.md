# Contribuir al Proyecto León GTO - Análisis Empresarial

¡Gracias por tu interés en contribuir! Este documento te guiará sobre cómo participar en el desarrollo del proyecto.

## 🚀 Formas de Contribuir

### 🐛 Reportar Bugs
- Usa el [issue tracker](https://github.com/tu-usuario/mapa-leon/issues)
- Describe el problema claramente
- Incluye pasos para reproducir el bug
- Menciona tu sistema operativo y navegador

### 💡 Sugerir Funcionalidades
- Abre un issue con la etiqueta "enhancement"
- Describe el caso de uso y beneficios
- Proporciona mockups o diagramas si es posible

### 📝 Mejorar Documentación
- Corrige errores en README o documentación
- Agrega ejemplos de uso
- Traduce contenido
- Mejora comentarios en el código

### 🔧 Contribuir Código
- Fork el repositorio
- Crea una rama feature
- Sigue las convenciones de código
- Agrega tests si aplica
- Crea un Pull Request

## 🛠️ Setup para Desarrollo

### 1. Fork y Clonar
```bash
git clone https://github.com/tu-usuario/mapa-leon.git
cd mapa-leon
```

### 2. Crear Rama Feature
```bash
git checkout -b feature/nombre-descriptivo
# o
git checkout -b fix/nombre-del-bug
```

### 3. Instalar Dependencias
```bash
npm install
```

### 4. Ejecutar en Desarrollo
```bash
npm start
# o
python -m http.server 3000
```

## 📋 Convenciones de Código

### JavaScript
- Usar `const` y `let`, evitar `var`
- Funciones arrow cuando sea apropiado
- Comentarios descriptivos en funciones complejas
- Nombres de variables en español para contexto local
- Nombres de funciones en inglés para funciones técnicas

### HTML/CSS
- Indentación de 2 espacios
- Clases CSS en inglés y descriptivas
- IDs en camelCase
- Responsive design first

### Git Commits
```
tipo(alcance): descripción corta

Descripción más detallada si es necesaria

- Cambio específico 1
- Cambio específico 2
```

Tipos:
- `feat`: nueva funcionalidad
- `fix`: corrección de bug
- `docs`: cambios en documentación
- `style`: formateo, espacios, etc.
- `refactor`: refactoring de código
- `test`: agregar o modificar tests
- `chore`: mantención, builds, etc.

### Ejemplos de Commits
```bash
feat(visualization): agregar modo de puntos individuales

- Crear nueva fuente poiPoints sin clustering
- Implementar toggle entre 3 modos de visualización
- Agregar atajos de teclado para cambiar modos
- Mejorar performance en datasets grandes

fix(api): corregir timeout en extracción DENUE

- Aumentar timeout de 45s a 120s
- Mejorar manejo de errores de red
- Agregar retry automático en fallos
```

## 🧪 Testing

### Tests Manuales
1. Cargar diferentes archivos GeoJSON
2. Probar filtros con datasets grandes
3. Verificar funcionalidad de dibujo de polígonos
4. Comprobar exportación de datos
5. Testear en diferentes navegadores

### Tests Futuros
- Unit tests para funciones de procesamiento de datos
- Integration tests para API calls
- E2E tests para flujos de usuario críticos

## 📊 Áreas de Contribución Priorizadas

### 🔥 Alto Impacto
1. **Dashboard de Analytics**: Gráficos con Chart.js o D3.js
2. **API REST**: Endpoints para análisis programático
3. **Machine Learning**: Clustering y predicciones
4. **Performance**: Optimizaciones para datasets masivos

### 🚀 Medio Impacto  
1. **PWA**: Service workers y cache offline
2. **Exportación avanzada**: PDF reports con gráficos
3. **Análisis temporal**: Comparaciones históricas
4. **Testing**: Suite de tests automatizados

### 💡 Nuevas Ideas
1. **Integración APIs**: Google Places, Foursquare
2. **Realidad Aumentada**: AR con geolocalización
3. **Bot de Telegram**: Consultas por ubicación
4. **Dashboard móvil**: App React Native

## 🎯 Roadmap Técnico

### Q1 2025
- [ ] Analytics dashboard con métricas clave
- [ ] API REST básica
- [ ] Tests unitarios core
- [ ] Docker containerization

### Q2 2025  
- [ ] Machine learning clustering
- [ ] PWA con offline support
- [ ] CI/CD pipeline
- [ ] Performance optimizations

### Q3 2025
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Historical data analysis
- [ ] Multi-city support

## 🤝 Proceso de Review

### Pull Requests
1. **Título descriptivo** siguiendo convención de commits
2. **Descripción detallada** del cambio y motivación
3. **Screenshots** si hay cambios visuales
4. **Testing realizado** y casos cubiertos
5. **Breaking changes** claramente marcados

### Criterios de Aceptación
- ✅ Código funcional y sin bugs obvios
- ✅ Sigue convenciones del proyecto
- ✅ Documentación actualizada si aplica
- ✅ No rompe funcionalidad existente
- ✅ Performance acceptable

## 📞 Contacto

### Dudas sobre Contribución
- Abre un issue con la etiqueta "question"
- Discute en GitHub Discussions (cuando esté disponible)

### Ideas y Propuestas
- Crea un issue con template de feature request
- Incluye mockups, diagramas o referencias

---

**¡Gracias por ayudar a mejorar el análisis empresarial en León! 🦁**
