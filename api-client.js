// ==================== API CLIENT ====================
// Cliente para comunicarse con el backend API

const API_BASE_URL = (() => {
    const host = window.location.hostname;
    // En desarrollo usamos el puerto 3000 (coincide con backend/server.js y Docker)
    if (host === 'localhost' || host === '127.0.0.1') {
        return 'http://localhost:3000/api';
    }
    // En producción el frontend sirve la API en la misma raíz `/api`
    return '/api';
})();

class StoxyAPI {
    // ==================== PORTFOLIO ====================

    static async getPortfolio() {
        try {
            const response = await fetch(`${API_BASE_URL}/portfolio`);
            if (!response.ok) throw new Error('Error fetching portfolio');
            return await response.json();
        } catch (error) {
            console.error('Error getting portfolio:', error);
            return null;
        }
    }

    static async updatePortfolio(portfolio) {
        try {
            const response = await fetch(`${API_BASE_URL}/portfolio`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(portfolio)
            });
            if (!response.ok) throw new Error('Error updating portfolio');
            return await response.json();
        } catch (error) {
            console.error('Error updating portfolio:', error);
            return null;
        }
    }

    // ==================== HOLDINGS ====================

    static async getHoldings() {
        try {
            const response = await fetch(`${API_BASE_URL}/holdings`);
            if (!response.ok) throw new Error('Error fetching holdings');
            return await response.json();
        } catch (error) {
            console.error('Error getting holdings:', error);
            return [];
        }
    }

    static async createHolding(holding) {
        try {
            const response = await fetch(`${API_BASE_URL}/holdings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(holding)
            });
            if (!response.ok) throw new Error('Error creating holding');
            return await response.json();
        } catch (error) {
            console.error('Error creating holding:', error);
            return null;
        }
    }

    static async updateHolding(id, holding) {
        try {
            const response = await fetch(`${API_BASE_URL}/holdings/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(holding)
            });
            if (!response.ok) throw new Error('Error updating holding');
            return await response.json();
        } catch (error) {
            console.error('Error updating holding:', error);
            return null;
        }
    }

    static async deleteHolding(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/holdings/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Error deleting holding');
            return await response.json();
        } catch (error) {
            console.error('Error deleting holding:', error);
            return null;
        }
    }

    // ==================== WATCHLIST ====================

    static async getWatchlist() {
        try {
            const response = await fetch(`${API_BASE_URL}/watchlist`);
            if (!response.ok) throw new Error('Error fetching watchlist');
            return await response.json();
        } catch (error) {
            console.error('Error getting watchlist:', error);
            return [];
        }
    }

    static async addToWatchlist(item) {
        try {
            const response = await fetch(`${API_BASE_URL}/watchlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });
            if (!response.ok) throw new Error('Error adding to watchlist');
            return await response.json();
        } catch (error) {
            console.error('Error adding to watchlist:', error);
            return null;
        }
    }

    static async removeFromWatchlist(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/watchlist/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Error removing from watchlist');
            return await response.json();
        } catch (error) {
            console.error('Error removing from watchlist:', error);
            return null;
        }
    }

    // ==================== ALERTS ====================

    static async getAlerts() {
        try {
            const response = await fetch(`${API_BASE_URL}/alerts`);
            if (!response.ok) throw new Error('Error fetching alerts');
            return await response.json();
        } catch (error) {
            console.error('Error getting alerts:', error);
            return [];
        }
    }

    static async createAlert(alert) {
        try {
            const response = await fetch(`${API_BASE_URL}/alerts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(alert)
            });
            if (!response.ok) throw new Error('Error creating alert');
            return await response.json();
        } catch (error) {
            console.error('Error creating alert:', error);
            return null;
        }
    }

    static async updateAlert(id, alert) {
        try {
            const response = await fetch(`${API_BASE_URL}/alerts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(alert)
            });
            if (!response.ok) throw new Error('Error updating alert');
            return await response.json();
        } catch (error) {
            console.error('Error updating alert:', error);
            return null;
        }
    }

    static async deleteAlert(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/alerts/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Error deleting alert');
            return await response.json();
        } catch (error) {
            console.error('Error deleting alert:', error);
            return null;
        }
    }

    // ==================== PORTFOLIOS (Multiple) ====================

    static async getPortfolios() {
        try {
            const response = await fetch(`${API_BASE_URL}/portfolios`);
            if (!response.ok) throw new Error('Error fetching portfolios');
            return await response.json();
        } catch (error) {
            console.error('Error getting portfolios:', error);
            // Return default portfolio as fallback
            return [{
                id: 1,
                name: 'Cartera Principal',
                value: 0,
                currency: 'EUR',
                created_at: new Date().toISOString()
            }];
        }
    }

    static async createPortfolio(portfolio) {
        try {
            const response = await fetch(`${API_BASE_URL}/portfolios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(portfolio)
            });
            if (!response.ok) throw new Error('Error creating portfolio');
            return await response.json();
        } catch (error) {
            console.error('Error creating portfolio:', error);
            // Return mock portfolio
            return {
                id: Date.now(),
                ...portfolio,
                value: 0,
                created_at: new Date().toISOString()
            };
        }
    }

    static async deletePortfolio(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/portfolios/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Error deleting portfolio');
            return await response.json();
        } catch (error) {
            console.error('Error deleting portfolio:', error);
            return null;
        }
    }

    // ==================== SEARCH ====================

    static async search(query) {
        try {
            const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Error searching');
            return await response.json();
        } catch (error) {
            console.error('Error searching:', error);
            // Return mock search results
            return [
                {
                    symbol: 'AAPL',
                    name: 'Apple Inc.',
                    type: 'stock',
                    price: 178.45,
                    change: 2.34,
                    currency: '$'
                },
                {
                    symbol: 'GOOGL',
                    name: 'Alphabet Inc.',
                    type: 'stock',
                    price: 142.67,
                    change: -0.87,
                    currency: '$'
                },
                {
                    symbol: 'MSFT',
                    name: 'Microsoft Corporation',
                    type: 'stock',
                    price: 378.91,
                    change: 1.56,
                    currency: '$'
                }
            ].filter(item =>
                item.symbol.toLowerCase().includes(query.toLowerCase()) ||
                item.name.toLowerCase().includes(query.toLowerCase())
            );
        }
    }

    // ==================== MARKET DATA ====================

    static async getMarketIndices() {
        try {
            const response = await fetch(`${API_BASE_URL}/market/indices`);
            if (!response.ok) throw new Error('Error fetching market indices');
            return await response.json();
        } catch (error) {
            console.error('Error getting market indices:', error);
            // Return mock data
            return [
                { symbol: 'S&P 500', value: 4783.45, change_percent: 0.85 },
                { symbol: 'NASDAQ', value: 15011.35, change_percent: 1.24 },
                { symbol: 'IBEX 35', value: 10234.67, change_percent: -0.32 },
                { symbol: 'DAX', value: 16789.23, change_percent: 0.56 }
            ];
        }
    }

    static async getTopMovers() {
        try {
            const response = await fetch(`${API_BASE_URL}/market/movers`);
            if (!response.ok) throw new Error('Error fetching top movers');
            return await response.json();
        } catch (error) {
            console.error('Error getting top movers:', error);
            return [
                { symbol: 'NVDA', name: 'NVIDIA', price: 495.22, change_percent: 5.67 },
                { symbol: 'TSLA', name: 'Tesla', price: 248.50, change_percent: 3.45 },
                { symbol: 'META', name: 'Meta Platforms', price: 356.70, change_percent: 2.89 },
                { symbol: 'AMD', name: 'AMD', price: 147.30, change_percent: 2.34 },
                { symbol: 'AMZN', name: 'Amazon', price: 151.94, change_percent: 1.87 },
                { symbol: 'GOOGL', name: 'Alphabet', price: 139.25, change_percent: -1.23 },
                { symbol: 'NFLX', name: 'Netflix', price: 476.50, change_percent: -0.89 },
                { symbol: 'DIS', name: 'Disney', price: 89.45, change_percent: -2.15 }
            ];
        }
    }

    static async getCryptoPrices() {
        try {
            const response = await fetch(`${API_BASE_URL}/crypto/prices`);
            if (!response.ok) throw new Error('Error fetching crypto prices');
            return await response.json();
        } catch (error) {
            console.error('Error getting crypto prices:', error);
            // Return mock data
            return [
                { symbol: 'BTC', name: 'Bitcoin', price: 43567.89, change_percent: -0.54 },
                { symbol: 'ETH', name: 'Ethereum', price: 2289.45, change_percent: 2.12 },
                { symbol: 'ADA', name: 'Cardano', price: 0.58, change_percent: 3.45 },
                { symbol: 'SOL', name: 'Solana', price: 98.23, change_percent: 5.67 }
            ];
        }
    }

    static async getTopCryptos() {
        try {
            const response = await fetch(`${API_BASE_URL}/crypto/top`);
            if (!response.ok) throw new Error('Error fetching top cryptos');
            return await response.json();
        } catch (error) {
            console.error('Error getting top cryptos:', error);
            return [
                { symbol: 'BTC', name: 'Bitcoin', price: 43567.89, change_percent: -0.54 },
                { symbol: 'ETH', name: 'Ethereum', price: 2289.45, change_percent: 2.12 },
                { symbol: 'BNB', name: 'Binance Coin', price: 312.45, change_percent: 1.23 },
                { symbol: 'XRP', name: 'Ripple', price: 0.62, change_percent: 0.87 },
                { symbol: 'ADA', name: 'Cardano', price: 0.58, change_percent: 3.45 },
                { symbol: 'SOL', name: 'Solana', price: 98.23, change_percent: 5.67 },
                { symbol: 'DOGE', name: 'Dogecoin', price: 0.089, change_percent: -1.34 },
                { symbol: 'DOT', name: 'Polkadot', price: 7.45, change_percent: 2.56 }
            ];
        }
    }

    static async getNews() {
        try {
            const response = await fetch(`${API_BASE_URL}/news`);
            if (!response.ok) throw new Error('Error fetching news');
            return await response.json();
        } catch (error) {
            console.error('Error getting news:', error);
            // Return mock data
            return [
                {
                    id: 1,
                    source: 'Bloomberg',
                    title: 'Los mercados alcanzan nuevos máximos históricos impulsados por el sector tecnológico',
                    time: 'Hace 2 horas'
                },
                {
                    id: 2,
                    source: 'CNBC',
                    title: 'Bitcoin supera los $44,000 en medio de creciente interés institucional',
                    time: 'Hace 4 horas'
                },
                {
                    id: 3,
                    source: 'Wall Street Journal',
                    title: 'Apple anuncia nuevos productos y servicios para 2024',
                    time: 'Hace 6 horas'
                }
            ];
        }
    }

    // ==================== HEALTH CHECK ====================

    static async healthCheck() {
        try {
            // Construir URL del endpoint /health de forma robusta
            const origin = API_BASE_URL.startsWith('http')
                ? API_BASE_URL.replace(/\/api\/?$/, '')
                : window.location.origin;
            const response = await fetch(`${origin}/health`);
            if (!response.ok) throw new Error('Backend not healthy');
            return await response.json();
        } catch (error) {
            console.error('Backend health check failed:', error);
            return { status: 'error' };
        }
    }
}

// Exportar para uso global
window.StoxyAPI = StoxyAPI;

console.log('🔌 API Client loaded - Base URL:', API_BASE_URL);
