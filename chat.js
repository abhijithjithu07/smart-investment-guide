// --- AI INVESTMENT PLANNER LOGIC ---

// Chat State
let chatState = {
    step: 0, // 0: Welcome, 1: Income, 2: Risk, 3: Goal, 4: Rec, 5: Post-Rec
    income: null,
    risk: null,
    goal: null,
    history: []
};

// DOM Elements
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Determine if we should show the welcome message automatically
    // For now, we'll just show it if the chat box is empty
    if (chatBox && chatBox.children.length <= 1) { // 1 because of the static HTML message
        // Clear static HTML message to avoid duplication or keep it if it's the welcome
        // actually the static HTML has a welcome message. Let's just reset state.
        // We can leave the static greeting or replace it.
        // Let's replace/reset to be sure.
        chatBox.innerHTML = '';
        addBotMessage("Hello! I am your AI Investment Planner. I can help you create a personalized investment strategy. To get started, may I ask for your monthly income?");
        chatState.step = 1;
    }
});


// --- CORE CHAT FUNCTIONS ---

function handleChat(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // 1. Add User Message
    addUserMessage(text);
    userInput.value = '';

    // 2. Process User Input based on State
    processInput(text);
}

function addUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'message user-message';
    div.textContent = text;
    chatBox.appendChild(div);
    scrollToBottom();
}

function addBotMessage(text, isHTML = false) {
    const div = document.createElement('div');
    div.className = 'message bot-message';
    if (isHTML) {
        div.innerHTML = text;
    } else {
        div.textContent = text;
    }
    chatBox.appendChild(div);
    scrollToBottom();
}

function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

// --- STATE MACHINE & LOGIC ---

function processInput(input) {
    // Delay slightly to simulate "thinking"
    setTimeout(() => {

        // GLOBAL COMMANDS
        if (input.toLowerCase() === 'reset' || input.toLowerCase() === 'restart') {
            chatState.step = 0;
            chatState.income = null;
            chatState.risk = null;
            chatState.goal = null;
            chatBox.innerHTML = '';
            addBotMessage("Restarting... Hello! I am your AI Investment Planner. To get started, what is your monthly income?");
            chatState.step = 1;
            return;
        }

        switch (chatState.step) {
            case 1: // INCOME INPUT
                const income = parseFloat(input.replace(/[^0-9.]/g, ''));
                if (isNaN(income) || income <= 0) {
                    addBotMessage("Please enter a valid monthly income number (e.g., 25000).");
                } else {
                    chatState.income = income;
                    chatState.step = 2;
                    addBotMessage(`Got it. Your monthly income is ₹${income}.`);
                    askRiskLevel();
                }
                break;

            case 2: // RISK INPUT (Handled mostly by buttons, but fallback for text)
                const risk = matchRisk(input);
                if (risk) {
                    chatState.risk = risk;
                    chatState.step = 3;
                    addBotMessage(`You selected: ${risk.charAt(0).toUpperCase() + risk.slice(1)} Risk.`);
                    askGoal();
                } else {
                    addBotMessage("Please select a risk level: Low, Medium, or High. You can type it or click the buttons above.");
                    // Re-show buttons
                    showClickableOptions([
                        { text: "Low (Safe)", value: "low" },
                        { text: "Medium (Balanced)", value: "medium" },
                        { text: "High (Aggressive)", value: "high" }
                    ], handleRiskClick);
                }
                break;

            case 3: // GOAL INPUT
                const goal = matchGoal(input);
                if (goal) {
                    chatState.goal = goal;
                    chatState.step = 4;
                    generateRecommendation();
                } else {
                    addBotMessage("Please select a goal: Short-term, Long-term, or Emergency.");
                    showClickableOptions([
                        { text: "Short Term (1-3 yrs)", value: "short" },
                        { text: "Long Term (5+ yrs)", value: "long" },
                        { text: "Emergency Fund", value: "emergency" }
                    ], handleGoalClick);
                }
                break;

            case 4: // RECOMMENDATION SHOWN - Handling Follow-ups
            case 5:
                if (input.toLowerCase().includes('concept') || input.toLowerCase().includes('understand')) {
                    showConcepts();
                } else if (input.toLowerCase().includes('project') || input.toLowerCase().includes('grow') || input.toLowerCase().includes('future')) {
                    showProjection();
                } else if (input.toLowerCase().includes('invest') && input.toLowerCase().includes('how')) {
                    addBotMessage("To start investing, go to the 'Dashboard' section, choose the recommended category, and click 'Explore'.");
                } else {
                    addBotMessage("You can ask me to 'explain concepts', 'show projection', or 'restart'.");
                }
                break;

            default:
                addBotMessage("I'm not sure what you mean. Type 'reset' to start over.");
        }

    }, 600);
}


// --- HELPER FUNCTIONS ---

function askRiskLevel() {
    addBotMessage("How much risk are you willing to take?");
    showClickableOptions([
        { text: "Low Risk (Safe)", value: "low" },
        { text: "Medium Risk (Balanced)", value: "medium" },
        { text: "High Risk (Aggressive)", value: "high" }
    ], handleRiskClick);
}

function handleRiskClick(value) {
    // Simulate user typing the choice
    addUserMessage(value.charAt(0).toUpperCase() + value.slice(1) + " Risk");
    chatState.risk = value;
    chatState.step = 3;
    askGoal();
}

function askGoal() {
    addBotMessage("What is your primary goal for this investment?");
    showClickableOptions([
        { text: "Short Term (1-3 yrs)", value: "short" },
        { text: "Long Term (5+ yrs)", value: "long" },
        { text: "Emergency Safety", value: "emergency" }
    ], handleGoalClick);
}

