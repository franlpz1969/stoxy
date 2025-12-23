// ==================== DATA & STATE ====================
const state = {
    currentPage: 'dashboard',
    currentPeriod: '1D',
    portfolio: {
        totalValue: 127458.32,
        todayGain: 1842.67,
        todayGainPercent: 1.47,
        stocks: 89234.50,
        crypto: 38223.82
    },
    watchlist: [
        { symbol: 'AAPL', name: 'Apple Inc.', price: 178.45, change: 2.34, changePercent: 1.33 },
        { symbol: 'TSLA', name: 'Tesla Inc.', price: 242.67, change: -3.21, changePercent: -1.30 },
        { symbol: 'MSFT', name: 'Microsoft', price: 374.89, change: 5.67, changePercent: 1.54 },
        { symbol: 'GOOGL', name: 'Alphabet', price: 139.23, change: 1.89, changePercent: 1.38 },
        { symbol: 'BTC', name: 'Bitcoin', price: 43567.89, change: -234.56, changePercent: -0.54 }
    ],
    holdings: [
        { symbol: 'AAPL', name: 'Apple Inc.', quantity: 150, value: 26767.50, change: 2.34, changePercent: 1.33 },
        { symbol: 'TSLA', name: 'Tesla Inc.', quantity: 75, value: 18200.25, change: -3.21, changePercent: -1.30 },
        { symbol: 'MSFT', name: 'Microsoft', quantity: 100, value: 37489.00, change: 5.67, changePercent: 1.54 },
        { symbol: 'BTC', name: 'Bitcoin', quantity: 0.5, value: 21783.95, change: -234.56, changePercent: -0.54 },
        { symbol: 'ETH', name: 'Ethereum', quantity: 8, value: 16439.87, change: 45.23, changePercent: 2.12 }
    ],
    news: [
        {
            source: 'Bloomberg',
            title: 'Los mercados alcanzan nuevos máximos históricos impulsados por el sector tecnológico',
            time: 'Hace 2 horas',
            image: 'news1'
        },
        {
            source: 'CNBC',
            title: 'Bitcoin supera los $44,000 en medio de creciente interés institucional',
            time: 'Hace 4 horas',
            image: 'news2'
        },
        {
            source: 'Wall Street Journal',
            title: 'Apple anuncia nuevos productos y servicios para 2024',
            time: 'Hace 6 horas',
            image: 'news3'
        },
        {
            source: 'Financial Times',
            title: 'La Fed mantiene las tasas de interés sin cambios',
            time: 'Hace 8 horas',
            image: 'news4'
        }
    ]
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    loadSavedData(); // Cargar datos guardados
    renderWatchlist();
    renderHoldings();
    renderNews();
    renderCharts();
    setupEventListeners();
    startRealTimeUpdates();
    enableAutoSave(); // Activar guardado automático
});

function initializeApp() {
    console.log('🚀 Stoxy Web App Initialized');

    // Mostrar información de almacenamiento
    if (StorageManager) {
        const lastSync = StorageManager.getLastSync();
        if (lastSync) {
            console.log('📅 Última sincronización:', lastSync.toLocaleString('es-ES'));
        }
        console.log('💾 Espacio usado:', StorageManager.getStorageSize(), 'KB');
    }
}

// ==================== CARGAR DATOS DESDE API ====================
async function loadSavedData() {
    console.log('📡 Cargando datos desde el backend...');

    try {
        // Verificar salud del backend
        const health = await StoxyAPI.healthCheck();
        if (health.status !== 'ok') {
            console.warn('⚠️ Backend no disponible, usando datos locales');
            loadLocalData();
            return;
        }

        // Cargar portfolio desde API
        const portfolio = await StoxyAPI.getPortfolio();
        if (portfolio && portfolio.total_value) {
            state.portfolio = {
                totalValue: parseFloat(portfolio.total_value),
                todayGain: parseFloat(portfolio.today_gain),
                todayGainPercent: parseFloat(portfolio.today_gain_percent),
                stocks: parseFloat(portfolio.stocks),
                crypto: parseFloat(portfolio.crypto)
            };
            console.log('✅ Portfolio cargado desde API');
        }

        // Cargar holdings desde API
        const holdings = await StoxyAPI.getHoldings();
        if (holdings && holdings.length > 0) {
            state.holdings = holdings.map(h => ({
                id: h.id,
                symbol: h.symbol,
                name: h.name,
                quantity: parseFloat(h.quantity),
                value: parseFloat(h.value),
                change: parseFloat(h.change),
                changePercent: parseFloat(h.change_percent),
                purchasePrice: parseFloat(h.purchase_price),
                purchaseDate: h.purchase_date,
                type: h.type
            }));
            console.log('✅ Holdings cargados desde API:', holdings.length, 'posiciones');
        }

        // Cargar watchlist desde API
        const watchlist = await StoxyAPI.getWatchlist();
        if (watchlist && watchlist.length > 0) {
            state.watchlist = watchlist.map(w => ({
                id: w.id,
                symbol: w.symbol,
                name: w.name,
                price: parseFloat(w.price),
                change: parseFloat(w.change),
                changePercent: parseFloat(w.change_percent)
            }));
            console.log('✅ Watchlist cargada desde API:', watchlist.length, 'activos');
        }

        // Cargar alertas desde API
        const alerts = await StoxyAPI.getAlerts();
        if (alerts && alerts.length > 0) {
            alertsState.alerts = alerts.map(a => ({
                id: a.id,
                symbol: a.symbol,
                condition: a.condition,
                value: parseFloat(a.value),
                active: a.active,
                triggered: a.triggered
            }));
            console.log('✅ Alertas cargadas desde API:', alerts.length, 'alertas');
        }

        console.log('🎉 Todos los datos cargados desde la base de datos');

    } catch (error) {
        console.error('❌ Error cargando datos desde API:', error);
        console.log('📦 Usando datos locales como fallback');
        loadLocalData();
    }
}

// ==================== CARGAR DATOS LOCALES (FALLBACK) ====================
function loadLocalData() {
    if (!StorageManager) {
        console.warn('⚠️ StorageManager no disponible');
        return;
    }

    const savedData = StorageManager.loadAll();

    // Cargar portfolio
    if (savedData.portfolio) {
        state.portfolio = savedData.portfolio;
        console.log('✅ Portfolio cargado desde localStorage');
    }

    // Cargar holdings
    if (savedData.holdings && savedData.holdings.length > 0) {
        state.holdings = savedData.holdings;
        console.log('✅ Holdings cargados:', savedData.holdings.length, 'posiciones');
    }

    // Cargar watchlist
    if (savedData.watchlist && savedData.watchlist.length > 0) {
        state.watchlist = savedData.watchlist;
        console.log('✅ Watchlist cargada:', savedData.watchlist.length, 'activos');
    }

    // Cargar alertas
    if (savedData.alerts && savedData.alerts.length > 0) {
        alertsState.alerts = savedData.alerts;
        console.log('✅ Alertas cargadas:', savedData.alerts.length, 'alertas');
    }

    // Cargar configuración
    if (savedData.settings) {
        state.settings = savedData.settings;
        console.log('✅ Configuración cargada');
    }

    // Cargar perfil de usuario
    if (savedData.userProfile) {
        state.userProfile = savedData.userProfile;
        updateUserProfile(savedData.userProfile);
        console.log('✅ Perfil de usuario cargado');
    }
}

// ==================== ACTUALIZAR PERFIL DE USUARIO ====================
function updateUserProfile(profile) {
    const userAvatar = document.querySelector('.user-avatar span');
    const userName = document.querySelector('.user-name');
    const userStatus = document.querySelector('.user-status');

    if (userAvatar) userAvatar.textContent = profile.initials || 'FG';
    if (userName) userName.textContent = profile.name || 'Francisco';
    if (userStatus) userStatus.textContent = profile.status || 'Inversor Pro';
}

// ==================== GUARDAR DATOS AUTOMÁTICAMENTE ====================
function enableAutoSave() {
    if (!StorageManager) return;

    // Auto-guardar cada 30 segundos
    StorageManager.enableAutoSave(state, alertsState, 30000);

    console.log('💾 Auto-guardado activado (cada 30 segundos)');
}

// ==================== GUARDAR MANUALMENTE ====================
function saveData() {
    if (!StorageManager) return;

    StorageManager.saveAll(state, alertsState);
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            switchPage(page);
        });
    });

    // Time period buttons
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentPeriod = btn.dataset.period;
            updateMainChart();
        });
    });

    // Sidebar toggle for mobile
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            handleSearch(e.target.value);
        });
    }
}

