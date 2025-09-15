@echo off
title Cloudflare Tunnel - Mapa Leon GTO
color 0B
echo.
echo ===============================================
echo       CLOUDFLARE TUNNEL INICIANDO...
echo    Tu mapa sera accesible desde internet
echo ===============================================
echo.

REM Ir a la carpeta del proyecto
cd /d C:\LeonGto_Negoscios

REM Verificar que existe cloudflared.exe
if not exist "cloudflared.exe" (
    echo ERROR: No se encuentra cloudflared.exe
    echo.
    echo Descargando cloudflared.exe...
    curl -L --output cloudflared.exe https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe
    
    if not exist "cloudflared.exe" (
        echo ERROR: No se pudo descargar cloudflared.exe
        echo Descarga manualmente desde: https://github.com/cloudflare/cloudflared/releases
        pause
        exit /b 1
    )
    echo [OK] cloudflared.exe descargado exitosamente
)

REM Verificar que el servidor local este corriendo
echo [INFO] Verificando servidor local...
netstat -an | findstr ":3000" >nul
if errorlevel 1 (
    echo [AVISO] El servidor local no parece estar corriendo en puerto 3000
    echo [AVISO] Asegurate de ejecutar 'node server.js' en otra ventana
    echo [AVISO] Continuando de todas formas...
    echo.
)

echo [INFO] Creando tunel a http://localhost:3000
echo [INFO] Tu URL publica aparecera abajo...
echo.

:restart
echo [%date% %time%] Iniciando tunel...
cloudflared.exe tunnel --url http://localhost:3000

echo.
echo [AVISO] El tunel se desconecto. Reintentando en 10 segundos...
echo [AVISO] Presiona Ctrl+C para salir
timeout /t 10 /nobreak >nul
goto restart