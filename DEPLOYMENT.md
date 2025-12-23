# 🚀 Guía de Despliegue - Stoxy

Guía completa para desplegar Stoxy en **Docker local** y **Google Cloud Run** con arquitectura de 3 capas.

## 📐 Arquitectura de 3 Capas

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Nginx)                      │
│              Aplicación Web Estática                     │
│                   Puerto: 8080                           │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                BACKEND API (Node.js/Express)             │
│                  API REST + Lógica                       │
│                   Puerto: 3000                           │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│              BASE DE DATOS (PostgreSQL)                  │
│              Persistencia de Datos                       │
│                   Puerto: 5432                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🐳 Parte 1: Despliegue Local con Docker

### Prerrequisitos

- Docker Desktop instalado ([Descargar](https://www.docker.com/products/docker-desktop))
- Docker Compose instalado (incluido en Docker Desktop)

### Paso 1: Verificar Instalación

```bash
docker --version
docker-compose --version
```

### Paso 2: Construir y Levantar Contenedores

```bash
# Desde el directorio raíz de Stoxy
cd /Users/francisco/Stoxy

# Construir y levantar todos los servicios
docker-compose up --build
```

### Paso 3: Verificar que Todo Funciona

Abre tu navegador y visita:

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000/health
- **Base de Datos**: localhost:5432 (usa un cliente PostgreSQL)

### Comandos Útiles Docker Local

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f database

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (¡cuidado! elimina datos)
docker-compose down -v

# Reiniciar un servicio específico
docker-compose restart backend

# Ver estado de los contenedores
docker-compose ps

# Ejecutar comandos en un contenedor
docker-compose exec backend sh
docker-compose exec database psql -U postgres -d stoxy
```

### Acceder a la Base de Datos Local

```bash
# Conectarse a PostgreSQL
docker-compose exec database psql -U postgres -d stoxy

# Ver tablas
\dt

# Ver datos de portfolio
SELECT * FROM portfolio;

# Ver holdings
SELECT * FROM holdings;

# Salir
\q
```

---

## ☁️ Parte 2: Despliegue en Google Cloud Run

### Prerrequisitos

1. **Cuenta de Google Cloud** ([Crear cuenta](https://cloud.google.com/))
2. **gcloud CLI instalado** ([Descargar](https://cloud.google.com/sdk/docs/install))
3. **Docker instalado**

### Paso 1: Configurar Google Cloud

```bash
# Instalar gcloud CLI (macOS)
brew install --cask google-cloud-sdk

# Inicializar gcloud
gcloud init

# Autenticarse
gcloud auth login

# Crear un nuevo proyecto (o usar uno existente)
gcloud projects create stoxy-prod --name="Stoxy Production"

# Configurar proyecto
gcloud config set project stoxy-prod

# Habilitar facturación (requerido)
# Ve a: https://console.cloud.google.com/billing
```

### Paso 2: Configurar Docker para GCR

```bash
# Configurar Docker para usar Google Container Registry
gcloud auth configure-docker
```

### Paso 3: Editar Script de Despliegue

Abre `deploy-cloudrun.sh` y actualiza:

```bash
PROJECT_ID="stoxy-prod"  # Tu Project ID real
REGION="europe-west1"    # O tu región preferida
```

### Paso 4: Ejecutar Despliegue

```bash
# Dar permisos de ejecución al script
chmod +x deploy-cloudrun.sh

# Ejecutar despliegue
./deploy-cloudrun.sh
```

El script automáticamente:
1. ✅ Habilita las APIs necesarias
2. ✅ Crea instancia Cloud SQL PostgreSQL
3. ✅ Construye y sube imagen del backend
4. ✅ Despliega backend en Cloud Run
5. ✅ Construye y sube imagen del frontend
6. ✅ Despliega frontend en Cloud Run
7. ✅ Configura conexión entre servicios

### Paso 5: Verificar Despliegue

Al finalizar, el script mostrará:

```
╔════════════════════════════════════════╗
║  ✅ Despliegue Completado             ║
╚════════════════════════════════════════╝

🌐 URLs de la aplicación:
   Frontend: https://stoxy-frontend-xxxxx.run.app
   Backend:  https://stoxy-backend-xxxxx.run.app

🗄️  Base de Datos:
   Instancia: stoxy-db
   ...
```

**¡Guarda esta información!**

---

## 🔧 Configuración Avanzada

### Variables de Entorno

#### Backend (Cloud Run)

```bash
NODE_ENV=production
PORT=3000
DB_HOST=/cloudsql/[CONNECTION_NAME]
DB_NAME=stoxy
DB_USER=postgres
DB_PASSWORD=[GENERATED_PASSWORD]
```

#### Frontend (Nginx)

El frontend se conecta automáticamente al backend a través del proxy de nginx.

### Escalado Automático

Cloud Run escala automáticamente:

- **Min instances**: 0 (ahorro de costos)
- **Max instances**: 10
- **Concurrency**: 80 requests por instancia

Para modificar:

```bash
gcloud run services update stoxy-backend \
    --min-instances=1 \
    --max-instances=20 \
    --region=europe-west1
```

### Monitoreo y Logs

```bash
# Ver logs en tiempo real
gcloud run services logs tail stoxy-backend --region=europe-west1

# Ver métricas
gcloud run services describe stoxy-backend --region=europe-west1

# Ver en Cloud Console
https://console.cloud.google.com/run
```

---

## 💰 Estimación de Costos (Cloud Run)

### Capa Gratuita Mensual
- **Cloud Run**: 2 millones de requests
- **Cloud SQL**: No incluido en capa gratuita
- **Container Registry**: 0.5 GB almacenamiento

### Costos Estimados (Uso Moderado)

| Servicio | Costo Mensual Estimado |
|----------|------------------------|
| Cloud Run (Backend) | ~$5-10 |
| Cloud Run (Frontend) | ~$2-5 |
| Cloud SQL (db-f1-micro) | ~$7-10 |
| Container Registry | ~$1-2 |
| **TOTAL** | **~$15-27/mes** |

Para reducir costos:
- Usa `--min-instances=0` (ya configurado)
- Considera Cloud SQL Serverless
- Usa CDN para frontend estático

---

## 🔒 Seguridad

### Recomendaciones

1. **Cambiar contraseñas por defecto**
   ```bash
   # Generar password seguro
   openssl rand -base64 32
   ```

2. **Habilitar HTTPS** (automático en Cloud Run)

3. **Configurar CORS** en el backend
   ```javascript
   // Ya configurado en server.js
   app.use(cors({
       origin: 'https://tu-frontend.run.app'
   }));
   ```

4. **Secrets Manager** para passwords
   ```bash
   # Crear secret
   echo -n "tu-password" | gcloud secrets create db-password --data-file=-
   
   # Usar en Cloud Run
   gcloud run services update stoxy-backend \
       --update-secrets=DB_PASSWORD=db-password:latest
   ```

---

## 🐛 Troubleshooting

### Problema: Error al conectar a la base de datos

**Solución**:
```bash
# Verificar que Cloud SQL está corriendo
gcloud sql instances list

# Verificar conexión
gcloud sql connect stoxy-db --user=postgres
```

### Problema: Frontend no se conecta al backend

**Solución**:
```bash
# Verificar que nginx.conf tiene el proxy correcto
# Verificar logs del frontend
docker-compose logs frontend
```

### Problema: "Permission denied" en deploy.sh

**Solución**:
```bash
chmod +x deploy-cloudrun.sh
```

### Problema: Docker build falla

**Solución**:
```bash
# Limpiar caché de Docker
docker system prune -a

# Reconstruir
docker-compose build --no-cache
```

---

## 📊 Comandos de Gestión

### Cloud Run

```bash
# Listar servicios
gcloud run services list

# Ver detalles de un servicio
gcloud run services describe stoxy-backend --region=europe-west1

# Actualizar servicio
gcloud run services update stoxy-backend \
    --image gcr.io/PROJECT_ID/stoxy-backend:latest \
    --region=europe-west1

# Eliminar servicio
gcloud run services delete stoxy-backend --region=europe-west1
```

### Cloud SQL

```bash
# Listar instancias
gcloud sql instances list

# Conectarse a la base de datos
gcloud sql connect stoxy-db --user=postgres

# Crear backup
gcloud sql backups create --instance=stoxy-db

# Restaurar backup
gcloud sql backups restore BACKUP_ID --backup-instance=stoxy-db
```

### Container Registry

```bash
# Listar imágenes
gcloud container images list

# Ver tags de una imagen
gcloud container images list-tags gcr.io/PROJECT_ID/stoxy-backend

# Eliminar imagen
gcloud container images delete gcr.io/PROJECT_ID/stoxy-backend:TAG
```

---

## 🔄 Actualizar la Aplicación

### Actualización Local (Docker)

```bash
# Reconstruir y reiniciar
docker-compose up --build -d

# O solo un servicio
docker-compose up --build -d backend
```

### Actualización en Cloud Run

```bash
# Simplemente ejecuta el script de nuevo
./deploy-cloudrun.sh

# O manualmente para un servicio específico
cd backend
docker build -t gcr.io/PROJECT_ID/stoxy-backend .
docker push gcr.io/PROJECT_ID/stoxy-backend
gcloud run deploy stoxy-backend \
    --image gcr.io/PROJECT_ID/stoxy-backend \
    --region=europe-west1
```

---

## 📚 Recursos Adicionales

- [Documentación Cloud Run](https://cloud.google.com/run/docs)
- [Documentación Cloud SQL](https://cloud.google.com/sql/docs)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs` o `gcloud run services logs`
2. Verifica la configuración de red
3. Consulta la documentación oficial
4. Abre un issue en el repositorio

---

**¡Feliz despliegue! 🚀**
