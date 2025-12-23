// ==================== INVESTMENT CALCULATOR ====================

function calculateInvestment() {
    const initial = parseFloat(document.getElementById('calcInitialInput').value) || 0;
    const monthly = parseFloat(document.getElementById('calcMonthlyInput').value) || 0;
    const returnRate = parseFloat(document.getElementById('calcReturnInput').value) / 100 || 0;
    const years = parseInt(document.getElementById('calcYearsInput').value) || 0;

    const months = years * 12;
    const monthlyRate = returnRate / 12;

    // Calculate future value with compound interest
    let futureValue = initial * Math.pow(1 + monthlyRate, months);

    // Add monthly contributions
    if (monthly > 0) {
        futureValue += monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    }

    const totalInvested = initial + (monthly * months);
    const gains = futureValue - totalInvested;

    // Update UI
    document.getElementById('calcFinalValue').textContent = formatCalculatorCurrency(futureValue);
    document.getElementById('calcTotalInvested').textContent = formatCalculatorCurrency(totalInvested);
    document.getElementById('calcGains').textContent = formatCalculatorCurrency(gains);

    // Render projection chart
    renderProjectionChart(initial, monthly, monthlyRate, months);

    console.log('💰 Investment calculated:', {
        futureValue,
        totalInvested,
        gains,
        roi: ((gains / totalInvested) * 100).toFixed(2) + '%'
    });
}