function handleGoalClick(value) {
    const label = value === 'short' ? "Short Term" : value === 'long' ? "Long Term" : "Emergency Safety";
    addUserMessage(label);
    chatState.goal = value;
    chatState.step = 4;
    generateRecommendation();
}

function generateRecommendation() {
    addBotMessage("Analyzing your profile... 🤖");

    setTimeout(() => {
        const { income, risk, goal } = chatState;
        const rec = getLogicOps(income, risk, goal);

        const logicMsg = `
            <strong>Recommendation: ${rec.category}</strong><br><br>
            Expected Return: ${rec.returns}<br>
            Risk Level: ${rec.riskLevel}<br><br>
            <em>${rec.reason}</em>
        `;
        addBotMessage(logicMsg, true);

        // Transition to next state options
        chatState.step = 5;
        setTimeout(() => {
            addBotMessage("Would you like to understand common concepts or see a growth projection?");
            showClickableOptions([
                { text: "Explain Concepts", value: "concepts" },
                { text: "Show Projection", value: "projection" },
                { text: "Start New Plan", value: "reset" }
            ], (val) => {
                if (val === 'concepts') showConcepts();
                if (val === 'projection') showProjection();
                if (val === 'reset') processInput('reset');
            });
        }, 800);

    }, 1500);
}

function getLogicOps(income, risk, goal) {
    // Same logic as robo-advisor but decoupled
    if (goal === 'emergency') {
        return {
            category: "Liquid Funds / FDs",
            returns: "6-7%",
            riskLevel: "Low",
            reason: "For emergency funds, immediate access and safety are more important than high returns."
        };
    }

    if (goal === 'short') {
        if (risk === 'high') return { category: "Debt Mutual Funds", returns: "7-9%", riskLevel: "Medium", reason: "Short term goals shouldn't be exposed to high stock market volatility, but debt funds offer better returns than FDs." };
        return { category: "Fixed Deposits (FD)", returns: "6.5-7.5%", riskLevel: "Low", reason: "For short durations with low risk, FDs provide guaranteed returns and peace of mind." };
    }

    if (goal === 'long') {
        if (risk === 'high') return { category: "Index Funds / Small Cap", returns: "12-15%", riskLevel: "High", reason: "Long time horizons allow you to ride out market volatility for maximum growth." };
        if (risk === 'medium') return { category: "Flexi-Cap Funds", returns: "10-12%", riskLevel: "Medium-High", reason: "Balances growth and stability by investing in companies of all sizes." };
        return { category: "Hybrid Funds", returns: "8-10%", riskLevel: "Low-Medium", reason: "A mix of stocks and bonds to give you growth without too much risk." };
    }

    return { category: "Balanced Funds", returns: "9-11%", riskLevel: "Medium", reason: "A standard balanced choice." };
}

function showConcepts() {
    const concepts = `
        <strong>Investment Concepts:</strong><br>
        <ul>
            <li><b>Stocks:</b> Owning a small part of a company.</li>
            <li><b>Mutual Funds:</b> A pool of money from many investors managed by an expert.</li>
            <li><b>FD:</b> Fixed Deposit. You give money to a bank for a fixed time and get fixed interest.</li>
            <li><b>SIP:</b> Systematic Investment Plan. Investing a small fixed amount every month.</li>
        </ul>
     `;
    addBotMessage(concepts, true);
}

function showProjection() {
    const { income, risk, goal } = chatState;
    // Simple rule of thumb: save 20% of income
    const monthlyInvestment = Math.round(income * 0.2);
    const rec = getLogicOps(income, risk, goal);

    // Extract return number (avg)
    // "12-15%" -> 13.5
    const returnStr = rec.returns.replace('%', '').split('-');
    let rate = 8;
    if (returnStr.length === 2) {
        rate = (parseFloat(returnStr[0]) + parseFloat(returnStr[1])) / 2;
    } else {
        rate = parseFloat(returnStr[0]);
    }

    // 5 Year SIP Formula: P * ({[1 + i]^n - 1} / i) * (1 + i)
    // where i = rate/1200, n = months
    const i = rate / 1200;
    const n = 60; // 5 years
    const futureValue = monthlyInvestment * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);

    const msg = `
        <strong>Growth Projection (5 Years):</strong><br>
        If you invest <b>₹${monthlyInvestment}</b>/month (20% of income) in ${rec.category} at ~${rate}% annual return:<br><br>
        Invested: ₹${(monthlyInvestment * 60).toLocaleString()}<br>
        <strong>Estimated Value: ₹${Math.round(futureValue).toLocaleString()}</strong><br><br>
        <small>Note: This is just an estimation. Market returns vary.</small>
    `;
    addBotMessage(msg, true);
}


// --- UTILS ---

function matchRisk(input) {
    const lower = input.toLowerCase();
    if (lower.includes('low') || lower.includes('safe')) return 'low';
    if (lower.includes('med') || lower.includes('bal')) return 'medium';
    if (lower.includes('high') || lower.includes('agg')) return 'high';
    return null;
}

function matchGoal(input) {
    const lower = input.toLowerCase();
    if (lower.includes('short')) return 'short';
    if (lower.includes('long') || lower.includes('retire') || lower.includes('wealth')) return 'long';
    if (lower.includes('emerg') || lower.includes('safe')) return 'emergency';
    return null;
}

function showClickableOptions(options, callback) {
    const div = document.createElement('div');
    div.className = 'chat-options';

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'chat-option-btn';
        btn.textContent = opt.text;
        btn.onclick = () => {
            // Remove options after click to prevent re-clicking old options
            div.remove();
            callback(opt.value);
        };
        div.appendChild(btn);
    });

    chatBox.appendChild(div);
    scrollToBottom();
}