function switchPage(page) {
    state.currentPage = page;

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });

    // Update page title
    const pageTitle = document.querySelector('.page-title');
    const titles = {
        dashboard: 'Dashboard',
        portfolio: 'Mi Cartera',
        markets: 'Mercados',
        crypto: 'Criptomonedas',
        news: 'Noticias',
        alerts: 'Alertas'
    };
    pageTitle.textContent = titles[page] || 'Dashboard';

    // Hide all page sections
    document.querySelectorAll('.page-section').forEach(section => {
        section.style.display = 'none';
    });

    // Show the selected page section
    const pageSection = document.getElementById(`${page}Page`);
    if (pageSection) {
        pageSection.style.display = 'block';
    } else {
        // If no specific page exists, show dashboard
        const dashboardSection = document.getElementById('dashboardPage');
        if (dashboardSection) {
            dashboardSection.style.display = 'block';
        }
    }

    // Show/hide chart toolbar based on page
    toggleChartToolbar(page === 'markets' || page === 'crypto');

    // Load page-specific content
    switch (page) {
        case 'markets':
            loadMarketsPage();
            break;
        case 'crypto':
            loadCryptoPage();
            break;
        case 'alerts':
            loadAlertsPage();
            break;
        case 'portfolio':
            loadPortfolioPage();
            break;
    }

    console.log(`📄 Switched to ${page} page`);
}

function handleSearch(query) {
    const searchResults = document.getElementById('searchResults');

    if (query.length < 2) {
        if (searchResults) searchResults.style.display = 'none';
        return;
    }

    console.log(`🔍 Searching for: ${query}`);

    // Search in watchlist and holdings
    const allAssets = [...state.watchlist, ...state.holdings];
    const results = allAssets.filter(asset =>
        asset.symbol.toLowerCase().includes(query.toLowerCase()) ||
        asset.name.toLowerCase().includes(query.toLowerCase())
    );

    // Show results dropdown
    if (searchResults) {
        if (results.length > 0) {
            searchResults.innerHTML = results.map(asset => `
                <div class="search-result-item" onclick="selectAsset('${asset.symbol}')">
                    <div class="search-result-icon">${asset.symbol.substring(0, 2)}</div>
                    <div class="search-result-info">
                        <div class="search-result-symbol">${asset.symbol}</div>
                        <div class="search-result-name">${asset.name}</div>
                    </div>
                    <div class="search-result-price">$${asset.price ? asset.price.toFixed(2) : 'N/A'}</div>
                </div>
            `).join('');
            searchResults.style.display = 'block';
        } else {
            searchResults.innerHTML = '<div class="search-no-results">No se encontraron resultados</div>';
            searchResults.style.display = 'block';
        }
    }
}

function selectAsset(symbol) {
    console.log(`✅ Selected asset: ${symbol}`);
    const searchResults = document.getElementById('searchResults');
    if (searchResults) searchResults.style.display = 'none';

    // Clear search input
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) searchInput.value = '';

    // Find the asset in watchlist or holdings
    const asset = [...state.watchlist, ...state.holdings].find(a => a.symbol === symbol);
    if (asset) {
        viewAssetDetail(symbol, asset.name, asset.price || asset.value, asset.changePercent || 0);
    }
}

// ==================== WATCHLIST RENDERING ====================
function renderWatchlist() {
    const container = document.getElementById('watchlistItems');
    if (!container) return;

    container.innerHTML = state.watchlist.map(item => `
        <div class="watchlist-item" onclick="viewAssetDetail('${item.symbol}', '${item.name}', ${item.price}, ${item.changePercent})" style="cursor: pointer;">
            <div class="watchlist-item-left">
                <div class="watchlist-icon">${item.symbol.substring(0, 2)}</div>
                <div class="watchlist-info">
                    <div class="watchlist-symbol">${item.symbol}</div>
                    <div class="watchlist-name">${item.name}</div>
                </div>
            </div>
            <div class="watchlist-item-right">
                <div class="watchlist-price">$${item.price.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
                <div class="watchlist-change ${item.change >= 0 ? 'positive' : 'negative'}">
                    ${item.change >= 0 ? '+' : ''}${item.changePercent.toFixed(2)}%
                </div>
            </div>
        </div>
    `).join('');
}

// ==================== HOLDINGS RENDERING ====================
function renderHoldings() {
    const container = document.getElementById('holdingsTable');
    if (!container) return;

    container.innerHTML = state.holdings.map(holding => `
        <div class="holding-row" onclick="viewHoldingDetail('${holding.symbol}', '${holding.name}', ${holding.quantity}, ${holding.value}, ${holding.changePercent})" style="cursor: pointer;">
            <div class="holding-asset">
                <div class="holding-icon">${holding.symbol.substring(0, 2)}</div>
                <div class="holding-details">
                    <h4>${holding.symbol}</h4>
                    <p>${holding.name}</p>
                </div>
            </div>
            <div class="holding-quantity">${holding.quantity} ${holding.symbol.length === 3 ? 'acciones' : 'unidades'}</div>
            <div class="holding-value">€${holding.value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
            <div class="holding-change ${holding.change >= 0 ? 'positive' : 'negative'}">
                ${holding.change >= 0 ? '+' : ''}${holding.changePercent.toFixed(2)}%
            </div>
        </div>
    `).join('');
}

// ==================== NEWS RENDERING ====================
function renderNews() {
    const container = document.getElementById('newsFeed');
    if (!container) return;

    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    ];

    container.innerHTML = state.news.map((item, index) => `
        <div class="news-item" onclick="viewNewsDetail('${encodeURIComponent(item.title)}', '${item.source}', '${item.time}')" style="cursor: pointer;">
            <div class="news-image-placeholder" style="width: 80px; height: 80px; border-radius: 0.5rem; background: ${gradients[index % gradients.length]};"></div>
            <div class="news-content">
                <div class="news-source">${item.source}</div>
                <div class="news-title">${item.title}</div>
                <div class="news-time">${item.time}</div>
            </div>
        </div>
    `).join('');
}

// ==================== CHART RENDERING ====================
function renderCharts() {
    // Wait for Chart.js to be loaded
    if (typeof Chart === 'undefined') {
        console.warn('⏳ Chart.js not loaded yet, retrying...');
        setTimeout(renderCharts, 500);
        return;
    }

    // Set Chart.js global defaults
    if (Chart.defaults) {
        Chart.defaults.color = '#a0aec0';
        Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
        Chart.defaults.font = {
            family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            size: 12
        };
    }

    // Render charts using the charts.js module
    if (typeof renderMiniCharts === 'function') {
        renderMiniCharts();
    }

    if (typeof renderMainChart === 'function') {
        renderMainChart();
    }

    console.log('📊 Charts rendered successfully');
}

function renderMiniCharts() {
    const charts = ['totalValueChart', 'todayGainChart', 'stocksChart', 'cryptoChart'];

    charts.forEach((chartId, index) => {
        const container = document.getElementById(chartId);
        if (!container) return;

        const data = generateMiniChartData(index);
        const isPositive = data[data.length - 1] > data[0];

        container.innerHTML = createSparkline(data, isPositive);
    });
}

function generateMiniChartData(seed) {
    const points = 20;
    const data = [];
    let value = 50 + seed * 10;

    for (let i = 0; i < points; i++) {
        value += (Math.random() - 0.45) * 10;
        value = Math.max(20, Math.min(80, value));
        data.push(value);
    }

    return data;
}

function createSparkline(data, isPositive) {
    const width = 100;
    const height = 60;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;

    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    const color = isPositive ? '#10b981' : '#ef4444';

    return `
        <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
            <defs>
                <linearGradient id="gradient-${isPositive ? 'pos' : 'neg'}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:${color};stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
                </linearGradient>
            </defs>
            <polyline
                fill="none"
                stroke="${color}"
                stroke-width="2"
                points="${points}"
            />
            <polygon
                fill="url(#gradient-${isPositive ? 'pos' : 'neg'})"
                points="${points} ${width},${height} 0,${height}"
            />
        </svg>
    `;
}

