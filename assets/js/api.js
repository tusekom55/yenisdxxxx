// ===== API MODULE =====

// API Base Configuration
const API_CONFIG = {
    baseURL: 'backend/',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
};

// API Endpoints
const API_ENDPOINTS = {
    // Authentication
    login: 'public/login.php',
    logout: 'public/logout.php',
    register: 'public/register.php',
    profile: 'public/profile.php',
    
    // User Operations
    coins: 'user/coins.php',
    trading: 'user/trading.php',
    deposits: 'user/deposits.php',
    withdrawals: 'user/withdrawals.php',
    portfolio: 'user/portfolio.php',
    transactionHistory: 'user/transaction_history.php',
    leverageTrading: 'user/leverage_trading.php',
    candlestick: 'user/candlestick.php',
    
    // Admin Operations
    adminCoins: 'admin/coins.php',
    adminUsers: 'admin/users.php',
    adminDeposits: 'admin/deposits.php',
    adminWithdrawals: 'admin/withdrawals.php',
    adminSettings: 'admin/settings.php'
};

// ===== API HELPER FUNCTIONS =====

// Make API Request with retry logic
async function makeAPIRequest(endpoint, options = {}) {
    const url = API_CONFIG.baseURL + endpoint;
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    for (let attempt = 1; attempt <= API_CONFIG.retryAttempts; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
            
            const response = await fetch(url, {
                ...finalOptions,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.warn(`API Request attempt ${attempt} failed:`, error.message);
            
            if (attempt === API_CONFIG.retryAttempts) {
                throw new Error(`API Request failed after ${API_CONFIG.retryAttempts} attempts: ${error.message}`);
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay * attempt));
        }
    }
}

// GET Request
async function apiGet(endpoint, params = {}) {
    const url = new URL(API_CONFIG.baseURL + endpoint, window.location.origin);
    Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
            url.searchParams.append(key, params[key]);
        }
    });
    
    return makeAPIRequest(url.pathname + url.search, {
        method: 'GET'
    });
}

// POST Request
async function apiPost(endpoint, data = {}) {
    const isFormData = data instanceof FormData;
    
    return makeAPIRequest(endpoint, {
        method: 'POST',
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        body: isFormData ? data : JSON.stringify(data)
    });
}

// PUT Request
async function apiPut(endpoint, data = {}) {
    return makeAPIRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

// DELETE Request
async function apiDelete(endpoint) {
    return makeAPIRequest(endpoint, {
        method: 'DELETE'
    });
}

// ===== SPECIFIC API FUNCTIONS =====

// Authentication APIs
const AuthAPI = {
    async login(username, password) {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        
        return apiPost(API_ENDPOINTS.login, formData);
    },
    
    async logout() {
        return apiPost(API_ENDPOINTS.logout);
    },
    
    async getProfile() {
        return apiGet(API_ENDPOINTS.profile);
    },
    
    async register(userData) {
        const formData = new FormData();
        Object.keys(userData).forEach(key => {
            formData.append(key, userData[key]);
        });
        
        return apiPost(API_ENDPOINTS.register, formData);
    }
};

// Trading APIs
const TradingAPI = {
    async getCoins(params = {}) {
        return apiGet(API_ENDPOINTS.coins, params);
    },
    
    async buyCoin(coinId, amount, price) {
        const formData = new FormData();
        formData.append('coin_id', coinId);
        formData.append('miktar', amount);
        formData.append('fiyat', price);
        
        return apiPost(API_ENDPOINTS.trading + '?action=buy', formData);
    },
    
    async sellCoin(coinId, amount, price) {
        const formData = new FormData();
        formData.append('coin_id', coinId);
        formData.append('miktar', amount);
        formData.append('fiyat', price);
        
        return apiPost(API_ENDPOINTS.trading + '?action=sell', formData);
    },
    
    async getPortfolio() {
        return apiGet(API_ENDPOINTS.trading + '?action=portfolio');
    }
};

// Leverage Trading APIs
const LeverageAPI = {
    async openPosition(data) {
        return apiPost(API_ENDPOINTS.leverageTrading, {
            action: 'open_position',
            ...data
        });
    },
    
    async closePosition(positionId, closePrice) {
        return apiPost(API_ENDPOINTS.leverageTrading, {
            action: 'close_position',
            position_id: positionId,
            close_price: closePrice
        });
    },
    
    async getPositions() {
        return apiGet(API_ENDPOINTS.leverageTrading + '?action=positions');
    },
    
    async getPositionHistory() {
        return apiGet(API_ENDPOINTS.leverageTrading + '?action=history');
    }
};

// Deposit/Withdrawal APIs
const PaymentAPI = {
    async getDeposits() {
        return apiGet(API_ENDPOINTS.deposits);
    },
    
    async createDeposit(amount, method) {
        const formData = new FormData();
        formData.append('amount', amount);
        formData.append('method', method);
        
        return apiPost(API_ENDPOINTS.deposits, formData);
    },
    
    async getWithdrawals() {
        return apiGet(API_ENDPOINTS.withdrawals);
    },
    
    async createWithdrawal(amount, method, details) {
        const formData = new FormData();
        formData.append('amount', amount);
        formData.append('method', method);
        formData.append('details', JSON.stringify(details));
        
        return apiPost(API_ENDPOINTS.withdrawals, formData);
    }
};

// Transaction History APIs
const HistoryAPI = {
    async getTransactions(params = {}) {
        return apiGet(API_ENDPOINTS.transactionHistory, {
            action: 'list',
            ...params
        });
    },
    
    async getTransactionStats() {
        return apiGet(API_ENDPOINTS.transactionHistory, {
            action: 'stats'
        });
    }
};

// Candlestick Chart APIs
const ChartAPI = {
    async getCandlestickData(symbol, interval = '1h', limit = 100) {
        return apiGet(API_ENDPOINTS.candlestick, {
            symbol,
            interval,
            limit
        });
    }
};

// ===== ERROR HANDLING =====
class APIError extends Error {
    constructor(message, status, endpoint) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.endpoint = endpoint;
    }
}

