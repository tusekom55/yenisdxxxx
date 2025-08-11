// Main JavaScript Functions
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    console.log('🚀 GlobalTradePro başlatılıyor...');
    
    // Sidebar navigation
    setupNavigation();
    
    // Mobile menu
    setupMobileMenu();
    
    // Load user data
    loadUserData();
    
    // Setup notifications
    setupNotifications();
    
    console.log('✅ Uygulama başarıyla başlatıldı');
}

// Navigation Functions
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.getAttribute('data-section');
            if (sectionId) {
                showSection(sectionId);
            }
        });
    });
    
    // Show dashboard by default
    showSection('dashboard');
}

function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Update page title
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) {
            const navLink = document.querySelector(`[data-section="${sectionName}"]`);
            if (navLink) {
                pageTitle.textContent = navLink.textContent.trim();
            }
        }
        
        // Load section specific data
        loadSectionData(sectionName);
    }
}

function loadSectionData(sectionName) {
    switch(sectionName) {
        case 'dashboard':
            if (typeof loadDashboardData === 'function') {
                loadDashboardData();
            }
            break;
        case 'portfolio':
            if (typeof initializePortfolio === 'function') {
                initializePortfolio();
            }
            break;
        case 'markets':
            if (typeof loadMarketsData === 'function') {
                loadMarketsData();
            }
            break;
        case 'trading':
            if (typeof initializeTrading === 'function') {
                initializeTrading();
            }
            break;
        case 'deposit':
            if (typeof loadDepositData === 'function') {
                loadDepositData();
            }
            break;
        case 'withdrawal':
            if (typeof loadWithdrawalData === 'function') {
                loadWithdrawalData();
            }
            break;
        case 'profile':
            if (typeof initializeProfile === 'function') {
                initializeProfile();
            }
            break;
        case 'positions':
            if (typeof loadPositionsData === 'function') {
                loadPositionsData();
            }
            break;
    }
}

// Mobile Menu Functions
function setupMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            if (sidebarOverlay) {
                sidebarOverlay.classList.toggle('active');
            }
        });
    }
    
    // Close sidebar when clicking overlay
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function() {
            sidebar.classList.remove('active');
            this.classList.remove('active');
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                sidebar.classList.remove('active');
                if (sidebarOverlay) {
                    sidebarOverlay.classList.remove('active');
                }
            }
        }
    });
}

// User Data Functions
function loadUserData() {
    console.log('👤 Kullanıcı verileri yükleniyor...');
    
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
        console.log('❌ Kullanıcı girişi gerekli');
        window.location.href = 'login.html';
        return;
    }
    
    // Load user data from API
    fetch('backend/auth.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'get_user_data',
            token: token
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('✅ Kullanıcı verileri yüklendi:', data.user);
            updateUserInterface(data);
        } else {
            console.error('❌ Kullanıcı verileri yüklenemedi:', data.message);
            showNotification('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    })
    .catch(err => {
        console.error('❌ API Hatası:', err);
        showNotification('Bağlantı hatası. Lütfen sayfayı yenileyin.', 'error');
    });
}

function updateUserInterface(data) {
    // Update balance display
    const balanceElements = document.querySelectorAll('.balance-display, #totalBalance, #userBalance');
    const balance = data.balance || 0;
    const balanceFormatted = balance.toLocaleString('tr-TR', {minimumFractionDigits: 2});
    
    balanceElements.forEach(element => {
        if (element.id === 'totalBalance') {
            element.innerHTML = `<h1 style="font-size: 2rem; color: #00d4aa;">₺${balanceFormatted}</h1>`;
        } else if (element.id === 'userBalance') {
            element.innerHTML = `<i class="fas fa-coins"></i> ₺${balanceFormatted}`;
        } else {
            element.innerHTML = `<i class="fas fa-coins"></i> ₺${balanceFormatted}`;
        }
    });
    
    // Update profile information
    updateProfileInfo(data.user);
    
    // Load transaction history
    if (typeof loadTransactionHistory === 'function') {
        loadTransactionHistory();
    }
}

function updateProfileInfo(user) {
    // Update profile elements
    const profileElements = {
        'profileUsername': user.username || 'Kullanıcı',
        'profileBalanceAmount': `₺${(user.balance || 0).toLocaleString('tr-TR', {minimumFractionDigits: 2})}`,
        'profileJoinDate': formatJoinDate(user.created_at)
    };
    
    Object.keys(profileElements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = profileElements[id];
        }
    });
}

function formatJoinDate(dateString) {
    if (!dateString) return 'Ocak 2024';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long'
    });
}

// Dashboard Functions
function loadDashboardData() {
    console.log('📊 Dashboard verileri yükleniyor...');
    
    // Simulate dashboard data loading
    setTimeout(() => {
        // Update dashboard stats
        updateDashboardStats();
        
        // Load recent activities
        if (typeof loadTransactionHistory === 'function') {
            loadTransactionHistory();
        }
    }, 1000);
}

function updateDashboardStats() {
    // Update daily PnL
    const dailyPnlElement = document.getElementById('dailyPnl');
    if (dailyPnlElement) {
        dailyPnlElement.innerHTML = `<h2 style="color: #00d4aa;">+₺156.24</h2><small style="color: #8b8fa3;">+2.34%</small>`;
    }
    
    // Update open positions
    const openPositionsElement = document.getElementById('openPositions');
    if (openPositionsElement) {
        openPositionsElement.innerHTML = `<h2 style="color: #ffffff;">3</h2><small style="color: #8b8fa3;">Aktif pozisyon</small>`;
    }
    
    // Update total trades
    const totalTradesElement = document.getElementById('totalTrades');
    if (totalTradesElement) {
        totalTradesElement.innerHTML = `<h2 style="color: #ffffff;">12</h2><small style="color: #8b8fa3;">Toplam işlem</small>`;
    }
}

// Notification System
function setupNotifications() {
    // Create notification container if it doesn't exist
    if (!document.getElementById('notification-container')) {
        const notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        `;
        document.body.appendChild(notificationContainer);
    }
}

function showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    
    const icon = document.createElement('i');
    icon.className = `fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}`;
    
    const text = document.createElement('span');
    text.textContent = message;
    
    notification.appendChild(icon);
    notification.appendChild(text);
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// Utility Functions
function formatCurrency(amount, currency = '₺') {
    return `${currency}${amount.toLocaleString('tr-TR', {minimumFractionDigits: 2})}`;
}

function formatNumber(num) {
    return num.toLocaleString('tr-TR');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Logout Function
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = 'login.html';
}

// Export functions for use in other modules
window.showSection = showSection;
window.showNotification = showNotification;
window.formatCurrency = formatCurrency;
window.formatNumber = formatNumber;
window.formatDate = formatDate;
window.logout = logout;
window.loadDashboardData = loadDashboardData;
