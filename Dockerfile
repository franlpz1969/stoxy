# Frontend con Nginx
FROM nginx:alpine

# Copiar archivos de la aplicación
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY mobile-enhancements.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/
COPY charts.js /usr/share/nginx/html/
COPY calculator.js /usr/share/nginx/html/
COPY storage.js /usr/share/nginx/html/
COPY api-client.js /usr/share/nginx/html/
COPY enhancements.js /usr/share/nginx/html/
COPY favicon.ico /usr/share/nginx/html/
COPY themes /usr/share/nginx/html/themes/

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