function renderMainChart() {
    const container = document.getElementById('mainChart');
    if (!container) return;

    const data = generateMainChartData();
    const width = container.offsetWidth || 800;
    const height = 400;
    const padding = 40;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;

    const points = data.map((value, index) => {
        const x = padding + (index / (data.length - 1)) * (width - padding * 2);
        const y = padding + (1 - (value - min) / range) * (height - padding * 2);
        return `${x},${y}`;
    }).join(' ');

    container.innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}">
            <defs>
                <linearGradient id="mainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#667eea;stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:#667eea;stop-opacity:0" />
                </linearGradient>
            </defs>
            
            <!-- Grid lines -->
            ${[0, 1, 2, 3, 4].map(i => {
        const y = padding + (i / 4) * (height - padding * 2);
        return `<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`;
    }).join('')}
            
            <!-- Area -->
            <polygon
                fill="url(#mainGradient)"
                points="${points} ${width - padding},${height - padding} ${padding},${height - padding}"
            />
            
            <!-- Line -->
            <polyline
                fill="none"
                stroke="#667eea"
                stroke-width="3"
                points="${points}"
                style="filter: drop-shadow(0 0 8px rgba(102, 126, 234, 0.5));"
            />
            
            <!-- Y-axis labels -->
            ${[0, 1, 2, 3, 4].map(i => {
        const y = padding + (i / 4) * (height - padding * 2);
        const value = max - (i / 4) * range;
        return `<text x="10" y="${y + 5}" fill="#718096" font-size="12" font-family="Inter">€${(value / 1000).toFixed(0)}k</text>`;
    }).join('')}
        </svg>
    `;
}

function generateMainChartData() {
    const periods = {
        '1D': 24,
        '1W': 7,
        '1M': 30,
        '3M': 90,
        '1Y': 365,
        'ALL': 730
    };

    const points = periods[state.currentPeriod] || 24;
    const data = [];
    let value = state.portfolio.totalValue;

    for (let i = 0; i < points; i++) {
        value += (Math.random() - 0.48) * 2000;
        value = Math.max(value * 0.9, Math.min(value * 1.1, value));
        data.push(value);
    }

    return data;
}

function updateMainChart() {
    renderMainChart();
    console.log(`📊 Chart updated for period: ${state.currentPeriod}`);
}

// ==================== REAL-TIME UPDATES ====================
function startRealTimeUpdates() {
    // Simulate real-time price updates
    setInterval(() => {
        updatePrices();
    }, 5000);
}

function updatePrices() {
    // Update watchlist prices
    state.watchlist.forEach(item => {
        const change = (Math.random() - 0.5) * 2;
        item.price += change;
        item.change += change;
        item.changePercent = (item.change / (item.price - item.change)) * 100;
    });

    // Update holdings
    state.holdings.forEach(holding => {
        const change = (Math.random() - 0.5) * 5;
        holding.value += change * holding.quantity;
        holding.changePercent = (Math.random() - 0.5) * 3;
    });

    // Update portfolio totals
    state.portfolio.totalValue = state.holdings.reduce((sum, h) => sum + h.value, 0);
    state.portfolio.todayGain = (Math.random() - 0.3) * 3000;
    state.portfolio.todayGainPercent = (state.portfolio.todayGain / state.portfolio.totalValue) * 100;

    // Re-render components
    renderWatchlist();
    renderHoldings();
    updateSummaryCards();
}

function updateSummaryCards() {
    // Update total value
    const totalValueEl = document.querySelector('.summary-card:nth-child(1) .card-value');
    if (totalValueEl) {
        totalValueEl.textContent = `€${state.portfolio.totalValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;
    }

    // Update today's gain
    const todayGainEl = document.querySelector('.summary-card:nth-child(2) .card-value');
    if (todayGainEl) {
        todayGainEl.textContent = `€${state.portfolio.todayGain.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;
    }

    const todayGainChangeEl = document.querySelector('.summary-card:nth-child(2) .card-change');
    if (todayGainChangeEl) {
        const isPositive = state.portfolio.todayGain >= 0;
        todayGainChangeEl.className = `card-change ${isPositive ? 'positive' : 'negative'}`;
        todayGainChangeEl.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="${isPositive ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'}" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>${isPositive ? '+' : ''}${state.portfolio.todayGainPercent.toFixed(2)}%</span>
        `;
    }
}

// ==================== UTILITY FUNCTIONS ====================
function formatCurrency(value, currency = 'EUR') {
    // Safety check: ensure currency is a valid string
    // This prevents crashes when function is used in map() callbacks where index is passed as second arg
    if (typeof currency !== 'string' || currency.length !== 3) {
        currency = 'EUR';
    }

    try {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(value);
    } catch (e) {
        console.warn(`Error formatting currency: ${value}, ${currency}`, e);
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(value);
    }
}

function formatPercent(value) {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}

function formatTime(date) {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Hace unos minutos';
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;

    const days = Math.floor(hours / 24);
    return `Hace ${days} día${days > 1 ? 's' : ''}`;
}

// ==================== EXPORT ====================
console.log('✅ Stoxy App Loaded Successfully');

// ==================== MODAL MANAGEMENT ====================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Initialize calculator on open
        if (modalId === 'calculatorModal') {
            setTimeout(() => calculateInvestment(), 100);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        const modal = e.target.closest('.modal');
        if (modal) {
            closeModal(modal.id);
        }
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            closeModal(modal.id);
        });
    }
});

// ==================== ALERTS SYSTEM ====================
const alertsState = {
    alerts: [
        { id: 1, symbol: 'AAPL', condition: 'above', value: 180, active: true, triggered: false },
        { id: 2, symbol: 'BTC', condition: 'below', value: 40000, active: true, triggered: false },
        { id: 3, symbol: 'TSLA', condition: 'change', value: 5, active: true, triggered: false }
    ]
};

function checkAlerts() {
    alertsState.alerts.forEach(alert => {
        if (!alert.active || alert.triggered) return;

        const asset = state.watchlist.find(w => w.symbol === alert.symbol);
        if (!asset) return;

        let shouldTrigger = false;

        switch (alert.condition) {
            case 'above':
                shouldTrigger = asset.price > alert.value;
                break;
            case 'below':
                shouldTrigger = asset.price < alert.value;
                break;
            case 'change':
                shouldTrigger = Math.abs(asset.changePercent) > alert.value;
                break;
        }

        if (shouldTrigger) {
            alert.triggered = true;
            showNotification(alert);
        }
    });
}

function showNotification(alert) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">🔔</div>
            <div class="notification-body">
                <div class="notification-title">Alerta de Precio</div>
                <div class="notification-message">
                    ${alert.symbol} ha ${alert.condition === 'above' ? 'superado' : 'caído por debajo de'} 
                    $${alert.value}
                </div>
            </div>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 5000);

    console.log('🔔 Alert triggered:', alert);
}

// Add notification styles dynamically
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 100px;
        right: 24px;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 16px;
        background: rgba(30, 33, 57, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        min-width: 320px;
    }
    
    .notification-icon {
        font-size: 24px;
    }
    
    .notification-body {
        flex: 1;
    }
    
    .notification-title {
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 4px;
        color: #ffffff;
    }
    
    .notification-message {
        font-size: 13px;
        color: #a0aec0;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: #718096;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .notification-close:hover {
        color: #ffffff;
    }
    
    @keyframes slideOut {
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// ==================== FORM HANDLERS ====================
document.addEventListener('DOMContentLoaded', () => {
    // Add Position Form
    const addPositionForm = document.getElementById('addPositionForm');
    if (addPositionForm) {
        addPositionForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const symbol = document.getElementById('symbolInput').value.toUpperCase();
            const type = document.getElementById('assetTypeInput').value;
            const quantity = parseFloat(document.getElementById('quantityInput').value);
            const price = parseFloat(document.getElementById('priceInput').value);
            const date = document.getElementById('dateInput').value;

            const newHolding = {
                symbol,
                name: symbol + ' Holdings',
                quantity,
                value: quantity * price,
                change: (Math.random() - 0.5) * 10,
                change_percent: (Math.random() - 0.5) * 5,
                purchase_price: price,
                purchase_date: date,
                type
            };

            // Guardar en API
            const savedHolding = await StoxyAPI.createHolding(newHolding);

            if (savedHolding) {
                // Actualizar estado local
                state.holdings.push({
                    id: savedHolding.id,
                    symbol: savedHolding.symbol,
                    name: savedHolding.name,
                    quantity: parseFloat(savedHolding.quantity),
                    value: parseFloat(savedHolding.value),
                    change: parseFloat(savedHolding.change),
                    changePercent: parseFloat(savedHolding.change_percent),
                    purchasePrice: parseFloat(savedHolding.purchase_price),
                    purchaseDate: savedHolding.purchase_date,
                    type: savedHolding.type
                });

                renderHoldings();
                closeModal('addPositionModal');
                addPositionForm.reset();

                showNotification({
                    symbol,
                    condition: 'added',
                    value: quantity
                });

                console.log('✅ Position added to database:', savedHolding);
            } else {
                alert('Error al guardar la posición. Inténtalo de nuevo.');
            }
        });
    }

    // Create Alert Form
    const createAlertForm = document.getElementById('createAlertForm');
    if (createAlertForm) {
        createAlertForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const symbol = document.getElementById('alertSymbolInput').value.toUpperCase();
            const condition = document.getElementById('alertConditionInput').value;
            const value = parseFloat(document.getElementById('alertValueInput').value);

            const newAlert = {
                symbol,
                condition,
                value,
                active: true
            };

            // Guardar en API
            const savedAlert = await StoxyAPI.createAlert(newAlert);

            if (savedAlert) {
                // Actualizar estado local
                alertsState.alerts.push({
                    id: savedAlert.id,
                    symbol: savedAlert.symbol,
                    condition: savedAlert.condition,
                    value: parseFloat(savedAlert.value),
                    active: savedAlert.active,
                    triggered: savedAlert.triggered
                });

                closeModal('createAlertModal');
                createAlertForm.reset();

                console.log('✅ Alert created in database:', savedAlert);
            } else {
                alert('Error al crear la alerta. Inténtalo de nuevo.');
            }
        });
    }
});

