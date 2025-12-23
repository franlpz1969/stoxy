const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'stoxy',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== PORTFOLIO ENDPOINTS ====================

// Obtener portfolio
app.get('/api/portfolio', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM portfolio WHERE user_id = $1', [1]);
        res.json(result.rows[0] || {});
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        res.status(500).json({ error: 'Error fetching portfolio' });
    }
});

// ==================== PORTFOLIOS (multiple) ====================

// Obtener todas las carteras del usuario
app.get('/api/portfolios', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM portfolios WHERE user_id = $1 ORDER BY created_at DESC', [1]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching portfolios:', error);
        res.status(500).json({ error: 'Error fetching portfolios' });
    }
});

// Crear nueva cartera
app.post('/api/portfolios', async (req, res) => {
    try {
        const { name, value, currency } = req.body;
        const result = await pool.query(
            `INSERT INTO portfolios (user_id, name, value, currency, created_at, updated_at)
             VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
            [1, name, value || 0, currency || 'EUR']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating portfolio:', error);
        res.status(500).json({ error: 'Error creating portfolio' });
    }
});

// Eliminar cartera
app.delete('/api/portfolios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM portfolios WHERE id = $1 AND user_id = $2 RETURNING *', [id, 1]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Portfolio not found' });
        res.json({ message: 'Portfolio deleted' });
    } catch (error) {
        console.error('Error deleting portfolio:', error);
        res.status(500).json({ error: 'Error deleting portfolio' });
    }
});

// Actualizar portfolio
app.put('/api/portfolio', async (req, res) => {
    try {
        const { totalValue, todayGain, todayGainPercent, stocks, crypto } = req.body;

        const result = await pool.query(
            `INSERT INTO portfolio (user_id, total_value, today_gain, today_gain_percent, stocks, crypto, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())
             ON CONFLICT (user_id) 
             DO UPDATE SET 
                total_value = $2, 
                today_gain = $3, 
                today_gain_percent = $4, 
                stocks = $5, 
                crypto = $6,
                updated_at = NOW()
             RETURNING *`,
            [1, totalValue, todayGain, todayGainPercent, stocks, crypto]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating portfolio:', error);
        res.status(500).json({ error: 'Error updating portfolio' });
    }
});

// ==================== HOLDINGS ENDPOINTS ====================

// Obtener todas las posiciones
app.get('/api/holdings', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM holdings WHERE user_id = $1 ORDER BY created_at DESC',
            [1]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching holdings:', error);
        res.status(500).json({ error: 'Error fetching holdings' });
    }
});

// Obtener holding por id
app.get('/api/holdings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM holdings WHERE id = $1 AND user_id = $2', [id, 1]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Holding not found' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching holding by id:', error);
        res.status(500).json({ error: 'Error fetching holding' });
    }
});

// Crear nueva posición
app.post('/api/holdings', async (req, res) => {
    try {
        const { symbol, name, quantity, value, change, changePercent, purchasePrice, purchaseDate, type } = req.body;

        const result = await pool.query(
            `INSERT INTO holdings (user_id, symbol, name, quantity, value, change, change_percent, purchase_price, purchase_date, type)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [1, symbol, name, quantity, value, change, changePercent, purchasePrice, purchaseDate, type]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating holding:', error);
        res.status(500).json({ error: 'Error creating holding' });
    }
});

// Actualizar posición
app.put('/api/holdings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, value, change, changePercent } = req.body;

        const result = await pool.query(
            `UPDATE holdings 
             SET quantity = $1, value = $2, change = $3, change_percent = $4, updated_at = NOW()
             WHERE id = $5 AND user_id = $6
             RETURNING *`,
            [quantity, value, change, changePercent, id, 1]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Holding not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating holding:', error);
        res.status(500).json({ error: 'Error updating holding' });
    }
});

// Eliminar posición
app.delete('/api/holdings/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM holdings WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, 1]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Holding not found' });
        }

        res.json({ message: 'Holding deleted successfully' });
    } catch (error) {
        console.error('Error deleting holding:', error);
        res.status(500).json({ error: 'Error deleting holding' });
    }
});

// ==================== WATCHLIST ENDPOINTS ====================

// Obtener watchlist
app.get('/api/watchlist', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM watchlist WHERE user_id = $1 ORDER BY created_at DESC',
            [1]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).json({ error: 'Error fetching watchlist' });
    }
});

