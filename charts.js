/**
 * Stoxy - Chart.js Integration
 * Professional charts using Chart.js library
 */

// ==================== CHART CONFIGURATION ====================

// Default chart colors
const CHART_COLORS = {
    primary: 'rgb(102, 126, 234)',
    primaryAlpha: 'rgba(102, 126, 234, 0.1)',
    success: 'rgb(16, 185, 129)',
    successAlpha: 'rgba(16, 185, 129, 0.1)',
    danger: 'rgb(239, 68, 68)',
    dangerAlpha: 'rgba(239, 68, 68, 0.1)',
    warning: 'rgb(245, 158, 11)',
    warningAlpha: 'rgba(245, 158, 11, 0.1)',
    grid: 'rgba(255, 255, 255, 0.05)',
    text: '#94a3b8'
};

// Default chart options
const DEFAULT_CHART_OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#f1f5f9',
            bodyColor: '#cbd5e1',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            boxPadding: 6
        }
    },
    scales: {
        x: {
            grid: {
                display: false,
                drawBorder: false
            },
            ticks: {
                color: CHART_COLORS.text,
                maxRotation: 0
            }
        },
        y: {
            grid: {
                color: CHART_COLORS.grid,
                drawBorder: false
            },
            ticks: {
                color: CHART_COLORS.text
            }
        }
    }
};

// ==================== MAIN PORTFOLIO CHART ====================

/**
 * Render main portfolio performance chart
 */
function renderMainChart() {
    const canvas = document.getElementById('mainChart');
    if (!canvas) {
        console.warn('Main chart canvas not found');
        return;
    }

    // Generate sample data (will be replaced with real data)
    const labels = generateDateLabels(30);
    const data = generatePortfolioData(30, 100000, 130000);

    const config = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Valor de Cartera',
                data: data,
                borderColor: CHART_COLORS.primary,
                backgroundColor: CHART_COLORS.primaryAlpha,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: CHART_COLORS.primary,
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            ...DEFAULT_CHART_OPTIONS,
            plugins: {
                ...DEFAULT_CHART_OPTIONS.plugins,
                tooltip: {
                    ...DEFAULT_CHART_OPTIONS.plugins.tooltip,
                    callbacks: {
                        label: function (context) {
                            return 'Valor: ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                ...DEFAULT_CHART_OPTIONS.scales,
                y: {
                    ...DEFAULT_CHART_OPTIONS.scales.y,
                    ticks: {
                        ...DEFAULT_CHART_OPTIONS.scales.y.ticks,
                        callback: function (value) {
                            return formatCompactNumber(value);
                        }
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        }
    };

    createChart('mainChart', config);
}

// ==================== MINI SPARKLINE CHARTS ====================

/**
 * Render mini charts in summary cards
 */
function renderMiniCharts() {
    // Total Value Chart
    const totalValueData = generateSparklineData(20, 120000, 127000);
    createMiniChart('totalValueChart', {
        labels: Array(20).fill(''),
        values: totalValueData
    }, CHART_COLORS.primary);

    // Today's Gain Chart
    const todayGainData = generateSparklineData(20, 1500, 1900);
    createMiniChart('todayGainChart', {
        labels: Array(20).fill(''),
        values: todayGainData
    }, CHART_COLORS.success);

    // Stocks Chart
    const stocksData = generateSparklineData(20, 85000, 90000);
    createMiniChart('stocksChart', {
        labels: Array(20).fill(''),
        values: stocksData
    }, CHART_COLORS.primary);

    // Crypto Chart
    const cryptoData = generateSparklineData(20, 39000, 38000);
    createMiniChart('cryptoChart', {
        labels: Array(20).fill(''),
        values: cryptoData
    }, CHART_COLORS.danger);
}

// ==================== DATA GENERATION HELPERS ====================

/**
 * Generate date labels for charts
 */
function generateDateLabels(days) {
    const labels = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }));
    }

    return labels;
}

/**
 * Generate portfolio performance data
 */
function generatePortfolioData(points, min, max) {
    const data = [];
    let current = min + (max - min) * Math.random();

    for (let i = 0; i < points; i++) {
        const change = (Math.random() - 0.45) * (max - min) * 0.05;
        current = Math.max(min, Math.min(max, current + change));
        data.push(current);
    }

    return data;
}

