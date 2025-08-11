// Profile Management Functions

// Initialize Profile
function initializeProfile() {
    console.log('👤 Profile modülü başlatılıyor...');
    loadProfileData();
    setupProfileEventListeners();
}

// Setup Profile Event Listeners
function setupProfileEventListeners() {
    // Edit profile button
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-profile-btn')) {
            editProfileInfo();
        }
        
        if (e.target.classList.contains('save-profile-btn')) {
            saveProfileInfo();
        }
        
        if (e.target.classList.contains('cancel-edit-btn')) {
            cancelProfileEdit();
        }
    });
}

// Load Profile Data
async function loadProfileData() {
    try {
        const userData = await getUserData();
        displayProfileInfo(userData.user);
        displayBalanceInfo(userData.balance);
        
    } catch (error) {
        console.error('Profil verileri yüklenemedi:', error);
        handleApiError(error);
    }
}

// Display Profile Info
function displayProfileInfo(user) {
    const profileContainer = document.getElementById('modernUserInfo');
    if (!profileContainer) return;
    
    profileContainer.innerHTML = `
        <div class="profile-info-grid">
            <div class="profile-info-item">
                <div class="info-label">
                    <i class="fas fa-user"></i>
                    <span>Kullanıcı Adı</span>
                </div>
                <div class="info-value" id="profileUsername">${user.username || 'N/A'}</div>
            </div>
            
            <div class="profile-info-item">
                <div class="info-label">
                    <i class="fas fa-envelope"></i>
                    <span>E-posta</span>
                </div>
                <div class="info-value" id="profileEmail">${user.email || 'N/A'}</div>
            </div>
            
            <div class="profile-info-item">
                <div class="info-label">
                    <i class="fas fa-id-card"></i>
                    <span>Ad Soyad</span>
                </div>
                <div class="info-value" id="profileFullName">${user.ad_soyad || 'Belirtilmemiş'}</div>
            </div>
            
            <div class="profile-info-item">
                <div class="info-label">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Kayıt Tarihi</span>
                </div>
                <div class="info-value" id="profileJoinDate">${formatDate(user.created_at)}</div>
            </div>
            
            <div class="profile-info-item">
                <div class="info-label">
                    <i class="fas fa-clock"></i>
                    <span>Son Giriş</span>
                </div>
                <div class="info-value" id="profileLastLogin">${user.son_giris ? formatDate(user.son_giris) : 'İlk giriş'}</div>
            </div>
            
            <div class="profile-info-item">
                <div class="info-label">
                    <i class="fas fa-shield-alt"></i>
                    <span>Hesap Tipi</span>
                </div>
                <div class="info-value" id="profileAccountType">${user.role === 'admin' ? 'Yönetici' : 'Standart Kullanıcı'}</div>
            </div>
        </div>
    `;
}

// Display Balance Info
function displayBalanceInfo(balance) {
    const balanceElements = {
        'profileBalanceAmount': balance,
        'modernPortfolioValue': balance,
        'modernProfitLoss': calculateProfitLoss(balance)
    };
    
    Object.keys(balanceElements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (id === 'modernProfitLoss') {
                element.textContent = formatCurrency(balanceElements[id]);
            } else {
                element.textContent = formatCurrency(balance);
            }
        }
    });
}

// Calculate Profit Loss (simplified)
function calculateProfitLoss(balance) {
    // This would normally come from actual trading data
    // For now, we'll simulate some profit
    return balance * 0.05; // 5% profit simulation
}

// Edit Profile Info
function editProfileInfo() {
    const profileContainer = document.getElementById('modernUserInfo');
    if (!profileContainer) return;
    
    // Get current values
    const username = document.getElementById('profileUsername')?.textContent || '';
    const email = document.getElementById('profileEmail')?.textContent || '';
    const fullName = document.getElementById('profileFullName')?.textContent || '';
    
    profileContainer.innerHTML = `
        <div class="profile-edit-form">
            <div class="form-group">
                <label for="editUsername">Kullanıcı Adı</label>
                <input type="text" id="editUsername" value="${username}" class="form-input">
            </div>
            
            <div class="form-group">
                <label for="editEmail">E-posta</label>
                <input type="email" id="editEmail" value="${email}" class="form-input">
            </div>
            
            <div class="form-group">
                <label for="editFullName">Ad Soyad</label>
                <input type="text" id="editFullName" value="${fullName}" class="form-input">
            </div>
            
            <div class="form-actions">
                <button class="btn btn-primary save-profile-btn">
                    <i class="fas fa-save"></i> Kaydet
                </button>
                <button class="btn btn-secondary cancel-edit-btn">
                    <i class="fas fa-times"></i> İptal
                </button>
            </div>
        </div>
    `;
}