// Global error handler
function handleAPIError(error, context = '') {
    console.error(`API Error ${context}:`, error);
    
    if (error.name === 'APIError') {
        switch (error.status) {
            case 401:
                showNotification('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                break;
            case 403:
                showNotification('Bu işlem için yetkiniz bulunmuyor.', 'error');
                break;
            case 404:
                showNotification('İstenen kaynak bulunamadı.', 'error');
                break;
            case 500:
                showNotification('Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.', 'error');
                break;
            default:
                showNotification(`Hata: ${error.message}`, 'error');
        }
    } else if (error.message.includes('fetch')) {
        showNotification('Bağlantı hatası. İnternet bağlantınızı kontrol edin.', 'error');
    } else {
        showNotification('Beklenmeyen bir hata oluştu.', 'error');
    }
}

// ===== PLACEHOLDER FUNCTIONS FOR MISSING MODULES =====

// Placeholder functions that will be implemented in other modules
async function loadMarkets() {
    const container = document.getElementById('marketsContent');
    if (container) {
        container.innerHTML = `
            <div class="text-center p-4">
                <h3>Piyasalar Modülü</h3>
                <p class="text-muted">Bu modül yakında eklenecek.</p>
                <button class="btn btn-primary" onclick="showNotification('Piyasalar modülü geliştiriliyor...', 'info')">
                    <i class="fas fa-chart-bar"></i> Demo Veriler
                </button>
            </div>
        `;
    }
}

async function loadPortfolio() {
    const container = document.getElementById('portfolioContent');
    if (container) {
        container.innerHTML = `
            <div class="text-center p-4">
                <h3>Portföy Modülü</h3>
                <p class="text-muted">Bu modül yakında eklenecek.</p>
                <button class="btn btn-primary" onclick="showNotification('Portföy modülü geliştiriliyor...', 'info')">
                    <i class="fas fa-briefcase"></i> Demo Veriler
                </button>
            </div>
        `;
    }
}

async function loadTrading() {
    const container = document.getElementById('tradingContent');
    if (container) {
        container.innerHTML = `
            <div class="text-center p-4">
                <h3>Trading Modülü</h3>
                <p class="text-muted">Bu modül yakında eklenecek.</p>
                <button class="btn btn-primary" onclick="showNotification('Trading modülü geliştiriliyor...', 'info')">
                    <i class="fas fa-exchange-alt"></i> Demo Veriler
                </button>
            </div>
        `;
    }
}

async function loadPositions() {
    const container = document.getElementById('positionsContent');
    if (container) {
        container.innerHTML = `
            <div class="text-center p-4">
                <h3>Pozisyonlar Modülü</h3>
                <p class="text-muted">Bu modül yakında eklenecek.</p>
                <button class="btn btn-primary" onclick="showNotification('Pozisyonlar modülü geliştiriliyor...', 'info')">
                    <i class="fas fa-layer-group"></i> Demo Veriler
                </button>
            </div>
        `;
    }
}

async function loadDeposit() {
    const container = document.getElementById('depositContent');
    if (container) {
        container.innerHTML = `
            <div class="text-center p-4">
                <h3>Para Yatırma Modülü</h3>
                <p class="text-muted">Bu modül yakında eklenecek.</p>
                <button class="btn btn-primary" onclick="showNotification('Para yatırma modülü geliştiriliyor...', 'info')">
                    <i class="fas fa-plus-circle"></i> Demo Veriler
                </button>
            </div>
        `;
    }
}

async function loadProfile() {
    const container = document.getElementById('profileContent');
    if (container) {
        container.innerHTML = `
            <div class="text-center p-4">
                <h3>Profil Modülü</h3>
                <p class="text-muted">Bu modül yakında eklenecek.</p>
                <button class="btn btn-primary" onclick="showNotification('Profil modülü geliştiriliyor...', 'info')">
                    <i class="fas fa-user"></i> Demo Veriler
                </button>
            </div>
        `;
    }
}

// ===== EXPORT FUNCTIONS =====
window.AuthAPI = AuthAPI;
window.TradingAPI = TradingAPI;
window.LeverageAPI = LeverageAPI;
window.PaymentAPI = PaymentAPI;
window.HistoryAPI = HistoryAPI;
window.ChartAPI = ChartAPI;
window.handleAPIError = handleAPIError;

// Export placeholder functions
window.loadMarkets = loadMarkets;
window.loadPortfolio = loadPortfolio;
window.loadTrading = loadTrading;
window.loadPositions = loadPositions;
window.loadDeposit = loadDeposit;
window.loadProfile = loadProfile;

console.log('✅ API.js initialized successfully');