function renderProjectionChart(initial, monthly, monthlyRate, totalMonths) {
    const container = document.getElementById('calculatorChart');
    if (!container) return;

    const width = container.offsetWidth || 400;
    const height = 200;
    const padding = 30;

    // Generate data points
    const dataPoints = [];
    const investedPoints = [];

    for (let month = 0; month <= totalMonths; month += Math.ceil(totalMonths / 50)) {
        let value = initial * Math.pow(1 + monthlyRate, month);
        if (monthly > 0) {
            value += monthly * ((Math.pow(1 + monthlyRate, month) - 1) / monthlyRate);
        }
        dataPoints.push(value);
        investedPoints.push(initial + (monthly * month));
    }

    const max = Math.max(...dataPoints);
    const min = 0;
    const range = max - min;

    // Create SVG points
    const valuePoints = dataPoints.map((value, index) => {
        const x = padding + (index / (dataPoints.length - 1)) * (width - padding * 2);
        const y = padding + (1 - (value - min) / range) * (height - padding * 2);
        return `${x},${y}`;
    }).join(' ');

    const investedPointsStr = investedPoints.map((value, index) => {
        const x = padding + (index / (investedPoints.length - 1)) * (width - padding * 2);
        const y = padding + (1 - (value - min) / range) * (height - padding * 2);
        return `${x},${y}`;
    }).join(' ');

    container.innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}">
            <defs>
                <linearGradient id="projectionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#43e97b;stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:#43e97b;stop-opacity:0" />
                </linearGradient>
            </defs>
            
            <!-- Invested line (dashed) -->
            <polyline
                fill="none"
                stroke="#718096"
                stroke-width="2"
                stroke-dasharray="5,5"
                points="${investedPointsStr}"
            />
            
            <!-- Value area -->
            <polygon
                fill="url(#projectionGradient)"
                points="${valuePoints} ${width - padding},${height - padding} ${padding},${height - padding}"
            />
            
            <!-- Value line -->
            <polyline
                fill="none"
                stroke="#43e97b"
                stroke-width="3"
                points="${valuePoints}"
                style="filter: drop-shadow(0 0 6px rgba(67, 233, 123, 0.5));"
            />
            
            <!-- Legend -->
            <text x="${padding}" y="20" fill="#43e97b" font-size="11" font-family="Inter" font-weight="600">Valor Proyectado</text>
            <text x="${padding + 120}" y="20" fill="#718096" font-size="11" font-family="Inter">Total Invertido</text>
        </svg>
    `;
}

// ==================== COMPOUND INTEREST SCENARIOS ====================
function calculateScenarios() {
    const initial = 10000;
    const monthly = 500;
    const years = 10;

    const scenarios = [
        { name: 'Conservador', rate: 0.05 },
        { name: 'Moderado', rate: 0.08 },
        { name: 'Agresivo', rate: 0.12 }
    ];

    scenarios.forEach(scenario => {
        const months = years * 12;
        const monthlyRate = scenario.rate / 12;

        let futureValue = initial * Math.pow(1 + monthlyRate, months);
        futureValue += monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

        console.log(`${scenario.name} (${(scenario.rate * 100).toFixed(0)}%):`, formatCalculatorCurrency(futureValue));
    });
}

// ==================== RETIREMENT CALCULATOR ====================
function calculateRetirement(currentAge, retirementAge, monthlyExpenses, currentSavings = 0) {
    const yearsToRetirement = retirementAge - currentAge;
    const yearsInRetirement = 90 - retirementAge; // Assume living to 90
    const inflationRate = 0.03;
    const returnRate = 0.07;

    // Adjust expenses for inflation
    const futureMonthlyExpenses = monthlyExpenses * Math.pow(1 + inflationRate, yearsToRetirement);

    // Calculate needed retirement fund (using 4% rule)
    const annualExpenses = futureMonthlyExpenses * 12;
    const neededFund = annualExpenses * 25; // 4% withdrawal rate

    // Calculate required monthly savings
    const months = yearsToRetirement * 12;
    const monthlyRate = returnRate / 12;

    const futureValueOfCurrent = currentSavings * Math.pow(1 + monthlyRate, months);
    const remainingNeeded = neededFund - futureValueOfCurrent;

    const requiredMonthlySavings = remainingNeeded / ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

    return {
        neededFund,
        futureMonthlyExpenses,
        requiredMonthlySavings,
        yearsToRetirement,
        yearsInRetirement
    };
}

// ==================== LOAN CALCULATOR ====================
function calculateLoan(principal, annualRate, years) {
    const monthlyRate = annualRate / 12 / 100;
    const months = years * 12;

    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);

    const totalPaid = monthlyPayment * months;
    const totalInterest = totalPaid - principal;

    return {
        monthlyPayment,
        totalPaid,
        totalInterest,
        principal
    };
}

// ==================== FIRE CALCULATOR (Financial Independence Retire Early) ====================
function calculateFIRE(annualIncome, annualExpenses, currentSavings, expectedReturn = 0.07) {
    const savingsRate = (annualIncome - annualExpenses) / annualIncome;
    const annualSavings = annualIncome - annualExpenses;

    // Calculate FI number (25x annual expenses)
    const fiNumber = annualExpenses * 25;

    // Calculate years to FI
    const monthlyRate = expectedReturn / 12;
    const monthlySavings = annualSavings / 12;

    let months = 0;
    let balance = currentSavings;

    while (balance < fiNumber && months < 1200) { // Max 100 years
        balance = balance * (1 + monthlyRate) + monthlySavings;
        months++;
    }

    const yearsToFI = months / 12;

    return {
        fiNumber,
        savingsRate: savingsRate * 100,
        yearsToFI,
        currentProgress: (currentSavings / fiNumber) * 100
    };
}

// ==================== DIVIDEND INCOME CALCULATOR ====================
function calculateDividendIncome(investment, dividendYield, growthRate, years) {
    const results = [];
    let currentValue = investment;

    for (let year = 1; year <= years; year++) {
        const dividendIncome = currentValue * (dividendYield / 100);
        currentValue *= (1 + growthRate / 100);

        results.push({
            year,
            portfolioValue: currentValue,
            annualDividend: dividendIncome,
            monthlyDividend: dividendIncome / 12
        });
    }

    return results;
}

// ==================== UTILITY FUNCTIONS ====================
function formatCalculatorCurrency(value, currency = 'EUR') {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

// ==================== AUTO-CALCULATE ON INPUT CHANGE ====================
document.addEventListener('DOMContentLoaded', () => {
    const calcInputs = ['calcInitialInput', 'calcMonthlyInput', 'calcReturnInput', 'calcYearsInput'];

    calcInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', () => {
                // Auto-calculate when inputs change
                if (document.getElementById('calculatorModal').classList.contains('active')) {
                    calculateInvestment();
                }
            });
        }
    });
});

// ==================== EXPORT ====================
window.calculateInvestment = calculateInvestment;
window.calculateRetirement = calculateRetirement;
window.calculateLoan = calculateLoan;
window.calculateFIRE = calculateFIRE;
window.calculateDividendIncome = calculateDividendIncome;
window.calculateScenarios = calculateScenarios;

console.log('🧮 Calculator Module Loaded');
