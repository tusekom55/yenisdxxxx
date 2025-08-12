// ===== MAIN APPLICATION CONTROLLER =====

// Application state
const AppState = {
    isInitialized: false,
    currentUser: null,
    currentSection: 'dashboard',
    modules: {
        dashboard: false,
        markets: false,
        portfolio: false,
        trading: false,
        positions: false,
        deposit: false,
        profile: false
    }
};

// ===== APPLICATION INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Main.js başlatılıyor...');
    
    // Wait for core modules to load
    if (typeof switchSection === 'function' && typeof loadUserInfo === 'function') {
        initializeApplication();
    } else {
        // Retry after a short delay
        setTimeout(initializeApplication, 500);
    }
});

async function initializeApplication() {
    try {
        console.log('🔧 Uygulama başlatılıyor...');
        
        // Check if already initialized
        if (AppState.isInitialized) {
            console.log('⚠️ Uygulama zaten başlatılmış');
            return;
        }
        
        // Initialize application components
        await initializeAppComponents();
        
        // Mark as initialized
        AppState.isInitialized = true;
        
        console.log('✅ Uygulama başarıyla başlatıldı');
        
    } catch (error) {
        console.error('❌ Uygulama başlatma hatası:', error);
        showNotification('Uygulama başlatılırken hata oluştu', 'error');
    }
}

async function initializeAppComponents() {
    // Initialize keyboard shortcuts
    initializeKeyboardShortcuts();
    
    // Initialize global event listeners
    initializeGlobalEventListeners();
    
    // Initialize performance monitoring
    initializePerformanceMonitoring();
    
    // Initialize error handling
    initializeGlobalErrorHandling();
    
    // Initialize auto-save functionality
    initializeAutoSave();
    
    console.log('🔧 Uygulama bileşenleri başlatıldı');
}

// ===== KEYBOARD SHORTCUTS =====
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + key combinations
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    switchSection('dashboard');
                    break;
                case '2':
                    e.preventDefault();
                    switchSection('markets');
                    break;
                case '3':
                    e.preventDefault();
                    switchSection('portfolio');
                    break;
                case '4':
                    e.preventDefault();
                    switchSection('positions');
                    break;
                case 'r':
                    e.preventDefault();
                    refreshCurrentSection();
                    break;
                case 'k':
                    e.preventDefault();
                    showKeyboardShortcuts();
                    break;
            }
        }
        
        // Escape key
        if (e.key === 'Escape') {
            closeAllModals();
        }
        
        // F5 - Refresh current section
        if (e.key === 'F5') {
            e.preventDefault();
            refreshCurrentSection();
        }
    });
    
    console.log('⌨️ Klavye kısayolları aktif');
}

// ===== GLOBAL EVENT LISTENERS =====
function initializeGlobalEventListeners() {
    // Window focus/blur events
    window.addEventListener('focus', function() {
        console.log('🔍 Window focused - refreshing data');
        refreshCurrentSection();
    });
    
    window.addEventListener('blur', function() {
        console.log('👁️ Window blurred - pausing updates');
        pauseAutoUpdates();
    });
    
    // Online/offline events
    window.addEventListener('online', function() {
        showNotification('İnternet bağlantısı yeniden kuruldu', 'success');
        refreshCurrentSection();
    });
    
    window.addEventListener('offline', function() {
        showNotification('İnternet bağlantısı kesildi', 'warning');
    });
    
    // Before unload warning
    window.addEventListener('beforeunload', function(e) {
        if (hasUnsavedChanges()) {
            e.preventDefault();
            e.returnValue = 'Kaydedilmemiş değişiklikler var. Sayfadan ayrılmak istediğinizden emin misiniz?';
        }
    });
    
    console.log('🌐 Global event listener'lar aktif');
}

// ===== PERFORMANCE MONITORING =====
function initializePerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', function() {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
            
            console.log(`📊 Sayfa yükleme süresi: ${loadTime}ms`);
            
            if (loadTime > 3000) {
                console.warn('⚠️ Yavaş sayfa yükleme tespit edildi');
            }
        }, 0);
    });
    
    // Monitor memory usage
    if ('memory' in performance) {
        setInterval(() => {
            const memory = performance.memory;
            const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
            const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
            
            if (usedMB > 100) {
                console.warn(`⚠️ Yüksek bellek kullanımı: ${usedMB}MB / ${totalMB}MB`);
            }
        }, 30000); // Check every 30 seconds
    }
    
    console.log('📊 Performans izleme aktif');
}

// ===== ERROR HANDLING =====
function initializeGlobalErrorHandling() {
    // Global error handler
    window.addEventListener('error', function(e) {
        console.error('🚨 Global Error:', e.error);
        
        // Don't show notification for script loading errors
        if (!e.filename || e.filename.includes('.js')) {
            return;
        }
        
        showNotification('Beklenmeyen bir hata oluştu', 'error');
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', function(e) {
        console.error('🚨 Unhandled Promise Rejection:', e.reason);
        
        // Handle API errors gracefully
        if (e.reason && e.reason.message) {
            handleAPIError(e.reason, 'Unhandled Promise');
        }
        
        e.preventDefault();
    });
    
    console.log('🛡️ Global hata yakalama aktif');
}

// ===== AUTO-SAVE FUNCTIONALITY =====
function initializeAutoSave() {
    // Save user preferences periodically
    setInterval(() => {
        saveUserPreferences();
    }, 60000); // Save every minute
    
    console.log('💾 Otomatik kaydetme aktif');
}