// ==================== CHART TOOLBAR ====================
function initializeChartToolbar() {
    const toolbar = document.getElementById('chartToolbar');
    if (!toolbar) return;

    // Chart type buttons
    document.querySelectorAll('[data-chart]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-chart]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const chartType = btn.dataset.chart;
            switchChartType(chartType);
        });
    });

    // Indicator buttons
    document.querySelectorAll('[data-indicator]').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');

            const indicator = btn.dataset.indicator;
            const isActive = btn.classList.contains('active');

            if (isActive) {
                console.log(`📊 Adding ${indicator.toUpperCase()} indicator`);
                // Add indicator overlay
            } else {
                console.log(`📊 Removing ${indicator.toUpperCase()} indicator`);
                // Remove indicator overlay
            }
        });
    });
}

// Show toolbar when viewing markets page
function toggleChartToolbar(show) {
    const toolbar = document.getElementById('chartToolbar');
    if (toolbar) {
        toolbar.style.display = show ? 'flex' : 'none';
    }
}

// ==================== PAGE LOADING FUNCTIONS ====================
// Note: Enhanced versions of these functions are defined at the end of this file along with other enhanced page switching logic.


async function loadAlertsPage() {
    console.log('🔔 Loading Alerts page...');

    try {
        // Reload alerts from API
        const alerts = await StoxyAPI.getAlerts();
        if (alerts && alerts.length > 0) {
            alertsState.alerts = alerts.map(a => ({
                id: a.id,
                symbol: a.symbol,
                condition: a.condition,
                value: parseFloat(a.value),
                active: a.active,
                triggered: a.triggered
            }));
        }

        renderAlertsList();
    } catch (error) {
        console.error('❌ Error loading alerts:', error);
        renderAlertsList(); // Render with local data
    }
}

function renderAlertsList() {
    const container = document.getElementById('alertsListContainer');
    if (!container) return;

    const activeAlerts = alertsState.alerts.filter(a => a.active);

    if (activeAlerts.length === 0) {
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    style="margin: 0 auto 1rem; opacity: 0.5;">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke-width="2" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke-width="2" />
                </svg>
                <p>Crea alertas para recibir notificaciones cuando tus activos alcancen ciertos precios</p>
                <button class="btn-primary" onclick="openModal('createAlertModal')" style="margin-top: 1rem;">
                    Crear Primera Alerta
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = activeAlerts.map(alert => `
        <div class="holding-row" style="margin-bottom: 1rem;">
            <div class="holding-asset">
                <div class="holding-icon">${alert.symbol.substring(0, 2)}</div>
                <div class="holding-details">
                    <h4>${alert.symbol}</h4>
                    <p>${getAlertConditionText(alert)}</p>
                </div>
            </div>
            <div class="holding-value">$${alert.value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
            <div class="holding-change ${alert.triggered ? 'positive' : 'neutral'}">
                ${alert.triggered ? '✓ Activada' : '⏳ Pendiente'}
            </div>
            <button onclick="deleteAlertFromList(${alert.id})" class="icon-button" title="Eliminar alerta">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke-width="2"/>
                </svg>
            </button>
        </div>
    `).join('');
}

function getAlertConditionText(alert) {
    switch (alert.condition) {
        case 'above':
            return `Precio por encima de $${alert.value}`;
        case 'below':
            return `Precio por debajo de $${alert.value}`;
        case 'change':
            return `Cambio mayor a ${alert.value}%`;
        default:
            return 'Condición desconocida';
    }
}

async function deleteAlertFromList(alertId) {
    try {
        const success = await StoxyAPI.deleteAlert(alertId);
        if (success) {
            const index = alertsState.alerts.findIndex(a => a.id === alertId);
            if (index !== -1) {
                alertsState.alerts.splice(index, 1);
                renderAlertsList();
                console.log(`✅ Alert ${alertId} deleted from database`);
            }
        }
    } catch (error) {
        console.error('❌ Error deleting alert:', error);
        alert('Error al eliminar la alerta');
    }
}


// ==================== ENHANCED REAL-TIME UPDATES ====================
const originalUpdatePrices = updatePrices;
updatePrices = function () {
    originalUpdatePrices();
    checkAlerts();
};

// ==================== MARKET DATA SIMULATION ====================
function simulateMarketData() {
    // Simulate market opening/closing
    const now = new Date();
    const hour = now.getHours();
    const isMarketOpen = hour >= 9 && hour < 17;

    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.market-status span:last-child');

    if (statusIndicator && statusText) {
        if (isMarketOpen) {
            statusIndicator.classList.add('active');
            statusText.textContent = 'Mercados Abiertos';
        } else {
            statusIndicator.classList.remove('active');
            statusText.textContent = 'Mercados Cerrados';
        }
    }
}

// ==================== SEARCH FUNCTIONALITY ====================
const originalHandleSearch = handleSearch;
handleSearch = function (query) {
    if (query.length < 2) return;

    const allAssets = [...state.watchlist, ...state.holdings];
    const results = allAssets.filter(asset =>
        asset.symbol.toLowerCase().includes(query.toLowerCase()) ||
        asset.name.toLowerCase().includes(query.toLowerCase())
    );

    console.log(`🔍 Search results for "${query}":`, results);

    // Could show search results dropdown
};

// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('.search-bar input').focus();
    }

    // Ctrl/Cmd + N for new position
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openModal('addPositionModal');
    }

    // Ctrl/Cmd + A for new alert
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        openModal('createAlertModal');
    }
});

// ==================== INITIALIZE ADVANCED FEATURES ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeChartToolbar();
    simulateMarketData();

    // Update market status every minute
    setInterval(simulateMarketData, 60000);

    console.log('🚀 Advanced features initialized');
    console.log('⌨️  Keyboard shortcuts:');
    console.log('   Ctrl/Cmd + K: Search');
    console.log('   Ctrl/Cmd + N: New Position');
    console.log('   Ctrl/Cmd + A: New Alert');
});

// ==================== NOTIFICATIONS PANEL ====================
function toggleNotificationsPanel() {
    const panel = document.getElementById('notificationsPanel');
    if (!panel) {
        createNotificationsPanel();
        return;
    }

    const isVisible = panel.style.display === 'block';
    panel.style.display = isVisible ? 'none' : 'block';

    if (!isVisible) {
        renderNotificationsPanel();
    }
}

function createNotificationsPanel() {
    const panel = document.createElement('div');
    panel.id = 'notificationsPanel';
    panel.className = 'notifications-panel';
    panel.innerHTML = `
        <div class="notifications-header">
            <h3>Notificaciones</h3>
            <button onclick="toggleNotificationsPanel()" class="close-panel-btn">×</button>
        </div>
        <div class="notifications-content" id="notificationsContent">
            <!-- Content will be rendered here -->
        </div>
    `;
    document.body.appendChild(panel);
    panel.style.display = 'block';
    renderNotificationsPanel();
}

function renderNotificationsPanel() {
    const content = document.getElementById('notificationsContent');
    if (!content) return;

    const activeAlerts = alertsState.alerts.filter(a => a.active);

    if (activeAlerts.length === 0) {
        content.innerHTML = `
            <div class="no-notifications">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <p>No tienes notificaciones</p>
            </div>
        `;
        return;
    }

    content.innerHTML = activeAlerts.map(alert => `
        <div class="notification-panel-item ${alert.triggered ? 'triggered' : ''}">
            <div class="notification-panel-icon">🔔</div>
            <div class="notification-panel-content">
                <div class="notification-panel-title">${alert.symbol}</div>
                <div class="notification-panel-message">
                    Alerta ${alert.condition === 'above' ? 'por encima de' : alert.condition === 'below' ? 'por debajo de' : 'cambio de'} 
                    $${alert.value}
                </div>
                <div class="notification-panel-status">
                    ${alert.triggered ? '✓ Activada' : '⏳ Pendiente'}
                </div>
            </div>
            <button onclick="deleteAlert(${alert.id})" class="delete-alert-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                </svg>
            </button>
        </div>
    `).join('');
}

function deleteAlert(alertId) {
    const index = alertsState.alerts.findIndex(a => a.id === alertId);
    if (index !== -1) {
        alertsState.alerts.splice(index, 1);
        renderNotificationsPanel();
        console.log(`🗑️ Alert ${alertId} deleted`);
    }
}

