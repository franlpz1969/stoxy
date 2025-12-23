# 🏗️ Arquitectura Stoxy - 3 Capas

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USUARIO / NAVEGADOR                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTP/HTTPS
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CAPA 1: FRONTEND (Nginx)                          │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  • Aplicación Web Estática (HTML/CSS/JS)                       │ │
│  │  • Nginx como servidor web                                     │ │
│  │  • Puerto: 8080                                                │ │
│  │  • Proxy reverso para API                                      │ │
│  │  • Compresión gzip                                             │ │
│  │  • Cache de archivos estáticos                                 │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  Archivos:                                                           │
│  • index.html, styles.css, app.js                                   │
│  • charts.js, calculator.js, storage.js                             │
│  • nginx.conf, Dockerfile                                           │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ /api/* → proxy_pass
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  CAPA 2: BACKEND API (Node.js)                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  • API REST con Express.js                                     │ │
│  │  • Puerto: 3000                                                │ │
│  │  • Endpoints:                                                  │ │
│  │    - GET/PUT  /api/portfolio                                   │ │
│  │    - GET/POST/PUT/DELETE /api/holdings                         │ │
│  │    - GET/POST/DELETE /api/watchlist                            │ │
│  │    - GET/POST/PUT/DELETE /api/alerts                           │ │
│  │  • CORS habilitado                                             │ │
│  │  • Health checks                                               │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  Archivos:                                                           │
│  • backend/server.js                                                │
│  • backend/package.json                                             │
│  • backend/Dockerfile                                               │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ PostgreSQL Protocol
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│               CAPA 3: BASE DE DATOS (PostgreSQL)                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  • PostgreSQL 15                                               │ │
│  │  • Puerto: 5432                                                │ │
│  │  • Tablas:                                                     │ │
│  │    - portfolio (valor total, ganancias)                        │ │
│  │    - holdings (posiciones de inversión)                        │ │
│  │    - watchlist (activos seguidos)                              │ │
│  │    - alerts (alertas de precio)                                │ │
│  │  • Persistencia con volúmenes Docker                           │ │
│  │  • Backups automáticos (Cloud SQL)                             │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  Configuración:                                                      │
│  • Local: postgres:15-alpine                                        │
│  • Cloud: Cloud SQL PostgreSQL                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Flujo de Datos

### 1. Usuario Carga la Aplicación
```
Usuario → Frontend (Nginx) → index.html + assets
```

### 2. Usuario Añade Posición
```
Usuario → Frontend (JS) → POST /api/holdings → Backend → INSERT INTO holdings → PostgreSQL
                                                ↓
                                            Response
                                                ↓
                                          Frontend actualiza UI
```

### 3. Actualización en Tiempo Real
```
Frontend (setInterval 5s) → GET /api/holdings → Backend → SELECT * FROM holdings → PostgreSQL
                                                  ↓
                                              Response
                                                  ↓
                                            Frontend renderiza
```

### 4. Crear Alerta
```
Usuario → Frontend → POST /api/alerts → Backend → INSERT INTO alerts → PostgreSQL
                                          ↓
                                      Verificación periódica
                                          ↓
                                      Notificación al usuario
```

## Comunicación entre Capas

### Docker Local
```
frontend:8080 ←→ backend:3000 ←→ database:5432
     │                │                │
     └────────────────┴────────────────┘
           stoxy-network (bridge)
```

### Cloud Run
```
Frontend Service ←→ Backend Service ←→ Cloud SQL
   (*.run.app)         (*.run.app)      (Private IP)
        │                   │                 │
        └───────────────────┴─────────────────┘
              VPC Connector (opcional)
```

## Tecnologías por Capa

### Frontend
- **HTML5**: Estructura semántica
- **CSS3**: Glassmorphism, animaciones
- **JavaScript**: Vanilla JS, sin frameworks
- **Nginx**: Servidor web + proxy reverso

### Backend
- **Node.js 18**: Runtime
- **Express.js**: Framework web
- **pg**: Cliente PostgreSQL
- **cors**: Cross-Origin Resource Sharing

### Base de Datos
- **PostgreSQL 15**: RDBMS
- **SQL**: Queries y schemas
- **Volúmenes**: Persistencia de datos

## Seguridad

### Frontend
- ✅ Headers de seguridad (X-Frame-Options, CSP)
- ✅ HTTPS en producción (Cloud Run)
- ✅ Compresión gzip
- ✅ Cache de assets

### Backend
- ✅ CORS configurado
- ✅ Validación de inputs
- ✅ Prepared statements (SQL injection protection)
- ✅ Health checks

### Base de Datos
- ✅ Credenciales en variables de entorno
- ✅ Conexión privada (Cloud SQL)
- ✅ Backups automáticos
- ✅ Encriptación en tránsito

## Escalabilidad

### Docker Local
- Limitado por recursos de la máquina
- Ideal para desarrollo y testing

### Cloud Run
- **Auto-scaling**: 0 a 10+ instancias
- **Serverless**: Paga solo por uso
- **Global**: Deploy en múltiples regiones
- **CDN**: Opcional para assets estáticos

## Monitoreo

### Métricas Disponibles
- Requests por segundo
- Latencia promedio
- Errores 4xx/5xx
- Uso de CPU/Memoria
- Conexiones a DB

### Logs
```bash
# Docker local
docker-compose logs -f [service]

# Cloud Run
gcloud run services logs read [service] --region=[region]
```

## Costos Estimados (Cloud Run)

| Componente | Configuración | Costo/Mes |
|------------|---------------|-----------|
| Frontend | 256Mi RAM, 1 CPU | $2-5 |
| Backend | 512Mi RAM, 1 CPU | $5-10 |
| Cloud SQL | db-f1-micro | $7-10 |
| Storage | Container Registry | $1-2 |
| **TOTAL** | | **$15-27** |

*Basado en ~10,000 requests/mes*

## Ventajas de esta Arquitectura

✅ **Separación de responsabilidades**: Cada capa tiene un propósito claro  
✅ **Escalabilidad independiente**: Escala frontend y backend por separado  
✅ **Mantenibilidad**: Código organizado y modular  
✅ **Portabilidad**: Funciona en Docker local y Cloud  
✅ **Seguridad**: Capas de seguridad en cada nivel  
✅ **Costo-efectivo**: Serverless con auto-scaling  

## Próximos Pasos

1. **Autenticación**: Añadir JWT/OAuth
2. **Cache**: Redis para sesiones
3. **CDN**: CloudFlare para assets
4. **Monitoring**: Cloud Monitoring/Prometheus
5. **CI/CD**: GitHub Actions para deploys automáticos