// Save Profile Info
async function saveProfileInfo() {
    try {
        const username = document.getElementById('editUsername')?.value;
        const email = document.getElementById('editEmail')?.value;
        const fullName = document.getElementById('editFullName')?.value;
        
        if (!username || !email) {
            showNotification('Kullanıcı adı ve e-posta zorunludur', 'warning');
            return;
        }
        
        const profileData = {
            username: username,
            email: email,
            ad_soyad: fullName
        };
        
        const result = await updateUserProfile(profileData);
        
        if (result.success) {
            showNotification('Profil başarıyla güncellendi', 'success');
            loadProfileData(); // Reload profile data
        } else {
            showNotification(result.message || 'Profil güncellenemedi', 'error');
        }
        
    } catch (error) {
        console.error('Profil güncelleme hatası:', error);
        handleApiError(error);
    }
}

// Cancel Profile Edit
function cancelProfileEdit() {
    loadProfileData(); // Reload original data
}

// Load Transaction History
async function loadTransactionHistory() {
    try {
        const transactions = await getTransactionHistory();
        displayTransactionHistory(transactions);
        
    } catch (error) {
        console.error('İşlem geçmişi yüklenemedi:', error);
        handleApiError(error);
    }
}

// Display Transaction History
function displayTransactionHistory(transactions) {
    const historyContainer = document.getElementById('transactionHistory');
    if (!historyContainer || !transactions.data) return;
    
    if (transactions.data.length === 0) {
        historyContainer.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-history" style="font-size: 48px; color: #8896ab; margin-bottom: 16px;"></i>
                <p>Henüz işlem geçmişi yok</p>
            </div>
        `;
        return;
    }
    
    historyContainer.innerHTML = transactions.data.map(transaction => `
        <div class="transaction-item ${transaction.type}">
            <div class="transaction-icon">
                <i class="fas fa-${getTransactionIcon(transaction.type)}"></i>
            </div>
            <div class="transaction-details">
                <div class="transaction-title">${getTransactionTitle(transaction.type)}</div>
                <div class="transaction-info">
                    ${transaction.symbol ? `${transaction.symbol} - ` : ''}${transaction.description || 'İşlem'}
                </div>
                <div class="transaction-time">${formatDate(transaction.created_at)}</div>
            </div>
            <div class="transaction-amount ${transaction.amount >= 0 ? 'positive' : 'negative'}">
                ${transaction.amount >= 0 ? '+' : ''}₺${parseFloat(transaction.amount).toLocaleString('tr-TR', {minimumFractionDigits: 2})}
            </div>
        </div>
    `).join('');
}

// Get Transaction Icon
function getTransactionIcon(type) {
    const icons = {
        'buy': 'arrow-up',
        'sell': 'arrow-down',
        'deposit': 'plus',
        'withdrawal': 'minus',
        'transfer': 'exchange-alt'
    };
    return icons[type] || 'circle';
}

// Get Transaction Title
function getTransactionTitle(type) {
    const titles = {
        'buy': 'Alım',
        'sell': 'Satım',
        'deposit': 'Para Yatırma',
        'withdrawal': 'Para Çekme',
        'transfer': 'Transfer'
    };
    return titles[type] || 'İşlem';
}

// Export functions
window.initializeProfile = initializeProfile;
window.loadProfileData = loadProfileData;
window.editProfileInfo = editProfileInfo;
window.saveProfileInfo = saveProfileInfo;
window.cancelProfileEdit = cancelProfileEdit;
window.loadTransactionHistory = loadTransactionHistory;