// Close notifications panel when clicking outside
document.addEventListener('click', (e) => {
    const panel = document.getElementById('notificationsPanel');
    const notifBtn = document.querySelector('[onclick*="toggleNotificationsPanel"]');

    if (panel && panel.style.display === 'block') {
        if (!panel.contains(e.target) && !notifBtn?.contains(e.target)) {
            panel.style.display = 'none';
        }
    }
});

// ==================== EXPORT FUNCTIONS ====================
window.openModal = openModal;
window.closeModal = closeModal;
window.showNotification = showNotification;
window.selectAsset = selectAsset;
window.toggleNotificationsPanel = toggleNotificationsPanel;
window.deleteAlert = deleteAlert;
window.deleteAlertFromList = deleteAlertFromList;

// ==================== MOBILE MENU TOGGLE ====================
function toggleMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
        console.log('📱 Mobile sidebar toggled');
    }
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    const sidebar = document.querySelector('.sidebar');
    const mobileMenuBtn = document.getElementById('mobileMenuToggle');

    if (sidebar && sidebar.classList.contains('open')) {
        if (!sidebar.contains(e.target) && !mobileMenuBtn?.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    }
});

// ==================== PORTFOLIO SELECTOR ====================
const portfolioState = {
    currentPortfolio: 1,
    portfolios: [
        { id: 1, name: 'Cartera Principal', value: 127458.32, currency: 'EUR' },
        { id: 2, name: 'Inversiones Cripto', value: 45230.15, currency: 'USD' },
        { id: 3, name: 'Cartera Conservadora', value: 89500.00, currency: 'EUR' }
    ]
};

function togglePortfolioDropdown() {
    const dropdown = document.getElementById('portfolioDropdown');
    const btn = document.getElementById('portfolioSelectorBtn');

    if (dropdown && btn) {
        const isVisible = dropdown.classList.contains('show');
        dropdown.classList.toggle('show');
        btn.classList.toggle('open');

        if (!isVisible) {
            renderPortfolioList();
        }

        console.log('💼 Portfolio dropdown toggled');
    }
}

function renderPortfolioList() {
    const listContainer = document.getElementById('portfolioList');
    if (!listContainer) return;

    listContainer.innerHTML = portfolioState.portfolios.map(portfolio => `
        <div class="portfolio-item ${portfolio.id === portfolioState.currentPortfolio ? 'active' : ''}" 
             onclick="switchPortfolio(${portfolio.id})">
            <div class="portfolio-item-info">
                <div class="portfolio-item-name">${portfolio.name}</div>
                <div class="portfolio-item-value">${formatCurrencyPro(portfolio.value, portfolio.currency)}</div>
            </div>
            <svg class="portfolio-item-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 6L9 17l-5-5" stroke-width="2" stroke-linecap="round"/>
            </svg>
        </div>
    `).join('');
}

function switchPortfolio(portfolioId) {
    portfolioState.currentPortfolio = portfolioId;
    const portfolio = portfolioState.portfolios.find(p => p.id === portfolioId);

    if (portfolio) {
        // Update button text
        const btnText = document.querySelector('#portfolioSelectorBtn span');
        if (btnText) {
            btnText.textContent = portfolio.name;
        }

        // Close dropdown
        togglePortfolioDropdown();

        // Reload data for selected portfolio
        console.log(`💼 Switched to portfolio: ${portfolio.name}`);

        // Update dashboard with portfolio data
        state.portfolio.totalValue = portfolio.value;
        updateSummaryCards();
        renderWatchlist();
        renderHoldings();
    }
}

// Close portfolio dropdown when clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('portfolioDropdown');
    const btn = document.getElementById('portfolioSelectorBtn');

    if (dropdown && dropdown.classList.contains('show')) {
        if (!dropdown.contains(e.target) && !btn?.contains(e.target)) {
            dropdown.classList.remove('show');
            btn?.classList.remove('open');
        }
    }
});

// ==================== CREATE PORTFOLIO MODAL ====================
document.addEventListener('DOMContentLoaded', () => {
    const createPortfolioForm = document.getElementById('createPortfolioForm');
    if (createPortfolioForm) {
        createPortfolioForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('portfolioNameInput').value;
            const description = document.getElementById('portfolioDescriptionInput').value;
            const currency = document.getElementById('portfolioCurrencyInput').value;

            const newPortfolio = {
                id: portfolioState.portfolios.length + 1,
                name,
                description,
                value: 0,
                currency
            };

            portfolioState.portfolios.push(newPortfolio);

            closeModal('createPortfolioModal');
            createPortfolioForm.reset();

            console.log('✅ Portfolio created:', newPortfolio);

            // Show success notification
            showNotification({
                symbol: '💼',
                condition: 'created',
                value: name
            });
        });
    }
});

