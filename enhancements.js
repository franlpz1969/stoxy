/**
 * Stoxy - Mobile & Enhanced Features
 * Handles mobile navigation, portfolio management, number formatting, and Chart.js integration
 */

;(function(){

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format number with proper decimals and thousands separators
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @param {string} currency - Currency symbol (default: '€')
 * @returns {string} Formatted number
 */
function formatCurrency(value, decimals = 2, currency = '€') {
    if (value === null || value === undefined || isNaN(value)) {
        return `${currency}0.00`;
    }

    const formatted = new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);

    return `${currency}${formatted}`;
}

/**
 * Format percentage with proper sign
 * @param {number} value - The percentage value
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage
 */
function formatPercentage(value, decimals = 2) {
    if (value === null || value === undefined || isNaN(value)) {
        return '0.00%';
    }

    const sign = value >= 0 ? '+' : '';
    const formatted = value.toFixed(decimals);
    return `${sign}${formatted}%`;
}

/**
 * Format large numbers with K, M, B suffixes
 * @param {number} value - The number to format
 * @returns {string} Formatted number
 */
function formatCompactNumber(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return '0';
    }

    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absValue >= 1e9) {
        return `${sign}${(absValue / 1e9).toFixed(2)}B`;
    } else if (absValue >= 1e6) {
        return `${sign}${(absValue / 1e6).toFixed(2)}M`;
    } else if (absValue >= 1e3) {
        return `${sign}${(absValue / 1e3).toFixed(2)}K`;
    }

    return `${sign}${absValue.toFixed(2)}`;
}

// ==================== MOBILE NAVIGATION ====================

/**
 * Toggle mobile sidebar visibility
 */
function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (sidebar && overlay) {
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('active');

        // Prevent body scroll when sidebar is open
        if (sidebar.classList.contains('mobile-open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
}

/**
 * Close mobile sidebar when clicking on a nav item
 */
function closeMobileSidebarOnNavClick() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                toggleMobileSidebar();
            }
        });
    });
}

// ==================== PORTFOLIO MANAGEMENT ====================

// Portfolio state (namespaced to avoid colliding with app-level `portfolioState`)
const portfolioManagerState = {
    portfolios: [],
    currentPortfolioId: null
};

/**
 * Toggle portfolio dropdown visibility
 */
function togglePortfolioDropdown() {
    const dropdown = document.getElementById('portfolioDropdown');
    if (dropdown) {
        const isVisible = dropdown.style.display === 'block';
        dropdown.style.display = isVisible ? 'none' : 'block';

        if (!isVisible) {
            loadPortfolioList();
        }
    }
}

/**
 * Close portfolio dropdown when clicking outside
 */
function setupPortfolioDropdownClose() {
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('portfolioDropdown');
        const button = document.getElementById('portfolioSelectorBtn');

        if (dropdown && button) {
            if (!dropdown.contains(e.target) && !button.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        }
    });
}

/**
 * Load and display portfolio list
 */
async function loadPortfolioList() {
    try {
        // Try to fetch from API
        const portfolios = await StoxyAPI.getPortfolios();
        portfolioManagerState.portfolios = portfolios;
        renderPortfolioList(portfolios);
    } catch (error) {
        console.error('Error loading portfolios:', error);
        // Load from localStorage as fallback
        const savedPortfolios = localStorage.getItem('stoxy_portfolios');
        if (savedPortfolios) {
            portfolioManagerState.portfolios = JSON.parse(savedPortfolios);
            renderPortfolioList(portfolioManagerState.portfolios);
        } else {
            // Create default portfolio
            const defaultPortfolio = {
                id: 1,
                name: 'Cartera Principal',
                value: 0,
                currency: 'EUR'
            };
            portfolioManagerState.portfolios = [defaultPortfolio];
            portfolioManagerState.currentPortfolioId = 1;
            localStorage.setItem('stoxy_portfolios', JSON.stringify([defaultPortfolio]));
            renderPortfolioList([defaultPortfolio]);
        }
    }
}

/**
 * Render portfolio list in dropdown
 */
