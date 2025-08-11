// API Functions
const API_BASE_URL = 'backend/';

// API Helper Functions
async function apiCall(endpoint, data = null, method = 'POST') {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include' // Include session cookies
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
    // Check if user has valid session
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Kullanıcı girişi gerekli');
    }

    // Use profile.php endpoint for session-based authentication
    const response = await fetch(API_BASE_URL + 'public/profile.php', {
        method: 'GET',
        credentials: 'include'
    });
    
    if (!response.ok) {
        throw new Error('Oturum süreniz dolmuş');
    }
    
    return await response.json();
}

async function updateUserProfile(userData) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Kullanıcı girişi gerekli');
    }

    return await apiCall('auth.php', {
        action: 'update_profile',
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
        position_id: positionId
    });
}

async function getPositions() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Kullanıcı girişi gerekli');
    }

    return await apiCall('user/trading.php', {
        action: 'get_positions'
    });
}

// Portfolio API Functions
async function getPortfolio() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Kullanıcı girişi gerekli');
    }

    return await apiCall('user/portfolio.php', {
        action: 'get_portfolio'
    });
}

async function getTransactionHistory(page = 1, limit = 20) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Kullanıcı girişi gerekli');
    }

    return await apiCall('user/transaction_history.php', {
        action: 'get_history',
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
        ...depositData
    });
}

async function getDeposits() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Kullanıcı girişi gerekli');
    }

    return await apiCall('user/deposits.php', {
        action: 'get_deposits'
    });
}

async function createWithdrawal(withdrawalData) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Kullanıcı girişi gerekli');
    }

    return await apiCall('user/withdrawals.php', {
        action: 'create_withdrawal',
        ...withdrawalData
    });
}

async function getWithdrawals() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Kullanıcı girişi gerekli');
    }

    return await apiCall('user/withdrawals.php', {
        action: 'get_withdrawals'
    });
}

// Error Handler
function handleApiError(error) {
    console.error('API Hatası:', error);
    
    if (error.message === 'Kullanıcı girişi gerekli' || error.message === 'Oturum süreniz dolmuş') {
        // Clear invalid authentication data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
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