// ==================== PROFESSIONAL NUMBER FORMATTING ====================
function formatCurrencyPro(value, currency = 'EUR') {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

function formatNumber(value, decimals = 2) {
    return new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

function formatPercentPro(value, decimals = 2) {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${formatNumber(value, decimals)}%`;
}

function formatLargeNumber(value) {
    if (value >= 1000000) {
        return `${formatNumber(value / 1000000, 2)}M`;
    } else if (value >= 1000) {
        return `${formatNumber(value / 1000, 2)}K`;
    }
    return formatNumber(value, 2);
}

// ==================== SEARCH DROPDOWN ====================
let searchTimeout;
const searchState = {
    isOpen: false,
    results: [],
    selectedIndex: -1
};

function initializeSearchDropdown() {
    const searchInput = document.querySelector('.search-bar input');
    if (!searchInput) return;

    // Create search results dropdown
    const searchWrapper = searchInput.closest('.search-bar');
    if (!searchWrapper) return;

    const resultsDropdown = document.createElement('div');
    resultsDropdown.className = 'search-results';
    resultsDropdown.id = 'searchResults';
    resultsDropdown.style.display = 'none';

    // Wrap search bar in a relative container
    const wrapper = document.createElement('div');
    wrapper.className = 'search-wrapper';
    wrapper.style.position = 'relative';
    searchWrapper.parentNode.insertBefore(wrapper, searchWrapper);
    wrapper.appendChild(searchWrapper);
    wrapper.appendChild(resultsDropdown);

    // Handle search input
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();

        clearTimeout(searchTimeout);

        if (query.length < 2) {
            hideSearchResults();
            return;
        }

        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    });

    // Handle keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
        if (!searchState.isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                searchState.selectedIndex = Math.min(
                    searchState.selectedIndex + 1,
                    searchState.results.length - 1
                );
                updateSearchSelection();
                break;
            case 'ArrowUp':
                e.preventDefault();
                searchState.selectedIndex = Math.max(searchState.selectedIndex - 1, -1);
                updateSearchSelection();
                break;
            case 'Enter':
                e.preventDefault();
                if (searchState.selectedIndex >= 0) {
                    selectSearchResult(searchState.results[searchState.selectedIndex]);
                }
                break;
            case 'Escape':
                hideSearchResults();
                break;
        }
    });

    console.log('🔍 Search dropdown initialized');
}

function performSearch(query) {
    const allAssets = [...state.watchlist, ...state.holdings];
    const results = allAssets.filter(asset =>
        asset.symbol.toLowerCase().includes(query.toLowerCase()) ||
        asset.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8); // Limit to 8 results

    searchState.results = results;
    searchState.selectedIndex = -1;

    showSearchResults(results);
}

function showSearchResults(results) {
    const dropdown = document.getElementById('searchResults');
    if (!dropdown) return;

    if (results.length === 0) {
        dropdown.innerHTML = `
            <div class="search-no-results">
                No se encontraron resultados
            </div>
        `;
    } else {
        dropdown.innerHTML = results.map((asset, index) => `
            <div class="search-result-item" data-index="${index}" onclick="selectSearchResult(${JSON.stringify(asset).replace(/"/g, '&quot;')})">
                <div class="search-result-icon">${asset.symbol.substring(0, 2)}</div>
                <div class="search-result-info">
                    <div class="search-result-symbol">${asset.symbol}</div>
                    <div class="search-result-name">${asset.name}</div>
                </div>
                <div class="search-result-price">${formatCurrencyPro(asset.price || asset.value)}</div>
            </div>
        `).join('');
    }

    dropdown.style.display = 'block';
    searchState.isOpen = true;
}

function hideSearchResults() {
    const dropdown = document.getElementById('searchResults');
    if (dropdown) {
        dropdown.style.display = 'none';
        searchState.isOpen = false;
        searchState.selectedIndex = -1;
    }
}

function updateSearchSelection() {
    const items = document.querySelectorAll('.search-result-item');
    items.forEach((item, index) => {
        if (index === searchState.selectedIndex) {
            item.style.background = 'var(--bg-elevated)';
        } else {
            item.style.background = 'transparent';
        }
    });
}

function selectSearchResult(asset) {
    console.log('🎯 Selected asset:', asset);
    hideSearchResults();

    // Clear search input
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.value = '';
    }

    // Navigate to appropriate page or show asset details
    selectAsset(asset.symbol);
}

// Close search dropdown when clicking outside
document.addEventListener('click', (e) => {
    const searchWrapper = document.querySelector('.search-wrapper');
    if (searchWrapper && !searchWrapper.contains(e.target)) {
        hideSearchResults();
    }
});

// ==================== ENHANCED PAGE SWITCHING ====================
const originalSwitchPage = switchPage;
switchPage = function (page) {
    // Call original function
    originalSwitchPage(page);

    // Load page-specific data
    switch (page) {
        case 'markets':
            loadMarketsPage();
            toggleChartToolbar(true);
            break;
        case 'crypto':
            loadCryptoPage();
            toggleChartToolbar(true);
            break;
        case 'alerts':
            loadAlertsPage();
            toggleChartToolbar(false);
            break;
        default:
            toggleChartToolbar(false);
    }

    // Close mobile sidebar on page switch
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
    }
};

// ==================== INITIALIZE NEW FEATURES ====================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize mobile menu
    const mobileMenuBtn = document.getElementById('mobileMenuToggle');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileSidebar);
    }

    // Initialize portfolio selector
    const portfolioBtn = document.getElementById('portfolioSelectorBtn');
    if (portfolioBtn) {
        portfolioBtn.addEventListener('click', togglePortfolioDropdown);
        renderPortfolioList();

        // Set initial portfolio name
        const currentPortfolio = portfolioState.portfolios.find(
            p => p.id === portfolioState.currentPortfolio
        );
        if (currentPortfolio) {
            const btnText = portfolioBtn.querySelector('span');
            if (btnText) {
                btnText.textContent = currentPortfolio.name;
            }
        }
    }

    // Initialize search dropdown
    initializeSearchDropdown();

    console.log('✨ Redesign features initialized');
    console.log('📱 Mobile menu ready');
    console.log('💼 Portfolio selector ready');
    console.log('🔍 Search dropdown ready');
});

// Export new functions to window
window.toggleMobileSidebar = toggleMobileSidebar;
window.togglePortfolioDropdown = togglePortfolioDropdown;
window.switchPortfolio = switchPortfolio;
window.formatCurrencyPro = formatCurrencyPro;
window.formatNumber = formatNumber;
window.formatPercentPro = formatPercentPro;
window.formatLargeNumber = formatLargeNumber;

// ==================== ASSET DETAIL MODAL ====================
function viewAssetDetail(symbol, name, price, changePercent) {
    console.log(`📊 Viewing asset: ${symbol}`);

    // Create or update asset detail modal
    let modal = document.getElementById('assetDetailModal');
    if (!modal) {
        modal = createAssetDetailModal();
    }

    // Update modal content
    const isPositive = changePercent >= 0;
    modal.querySelector('.asset-detail-symbol').textContent = symbol;
    modal.querySelector('.asset-detail-name').textContent = name;
    modal.querySelector('.asset-detail-price').textContent = formatCurrencyPro(price);
    modal.querySelector('.asset-detail-change').className = `asset-detail-change ${isPositive ? 'positive' : 'negative'}`;
    modal.querySelector('.asset-detail-change').textContent = `${isPositive ? '+' : ''}${changePercent.toFixed(2)}%`;
    modal.querySelector('.asset-detail-icon').textContent = symbol.substring(0, 2);

    openModal('assetDetailModal');
}

function createAssetDetailModal() {
    const modal = document.createElement('div');
    modal.id = 'assetDetailModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                    <div class="asset-detail-icon" style="width: 48px; height: 48px; border-radius: var(--radius-md); background: var(--primary-gradient); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.25rem;"></div>
                    <div>
                        <h2 class="asset-detail-symbol" style="margin: 0;"></h2>
                        <p class="asset-detail-name" style="margin: 0; color: var(--text-secondary); font-size: 0.875rem;"></p>
                    </div>
                </div>
                <button class="modal-close" onclick="closeModal('assetDetailModal')">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round" />
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div style="display: flex; align-items: baseline; gap: var(--spacing-md); margin-bottom: var(--spacing-xl);">
                    <div class="asset-detail-price" style="font-size: 2.5rem; font-weight: 700; background: var(--primary-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></div>
                    <div class="asset-detail-change" style="font-size: 1.25rem; font-weight: 600;"></div>
                </div>
                
                <div class="asset-detail-chart" style="height: 200px; background: var(--bg-elevated); border-radius: var(--radius-md); margin-bottom: var(--spacing-xl); display: flex; align-items: center; justify-content: center; color: var(--text-tertiary);">
                    <p>Gráfico disponible próximamente</p>
                </div>
                
                <div class="form-actions">
                    <button class="btn-secondary" onclick="closeModal('assetDetailModal')">Cerrar</button>
                    <button class="btn-primary" onclick="openModal('addPositionModal'); closeModal('assetDetailModal');">Añadir a Cartera</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function viewHoldingDetail(symbol, name, quantity, value, changePercent) {
    console.log(`💼 Viewing holding: ${symbol}`);

    // Create or update holding detail modal
    let modal = document.getElementById('holdingDetailModal');
    if (!modal) {
        modal = createHoldingDetailModal();
    }

    // Update modal content
    const isPositive = changePercent >= 0;
    const pricePerUnit = value / quantity;

    modal.querySelector('.holding-detail-symbol').textContent = symbol;
    modal.querySelector('.holding-detail-name').textContent = name;
    modal.querySelector('.holding-detail-value').textContent = formatCurrencyPro(value);
    modal.querySelector('.holding-detail-quantity').textContent = `${quantity} ${symbol.length === 3 ? 'acciones' : 'unidades'}`;
    modal.querySelector('.holding-detail-price').textContent = `Precio unitario: ${formatCurrencyPro(pricePerUnit)}`;
    modal.querySelector('.holding-detail-change').className = `holding-detail-change ${isPositive ? 'positive' : 'negative'}`;
    modal.querySelector('.holding-detail-change').textContent = `${isPositive ? '+' : ''}${changePercent.toFixed(2)}%`;
    modal.querySelector('.holding-detail-icon').textContent = symbol.substring(0, 2);

    openModal('holdingDetailModal');
}

function createHoldingDetailModal() {
    const modal = document.createElement('div');
    modal.id = 'holdingDetailModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                    <div class="holding-detail-icon" style="width: 48px; height: 48px; border-radius: var(--radius-md); background: var(--primary-gradient); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.25rem;"></div>
                    <div>
                        <h2 class="holding-detail-symbol" style="margin: 0;"></h2>
                        <p class="holding-detail-name" style="margin: 0; color: var(--text-secondary); font-size: 0.875rem;"></p>
                    </div>
                </div>
                <button class="modal-close" onclick="closeModal('holdingDetailModal')">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round" />
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div style="display: flex; align-items: baseline; gap: var(--spacing-md); margin-bottom: var(--spacing-md);">
                    <div class="holding-detail-value" style="font-size: 2.5rem; font-weight: 700; background: var(--primary-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></div>
                    <div class="holding-detail-change" style="font-size: 1.25rem; font-weight: 600;"></div>
                </div>
                
                <div style="margin-bottom: var(--spacing-xl);">
                    <p class="holding-detail-quantity" style="color: var(--text-secondary); margin-bottom: var(--spacing-xs);"></p>
                    <p class="holding-detail-price" style="color: var(--text-tertiary); font-size: 0.875rem;"></p>
                </div>
                
                <div class="holding-detail-chart" style="height: 200px; background: var(--bg-elevated); border-radius: var(--radius-md); margin-bottom: var(--spacing-xl); display: flex; align-items: center; justify-content: center; color: var(--text-tertiary);">
                    <p>Historial de rendimiento</p>
                </div>
                
                <div class="form-actions">
                    <button class="btn-secondary" onclick="closeModal('holdingDetailModal')">Cerrar</button>
                    <button class="btn-danger" style="background: var(--danger);" onclick="console.log('Sell action'); closeModal('holdingDetailModal');">Vender</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function viewNewsDetail(title, source, time) {
    console.log(`📰 Viewing news: ${title}`);

    // Create or update news detail modal
    let modal = document.getElementById('newsDetailModal');
    if (!modal) {
        modal = createNewsDetailModal();
    }

    // Update modal content
    const decodedTitle = decodeURIComponent(title);
    modal.querySelector('.news-detail-title').textContent = decodedTitle;
    modal.querySelector('.news-detail-source').textContent = source;
    modal.querySelector('.news-detail-time').textContent = time;

    openModal('newsDetailModal');
}

function createNewsDetailModal() {
    const modal = document.createElement('div');
    modal.id = 'newsDetailModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h2>Noticia</h2>
                <button class="modal-close" onclick="closeModal('newsDetailModal')">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round" />
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: var(--spacing-md);">
                    <span class="news-detail-source" style="color: var(--accent-purple); font-weight: 500;"></span>
                    <span class="news-detail-time" style="color: var(--text-tertiary); margin-left: var(--spacing-md);"></span>
                </div>
                
                <h3 class="news-detail-title" style="font-size: 1.5rem; font-weight: 700; margin-bottom: var(--spacing-xl); line-height: 1.4;"></h3>
                
                <div style="background: var(--bg-elevated); border-radius: var(--radius-md); padding: var(--spacing-xl); margin-bottom: var(--spacing-xl); color: var(--text-secondary);">
                    <p style="margin-bottom: var(--spacing-md);">Esta es una vista previa de la noticia. El contenido completo estará disponible próximamente.</p>
                    <p>Para leer la noticia completa, visita la fuente original.</p>
                </div>
                
                <div class="form-actions">
                    <button class="btn-secondary" onclick="closeModal('newsDetailModal')">Cerrar</button>
                    <button class="btn-primary" onclick="window.open('#', '_blank');">Ver en Fuente Original</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

// ==================== PORTFOLIO PAGE ====================
function loadPortfolioPage() {
    console.log('💼 Loading Portfolio page...');

    // Render holdings in portfolio page
    const portfolioHoldingsTable = document.getElementById('portfolioHoldingsTable');
    if (portfolioHoldingsTable) {
        portfolioHoldingsTable.innerHTML = state.holdings.map(holding => `
            <div class="holding-row" onclick="viewHoldingDetail('${holding.symbol}', '${holding.name}', ${holding.quantity}, ${holding.value}, ${holding.changePercent})" style="cursor: pointer;">
                <div class="holding-asset">
                    <div class="holding-icon">${holding.symbol.substring(0, 2)}</div>
                    <div class="holding-details">
                        <h4>${holding.symbol}</h4>
                        <p>${holding.name}</p>
                    </div>
                </div>
                <div class="holding-quantity">${holding.quantity} ${holding.symbol.length === 3 ? 'acciones' : 'unidades'}</div>
                <div class="holding-value">€${holding.value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
                <div class="holding-change ${holding.change >= 0 ? 'positive' : 'negative'}">
                    ${holding.change >= 0 ? '+' : ''}${holding.changePercent.toFixed(2)}%
                </div>
            </div>
        `).join('');
    }

    // Render portfolio allocation chart
    renderPortfolioAllocationChart();
}

function renderPortfolioAllocationChart() {
    const ctx = document.getElementById('portfolioAllocationChart');
    if (!ctx || typeof Chart === 'undefined') return;

    // Destroy existing chart if it exists
    if (ctx.chart) {
        ctx.chart.destroy();
    }

    const holdingValues = state.holdings.map(h => h.value);
    const holdingLabels = state.holdings.map(h => h.symbol);
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c',
        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'
    ];

    ctx.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: holdingLabels,
            datasets: [{
                data: holdingValues,
                backgroundColor: colors.slice(0, holdingValues.length),
                borderColor: 'rgba(0,0,0,0.2)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#a0aec0',
                        font: { size: 12 },
                        padding: 15
                    }
                }
            }
        }
    });
}

// ==================== STATIC MARKET DATA (FALLBACK) ====================
const staticMarketData = {
    indices: [
        { symbol: 'SPX', name: 'S&P 500', value: 4783.45, change_percent: 0.85 },
        { symbol: 'NDX', name: 'NASDAQ', value: 15011.35, change_percent: 1.24 },
        { symbol: 'IBEX', name: 'IBEX 35', value: 10234.67, change_percent: -0.32 },
        { symbol: 'DAX', name: 'DAX', value: 16789.23, change_percent: 0.56 }
    ],
    topMovers: [
        { symbol: 'NVDA', name: 'NVIDIA', price: 495.22, change_percent: 5.67 },
        { symbol: 'TSLA', name: 'Tesla', price: 248.50, change_percent: 3.45 },
        { symbol: 'META', name: 'Meta Platforms', price: 356.70, change_percent: 2.89 },
        { symbol: 'AMD', name: 'AMD', price: 147.30, change_percent: 2.34 },
        { symbol: 'AMZN', name: 'Amazon', price: 151.94, change_percent: 1.87 },
        { symbol: 'GOOGL', name: 'Alphabet', price: 139.25, change_percent: -1.23 },
        { symbol: 'NFLX', name: 'Netflix', price: 476.50, change_percent: -0.89 },
        { symbol: 'DIS', name: 'Disney', price: 89.45, change_percent: -2.15 }
    ],
    cryptos: [
        { symbol: 'BTC', name: 'Bitcoin', price: 43567.89, change_percent: -0.54 },
        { symbol: 'ETH', name: 'Ethereum', price: 2289.45, change_percent: 2.12 },
        { symbol: 'ADA', name: 'Cardano', price: 0.58, change_percent: 3.45 },
        { symbol: 'SOL', name: 'Solana', price: 98.23, change_percent: 5.67 }
    ],
    topCryptos: [
        { symbol: 'BTC', name: 'Bitcoin', price: 43567.89, change_percent: -0.54 },
        { symbol: 'ETH', name: 'Ethereum', price: 2289.45, change_percent: 2.12 },
        { symbol: 'BNB', name: 'Binance Coin', price: 312.45, change_percent: 1.23 },
        { symbol: 'XRP', name: 'Ripple', price: 0.62, change_percent: 0.87 },
        { symbol: 'ADA', name: 'Cardano', price: 0.58, change_percent: 3.45 },
        { symbol: 'SOL', name: 'Solana', price: 98.23, change_percent: 5.67 },
        { symbol: 'DOGE', name: 'Dogecoin', price: 0.089, change_percent: -1.34 },
        { symbol: 'DOT', name: 'Polkadot', price: 7.45, change_percent: 2.56 }
    ]
};

// ==================== RESTORED HELPER FUNCTIONS ====================
function renderMarketIndices(indices) {
    const cards = document.querySelectorAll('#marketsPage .summary-card');
    indices.slice(0, 4).forEach((index, i) => {
        if (cards[i]) {
            const valueEl = cards[i].querySelector('.card-value');
            const changeEl = cards[i].querySelector('.card-change');

            if (valueEl) valueEl.textContent = index.value.toLocaleString('es-ES', { minimumFractionDigits: 2 });
            if (changeEl) {
                const isPositive = index.change_percent >= 0;
                changeEl.className = `card-change ${isPositive ? 'positive' : 'negative'}`;
                changeEl.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="${isPositive ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'}" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <span>${isPositive ? '+' : ''}${index.change_percent.toFixed(2)}%</span>
                `;
            }
        }
    });
}