function renderPortfolioList(portfolios) {
    const container = document.getElementById('portfolioList');
    if (!container) return;

    if (portfolios.length === 0) {
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                <p>No tienes carteras creadas</p>
                <button class="btn-primary" onclick="openModal('createPortfolioModal')" style="margin-top: 1rem;">
                    Crear Primera Cartera
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = portfolios.map(portfolio => `
        <div class="portfolio-item ${portfolio.id === portfolioManagerState.currentPortfolioId ? 'active' : ''}" 
             onclick="selectPortfolio(${portfolio.id})">
            <div class="portfolio-item-name">${portfolio.name}</div>
            <div class="portfolio-item-value">${formatCurrency(portfolio.value || 0, 2, portfolio.currency === 'USD' ? '$' : portfolio.currency === 'GBP' ? '£' : '€')}</div>
        </div>
    `).join('');
}

/**
 * Select a portfolio
 */
async function selectPortfolio(portfolioId) {
    portfolioManagerState.currentPortfolioId = portfolioId;
    const portfolio = portfolioManagerState.portfolios.find(p => p.id === portfolioId);

    if (portfolio) {
        // Update UI
        const nameElement = document.getElementById('currentPortfolioName');
        if (nameElement) {
            nameElement.textContent = portfolio.name;
        }

        // Close dropdown
        const dropdown = document.getElementById('portfolioDropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }

        // Reload data for selected portfolio
        await loadPortfolioData(portfolioId);

        // Update portfolio list to show active state
        renderPortfolioList(portfolioManagerState.portfolios);
    }
}

/**
 * Load data for specific portfolio
 */
async function loadPortfolioData(portfolioId) {
    try {
        console.log(`📊 Loading data for portfolio ${portfolioId}`);
        // This will be integrated with existing loadSavedData function
        if (typeof loadSavedData === 'function') {
            await loadSavedData();
        }
    } catch (error) {
        console.error('Error loading portfolio data:', error);
    }
}

/**
 * Handle create portfolio form submission
 */
function setupCreatePortfolioForm() {
    const form = document.getElementById('createPortfolioForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('portfolioNameInput').value;
            const description = document.getElementById('portfolioDescInput').value;
            const currency = document.getElementById('portfolioCurrencyInput').value;

            try {
                // Try to create via API
                const newPortfolio = await StoxyAPI.createPortfolio({
                    name,
                    description,
                    currency
                });

                portfolioManagerState.portfolios.push(newPortfolio);
                localStorage.setItem('stoxy_portfolios', JSON.stringify(portfolioManagerState.portfolios));

                // Select the new portfolio
                await selectPortfolio(newPortfolio.id);

                // Close modal
                closeModal('createPortfolioModal');

                // Reset form
                form.reset();

                console.log('✅ Portfolio created successfully');
            } catch (error) {
                console.error('Error creating portfolio:', error);

                // Fallback: create locally
                const newPortfolio = {
                    id: Date.now(),
                    name,
                    description,
                    currency,
                    value: 0,
                    created_at: new Date().toISOString()
                };

                portfolioManagerState.portfolios.push(newPortfolio);
                localStorage.setItem('stoxy_portfolios', JSON.stringify(portfolioManagerState.portfolios));

                await selectPortfolio(newPortfolio.id);
                closeModal('createPortfolioModal');
                form.reset();
            }
        });
    }
}

// ==================== SEARCH FUNCTIONALITY ====================

let searchTimeout;
let searchCache = {};

/**
 * Setup search input handler
 */
function setupSearchFunctionality() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (searchInput && searchResults) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();

            clearTimeout(searchTimeout);

            if (query.length < 2) {
                searchResults.style.display = 'none';
                return;
            }

            searchTimeout = setTimeout(async () => {
                await performSearch(query);
            }, 300);
        });

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });

        // Handle keyboard navigation
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchResults.style.display = 'none';
                searchInput.blur();
            }
        });
    }
}

/**
 * Perform search and display results
 */
async function performSearch(query) {
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;

    // Check cache first
    if (searchCache[query]) {
        renderSearchResults(searchCache[query]);
        return;
    }

    try {
        // Show loading state
        searchResults.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-secondary);">Buscando...</div>';
        searchResults.style.display = 'block';

        // Search via API
        const results = await StoxyAPI.search(query);

        // Cache results
        searchCache[query] = results;

        renderSearchResults(results);
    } catch (error) {
        console.error('Search error:', error);
        searchResults.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--accent-red);">Error en la búsqueda</div>';
    }
}

/**
 * Render search results
 */
function renderSearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;

    if (!results || results.length === 0) {
        searchResults.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-secondary);">No se encontraron resultados</div>';
        searchResults.style.display = 'block';
        return;
    }

    searchResults.innerHTML = results.map(result => `
        <div class="search-result-item" onclick="handleSearchResultClick('${result.symbol}', '${result.type}')">
            <div class="search-result-left">
                <div class="search-result-symbol">${result.symbol}</div>
                <div class="search-result-name">${result.name || ''}</div>
            </div>
            <div class="search-result-right">
                <div class="search-result-price">${formatCurrency(result.price || 0, 2, result.currency || '€')}</div>
                <div class="search-result-change ${(result.change || 0) >= 0 ? 'positive' : 'negative'}">
                    ${formatPercentage(result.change || 0)}
                </div>
            </div>
        </div>
    `).join('');

    searchResults.style.display = 'block';
}

/**
 * Handle search result click
 */
function handleSearchResultClick(symbol, type) {
    console.log(`Selected: ${symbol} (${type})`);

    // Close search results
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
        searchResults.style.display = 'none';
    }

    // Clear search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }

    // Open add position modal with pre-filled symbol
    openModal('addPositionModal');
    const symbolInput = document.getElementById('symbolInput');
    if (symbolInput) {
        symbolInput.value = symbol;
    }
}

// ==================== CHART.JS INTEGRATION ====================

// Chart instances storage
const chartInstances = {};

/**
 * Create or update a Chart.js chart
 * @param {string} canvasId - Canvas element ID
 * @param {object} config - Chart configuration
 * @returns {Chart} Chart instance
 */
function createChart(canvasId, config) {
    // Destroy existing chart if it exists
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas element ${canvasId} not found`);
        return null;
    }

    // Create new chart
    const ctx = canvas.getContext('2d');
    chartInstances[canvasId] = new Chart(ctx, config);

    return chartInstances[canvasId];
}

/**
 * Create portfolio performance chart
 */
function createPortfolioChart(data) {
    const config = {
        type: 'line',
        data: {
            labels: data.labels || [],
            datasets: [{
                label: 'Valor de Cartera',
                data: data.values || [],
                borderColor: 'rgb(102, 126, 234)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: 'rgb(102, 126, 234)',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#f1f5f9',
                    bodyColor: '#cbd5e1',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            return formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#94a3b8',
                        maxRotation: 0
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#94a3b8',
                        callback: function (value) {
                            return formatCompactNumber(value);
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    };

    return createChart('mainChart', config);
}

/**
 * Create mini sparkline chart
 */
function createMiniChart(canvasId, data, color = 'rgb(102, 126, 234)') {
    const config = {
        type: 'line',
        data: {
            labels: data.labels || [],
            datasets: [{
                data: data.values || [],
                borderColor: color,
                backgroundColor: `${color.replace('rgb', 'rgba').replace(')', ', 0.1)')}`,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false
                }
            },
            elements: {
                line: {
                    borderWidth: 2
                }
            }
        }
    };

    return createChart(canvasId, config);
}

// ==================== INITIALIZATION ====================

/**
 * Initialize all enhanced features
 */
function initializeEnhancements() {
    console.log('🚀 Initializing Stoxy enhancements...');

    // Mobile navigation
    closeMobileSidebarOnNavClick();

    // Portfolio management
    setupPortfolioDropdownClose();
    setupCreatePortfolioForm();
    loadPortfolioList();

    // Search functionality
    setupSearchFunctionality();

    // Format all existing numbers on the page
    formatAllNumbers();

    console.log('✅ Enhancements initialized');
}

/**
 * Format all numbers on the page
 */
function formatAllNumbers() {
    // This will be called after data is loaded to format all displayed numbers
    document.querySelectorAll('.card-value').forEach(el => {
        const value = parseFloat(el.textContent.replace(/[^0-9.-]/g, ''));
        if (!isNaN(value)) {
            el.textContent = formatCurrency(value);
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEnhancements);
} else {
    initializeEnhancements();
}

// Export functions to window for onclick handlers
window.toggleMobileSidebar = toggleMobileSidebar;
window.togglePortfolioDropdown = togglePortfolioDropdown;
window.selectPortfolio = selectPortfolio;
window.handleSearchResultClick = handleSearchResultClick;
window.formatCurrency = formatCurrency;
window.formatPercentage = formatPercentage;
window.formatCompactNumber = formatCompactNumber;
window.createPortfolioChart = createPortfolioChart;
window.createMiniChart = createMiniChart;
window.createChart = createChart;
window.chartInstances = chartInstances;

})();