function saveUserPreferences() {
    try {
        const preferences = {
            currentSection: AppState.currentSection,
            sidebarCollapsed: document.getElementById('sidebar')?.classList.contains('collapsed'),
            timestamp: Date.now()
        };
        
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
    } catch (error) {
        console.warn('⚠️ Kullanıcı tercihleri kaydedilemedi:', error);
    }
}

function loadUserPreferences() {
    try {
        const saved = localStorage.getItem('userPreferences');
        if (saved) {
            const preferences = JSON.parse(saved);
            
            // Apply saved preferences
            if (preferences.sidebarCollapsed) {
                document.getElementById('sidebar')?.classList.add('collapsed');
            }
            
            return preferences;
        }
    } catch (error) {
        console.warn('⚠️ Kullanıcı tercihleri yüklenemedi:', error);
    }
    
    return null;
}

// ===== UTILITY FUNCTIONS =====

// Refresh current section
async function refreshCurrentSection() {
    try {
        showNotification('Sayfa yenileniyor...', 'info', 1000);
        
        switch (AppState.currentSection) {
            case 'dashboard':
                if (typeof refreshDashboard === 'function') {
                    await refreshDashboard();
                }
                break;
            case 'markets':
                if (typeof refreshMarkets === 'function') {
                    await refreshMarkets();
                }
                break;
            case 'portfolio':
                if (typeof refreshPortfolio === 'function') {
                    await refreshPortfolio();
                }
                break;
            case 'positions':
                if (typeof refreshPositions === 'function') {
                    await refreshPositions();
                }
                break;
            default:
                await loadUserInfo();
        }
        
        console.log(`🔄 ${AppState.currentSection} bölümü yenilendi`);
        
    } catch (error) {
        console.error('❌ Section refresh error:', error);
        showNotification('Sayfa yenilenirken hata oluştu', 'error');
    }
}

// Close all modals
function closeAllModals() {
    const modals = document.querySelectorAll('.modal, .trading-modal, .trading-modal-enhanced');
    modals.forEach(modal => {
        if (modal.style.display !== 'none') {
            modal.style.display = 'none';
        }
    });
    
    // Close mobile menu
    if (typeof closeMobileMenu === 'function') {
        closeMobileMenu();
    }
}

// Check for unsaved changes
function hasUnsavedChanges() {
    // This would be implemented based on specific form states
    // For now, return false
    return false;
}

// Pause auto updates
function pauseAutoUpdates() {
    // This would pause any running intervals
    console.log('⏸️ Otomatik güncellemeler duraklatıldı');
}

// Show keyboard shortcuts
function showKeyboardShortcuts() {
    const shortcuts = `
        <div style="font-family: monospace; line-height: 1.6;">
            <h3 style="margin-bottom: 1rem;">Klavye Kısayolları</h3>
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 0.5rem;">
                <strong>Ctrl+1:</strong> <span>Dashboard</span>
                <strong>Ctrl+2:</strong> <span>Piyasalar</span>
                <strong>Ctrl+3:</strong> <span>Portföy</span>
                <strong>Ctrl+4:</strong> <span>Pozisyonlar</span>
                <strong>Ctrl+R:</strong> <span>Sayfayı Yenile</span>
                <strong>Ctrl+K:</strong> <span>Kısayolları Göster</span>
                <strong>F5:</strong> <span>Mevcut Bölümü Yenile</span>
                <strong>Esc:</strong> <span>Modal'ları Kapat</span>
            </div>
        </div>
    `;
    
    showNotification(shortcuts, 'info', 8000);
}

// ===== MODULE MANAGEMENT =====

// Track section changes
const originalSwitchSection = window.switchSection;
if (originalSwitchSection) {
    window.switchSection = function(sectionName) {
        AppState.currentSection = sectionName;
        AppState.modules[sectionName] = true;
        
        console.log(`📍 Section changed to: ${sectionName}`);
        
        return originalSwitchSection(sectionName);
    };
}

// ===== DEVELOPMENT HELPERS =====
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Development mode helpers
    window.AppState = AppState;
    window.refreshCurrentSection = refreshCurrentSection;
    window.saveUserPreferences = saveUserPreferences;
    window.loadUserPreferences = loadUserPreferences;
    
    console.log('🔧 Development mode aktif - Helper fonksiyonlar window objesinde mevcut');
}

// ===== ANALYTICS & TRACKING =====
function trackUserAction(action, data = {}) {
    try {
        const event = {
            action,
            data,
            timestamp: Date.now(),
            section: AppState.currentSection,
            user: AppState.currentUser?.username || 'anonymous'
        };
        
        // Store in localStorage for now (could be sent to analytics service)
        const events = JSON.parse(localStorage.getItem('userEvents') || '[]');
        events.push(event);
        
        // Keep only last 100 events
        if (events.length > 100) {
            events.splice(0, events.length - 100);
        }
        
        localStorage.setItem('userEvents', JSON.stringify(events));
        
        console.log('📊 User action tracked:', action);
        
    } catch (error) {
        console.warn('⚠️ Analytics tracking failed:', error);
    }
}

// ===== EXPORT FUNCTIONS =====
window.trackUserAction = trackUserAction;
window.refreshCurrentSection = refreshCurrentSection;
window.closeAllModals = closeAllModals;

// ===== INITIALIZATION COMPLETE =====
console.log('✅ Main.js initialized successfully');

// Load user preferences on startup
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        loadUserPreferences();
    }, 1000);
});
