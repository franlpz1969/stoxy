#!/bin/bash

# Script de despliegue automático para Google Cloud Run
# Asegúrate de tener gcloud CLI instalado y configurado

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Desplegando Stoxy en Google Cloud Run${NC}"

# Variables de configuración
PROJECT_ID="tu-project-id"  # Cambia esto por tu Project ID
SERVICE_NAME="stoxy"
REGION="europe-west1"  # Cambia según tu preferencia
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# 1. Verificar que gcloud esté instalado
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI no está instalado${NC}"
    echo "Instala desde: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo -e "${GREEN}✅ gcloud CLI encontrado${NC}"

# 2. Configurar proyecto
echo -e "${BLUE}📋 Configurando proyecto: ${PROJECT_ID}${NC}"
gcloud config set project ${PROJECT_ID}

# 3. Habilitar APIs necesarias
echo -e "${BLUE}🔧 Habilitando APIs necesarias...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# 4. Construir imagen Docker
echo -e "${BLUE}🐳 Construyendo imagen Docker...${NC}"
docker build -t ${IMAGE_NAME} .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error construyendo imagen Docker${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Imagen Docker construida${NC}"

# 5. Subir imagen a Google Container Registry
echo -e "${BLUE}☁️  Subiendo imagen a GCR...${NC}"
docker push ${IMAGE_NAME}

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error subiendo imagen${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Imagen subida a GCR${NC}"

# 6. Desplegar en Cloud Run
echo -e "${BLUE}🚀 Desplegando en Cloud Run...${NC}"
gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_NAME} \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --port 8080 \
    --memory 256Mi \
    --cpu 1 \
    --max-instances 10 \
    --min-instances 0

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error desplegando en Cloud Run${NC}"
    exit 1
fi

# 7. Obtener URL del servicio
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')

echo ""
echo -e "${GREEN}✅ ¡Despliegue completado exitosamente!${NC}"
echo -e "${BLUE}🌐 URL de tu aplicación:${NC} ${SERVICE_URL}"
echo ""
echo -e "${BLUE}📊 Para ver logs:${NC}"
echo "   gcloud run services logs read ${SERVICE_NAME} --region ${REGION}"
echo ""
echo -e "${BLUE}🔄 Para actualizar:${NC}"
echo "   ./deploy.sh"
echo ""