function renderCryptoPrices(cryptos) {
    const cards = document.querySelectorAll('#cryptoPage .summary-card');
    cryptos.slice(0, 4).forEach((crypto, i) => {
        if (cards[i]) {
            const valueEl = cards[i].querySelector('.card-value');
            const changeEl = cards[i].querySelector('.card-change');

            if (valueEl) valueEl.textContent = crypto.price.toLocaleString('es-ES', { minimumFractionDigits: 2, style: 'currency', currency: 'USD' });
            if (changeEl) {
                const isPositive = crypto.change_percent >= 0;
                changeEl.className = `card-change ${isPositive ? 'positive' : 'negative'}`;
                changeEl.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="${isPositive ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'}" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <span>${isPositive ? '+' : ''}${crypto.change_percent.toFixed(2)}%</span>
                `;
            }
        }
    });
}

// ==================== PAGE LOADING FUNCTIONS ====================

async function loadMarketsPage() {
    console.log('📈 Loading Markets page with fallback support...');

    try {
        // Try to load from API first
        if (typeof StoxyAPI !== 'undefined') {
            const indices = await StoxyAPI.getMarketIndices();
            if (indices && indices.length > 0) {
                renderMarketIndices(indices);
            } else {
                renderMarketIndices(staticMarketData.indices);
            }

            const topMovers = await StoxyAPI.getTopMovers();
            if (topMovers && topMovers.length > 0) {
                renderTopMoversWithClick(topMovers);
            } else {
                renderTopMoversWithClick(staticMarketData.topMovers);
            }
        } else {
            // API not available, use static data
            renderMarketIndices(staticMarketData.indices);
            renderTopMoversWithClick(staticMarketData.topMovers);
        }
    } catch (error) {
        console.warn('⚠️ API not available, using static data:', error);
        renderMarketIndices(staticMarketData.indices);
        renderTopMoversWithClick(staticMarketData.topMovers);
    }

    // Render market chart
    if (typeof renderMarketsChart === 'function') {
        renderMarketsChart();
    }
}

async function loadCryptoPage() {
    console.log('₿ Loading Crypto page with fallback support...');

    try {
        // Try to load from API first
        if (typeof StoxyAPI !== 'undefined') {
            const cryptos = await StoxyAPI.getCryptoPrices();
            if (cryptos && cryptos.length > 0) {
                renderCryptoPrices(cryptos);
            } else {
                renderCryptoPrices(staticMarketData.cryptos);
            }

            const topCryptos = await StoxyAPI.getTopCryptos();
            if (topCryptos && topCryptos.length > 0) {
                renderTopCryptosWithClick(topCryptos);
            } else {
                renderTopCryptosWithClick(staticMarketData.topCryptos);
            }
        } else {
            // API not available, use static data
            renderCryptoPrices(staticMarketData.cryptos);
            renderTopCryptosWithClick(staticMarketData.topCryptos);
        }
    } catch (error) {
        console.warn('⚠️ API not available, using static data:', error);
        renderCryptoPrices(staticMarketData.cryptos);
        renderTopCryptosWithClick(staticMarketData.topCryptos);
    }

    // Render crypto chart
    if (typeof renderCryptoChart === 'function') {
        renderCryptoChart();
    }
}

// Improved render functions with click handlers
function renderTopMoversWithClick(movers) {
    const container = document.querySelector('#marketsPage .watchlist-items');
    if (!container) {
        // Try alternative selector
        const watchlistContainer = document.querySelector('#marketsPage .watchlist-container');
        if (watchlistContainer) {
            let itemsContainer = watchlistContainer.querySelector('.watchlist-items');
            if (!itemsContainer) {
                // Create items container if it doesn't exist
                const placeholder = watchlistContainer.querySelector('div[style*="padding: 2rem"]');
                if (placeholder) {
                    placeholder.outerHTML = '<div class="watchlist-items" id="marketsTopMovers"></div>';
                    itemsContainer = document.getElementById('marketsTopMovers');
                }
            }
            if (itemsContainer) {
                itemsContainer.innerHTML = movers.slice(0, 10).map(stock => `
                    <div class="watchlist-item" onclick="viewAssetDetail('${stock.symbol}', '${stock.name}', ${stock.price}, ${stock.change_percent})" style="cursor: pointer;">
                        <div class="watchlist-item-left">
                            <div class="watchlist-icon">${stock.symbol.substring(0, 2)}</div>
                            <div class="watchlist-info">
                                <div class="watchlist-symbol">${stock.symbol}</div>
                                <div class="watchlist-name">${stock.name}</div>
                            </div>
                        </div>
                        <div class="watchlist-item-right">
                            <div class="watchlist-price">$${stock.price.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
                            <div class="watchlist-change ${stock.change_percent >= 0 ? 'positive' : 'negative'}">
                                ${stock.change_percent >= 0 ? '+' : ''}${stock.change_percent.toFixed(2)}%
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }
        return;
    }

    container.innerHTML = movers.slice(0, 10).map(stock => `
        <div class="watchlist-item" onclick="viewAssetDetail('${stock.symbol}', '${stock.name}', ${stock.price}, ${stock.change_percent})" style="cursor: pointer;">
            <div class="watchlist-item-left">
                <div class="watchlist-icon">${stock.symbol.substring(0, 2)}</div>
                <div class="watchlist-info">
                    <div class="watchlist-symbol">${stock.symbol}</div>
                    <div class="watchlist-name">${stock.name}</div>
                </div>
            </div>
            <div class="watchlist-item-right">
                <div class="watchlist-price">$${stock.price.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
                <div class="watchlist-change ${stock.change_percent >= 0 ? 'positive' : 'negative'}">
                    ${stock.change_percent >= 0 ? '+' : ''}${stock.change_percent.toFixed(2)}%
                </div>
            </div>
        </div>
    `).join('');
}

function renderTopCryptosWithClick(cryptos) {
    const container = document.querySelector('#cryptoPage .watchlist-items');
    if (!container) {
        // Try alternative selector
        const watchlistContainer = document.querySelector('#cryptoPage .watchlist-container');
        if (watchlistContainer) {
            let itemsContainer = watchlistContainer.querySelector('.watchlist-items');
            if (!itemsContainer) {
                // Create items container if it doesn't exist
                const placeholder = watchlistContainer.querySelector('div[style*="padding: 2rem"]');
                if (placeholder) {
                    placeholder.outerHTML = '<div class="watchlist-items" id="cryptoTopList"></div>';
                    itemsContainer = document.getElementById('cryptoTopList');
                }
            }
            if (itemsContainer) {
                itemsContainer.innerHTML = cryptos.slice(0, 20).map(crypto => `
                    <div class="watchlist-item" onclick="viewAssetDetail('${crypto.symbol}', '${crypto.name}', ${crypto.price}, ${crypto.change_percent})" style="cursor: pointer;">
                        <div class="watchlist-item-left">
                            <div class="watchlist-icon">${crypto.symbol.substring(0, 2)}</div>
                            <div class="watchlist-info">
                                <div class="watchlist-symbol">${crypto.symbol}</div>
                                <div class="watchlist-name">${crypto.name}</div>
                            </div>
                        </div>
                        <div class="watchlist-item-right">
                            <div class="watchlist-price">$${crypto.price.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
                            <div class="watchlist-change ${crypto.change_percent >= 0 ? 'positive' : 'negative'}">
                                ${crypto.change_percent >= 0 ? '+' : ''}${crypto.change_percent.toFixed(2)}%
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }
        return;
    }

    container.innerHTML = cryptos.slice(0, 20).map(crypto => `
        <div class="watchlist-item" onclick="viewAssetDetail('${crypto.symbol}', '${crypto.name}', ${crypto.price}, ${crypto.change_percent})" style="cursor: pointer;">
            <div class="watchlist-item-left">
                <div class="watchlist-icon">${crypto.symbol.substring(0, 2)}</div>
                <div class="watchlist-info">
                    <div class="watchlist-symbol">${crypto.symbol}</div>
                    <div class="watchlist-name">${crypto.name}</div>
                </div>
            </div>
            <div class="watchlist-item-right">
                <div class="watchlist-price">$${crypto.price.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
                <div class="watchlist-change ${crypto.change_percent >= 0 ? 'positive' : 'negative'}">
                    ${crypto.change_percent >= 0 ? '+' : ''}${crypto.change_percent.toFixed(2)}%
                </div>
            </div>
        </div>
    `).join('');
}

// Render placeholder charts for markets and crypto pages
function renderMarketsChart() {
    const chartContainer = document.querySelector('#marketsPage .chart-container .chart-header + div');
    if (chartContainer) {
        chartContainer.innerHTML = `
            <div class="chart-wrapper main-chart-wrapper">
                <canvas id="marketsIndexChart"></canvas>
            </div>
        `;

        // Create a simple chart if Chart.js is available
        if (typeof Chart !== 'undefined') {
            const ctx = document.getElementById('marketsIndexChart');
            if (ctx) {
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
                        datasets: [{
                            label: 'S&P 500',
                            data: [4750, 4762, 4755, 4770, 4768, 4780, 4775, 4785, 4783],
                            borderColor: '#667eea',
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#a0aec0' } },
                            y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#a0aec0' } }
                        }
                    }
                });
            }
        }
    }
}

function renderCryptoChart() {
    const chartContainer = document.querySelector('#cryptoPage .chart-container .chart-header + div');
    if (chartContainer) {
        chartContainer.innerHTML = `
            <div class="chart-wrapper main-chart-wrapper">
                <canvas id="cryptoMarketChart"></canvas>
            </div>
        `;

        // Create a simple chart if Chart.js is available
        if (typeof Chart !== 'undefined') {
            const ctx = document.getElementById('cryptoMarketChart');
            if (ctx) {
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Ahora'],
                        datasets: [{
                            label: 'Bitcoin',
                            data: [43800, 43650, 43500, 43700, 43400, 43600, 43567],
                            borderColor: '#f7931a',
                            backgroundColor: 'rgba(247, 147, 26, 0.1)',
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#a0aec0' } },
                            y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#a0aec0' } }
                        }
                    }
                });
            }
        }
    }
}

// Export new functions
window.viewAssetDetail = viewAssetDetail;
window.viewHoldingDetail = viewHoldingDetail;
window.viewNewsDetail = viewNewsDetail;
window.loadPortfolioPage = loadPortfolioPage;
window.renderTopMoversWithClick = renderTopMoversWithClick;
window.renderTopCryptosWithClick = renderTopCryptosWithClick;
window.renderMarketsChart = renderMarketsChart;
window.renderCryptoChart = renderCryptoChart;

