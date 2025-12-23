// ==================== STORAGE MANAGER ====================
// Gestión completa de persistencia de datos con localStorage

const StorageManager = {
    // Claves de almacenamiento
    KEYS: {
        PORTFOLIO: 'stoxy_portfolio',
        HOLDINGS: 'stoxy_holdings',
        WATCHLIST: 'stoxy_watchlist',
        ALERTS: 'stoxy_alerts',
        NEWS: 'stoxy_news',
        SETTINGS: 'stoxy_settings',
        USER_PROFILE: 'stoxy_user_profile',
        LAST_SYNC: 'stoxy_last_sync'
    },

    // ==================== GUARDAR DATOS ====================

    savePortfolio(portfolio) {
        try {
            localStorage.setItem(this.KEYS.PORTFOLIO, JSON.stringify(portfolio));
            this.updateLastSync();
            console.log('💾 Portfolio guardado:', portfolio);
            return true;
        } catch (error) {
            console.error('❌ Error guardando portfolio:', error);
            return false;
        }
    },

    saveHoldings(holdings) {
        try {
            localStorage.setItem(this.KEYS.HOLDINGS, JSON.stringify(holdings));
            this.updateLastSync();
            console.log('💾 Holdings guardados:', holdings.length, 'posiciones');
            return true;
        } catch (error) {
            console.error('❌ Error guardando holdings:', error);
            return false;
        }
    },

    saveWatchlist(watchlist) {
        try {
            localStorage.setItem(this.KEYS.WATCHLIST, JSON.stringify(watchlist));
            this.updateLastSync();
            console.log('💾 Watchlist guardada:', watchlist.length, 'activos');
            return true;
        } catch (error) {
            console.error('❌ Error guardando watchlist:', error);
            return false;
        }
    },

    saveAlerts(alerts) {
        try {
            localStorage.setItem(this.KEYS.ALERTS, JSON.stringify(alerts));
            this.updateLastSync();
            console.log('💾 Alertas guardadas:', alerts.length, 'alertas');
            return true;
        } catch (error) {
            console.error('❌ Error guardando alertas:', error);
            return false;
        }
    },

    saveSettings(settings) {
        try {
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
            console.log('💾 Configuración guardada');
            return true;
        } catch (error) {
            console.error('❌ Error guardando configuración:', error);
            return false;
        }
    },

    saveUserProfile(profile) {
        try {
            localStorage.setItem(this.KEYS.USER_PROFILE, JSON.stringify(profile));
            console.log('💾 Perfil de usuario guardado');
            return true;
        } catch (error) {
            console.error('❌ Error guardando perfil:', error);
            return false;
        }
    },

    // ==================== CARGAR DATOS ====================

    loadPortfolio() {
        try {
            const data = localStorage.getItem(this.KEYS.PORTFOLIO);
            if (data) {
                const portfolio = JSON.parse(data);
                console.log('📂 Portfolio cargado:', portfolio);
                return portfolio;
            }
            return null;
        } catch (error) {
            console.error('❌ Error cargando portfolio:', error);
            return null;
        }
    },

    loadHoldings() {
        try {
            const data = localStorage.getItem(this.KEYS.HOLDINGS);
            if (data) {
                const holdings = JSON.parse(data);
                console.log('📂 Holdings cargados:', holdings.length, 'posiciones');
                return holdings;
            }
            return null;
        } catch (error) {
            console.error('❌ Error cargando holdings:', error);
            return null;
        }
    },

    loadWatchlist() {
        try {
            const data = localStorage.getItem(this.KEYS.WATCHLIST);
            if (data) {
                const watchlist = JSON.parse(data);
                console.log('📂 Watchlist cargada:', watchlist.length, 'activos');
                return watchlist;
            }
            return null;
        } catch (error) {
            console.error('❌ Error cargando watchlist:', error);
            return null;
        }
    },

    loadAlerts() {
        try {
            const data = localStorage.getItem(this.KEYS.ALERTS);
            if (data) {
                const alerts = JSON.parse(data);
                console.log('📂 Alertas cargadas:', alerts.length, 'alertas');
                return alerts;
            }
            return null;
        } catch (error) {
            console.error('❌ Error cargando alertas:', error);
            return null;
        }
    },

    loadSettings() {
        try {
            const data = localStorage.getItem(this.KEYS.SETTINGS);
            if (data) {
                return JSON.parse(data);
            }
            return this.getDefaultSettings();
        } catch (error) {
            console.error('❌ Error cargando configuración:', error);
            return this.getDefaultSettings();
        }
    },

    loadUserProfile() {
        try {
            const data = localStorage.getItem(this.KEYS.USER_PROFILE);
            if (data) {
                return JSON.parse(data);
            }
            return this.getDefaultUserProfile();
        } catch (error) {
            console.error('❌ Error cargando perfil:', error);
            return this.getDefaultUserProfile();
        }
    },

    // ==================== VALORES POR DEFECTO ====================

    getDefaultSettings() {
        return {
            theme: 'dark',
            currency: 'EUR',
            language: 'es',
            notifications: {
                push: true,
                email: true,
                sms: false
            },
            autoRefresh: true,
            refreshInterval: 5000,
            chartType: 'line',
            showMiniCharts: true
        };
    },

    getDefaultUserProfile() {
        return {
            name: 'Francisco',
            initials: 'FG',
            status: 'Inversor Pro',
            joinDate: new Date().toISOString(),
            preferences: {
                defaultPage: 'dashboard',
                compactView: false
            }
        };
    },

    // ==================== GUARDAR TODO ====================

    saveAll(state, alertsState) {
        const results = {
            portfolio: this.savePortfolio(state.portfolio),
            holdings: this.saveHoldings(state.holdings),
            watchlist: this.saveWatchlist(state.watchlist),
            alerts: this.saveAlerts(alertsState.alerts)
        };

        const allSuccess = Object.values(results).every(r => r === true);

        if (allSuccess) {
            console.log('✅ Todos los datos guardados correctamente');
            this.showSaveNotification('Datos guardados correctamente');
        } else {
            console.warn('⚠️ Algunos datos no se pudieron guardar');
        }

        return allSuccess;
    },

    // ==================== CARGAR TODO ====================

    loadAll() {
        return {
            portfolio: this.loadPortfolio(),
            holdings: this.loadHoldings(),
            watchlist: this.loadWatchlist(),
            alerts: this.loadAlerts(),
            settings: this.loadSettings(),
            userProfile: this.loadUserProfile()
        };
    },

    // ==================== LIMPIAR DATOS ====================

    clearAll() {
        try {
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            console.log('🗑️ Todos los datos eliminados');
            return true;
        } catch (error) {
            console.error('❌ Error limpiando datos:', error);
            return false;
        }
    },

    clearPortfolio() {
        localStorage.removeItem(this.KEYS.PORTFOLIO);
        localStorage.removeItem(this.KEYS.HOLDINGS);
        console.log('🗑️ Portfolio limpiado');
    },

    clearAlerts() {
        localStorage.removeItem(this.KEYS.ALERTS);
        console.log('🗑️ Alertas limpiadas');
    },

    // ==================== EXPORTAR/IMPORTAR ====================

    exportData() {
        const data = {
            version: '1.0.0',
            exportDate: new Date().toISOString(),
            portfolio: this.loadPortfolio(),
            holdings: this.loadHoldings(),
            watchlist: this.loadWatchlist(),
            alerts: this.loadAlerts(),
            settings: this.loadSettings(),
            userProfile: this.loadUserProfile()
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `stoxy_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        URL.revokeObjectURL(url);
        console.log('📤 Datos exportados');
        this.showSaveNotification('Datos exportados correctamente');
    },

    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);

            if (data.portfolio) this.savePortfolio(data.portfolio);
            if (data.holdings) this.saveHoldings(data.holdings);
            if (data.watchlist) this.saveWatchlist(data.watchlist);
            if (data.alerts) this.saveAlerts(data.alerts);
            if (data.settings) this.saveSettings(data.settings);
            if (data.userProfile) this.saveUserProfile(data.userProfile);

            console.log('📥 Datos importados correctamente');
            this.showSaveNotification('Datos importados correctamente');

            // Recargar página para aplicar cambios
            setTimeout(() => window.location.reload(), 1000);

            return true;
        } catch (error) {
            console.error('❌ Error importando datos:', error);
            this.showSaveNotification('Error al importar datos', 'error');
            return false;
        }
    },

    // ==================== UTILIDADES ====================

    updateLastSync() {
        localStorage.setItem(this.KEYS.LAST_SYNC, new Date().toISOString());
    },

    getLastSync() {
        const lastSync = localStorage.getItem(this.KEYS.LAST_SYNC);
        return lastSync ? new Date(lastSync) : null;
    },

    getStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return (total / 1024).toFixed(2); // KB
    },

    showSaveNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = 'save-notification';
        notification.innerHTML = `
            <div class="save-notification-content ${type}">
                <span class="save-icon">${type === 'success' ? '✅' : '❌'}</span>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    },

    // ==================== AUTO-SAVE ====================

    enableAutoSave(state, alertsState, interval = 30000) {
        // Guardar cada 30 segundos
        setInterval(() => {
            this.saveAll(state, alertsState);
        }, interval);

        // Guardar antes de cerrar la página
        window.addEventListener('beforeunload', () => {
            this.saveAll(state, alertsState);
        });

        console.log(`💾 Auto-guardado activado (cada ${interval / 1000}s)`);
    }
};

// ==================== ESTILOS PARA NOTIFICACIONES ====================
const saveNotificationStyles = document.createElement('style');
saveNotificationStyles.textContent = `
    .save-notification {
        position: fixed;
        bottom: 100px;
        right: 24px;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    }
    
    .save-notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
        background: rgba(30, 33, 57, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 12px 20px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        color: #ffffff;
        font-size: 14px;
        font-weight: 500;
    }
    
    .save-notification-content.success {
        border-left: 3px solid #10b981;
    }
    
    .save-notification-content.error {
        border-left: 3px solid #ef4444;
    }
    
    .save-icon {
        font-size: 18px;
    }
`;
document.head.appendChild(saveNotificationStyles);

// ==================== EXPORT ====================
window.StorageManager = StorageManager;

console.log('💾 Storage Manager cargado');
console.log('📊 Tamaño actual de almacenamiento:', StorageManager.getStorageSize(), 'KB');
