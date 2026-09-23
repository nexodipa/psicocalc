@echo off
setlocal enabledelayedexpansion
title Psicocalc - Calculadora Psicométrica (WISC-V y WAIS-IV)

echo ========================================================
echo        PSICOCALC - PLATAFORMA CLINICA LOCAL
echo ========================================================
echo.

cd /d "%~dp0"

:: 1. Verify Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no se encuentra instalado en este equipo.
    echo Por favor, descargue e instale Node.js (version LTS recomendada):
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 2. Check and install dependencies if missing
if not exist "node_modules\" (
    echo [INFO] Primera ejecucion detectada. Instalando librerias necesarias...
    call npm.cmd install
    if %errorlevel% neq 0 (
        echo [ERROR] No se pudieron instalar las dependencias con npm.
        pause
        exit /b 1
    )
)

:: 3. Launch local server and open default browser
echo [INFO] Iniciando servidor Vite y abriendo aplicacion en el navegador...
echo Para cerrar la aplicacion, cierre esta ventana o presione Ctrl+C.
echo.

call npm.cmd run dev -- --open
pause
