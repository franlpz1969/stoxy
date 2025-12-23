#!/bin/bash

# Script de despliegue para Google Cloud Run (3 capas)
# Asegúrate de tener gcloud CLI instalado y configurado

set -e  # Salir si hay errores

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🚀 Stoxy - Despliegue Cloud Run     ║${NC}"
echo -e "${BLUE}║  Arquitectura de 3 Capas             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# ==================== CONFIGURACIÓN ====================
PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-tu-project-id}"
REGION="europe-west1"

# Nombres de servicios
BACKEND_SERVICE="stoxy-backend"
FRONTEND_SERVICE="stoxy-frontend"

# Nombres de imágenes
BACKEND_IMAGE="gcr.io/${PROJECT_ID}/${BACKEND_SERVICE}"
FRONTEND_IMAGE="gcr.io/${PROJECT_ID}/${FRONTEND_SERVICE}"

# Base de datos
DB_INSTANCE="stoxy-db"
DB_NAME="stoxy"
DB_USER="postgres"
DB_PASSWORD=$(openssl rand -base64 32)  # Generar password seguro

echo -e "${YELLOW}📋 Configuración:${NC}"
echo "   Project ID: ${PROJECT_ID}"
echo "   Región: ${REGION}"
echo "   Backend: ${BACKEND_SERVICE}"
echo "   Frontend: ${FRONTEND_SERVICE}"
echo ""

# ==================== VERIFICACIONES ====================
echo -e "${BLUE}🔍 Verificando requisitos...${NC}"

if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI no está instalado${NC}"
    echo "Instala desde: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Requisitos verificados${NC}"

# ==================== CONFIGURAR PROYECTO ====================
echo -e "${BLUE}📋 Configurando proyecto...${NC}"
gcloud config set project ${PROJECT_ID}

# ==================== HABILITAR APIS ====================
echo -e "${BLUE}🔧 Habilitando APIs necesarias...${NC}"
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    sqladmin.googleapis.com \
    vpcaccess.googleapis.com

echo -e "${GREEN}✅ APIs habilitadas${NC}"

# ==================== CREAR INSTANCIA CLOUD SQL ====================
echo -e "${BLUE}🗄️  Creando instancia Cloud SQL PostgreSQL...${NC}"

# Verificar si ya existe
if gcloud sql instances describe ${DB_INSTANCE} --project=${PROJECT_ID} 2>/dev/null; then
    echo -e "${YELLOW}⚠️  La instancia ${DB_INSTANCE} ya existe${NC}"
else
    gcloud sql instances create ${DB_INSTANCE} \
        --database-version=POSTGRES_15 \
        --tier=db-f1-micro \
        --region=${REGION} \
        --root-password=${DB_PASSWORD} \
        --storage-type=SSD \
        --storage-size=10GB \
        --backup-start-time=03:00
    
    echo -e "${GREEN}✅ Instancia Cloud SQL creada${NC}"
fi

# Crear base de datos
echo -e "${BLUE}📊 Creando base de datos...${NC}"
gcloud sql databases create ${DB_NAME} \
    --instance=${DB_INSTANCE} 2>/dev/null || echo "Base de datos ya existe"

# ==================== CONSTRUIR Y SUBIR BACKEND ====================
echo -e "${BLUE}🐳 Construyendo imagen del backend...${NC}"
cd backend
docker build -t ${BACKEND_IMAGE} .
docker push ${BACKEND_IMAGE}
cd ..
echo -e "${GREEN}✅ Imagen del backend subida${NC}"

# ==================== DESPLEGAR BACKEND ====================
echo -e "${BLUE}🚀 Desplegando backend en Cloud Run...${NC}"

# Obtener connection name de Cloud SQL
CONNECTION_NAME=$(gcloud sql instances describe ${DB_INSTANCE} \
    --format='value(connectionName)')

gcloud run deploy ${BACKEND_SERVICE} \
    --image ${BACKEND_IMAGE} \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --port 3000 \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --min-instances 0 \
    --set-env-vars "NODE_ENV=production,DB_HOST=/cloudsql/${CONNECTION_NAME},DB_NAME=${DB_NAME},DB_USER=${DB_USER},DB_PASSWORD=${DB_PASSWORD}" \
    --add-cloudsql-instances ${CONNECTION_NAME}

BACKEND_URL=$(gcloud run services describe ${BACKEND_SERVICE} \
    --region ${REGION} \
    --format 'value(status.url)')

echo -e "${GREEN}✅ Backend desplegado: ${BACKEND_URL}${NC}"

# ==================== CONSTRUIR Y SUBIR FRONTEND ====================
echo -e "${BLUE}🐳 Construyendo imagen del frontend...${NC}"

# Actualizar configuración del frontend con URL del backend
cat > api-config.js << EOF
// Configuración de API para producción
window.API_BASE_URL = '${BACKEND_URL}';
EOF

docker build -t ${FRONTEND_IMAGE} .
docker push ${FRONTEND_IMAGE}

echo -e "${GREEN}✅ Imagen del frontend subida${NC}"

# ==================== DESPLEGAR FRONTEND ====================
echo -e "${BLUE}🚀 Desplegando frontend en Cloud Run...${NC}"

gcloud run deploy ${FRONTEND_SERVICE} \
    --image ${FRONTEND_IMAGE} \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --port 8080 \
    --memory 256Mi \
    --cpu 1 \
    --max-instances 10 \
    --min-instances 0

FRONTEND_URL=$(gcloud run services describe ${FRONTEND_SERVICE} \
    --region ${REGION} \
    --format 'value(status.url)')

echo -e "${GREEN}✅ Frontend desplegado: ${FRONTEND_URL}${NC}"

# ==================== RESUMEN ====================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Despliegue Completado             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}🌐 URLs de la aplicación:${NC}"
echo "   Frontend: ${FRONTEND_URL}"
echo "   Backend:  ${BACKEND_URL}"
echo ""
echo -e "${BLUE}🗄️  Base de Datos:${NC}"
echo "   Instancia: ${DB_INSTANCE}"
echo "   Conexión:  ${CONNECTION_NAME}"
echo "   Database:  ${DB_NAME}"
echo "   Usuario:   ${DB_USER}"
echo "   Password:  ${DB_PASSWORD}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE: Guarda la contraseña de la base de datos${NC}"
echo ""
echo -e "${BLUE}📊 Para ver logs:${NC}"
echo "   Backend:  gcloud run services logs read ${BACKEND_SERVICE} --region ${REGION}"
echo "   Frontend: gcloud run services logs read ${FRONTEND_SERVICE} --region ${REGION}"
echo ""
echo -e "${BLUE}🔄 Para actualizar:${NC}"
echo "   ./deploy-cloudrun.sh"
echo ""
