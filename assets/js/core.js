// ===== CORE JAVASCRIPT FUNCTIONS =====

// Global variables
let currentSection = 'dashboard';
let isMobile = window.innerWidth <= 768;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Core.js yüklendi');
    
    // Initialize core components
    initializeNavigation();
    initializeSidebar();
    initializeMobileMenu();
    initializeNotifications();
    
    // Window resize handler
    window.addEventListener('resize', handleWindowResize);
});

// ===== NAVIGATION SYSTEM =====
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            switchSection(section);
        });
    });
}

// Switch between sections
async function switchSection(sectionName) {
    console.log(`🔄 Switching to section: ${sectionName}`);
    
    try {
        // Update navigation
        updateActiveNavLink(sectionName);
        
        // Update page title
        updatePageTitle(sectionName);
        
        // Hide all sections
        hideAllSections();
        
        // Show target section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
            currentSection = sectionName;
            
            // Load section content
            await loadSectionContent(sectionName);
            
            // Close mobile menu if open
            if (isMobile) {
                closeMobileMenu();
            }
        }
        
    } catch (error) {
        console.error(`❌ Section switching error: ${error.message}`);
        showNotification('Sayfa yüklenirken hata oluştu', 'error');
    }
}

// Update active navigation link
function updateActiveNavLink(sectionName) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionName) {
            link.classList.add('active');
        }
    });
}

// Update page title
function updatePageTitle(sectionName) {
    const titles = {
        'dashboard': 'Dashboard',
        'markets': 'Piyasalar',
        'portfolio': 'Portföy',
        'trading': 'Trading',
        'positions': 'Pozisyonlar',
        'deposit': 'Para Yatır',
        'profile': 'Profil'
    };
    
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = titles[sectionName] || 'Dashboard';
    }
}

// Hide all content sections
function hideAllSections() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
}

// Load section content dynamically
async function loadSectionContent(sectionName) {
    const contentContainer = document.getElementById(`${sectionName}Content`);
    
    if (!contentContainer) {
        console.warn(`⚠️ Content container not found for section: ${sectionName}`);
        return;
    }
    
    // Show loading state
    contentContainer.innerHTML = `
        <div class="loading-state" style="text-align: center; padding: 3rem;">
            <div class="loading-spinner" style="margin: 0 auto 1rem;"></div>
            <p style="color: #8b8fa3;">Yükleniyor...</p>
        </div>
    `;
    
    try {
        // Load section-specific content
        switch (sectionName) {
            case 'dashboard':
                await loadDashboard();
                break;
            case 'markets':
                await loadMarkets();
                break;
            case 'portfolio':
                await loadPortfolio();
                break;
            case 'trading':
                await loadTrading();
                break;
            case 'positions':
                await loadPositions();
                break;
            case 'deposit':
                await loadDeposit();
                break;
            case 'profile':
                await loadProfile();
                break;
            default:
                contentContainer.innerHTML = `
                    <div class="text-center p-4">
                        <h3>Sayfa bulunamadı</h3>
                        <p class="text-muted">Bu sayfa henüz hazır değil.</p>
                    </div>
                `;
        }
    } catch (error) {
        console.error(`❌ Content loading error for ${sectionName}:`, error);
        contentContainer.innerHTML = `
            <div class="text-center p-4">
                <i class="fas fa-exclamation-triangle text-danger mb-3" style="font-size: 2rem;"></i>
                <h3>Yükleme Hatası</h3>
                <p class="text-muted">İçerik yüklenirken hata oluştu.</p>
                <button class="btn btn-primary" onclick="loadSectionContent('${sectionName}')">
                    <i class="fas fa-redo"></i> Tekrar Dene
                </button>
            </div>
        `;
    }
}

// ===== SIDEBAR FUNCTIONALITY =====
function initializeSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            
            // Save sidebar state
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        });
        
        // Restore sidebar state
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
        }
    }
}

// ===== MOBILE MENU =====
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', function() {
            toggleMobileMenu();
        });
        
        // Create overlay for mobile
        if (!document.querySelector('.sidebar-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            overlay.addEventListener('click', closeMobileMenu);
            document.body.appendChild(overlay);
        }
    }
}

function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('active');
    }
}

function closeMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
    }
}

// ===== WINDOW RESIZE HANDLER =====
function handleWindowResize() {
    const newIsMobile = window.innerWidth <= 768;
    
    if (newIsMobile !== isMobile) {
        isMobile = newIsMobile;
        
        // Close mobile menu when switching to desktop
        if (!isMobile) {
            closeMobileMenu();
        }
    }
}

