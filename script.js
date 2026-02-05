// --- ORIGINAL ADVISOR LOGIC ---
// State to hold user answers
let userState = {
    income: null,
    risk: null,
    goal: null
};

// Next Step Navigation
function nextStep(currentStep) {
    const currentStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);

    // Check for Radio Inputs (Steps 2 & 3)
    const radios = currentStepEl.querySelectorAll('input[type="radio"]');
    if (radios.length > 0) {
        let selected = false;
        radios.forEach(input => {
            if (input.checked) {
                selected = true;
                userState[input.name] = input.value;
            }
        });

        if (!selected) {
            alert("Please select an option to continue.");
            return;
        }
    }
    // Check for Number Input (Step 1 - Income)
    else {
        const numberInput = currentStepEl.querySelector('input[type="number"]');
        if (numberInput) {
            if (!numberInput.value) {
                alert("Please enter your income.");
                return;
            }
            const val = parseFloat(numberInput.value);
            // Categorize Income Logic
            if (val < 20000) userState.income = 'low';
            else if (val <= 50000) userState.income = 'medium';
            else userState.income = 'high';
        }
    }

    // Scroll to top of card
    const advisorCard = document.querySelector('.advisor-card');
    if (advisorCard) advisorCard.scrollIntoView({ behavior: 'smooth' });

    // Transition
    document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.remove('active');

    const nextStepNum = currentStep + 1;
    document.querySelector(`.form-step[data-step="${nextStepNum}"]`).classList.add('active');

    // Update indicator
    const indicator = document.getElementById('current-step');
    if (indicator) indicator.textContent = nextStepNum;
}

// Previous Step Navigation
function prevStep(currentStep) {
    document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.remove('active');
    const prevStepNum = currentStep - 1;
    document.querySelector(`.form-step[data-step="${prevStepNum}"]`).classList.add('active');
    document.getElementById('current-step').textContent = prevStepNum;
}

// Logic Engine ("Brain")
function getRecommendation(income, risk, goal) {
    // Default fallback
    let rec = {
        title: "Balanced Mutual Funds",
        description: "A balanced mix of equity and debt funds. This provides a safety net while still allowing your money to grow over time.",
        riskLevel: "Medium",
        expectedReturn: "8-10%",
        icon: "⚖️"
    };

    // --- LOGIC RULES --- //

    // 1. Emergency Goal -> Safety First (Overrides everything)
    if (goal === 'emergency') {
        return {
            title: "Liquid Funds & Fixed Deposits",
            description: "For an emergency fund, safety and liquidity are key. Do not lock this money in risky assets. Liquid funds offer better returns than a savings account but are just as accessible.",
            riskLevel: "Low",
            expectedReturn: "6-7%",
            icon: "🚑"
        };
    }

    // 2. Short Term Goal -> Avoid High Risk
    if (goal === 'short') {
        if (risk === 'high') {
            return {
                title: "Short-Duration Debt Funds",
                description: "Since your goal is short-term (1-3 years), taking high risk is dangerous. We recommend Debt Mutual Funds which are safer than stocks but give better returns than FDs.",
                riskLevel: "Low-Medium",
                expectedReturn: "7-9%",
                icon: "📉"
            };
        } else {
            return {
                title: "Fixed Deposits or RDs",
                description: "For short-term goals with low risk appetite, stick to the basics. FDs and Recurring Deposits guarantee your capital is safe when you need it.",
                riskLevel: "Zero/Low",
                expectedReturn: "6-7.5%",
                icon: "🏦"
            };
        }
    }

    // 3. Long Term Logic
    if (goal === 'long') {
        // High Risk + Long Term (The Aggressive Growth Path)
        if (risk === 'high') {
            return {
                title: "Nifty 50 Index Funds / Mid-Cap Funds",
                description: "You have a high risk appetite and a long time horizon. Invest in pure Equity Mutual Funds (Index or Mid-cap). These can be volatile but have the best potential for wealth creation.",
                riskLevel: "High",
                expectedReturn: "12-15%",
                icon: "🚀"
            };
        }

        // Medium Risk + Long Term (The Balancer)
        if (risk === 'medium') {
            return {
                title: "Flexi-Cap Mutual Funds",
                description: "Flexi-cap funds invest in companies of all sizes. They balance risk and reward perfectly for a long-term investor like you.",
                riskLevel: "Medium-High",
                expectedReturn: "10-12%",
                icon: "📈"
            };
        }

        // Low Risk + Long Term (The Conservative Grower)
        if (risk === 'low') {
            return {
                title: "Conservative Hybrid Funds",
                description: "Even for long term, you prefer safety. Hybrid funds invest mostly in debt (safe) but keep a small portion in stocks (growth) to beat inflation.",
                riskLevel: "Low-Medium",
                expectedReturn: "8-10%",
                icon: "🛡️"
            };
        }
    }

    return rec;
}

