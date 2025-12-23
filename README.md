# 📈 Stoxy - Plataforma de Gestión de Inversiones

Una aplicación web completa y moderna para la gestión de inversiones, seguimiento de mercados en tiempo real, análisis técnico y planificación financiera.

![Stoxy Dashboard](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Características Principales

### 📊 Dashboard Interactivo
- **Resumen de Cartera en Tiempo Real**
  - Valor total de inversiones
  - Ganancias/pérdidas del día
  - Desglose por tipo de activo (acciones, criptomonedas, ETFs)
  - Mini-gráficos de tendencia en cada tarjeta

- **Gráfico Principal Dinámico**
  - Múltiples períodos: 1D, 1S, 1M, 3M, 1A, Todo
  - Visualización SVG de alto rendimiento
  - Gradientes y efectos visuales premium

### 💼 Gestión de Cartera
- **Añadir Posiciones**
  - Soporte para acciones, criptomonedas, ETFs y materias primas
  - Registro de precio y fecha de compra
  - Cálculo automático de ganancias/pérdidas
  
- **Tabla de Inversiones**
  - Vista detallada de todas las posiciones
  - Cantidad, valor actual y rendimiento
  - Ordenación y filtrado

### 📈 Análisis Técnico Avanzado

#### Tipos de Gráficos
- **Velas Japonesas (Candlestick)**
  - Visualización OHLC completa
  - Identificación de patrones
  
- **Gráfico de Línea**
  - Vista simplificada de tendencias
  
- **Gráfico de Área**
  - Visualización de volumen y tendencias

#### Indicadores Técnicos
- **SMA** (Simple Moving Average) - Media Móvil Simple
- **EMA** (Exponential Moving Average) - Media Móvil Exponencial
- **Bandas de Bollinger** - Volatilidad y niveles de soporte/resistencia
- **RSI** (Relative Strength Index) - Índice de Fuerza Relativa
- **MACD** (Moving Average Convergence Divergence)

### 🔔 Sistema de Alertas
- **Alertas de Precio**
  - Precio por encima de X
  - Precio por debajo de X
  - Cambio porcentual mayor a X%
  
- **Notificaciones**
  - Push notifications
  - Email
  - SMS (configurable)
  
- **Alertas en Tiempo Real**
  - Verificación automática cada 5 segundos
  - Notificaciones visuales elegantes

### 🧮 Calculadora de Inversiones

#### Calculadora de Interés Compuesto
- Inversión inicial
- Aportaciones mensuales
- Rentabilidad anual esperada
- Período de inversión
- Gráfico de proyección

#### Calculadora de Jubilación
- Edad actual y edad de jubilación
- Gastos mensuales esperados
- Ahorros actuales
- Cálculo de fondo necesario

#### Calculadora FIRE
- Financial Independence, Retire Early
- Tasa de ahorro
- Número FI (25x gastos anuales)
- Años hasta la independencia financiera

#### Calculadora de Préstamos
- Capital del préstamo
- Tasa de interés
- Plazo
- Pago mensual y total de intereses

#### Calculadora de Dividendos
- Inversión inicial
- Rendimiento por dividendo
- Tasa de crecimiento
- Proyección de ingresos pasivos

### 📰 Noticias Financieras
- Agregador de noticias de fuentes premium
  - Bloomberg
  - CNBC
  - Wall Street Journal
  - Financial Times
- Actualización en tiempo real
- Filtrado por relevancia

### 🎯 Lista de Seguimiento (Watchlist)
- Seguimiento de activos favoritos
- Precios en tiempo real
- Cambios porcentuales
- Añadir/eliminar activos fácilmente

## 🎨 Diseño y UX

### Tema Visual Premium
- **Dark Mode** con gradientes vibrantes
- **Glassmorphism** - Efectos de cristal esmerilado
- **Micro-animaciones** suaves en todas las interacciones
- **Paleta de colores moderna**:
  - Púrpura (#667eea) - Primario
  - Rosa (#f093fb) - Secundario
  - Verde (#43e97b) - Éxito
  - Azul (#4facfe) - Información

### Tipografía
- **Inter** - Fuente principal de Google Fonts
- Jerarquía clara y legible
- Pesos variables para énfasis

### Animaciones
- Transiciones suaves (250ms cubic-bezier)
- Hover effects en todos los elementos interactivos
- Animaciones escalonadas en listas
- Efectos de entrada (slide-in, fade-in)

## ⌨️ Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl/Cmd + K` | Abrir búsqueda |
| `Ctrl/Cmd + N` | Nueva posición |
| `Ctrl/Cmd + A` | Nueva alerta |
| `Esc` | Cerrar modal |

## 🚀 Tecnologías Utilizadas

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos avanzados con variables CSS
- **JavaScript (Vanilla)** - Sin dependencias externas
- **SVG** - Gráficos vectoriales para charts

### Características Técnicas
- **Responsive Design** - Adaptable a móviles y tablets
- **PWA Ready** - Preparado para Progressive Web App
- **SEO Optimizado** - Meta tags y estructura semántica
- **Performance** - Carga rápida sin frameworks pesados

## 📁 Estructura del Proyecto

```
Stoxy/
├── index.html          # Estructura HTML principal
├── styles.css          # Sistema de diseño y estilos
├── app.js              # Lógica principal de la aplicación
├── charts.js           # Módulo de gráficos avanzados
├── calculator.js       # Módulo de calculadoras financieras
└── README.md           # Documentación
```

## 🎯 Funcionalidades Implementadas

### ✅ Completado

- [x] Dashboard con resumen de cartera
- [x] Gráficos interactivos (línea, área, velas)
- [x] Lista de seguimiento (watchlist)
- [x] Tabla de inversiones
- [x] Sistema de alertas con notificaciones
- [x] Calculadora de inversiones
- [x] Calculadora de jubilación
- [x] Calculadora FIRE
- [x] Calculadora de préstamos
- [x] Calculadora de dividendos
- [x] Indicadores técnicos (SMA, EMA, RSI, Bollinger, MACD)
- [x] Añadir/editar posiciones
- [x] Feed de noticias financieras
- [x] Actualización en tiempo real
- [x] Responsive design
- [x] Atajos de teclado
- [x] Modales para formularios
- [x] Floating Action Buttons
- [x] Toolbar de análisis técnico
- [x] Simulación de datos de mercado

### 🔮 Futuras Mejoras

- [ ] Integración con APIs reales (Yahoo Finance, CoinGecko)
- [ ] Autenticación de usuarios
- [ ] Sincronización en la nube
- [ ] Exportar reportes PDF
- [ ] Modo claro/oscuro toggle
- [ ] Múltiples carteras
- [ ] Análisis de correlación entre activos
- [ ] Backtesting de estrategias
- [ ] Alertas por email/SMS reales
- [ ] Integración con brokers

## 🎓 Cómo Usar

### Instalación Local

1. **Clonar o descargar** los archivos en una carpeta local

2. **Abrir** `index.html` en un navegador moderno
   ```bash
   # Opción 1: Doble clic en index.html
   
   # Opción 2: Servidor local con Python
   python -m http.server 8000
   # Luego abrir http://localhost:8000
   
   # Opción 3: Servidor local con Node.js
   npx serve
   ```

### Desarrollo local con backend (sin Docker)

Si quieres ejecutar el backend de Node.js localmente (útil si Docker no está disponible):

```bash
# Instalar dependencias del backend
cd backend
npm install

# Arrancar backend en puerto 3000 (usa las variables de entorno si es necesario)
DB_HOST=localhost DB_USER=postgres DB_PASSWORD=postgres123 DB_NAME=stoxy PORT=3000 npm start

# En otra terminal, servir el frontend desde la raíz del proyecto
cd ..
npx serve .

# Frontend disponible en http://localhost:5000 (o el puerto que indique `serve`)
```

### Desarrollo con Docker (recomendado)

Si prefieres usar Docker asegúrate de que Docker Desktop esté ejecutándose y luego:

```bash
./start-local.sh
# o
docker compose up --build -d
```

### Uso Básico

1. **Dashboard**: Vista principal con resumen de tu cartera
2. **Añadir Posición**: Click en el botón "+" en la sección de inversiones
3. **Crear Alerta**: Click en el FAB de campana (abajo derecha)
4. **Calculadora**: Click en el FAB de calculadora
5. **Cambiar Período**: Usa los botones 1D, 1S, 1M, etc.
6. **Análisis Técnico**: Navega a Mercados para ver el toolbar

## 📊 Datos de Ejemplo

La aplicación viene precargada con datos de ejemplo:

### Watchlist
- AAPL (Apple Inc.)
- TSLA (Tesla Inc.)
- MSFT (Microsoft)
- GOOGL (Alphabet)
- BTC (Bitcoin)

### Cartera
- 150 acciones de AAPL
- 75 acciones de TSLA
- 100 acciones de MSFT
- 0.5 BTC
- 8 ETH

### Alertas Preconfiguradas
- AAPL > $180
- BTC < $40,000
- TSLA cambio > 5%

## 🎨 Personalización

### Cambiar Colores

Edita las variables CSS en `styles.css`:

```css
:root {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --accent-purple: #667eea;
    /* ... más variables */
}
```

### Añadir Nuevos Activos

En `app.js`, modifica el array `state.watchlist`:

```javascript
state.watchlist.push({
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    price: 495.50,
    change: 12.34,
    changePercent: 2.56
});
```

## 🔧 Configuración Avanzada

### Cambiar Frecuencia de Actualización

En `app.js`:

```javascript
// Cambiar de 5000ms (5s) a otro valor
setInterval(() => {
    updatePrices();
}, 5000);
```

### Modificar Horario de Mercado

En `app.js`, función `simulateMarketData()`:

```javascript
const isMarketOpen = hour >= 9 && hour < 17; // 9 AM - 5 PM
```

## 📱 Responsive Breakpoints

- **Desktop**: > 1200px
- **Tablet**: 768px - 1200px
- **Mobile**: < 768px

## 🌐 Compatibilidad de Navegadores

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📄 Licencia

MIT License - Libre para uso personal y comercial

## 👨‍💻 Desarrollo

### Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Reportar Bugs

Abre un issue en GitHub con:
- Descripción del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si es posible

## 🙏 Agradecimientos

- **Diseño inspirado en**: Robinhood, Webull, Trading View
- **Iconos**: SVG personalizados
- **Fuentes**: Google Fonts (Inter)
- **Colores**: Gradientes modernos de UI Gradients

## 📞 Contacto

Para preguntas o sugerencias, abre un issue en el repositorio.

---

**Hecho con ❤️ para inversores modernos**

*Nota: Esta aplicación usa datos simulados. Para trading real, consulta con un asesor financiero profesional.*
