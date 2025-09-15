@echo off
title Mapa Leon GTO - Servidor Acer
color 0A
echo.
echo ===============================================
echo    MAPA DE NEGOCIOS LEON GUANAJUATO
echo         SERVIDOR ACER INICIANDO...
echo ===============================================
echo.

REM Ir a la carpeta del proyecto
cd /d C:\LeonGto_Negoscios

REM Verificar que existe el proyecto
if not exist "server.js" (
    echo ERROR: No se encuentra server.js
    echo Verifica que el proyecto este en C:\LeonGto_Negoscios\
    pause
    exit /b 1
)

REM Verificar que Node.js esta instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado
    echo Instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Iniciando servidor Node.js...
echo [INFO] Servidor estara disponible en http://localhost:3000
echo [INFO] Para crear tunel publico, ejecuta cloudflared en otra ventana
echo.

:restart
echo [%date% %time%] Iniciando servidor...
node server.js

echo.
echo [AVISO] El servidor se detuvo. Reiniciando en 5 segundos...
echo [AVISO] Presiona Ctrl+C para salir permanentemente
timeout /t 5 /nobreak >nul
goto restart