// Calculate and Display Result
function calculateResult() {
    // Get last input
    const currentStepEl = document.querySelector(`.form-step[data-step="3"]`);
    const inputs = currentStepEl.querySelectorAll('input[type="radio"]');

    let selected = false;
    inputs.forEach(input => {
        if (input.checked) {
            selected = true;
            userState[input.name] = input.value;
        }
    });

    if (!selected) {
        alert("Please select an option to finish.");
        return;
    }

    // Run Logic
    const recommendation = getRecommendation(userState.income, userState.risk, userState.goal);

    // Update UI
    document.getElementById('rec-title').textContent = recommendation.title;
    document.getElementById('rec-desc').textContent = recommendation.description;
    document.getElementById('rec-risk').textContent = recommendation.riskLevel;
    document.getElementById('rec-return').textContent = recommendation.expectedReturn;
    document.getElementById('rec-icon').textContent = recommendation.icon;

    // Hide Form, Show Result
    document.getElementById('advisor-form').classList.add('hidden');
    document.getElementById('advisor-result').classList.remove('hidden');
}

// Reset Flow
function resetAdvisor() {
    // Reset inputs
    document.getElementById('investment-form').reset();
    userState = { income: null, risk: null, goal: null };

    // Reset Steps
    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
    document.querySelector('.form-step[data-step="1"]').classList.add('active');
    document.getElementById('current-step').textContent = '1';

    // Show Form
    document.getElementById('advisor-result').classList.add('hidden');
    document.getElementById('advisor-form').classList.remove('hidden');
}


// --- NEW DASHBOARD & DETAIL LOGIC ---
let currentDetailType = null;
let myPortfolio = []; // Mock database

// Section Switcher
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(el => el.classList.remove('active'));
    // Remove active from nav items
    document.querySelectorAll('.side-nav li').forEach(el => el.classList.remove('active'));

    // Show target section
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');

    // Highlight nav item logic (simplified)
    const navItems = document.querySelectorAll('.side-nav li');
    if (sectionId === 'dashboard' || sectionId === 'details-view') {
        if (navItems[0]) navItems[0].classList.add('active');
    }
    else if (sectionId === 'chat') {
        if (navItems[1]) navItems[1].classList.add('active');
    }
    else if (sectionId === 'portfolio') {
        if (navItems[2]) navItems[2].classList.add('active');
    }
    else if (sectionId === 'settings') {
        if (navItems[3]) navItems[3].classList.add('active');
    }
}

// Data for Explore Details
const detailsData = {
    'stocks': { title: 'Stock Market', icon: '📈', risk: 'High Risk', desc: 'Stocks represent partial ownership in a company.', returns: '12-15%', min: '₹100', lock: 'None' },
    'funds': { title: 'Mutual Funds', icon: '🥧', risk: 'Medium Risk', desc: 'A pool of money managed by professionals.', returns: '10-12%', min: '₹500', lock: 'None' },
    'fd': { title: 'Fixed Deposits', icon: '🛡️', risk: 'Low Risk', desc: 'Safe investment with banks.', returns: '6-7.5%', min: '₹1,000', lock: '1-5 Years' },
    'crypto': { title: 'Cryptocurrency', icon: '⚡', risk: 'Very High Risk', desc: 'Volatile digital assets.', returns: 'Volatile', min: '₹100', lock: 'None' },
    'eco': { title: 'Green Bonds', icon: '🌱', risk: 'Low-Medium Risk', desc: 'Invest in eco-friendly projects.', returns: '7-9%', min: '₹10,000', lock: '3-5 Years' },
    'gold': { title: 'Digital Gold', icon: '🥇', risk: 'Low Risk', desc: 'Digital way to invest in gold.', returns: '8-10%', min: '₹1', lock: 'None' }
};