/**
 * Generate sparkline data
 */
function generateSparklineData(points, min, max) {
    const data = [];
    let current = min + (max - min) * Math.random();

    for (let i = 0; i < points; i++) {
        const change = (Math.random() - 0.5) * (max - min) * 0.1;
        current = Math.max(min * 0.9, Math.min(max * 1.1, current + change));
        data.push(current);
    }

    return data;
}

// ==================== CHART TYPE SWITCHING ====================

let currentChartType = 'line';
let currentChartData = null;

/**
 * Switch between chart types
 */
function switchChartType(type) {
    currentChartType = type;

    const canvas = document.getElementById('mainChart');
    if (!canvas) return;

    // Store current data if exists
    if (!currentChartData) {
        currentChartData = {
            labels: generateDateLabels(30),
            values: generatePortfolioData(30, 100000, 130000)
        };
    }

    let config;

    switch (type) {
        case 'line':
            config = createLineChartConfig(currentChartData);
            break;
        case 'area':
            config = createAreaChartConfig(currentChartData);
            break;
        case 'bar':
            config = createBarChartConfig(currentChartData);
            break;
        default:
            config = createLineChartConfig(currentChartData);
    }

    createChart('mainChart', config);

    // Update toolbar buttons
    document.querySelectorAll('.toolbar-btn[data-chart]').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.chart === type) {
            btn.classList.add('active');
        }
    });

    console.log(`📊 Switched to ${type} chart`);
}

/**
 * Create line chart configuration
 */
