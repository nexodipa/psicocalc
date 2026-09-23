@echo off
setlocal enabledelayedexpansion
title Psicocalc Diagnostic Launcher (WISC-V y WAIS-IV)

echo ========================================================
echo        PSICOCALC - LANZADOR DIAGNOSTICO LOCAL
echo ========================================================
echo.

cd /d "%~dp0"

echo [DIAGNOSTICO] Directorio de ejecucion: %~dp0

:: 1. Verify Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no se encuentra en el PATH del sistema.
    echo Descargue Node.js LTS en: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
for /f "tokens=*" %%v in ('npm -v') do set NPM_VERSION=%%v
echo [DIAGNOSTICO] Node.js Version: %NODE_VERSION%
echo [DIAGNOSTICO] NPM Version:     %NPM_VERSION%

:: 2. Check and install dependencies if missing
if not exist "node_modules\" (
    echo.
    echo [INFO] Carpeta node_modules ausente. Instalando dependencias...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Fallo al instalar las dependencias.
        pause
        exit /b 1
    )
) else (
    echo [DIAGNOSTICO] Dependencias instaladas en node_modules: OK.
)

:: 3. Launch local server and open default browser
echo.
echo [INFO] Iniciando servidor Vite en http://localhost:5173...
echo La aplicacion abrira automaticamente una pestana en su navegador predeterminado.
echo.

call npm run dev -- --open