// Añadir a watchlist
app.post('/api/watchlist', async (req, res) => {
    try {
        const { symbol, name, price, change, changePercent } = req.body;

        const result = await pool.query(
            `INSERT INTO watchlist (user_id, symbol, name, price, change, change_percent)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [1, symbol, name, price, change, changePercent]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        res.status(500).json({ error: 'Error adding to watchlist' });
    }
});

// Eliminar de watchlist
app.delete('/api/watchlist/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM watchlist WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, 1]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Watchlist item not found' });
        }

        res.json({ message: 'Removed from watchlist' });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({ error: 'Error removing from watchlist' });
    }
});

// ==================== ALERTS ENDPOINTS ====================

// Obtener alertas
app.get('/api/alerts', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM alerts WHERE user_id = $1 ORDER BY created_at DESC',
            [1]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ error: 'Error fetching alerts' });
    }
});

// Crear alerta
app.post('/api/alerts', async (req, res) => {
    try {
        const { symbol, condition, value, active } = req.body;

        const result = await pool.query(
            `INSERT INTO alerts (user_id, symbol, condition, value, active, triggered)
             VALUES ($1, $2, $3, $4, $5, false)
             RETURNING *`,
            [1, symbol, condition, value, active !== false]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating alert:', error);
        res.status(500).json({ error: 'Error creating alert' });
    }
});

// Actualizar alerta
app.put('/api/alerts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { active, triggered } = req.body;

        const result = await pool.query(
            `UPDATE alerts 
             SET active = $1, triggered = $2, updated_at = NOW()
             WHERE id = $3 AND user_id = $4
             RETURNING *`,
            [active, triggered, id, 1]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Alert not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating alert:', error);
        res.status(500).json({ error: 'Error updating alert' });
    }
});

// Eliminar alerta
app.delete('/api/alerts/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM alerts WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, 1]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Alert not found' });
        }

        res.json({ message: 'Alert deleted successfully' });
    } catch (error) {
        console.error('Error deleting alert:', error);
        res.status(500).json({ error: 'Error deleting alert' });
    }
});

// ==================== INICIALIZAR BASE DE DATOS ====================

async function initializeDatabase() {
    try {
        // Crear tabla portfolio
        await pool.query(`
            CREATE TABLE IF NOT EXISTS portfolio (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                total_value DECIMAL(15, 2) DEFAULT 0,
                today_gain DECIMAL(15, 2) DEFAULT 0,
                today_gain_percent DECIMAL(5, 2) DEFAULT 0,
                stocks DECIMAL(15, 2) DEFAULT 0,
                crypto DECIMAL(15, 2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(user_id)
            )
        `);

        // Crear tabla holdings
        await pool.query(`
            CREATE TABLE IF NOT EXISTS holdings (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                symbol VARCHAR(50) NOT NULL,
                name VARCHAR(200) NOT NULL,
                quantity DECIMAL(15, 8) NOT NULL,
                value DECIMAL(15, 2) NOT NULL,
                change DECIMAL(15, 2) DEFAULT 0,
                change_percent DECIMAL(5, 2) DEFAULT 0,
                purchase_price DECIMAL(15, 2),
                purchase_date DATE,
                type VARCHAR(20),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);

        // Crear tabla watchlist
        await pool.query(`
            CREATE TABLE IF NOT EXISTS watchlist (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                symbol VARCHAR(50) NOT NULL,
                name VARCHAR(200) NOT NULL,
                price DECIMAL(15, 2) NOT NULL,
                change DECIMAL(15, 2) DEFAULT 0,
                change_percent DECIMAL(5, 2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(user_id, symbol)
            )
        `);

        // Crear tabla alerts
        await pool.query(`
            CREATE TABLE IF NOT EXISTS alerts (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                symbol VARCHAR(50) NOT NULL,
                condition VARCHAR(20) NOT NULL,
                value DECIMAL(15, 2) NOT NULL,
                active BOOLEAN DEFAULT true,
                triggered BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);

        // Crear tabla portfolios (múltiples carteras)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS portfolios (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                name VARCHAR(200) NOT NULL,
                value DECIMAL(18,2) DEFAULT 0,
                currency VARCHAR(10) DEFAULT 'EUR',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);

        console.log('✅ Database tables initialized');
    } catch (error) {
        console.error('❌ Error initializing database:', error);
    }
}

// ==================== INICIAR SERVIDOR ====================

// Export app for tests
async function startServer() {
    await initializeDatabase();
    return app.listen(PORT, () => {
        console.log(`🚀 Stoxy API running on port ${PORT}`);
    });
}

if (require.main === module) {
    startServer();
}

module.exports = app;

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    process.exit(1);
});
