#!/bin/bash

# Script de inicio rápido para Docker local

echo "🚀 Iniciando Stoxy en Docker..."
echo ""

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    echo "Descarga desde: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado"
    exit 1
fi

echo "✅ Docker encontrado"
echo ""

# Detener contenedores anteriores si existen
echo "🧹 Limpiando contenedores anteriores..."
docker-compose down 2>/dev/null

# Construir y levantar
echo "🐳 Construyendo y levantando contenedores..."
docker-compose up --build -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Verificar estado
echo ""
echo "📊 Estado de los servicios:"
docker-compose ps

echo ""
echo "✅ ¡Stoxy está corriendo!"
echo ""
echo "🌐 Accede a la aplicación:"
echo "   Frontend:  http://localhost:8080"
echo "   Backend:   http://localhost:3000/health"
echo "   Database:  localhost:5432"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs:        docker-compose logs -f"
echo "   Detener:         docker-compose down"
echo "   Reiniciar:       docker-compose restart"
echo ""