// ===== NOTIFICATION SYSTEM =====
function initializeNotifications() {
    // Create notification container if it doesn't exist
    if (!document.getElementById('notificationContainer')) {
        const container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
}

// Show notification
function showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
        'success': 'fas fa-check-circle',
        'error': 'fas fa-exclamation-circle',
        'warning': 'fas fa-exclamation-triangle',
        'info': 'fas fa-info-circle'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${icons[type] || icons.info}"></i>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="closeNotification(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add to container
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto remove
    if (duration > 0) {
        setTimeout(() => {
            closeNotification(notification.querySelector('.notification-close'));
        }, duration);
    }
    
    console.log(`📢 Notification: ${type.toUpperCase()} - ${message}`);
}

// Close notification
function closeNotification(closeBtn) {
    const notification = closeBtn.closest('.notification');
    if (notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
}

// ===== USER INFO LOADING =====
async function loadUserInfo() {
    try {
        const response = await fetch('backend/public/profile.php', {
            method: 'GET',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success && data.user) {
            console.log('✅ Kullanıcı bilgileri yüklendi:', data.user.username);
            
            // Update balance displays
            const balance = parseFloat(data.user.balance) || 0;
            const balanceFormatted = balance.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            
            // Update sidebar balance
            const userBalance = document.getElementById('userBalance');
            if (userBalance) {
                userBalance.innerHTML = `<i class="fas fa-wallet"></i> ₺${balanceFormatted}`;
            }
            
            // Update header balance
            const totalBalance = document.getElementById('totalBalance');
            if (totalBalance) {
                totalBalance.innerHTML = `<h1 style="font-size: 1.8rem; color: #00d4aa; margin: 0;">₺${balanceFormatted}</h1>`;
            }
            
            return data.user;
            
        } else {
            console.error('❌ Kullanıcı bilgisi alınamadı:', data.message);
            throw new Error(data.message || 'Kullanıcı bilgisi alınamadı');
        }
        
    } catch (error) {
        console.error('❌ loadUserInfo error:', error);
        
        // Update UI with error state
        const userBalance = document.getElementById('userBalance');
        if (userBalance) {
            userBalance.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Hata';
        }
        
        const totalBalance = document.getElementById('totalBalance');
        if (totalBalance) {
            totalBalance.innerHTML = '<span style="color: #ff4757;">Bağlantı Hatası</span>';
        }
        
        throw error;
    }
}

// ===== UTILITY FUNCTIONS =====

// Format currency
function formatCurrency(amount, currency = 'TRY') {
    const symbols = {
        'TRY': '₺',
        'USD': '$',
        'EUR': '€'
    };
    
    const formatted = parseFloat(amount).toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    return `${symbols[currency] || '₺'}${formatted}`;
}

// Format number
function formatNumber(number, decimals = 2) {
    return parseFloat(number).toLocaleString('tr-TR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

// Format date
function formatDate(dateString, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    return new Date(dateString).toLocaleDateString('tr-TR', finalOptions);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Smooth scroll to element
function scrollToElement(element, offset = 0) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
    });
}

// Copy to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Panoya kopyalandı', 'success');
        return true;
    } catch (error) {
        console.error('Clipboard error:', error);
        showNotification('Kopyalama başarısız', 'error');
        return false;
    }
}

// Generate random ID
function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// ===== LOADING STATES =====
function showLoadingState(container, message = 'Yükleniyor...') {
    if (typeof container === 'string') {
        container = document.getElementById(container);
    }
    
    if (container) {
        container.innerHTML = `
            <div class="loading-state" style="text-align: center; padding: 3rem;">
                <div class="loading-spinner" style="margin: 0 auto 1rem;"></div>
                <p style="color: #8b8fa3;">${message}</p>
            </div>
        `;
    }
}

function hideLoadingState(container) {
    if (typeof container === 'string') {
        container = document.getElementById(container);
    }
    
    if (container) {
        const loadingState = container.querySelector('.loading-state');
        if (loadingState) {
            loadingState.remove();
        }
    }
}

// ===== ERROR HANDLING =====
function showErrorState(container, message = 'Bir hata oluştu', retryCallback = null) {
    if (typeof container === 'string') {
        container = document.getElementById(container);
    }
    
    if (container) {
        const retryButton = retryCallback ? `
            <button class="btn btn-primary mt-3" onclick="${retryCallback}">
                <i class="fas fa-redo"></i> Tekrar Dene
            </button>
        ` : '';
        
        container.innerHTML = `
            <div class="error-state text-center p-4">
                <i class="fas fa-exclamation-triangle text-danger mb-3" style="font-size: 2rem;"></i>
                <h3>Hata</h3>
                <p class="text-muted">${message}</p>
                ${retryButton}
            </div>
        `;
    }
}

// ===== EXPORT FUNCTIONS FOR GLOBAL USE =====
window.switchSection = switchSection;
window.showNotification = showNotification;
window.closeNotification = closeNotification;
window.loadUserInfo = loadUserInfo;
window.formatCurrency = formatCurrency;
window.formatNumber = formatNumber;
window.formatDate = formatDate;
window.copyToClipboard = copyToClipboard;
window.showLoadingState = showLoadingState;
window.hideLoadingState = hideLoadingState;
window.showErrorState = showErrorState;

console.log('✅ Core.js initialized successfully');
