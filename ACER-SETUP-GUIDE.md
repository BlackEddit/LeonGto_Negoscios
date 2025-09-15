# 🚀 ACER SETUP - INSTRUCCIONES COMPLETAS

## 📋 ARCHIVO DE INSTALACIÓN PARA LA ACER

### ANTES DE EMPEZAR:
1. ✅ Este archivo debe estar en la Acer junto con la carpeta del proyecto
2. ✅ Tener conexión a internet en la Acer
3. ✅ Tener permisos de administrador

---

## 🔧 PASO 1: INSTALAR SOFTWARE BÁSICO

### 1.1 - Instalar Node.js:
- Ir a: https://nodejs.org/
- Descargar versión "LTS" (la recomendada)
- Instalar con opciones por defecto
- **REINICIAR LA ACER** después de instalar

### 1.2 - Verificar Node.js:
```cmd
# Abrir CMD y verificar:
node --version
npm --version
```

### 1.3 - Instalar Git:
- Ir a: https://git-scm.com/download/win
- Descargar "64-bit Git for Windows Setup"
- Instalar con todas las opciones por defecto

### 1.4 - Instalar TeamViewer (opcional):
- Ir a: https://www.teamviewer.com/
- Descargar versión gratuita
- Configurar para acceso desatendido

---

## 📁 PASO 2: PREPARAR EL PROYECTO

### 2.1 - Ubicar carpeta del proyecto:
- El proyecto debe estar en: `C:\LeonGto_Negoscios\`
- Verificar que contiene: server.js, package.json, public/, data/

### 2.2 - Instalar dependencias:
```cmd
# Abrir CMD como administrador
cd C:\LeonGto_Negoscios
npm install
```

### 2.3 - Probar que funciona:
```cmd
# Iniciar servidor
node server.js

# Abrir navegador: http://localhost:3000
# Debe cargar el mapa de León
```

---

## 🌐 PASO 3: CONFIGURAR CLOUDFLARE TUNNEL

### 3.1 - Descargar cloudflared.exe:
```cmd
# En la carpeta del proyecto:
cd C:\LeonGto_Negoscios
curl -L --output cloudflared.exe https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe
```

### 3.2 - Crear túnel temporal:
```cmd
# Ventana 1: Iniciar servidor
node server.js

# Ventana 2: Crear túnel
cloudflared.exe tunnel --url http://localhost:3000
```

**¡IMPORTANTE!** Cloudflare te dará una URL como:
`https://abc123.trycloudflare.com`

---

## ⚙️ PASO 4: AUTOMATIZAR INICIO

### 4.1 - Crear script de inicio automático:
- Usar el archivo `start-server.bat` incluido
- Copiar a: `C:\Users\[Usuario]\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\`

### 4.2 - Configurar Windows:
- Deshabilitar suspensión automática
- Configurar actualizaciones para horarios específicos

---

## 🎯 RESULTADO FINAL

Una vez completado:
- ✅ Servidor corriendo 24/7 en la Acer
- ✅ URL pública accesible desde internet
- ✅ Tu IP completamente oculta
- ✅ HTTPS automático
- ✅ Costo: $0

---

## 🆘 TROUBLESHOOTING

### Si Node.js no se reconoce:
```cmd
# Verificar PATH del sistema
echo %PATH%
# Debe contener: C:\Program Files\nodejs\
```

### Si npm install falla:
```cmd
# Limpiar caché
npm cache clean --force
# Reinstalar
npm install
```

### Si cloudflared no funciona:
```cmd
# Verificar descarga
dir cloudflared.exe
# Ejecutar como administrador
```

### Si el servidor se cierra solo:
- Verificar que la Acer no se suspende
- Revisar logs de errores
- Usar el script de reinicio automático

---

## 📞 CONTACTO REMOTO

### Para control remoto con TeamViewer:
1. Anotar ID de la Acer: __________
2. Configurar contraseña fija: __________
3. Habilitar inicio automático de TeamViewer

¡Listo para ser servidor! 🚀