function openDetail(type) {
    const data = detailsData[type];
    if (!data) return;

    currentDetailType = type; // Track what is open
    document.getElementById('detail-title').textContent = data.title;
    document.getElementById('detail-icon').textContent = data.icon;
    document.getElementById('detail-risk').textContent = data.risk;
    document.getElementById('detail-desc').textContent = data.desc;
    document.getElementById('detail-return').textContent = data.returns;
    document.getElementById('detail-min').textContent = data.min;
    document.getElementById('detail-lock').textContent = data.lock;

    showSection('details-view');
}

// --- PORTFOLIO LOGIC ---

function startInvesting() {
    if (!currentDetailType) return;

    // Simulate adding to portfolio
    const investData = detailsData[currentDetailType];

    // Get Amount
    const amountInput = document.getElementById('invest-amount');
    const amount = parseFloat(amountInput.value);

    // Parse Min Amount (remove non-numeric chars)
    const minVal = parseFloat(investData.min.replace(/[^0-9.]/g, '')) || 0;

    // Validate
    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid investment amount.");
        return;
    }
    if (amount < minVal) {
        alert(`Minimum investment for this option is ${investData.min}`);
        return;
    }

    // Check if already in portfolio
    const exists = myPortfolio.find(item => item.id === currentDetailType);
    if (exists) {
        // If exists, maybe we just add to the amount? For now, simple alert as before.
        alert("You are already invested in " + investData.title + "! We will add to your existing investment.");
        exists.investedAmount += amount;
        exists.currentValue += amount; // Simplified immediate value add
        updatePortfolioUI();
        showSection('portfolio');
        return;
    }

    // Add to list
    myPortfolio.push({
        id: currentDetailType,
        ...investData,
        investedAmount: amount,
        currentValue: amount // Initial value is same as invested
    });

    updatePortfolioUI();

    // Confirm and Switch
    if (confirm(`Successfully invested ₹${amount} in ${investData.title}! Go to Portfolio?`)) {
        showSection('portfolio');
    }
}

// Add Animation Listeners to Dash Cards
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.method-card');
    cards.forEach(card => {
        card.addEventListener('click', function () {
            // Remove class checks to allow re-triggering if needed, though simple add/remove is fine
            this.classList.remove('card-clicked');
            void this.offsetWidth; // Trigger reflow
            this.classList.add('card-clicked');
        });
    });
});

function updatePortfolioUI() {
    const portfolioContainer = document.getElementById('portfolio');

    if (myPortfolio.length === 0) {
        // Keep empty state if empty
        return; // HTML Default is empty state
    }

    // Build Table/Cards string
    let html = `
        <header class="top-bar">
            <h1>My Portfolio</h1>
            <p>Total Investment: ₹${myPortfolio.length * 5000}</p>
        </header>
        <div class="portfolio-grid">
    `;

    myPortfolio.forEach(item => {
        html += `
            <div class="method-card portfolio-item">
                <div class="card-icon" style="background:#eef2ff">${item.icon}</div>
                <div>
                   <h3>${item.title}</h3>
                   <p style="color:green; font-weight:bold">+4% Returns</p>
                </div>
                <div style="text-align:right">
                   <h3>₹${item.currentValue}</h3>
                   <p class="text-muted">Inv: ₹${item.investedAmount}</p>
                </div>
            </div>
        `;
    });

    html += `</div>`;

    portfolioContainer.innerHTML = html;
}

// Dark Mode Logic
const darkModeToggle = document.getElementById('dark-mode-toggle');
if (darkModeToggle) {
    darkModeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode');
    });
}

// Mobile Sidebar Toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');

    // Close sidebar when clicking a link on mobile
    if (window.innerWidth <= 768) {
        const links = sidebar.querySelectorAll('li, button');
        links.forEach(link => {
            link.addEventListener('click', () => {
                sidebar.classList.remove('open');
            }, { once: true });
        });
    }
}

// --- INTRO SCREEN LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    // Check if intro has already been shown in this session (Optional - currently disabled to always show as "Video")
    // if (sessionStorage.getItem('introShown')) {
    //     document.getElementById('intro-screen').style.display = 'none';
    //     return;
    // }

    // Auto-skip after 5.5 seconds (matches animation times)
    setTimeout(() => {
        skipIntro();
    }, 5500);
});

function skipIntro() {
    const intro = document.getElementById('intro-screen');
    if (!intro) return;

    intro.classList.add('fade-out');

    // Remove from DOM after fade out to prevent interaction
    setTimeout(() => {
        intro.style.display = 'none';
    }, 800); // Matches CSS transition time

    // Mark as shown
    sessionStorage.setItem('introShown', 'true');
}