function createLineChartConfig(data) {
    return {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Valor de Cartera',
                data: data.values,
                borderColor: CHART_COLORS.primary,
                backgroundColor: 'transparent',
                borderWidth: 3,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: CHART_COLORS.primary,
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            ...DEFAULT_CHART_OPTIONS,
            plugins: {
                ...DEFAULT_CHART_OPTIONS.plugins,
                tooltip: {
                    ...DEFAULT_CHART_OPTIONS.plugins.tooltip,
                    callbacks: {
                        label: function (context) {
                            return 'Valor: ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            }
        }
    };
}

/**
 * Create area chart configuration
 */
function createAreaChartConfig(data) {
    return {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Valor de Cartera',
                data: data.values,
                borderColor: CHART_COLORS.primary,
                backgroundColor: CHART_COLORS.primaryAlpha,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: CHART_COLORS.primary,
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            ...DEFAULT_CHART_OPTIONS,
            plugins: {
                ...DEFAULT_CHART_OPTIONS.plugins,
                tooltip: {
                    ...DEFAULT_CHART_OPTIONS.plugins.tooltip,
                    callbacks: {
                        label: function (context) {
                            return 'Valor: ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            }
        }
    };
}

/**
 * Create bar chart configuration
 */
function createBarChartConfig(data) {
    return {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Valor de Cartera',
                data: data.values,
                backgroundColor: CHART_COLORS.primaryAlpha,
                borderColor: CHART_COLORS.primary,
                borderWidth: 2,
                borderRadius: 4
            }]
        },
        options: {
            ...DEFAULT_CHART_OPTIONS,
            plugins: {
                ...DEFAULT_CHART_OPTIONS.plugins,
                tooltip: {
                    ...DEFAULT_CHART_OPTIONS.plugins.tooltip,
                    callbacks: {
                        label: function (context) {
                            return 'Valor: ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            }
        }
    };
}

// ==================== TECHNICAL INDICATORS ====================

/**
 * Calculate Simple Moving Average
 */
function calculateSMA(data, period) {
    const sma = [];
    for (let i = period - 1; i < data.length; i++) {
        const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        sma.push(sum / period);
    }
    return sma;
}

/**
 * Calculate Exponential Moving Average
 */
function calculateEMA(data, period) {
    const ema = [];
    const multiplier = 2 / (period + 1);

    // First EMA is SMA
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += data[i];
    }
    ema.push(sum / period);

    // Calculate EMA
    for (let i = period; i < data.length; i++) {
        const value = (data[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
        ema.push(value);
    }

    return ema;
}

/**
 * Add indicator to chart
 */
function addIndicator(indicator) {
    if (!currentChartData) return;

    let indicatorData;
    let label;
    let color;

    switch (indicator) {
        case 'sma':
            indicatorData = calculateSMA(currentChartData.values, 20);
            label = 'SMA (20)';
            color = CHART_COLORS.warning;
            break;
        case 'ema':
            indicatorData = calculateEMA(currentChartData.values, 20);
            label = 'EMA (20)';
            color = CHART_COLORS.success;
            break;
        default:
            return;
    }

    // Pad indicator data to match chart data length
    const paddedData = new Array(currentChartData.values.length - indicatorData.length).fill(null).concat(indicatorData);

    // Get current chart instance (use window reference from enhancements.js)
    const chart = window.chartInstances ? window.chartInstances['mainChart'] : null;
    if (!chart) return;

    // Check if indicator already exists
    const existingIndex = chart.data.datasets.findIndex(ds => ds.label === label);

    if (existingIndex >= 0) {
        // Remove indicator
        chart.data.datasets.splice(existingIndex, 1);
    } else {
        // Add indicator
        chart.data.datasets.push({
            label: label,
            data: paddedData,
            borderColor: color,
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0,
            borderDash: [5, 5]
        });
    }

    chart.update();

    // Update toolbar button state
    const btn = document.querySelector(`.toolbar-btn[data-indicator="${indicator}"]`);
    if (btn) {
        btn.classList.toggle('active');
    }

    console.log(`📊 Toggled ${label} indicator`);
}

// ==================== CHART TOOLBAR SETUP ====================

/**
 * Setup chart toolbar event listeners
 */
function setupChartToolbar() {
    // Chart type buttons
    document.querySelectorAll('.toolbar-btn[data-chart]').forEach(btn => {
        btn.addEventListener('click', () => {
            const chartType = btn.dataset.chart;
            switchChartType(chartType);
        });
    });

    // Indicator buttons
    document.querySelectorAll('.toolbar-btn[data-indicator]').forEach(btn => {
        btn.addEventListener('click', () => {
            const indicator = btn.dataset.indicator;
            addIndicator(indicator);
        });
    });
}

// ==================== TIME PERIOD CONTROLS ====================

/**
 * Setup time period buttons
 */
function setupTimePeriodControls() {
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const period = btn.dataset.period;
            updateChartPeriod(period);

            // Update active button
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

/**
 * Update chart data based on time period
 */
function updateChartPeriod(period) {
    let days;

    switch (period) {
        case '1D':
            days = 1;
            break;
        case '1W':
            days = 7;
            break;
        case '1M':
            days = 30;
            break;
        case '3M':
            days = 90;
            break;
        case '1Y':
            days = 365;
            break;
        case 'ALL':
            days = 730; // 2 years
            break;
        default:
            days = 30;
    }

    // Generate new data
    currentChartData = {
        labels: generateDateLabels(days),
        values: generatePortfolioData(days, 100000, 130000)
    };

    // Re-render chart
    switchChartType(currentChartType);

    console.log(`📊 Updated chart to ${period} period`);
}

// ==================== INITIALIZATION ====================

/**
 * Initialize all charts
 */
function initializeCharts() {
    console.log('📊 Initializing charts...');

    // Render main chart
    renderMainChart();

    // Render mini charts
    renderMiniCharts();

    // Setup toolbar
    setupChartToolbar();

    // Setup time period controls
    setupTimePeriodControls();

    console.log('✅ Charts initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCharts);
} else {
    // DOM already loaded, check if Chart.js is available
    if (typeof Chart !== 'undefined') {
        initializeCharts();
    } else {
        console.warn('Chart.js not loaded yet, waiting...');
        window.addEventListener('load', initializeCharts);
    }
}

// Export functions
window.renderMainChart = renderMainChart;
window.renderMiniCharts = renderMiniCharts;
window.switchChartType = switchChartType;
window.addIndicator = addIndicator;
window.calculateSMA = calculateSMA;
window.calculateEMA = calculateEMA;
window.updateChartPeriod = updateChartPeriod;

console.log('📈 Chart.js Integration Module Loaded');
