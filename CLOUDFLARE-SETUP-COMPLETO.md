# 🔧 GUÍA COMPLETA: CLOUDFLARE TUNNEL DESDE CERO

## 📋 PASO 1: INSTALAR NODE.JS EN TU ACER

### Descargar Node.js:
1. Ve a: https://nodejs.org/
2. Descarga la versión "LTS" (la verde que dice "Recommended")
3. Instala normal (Next, Next, Install)
4. Reinicia la Acer

### Verificar instalación:
1. Presiona Win+R → escribe "cmd" → Enter
2. Escribe: `node --version`
3. Debe mostrar algo como: v20.x.x

## 📋 PASO 2: INSTALAR GIT (para descargar tu proyecto)

### Descargar Git:
1. Ve a: https://git-scm.com/download/win
2. Descarga "64-bit Git for Windows Setup"
3. Instala con todas las opciones por defecto

## 📋 PASO 3: DESCARGAR TU PROYECTO

### Clonar desde GitHub:
1. Presiona Win+R → escribe "cmd" → Enter
2. Navega a donde quieres el proyecto:
   ```
   cd C:\
   mkdir Proyectos
   cd Proyectos
   ```
3. Clona tu repositorio:
   ```
   git clone https://github.com/BlackEddit/LeonGto_Negoscios.git
   cd LeonGto_Negoscios
   ```

## 📋 PASO 4: INSTALAR DEPENDENCIAS DEL PROYECTO

```cmd
npm install
```

## 📋 PASO 5: PROBAR QUE FUNCIONA LOCALMENTE

```cmd
node server.js
```

Luego ve a: http://localhost:3000

## 📋 PASO 6: INSTALAR CLOUDFLARE TUNNEL

### Descargar cloudflared:
1. Ve a: https://github.com/cloudflare/cloudflared/releases
2. Busca "cloudflared-windows-amd64.exe"
3. Descárgalo a: C:\Proyectos\LeonGto_Negoscios\

### O más fácil, desde CMD en tu proyecto:
```cmd
curl -L --output cloudflared.exe https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe
```

## 📋 PASO 7: CREAR TÚNEL TEMPORAL (SIN CUENTA)

### Túnel rápido (sin registrarse):
```cmd
# Asegúrate que tu servidor esté corriendo en otra ventana
# node server.js

# En otra ventana CMD, en la carpeta del proyecto:
cloudflared.exe tunnel --url http://localhost:3000
```

**¡LISTO!** Te dará una URL como:
`https://abc123.trycloudflare.com`

## 📋 PASO 8: TÚNEL PERMANENTE (CON CUENTA GRATIS)

### Si quieres URL fija:
1. Crea cuenta gratis en: https://dash.cloudflare.com/
2. ```cmd
   cloudflared.exe tunnel login
   ```
3. ```cmd
   cloudflared.exe tunnel create mapa-leon
   ```
4. ```cmd
   cloudflared.exe tunnel route dns mapa-leon tu-dominio.com
   ```

## 🎯 RESULTADO FINAL

Tu mapa estará disponible en internet con:
- ✅ URL pública funcionando
- ✅ Tu IP completamente oculta
- ✅ HTTPS automático
- ✅ Protección DDoS de Cloudflare
- ✅ $0 pesos gastados

## 🚨 COMANDOS RESUMIDOS

```cmd
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor (ventana 1)
node server.js

# 3. Iniciar túnel (ventana 2)
cloudflared.exe tunnel --url http://localhost:3000
```

## 📞 TROUBLESHOOTING

### Si no funciona Node.js:
- Reinicia la Acer después de instalar
- Abre CMD como administrador

### Si no funciona Git:
- Instala con todas las opciones por defecto
- Reinicia CMD después de instalar

### Si cloudflared no funciona:
- Verifica que lo descargaste en la carpeta correcta
- Ejecuta CMD como administrador

¡Listo para empezar! 🚀