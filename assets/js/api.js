// API Functions
const API_BASE_URL = 'backend/';

// API Helper Functions
async function apiCall(endpoint, data = null, method = 'POST') {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(API_BASE_URL + endpoint, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'API hatası');
        }

        return result;
    } catch (error) {
        console.error('API Hatası:', error);
        throw error;
    }
}

// User API Functions
async function getUserData() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Kullanıcı girişi gerekli');
    }

    return await apiCall('auth.php', {
        action: 'get_user_data',
        token: token
    });
}

async function updateUserProfile(userData) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Kullanıcı girişi gerekli');
    }

    return await apiCall('auth.php', {
        action: 'update_profile',
        token: token,
        ...userData
    });
}

// Trading API Functions
async function getMarkets() {
    return await apiCall('user/coins.php', {
        action: 'get_markets'
    });
}

async function getCoinPrice(symbol) {
    return await apiCall('user/coins.php', {
        action: 'get_price',
        symbol: symbol
    });
}

async function openPosition(tradeData) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Kullanıcı girişi gerekli');
    }

    return await apiCall('user/trading.php', {
        action: 'open_position',
        token: token,
        ...tradeData
    });
}

async function closePosition(positionId) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Kullanıcı girişi gerekli');
    }

    return await apiCall('user/trading.php', {
        action: 'close_position',
        token: token,
        position_id: positionId
    });
}

async function getPositions() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Kullanıcı girişi gerekli');
    }

    return await apiCall('user/trading.php', {
        action: 'get_positions',
        token: token
    });
}

// Portfolio API Functions
async function getPortfolio() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Kullanıcı girişi gerekli');
    }

    return await apiCall('user/portfolio.php', {
        action: 'get_portfolio',
        token: token
    });
}

async function getTransactionHistory(page = 1, limit = 20) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Kullanıcı girişi gerekli');
    }

    return await apiCall('user/transaction_history.php', {
        action: 'get_history',
        token: token,
        page: page,
        limit: limit
    });
}

// Deposit/Withdrawal API Functions
async function createDeposit(depositData) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Kullanıcı girişi gerekli');
    }

    return await apiCall('user/deposits.php', {
        action: 'create_deposit',
        token: token,
        ...depositData
    });
}

async function getDeposits() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Kullanıcı girişi gerekli');
    }

    return await apiCall('user/deposits.php', {
        action: 'get_deposits',
        token: token
    });
}

async function createWithdrawal(withdrawalData) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Kullanıcı girişi gerekli');
    }

    return await apiCall('user/withdrawals.php', {
        action: 'create_withdrawal',
        token: token,
        ...withdrawalData
    });
}

async function getWithdrawals() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Kullanıcı girişi gerekli');
    }

    return await apiCall('user/withdrawals.php', {
        action: 'get_withdrawals',
        token: token
    });
}

// Error Handler
function handleApiError(error) {
    console.error('API Hatası:', error);
    
    if (error.message === 'Kullanıcı girişi gerekli') {
        showNotification('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    } else {
        showNotification(error.message || 'Bir hata oluştu', 'error');
    }
}

// Export functions
window.apiCall = apiCall;
window.getUserData = getUserData;
window.updateUserProfile = updateUserProfile;
window.getMarkets = getMarkets;
window.getCoinPrice = getCoinPrice;
window.openPosition = openPosition;
window.closePosition = closePosition;
window.getPositions = getPositions;
window.getPortfolio = getPortfolio;
window.getTransactionHistory = getTransactionHistory;
window.createDeposit = createDeposit;
window.getDeposits = getDeposits;
window.createWithdrawal = createWithdrawal;
window.getWithdrawals = getWithdrawals;
window.handleApiError = handleApiError;
