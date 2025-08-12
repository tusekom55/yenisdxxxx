// ===== DASHBOARD MODULE =====

// Dashboard global variables
let dashboardData = {
    stats: {
        balance: 0,
        totalTrades: 0,
        profitLoss: 0,
        openPositions: 0
    },
    recentActivity: [],
    chartData: null
};

// ===== DASHBOARD INITIALIZATION =====
async function loadDashboard() {
    console.log('📊 Dashboard yükleniyor...');
    
    const container = document.getElementById('dashboardContent');
    if (!container) {
        console.error('❌ Dashboard container bulunamadı');
        return;
    }
    
    try {
        // Dashboard HTML yapısını oluştur
        container.innerHTML = createDashboardHTML();
        
        // Dashboard verilerini yükle
        await loadDashboardData();
        
        // Dashboard bileşenlerini başlat
        initializeDashboardComponents();
        
        console.log('✅ Dashboard başarıyla yüklendi');
        
    } catch (error) {
        console.error('❌ Dashboard yükleme hatası:', error);
        showErrorState(container, 'Dashboard yüklenirken hata oluştu', 'loadDashboard()');
    }
}

// ===== DASHBOARD HTML STRUCTURE =====
function createDashboardHTML() {
    return `
        <!-- Dashboard Stats -->
        <div class="dashboard-stats animate-slide-up">
            <div class="stat-card animate-fade-scale">
                <div class="stat-header">
                    <div class="stat-title">Toplam Bakiye</div>
                    <div class="stat-icon balance">
                        <i class="fas fa-wallet"></i>
                    </div>
                </div>
                <div class="stat-value" id="dashboardBalance">₺0.00</div>
                <div class="stat-change neutral" id="balanceChange">
                    <i class="fas fa-minus"></i>
                    <span>Değişim yok</span>
                </div>
            </div>
            
            <div class="stat-card animate-fade-scale">
                <div class="stat-header">
                    <div class="stat-title">Toplam İşlem</div>
                    <div class="stat-icon trades">
                        <i class="fas fa-exchange-alt"></i>
                    </div>
                </div>
                <div class="stat-value" id="dashboardTrades">0</div>
                <div class="stat-change neutral" id="tradesChange">
                    <i class="fas fa-chart-line"></i>
                    <span>Bu ay</span>
                </div>
            </div>
            
            <div class="stat-card animate-fade-scale">
                <div class="stat-header">
                    <div class="stat-title">Günlük K/Z</div>
                    <div class="stat-icon profit">
                        <i class="fas fa-chart-line"></i>
                    </div>
                </div>
                <div class="stat-value" id="dashboardPnL">₺0.00</div>
                <div class="stat-change neutral" id="pnlChange">
                    <i class="fas fa-equals"></i>
                    <span>Son 24 saat</span>
                </div>
            </div>
            
            <div class="stat-card animate-fade-scale">
                <div class="stat-header">
                    <div class="stat-title">Açık Pozisyon</div>
                    <div class="stat-icon positions">
                        <i class="fas fa-layer-group"></i>
                    </div>
                </div>
                <div class="stat-value" id="dashboardPositions">0</div>
                <div class="stat-change neutral" id="positionsChange">
                    <i class="fas fa-clock"></i>
                    <span>Aktif</span>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions animate-slide-up">
            <a href="#" class="quick-action-btn animate-fade-scale" onclick="switchSection('markets')">
                <div class="quick-action-icon">
                    <i class="fas fa-chart-bar"></i>
                </div>
                <div class="quick-action-title">Piyasalar</div>
                <div class="quick-action-desc">Coin fiyatlarını görüntüle ve işlem yap</div>
            </a>
            
            <a href="#" class="quick-action-btn animate-fade-scale" onclick="switchSection('portfolio')">
                <div class="quick-action-icon">
                    <i class="fas fa-briefcase"></i>
                </div>
                <div class="quick-action-title">Portföy</div>
                <div class="quick-action-desc">Varlıklarınızı yönetin</div>
            </a>
            
            <a href="#" class="quick-action-btn animate-fade-scale" onclick="switchSection('positions')">
                <div class="quick-action-icon">
                    <i class="fas fa-layer-group"></i>
                </div>
                <div class="quick-action-title">Pozisyonlar</div>
                <div class="quick-action-desc">Kaldıraçlı işlemlerinizi takip edin</div>
            </a>
            
            <a href="#" class="quick-action-btn animate-fade-scale" onclick="switchSection('deposit')">
                <div class="quick-action-icon">
                    <i class="fas fa-plus-circle"></i>
                </div>
                <div class="quick-action-title">Para Yatır</div>
                <div class="quick-action-desc">Hesabınıza para ekleyin</div>
            </a>
        </div>

        <!-- Dashboard Charts -->
        <div class="dashboard-charts animate-slide-up">
            <div class="chart-card">
                <div class="chart-header">
                    <div class="chart-title">
                        <i class="fas fa-chart-area"></i>
                        Portföy Performansı
                    </div>
                    <div class="chart-controls">
                        <button class="chart-btn active" data-period="1d">1G</button>
                        <button class="chart-btn" data-period="1w">1H</button>
                        <button class="chart-btn" data-period="1m">1A</button>
                        <button class="chart-btn" data-period="3m">3A</button>
                    </div>
                </div>
                <div class="chart-container" id="portfolioChart">
                    <canvas id="portfolioChartCanvas"></canvas>
                </div>
            </div>
            
            <div class="chart-card">
                <div class="chart-header">
                    <div class="chart-title">
                        <i class="fas fa-pie-chart"></i>
                        Varlık Dağılımı
                    </div>
                </div>
                <div class="chart-container" id="assetDistribution">
                    <canvas id="assetDistributionCanvas"></canvas>
                </div>
            </div>
        </div>

        <!-- Dashboard Activity -->
        <div class="dashboard-activity animate-slide-up">
            <div class="activity-card">
                <div class="activity-header">
                    <div class="activity-title">
                        <i class="fas fa-history"></i>
                        Son İşlemler
                    </div>
                    <a href="#" class="activity-more" onclick="switchSection('profile')">Tümünü Gör</a>
                </div>
                <div class="activity-list" id="recentTransactions">
                    <!-- Recent transactions will be loaded here -->
                </div>
            </div>
            
            <div class="activity-card">
                <div class="activity-header">
                    <div class="activity-title">
                        <i class="fas fa-trending-up"></i>
                        Piyasa Özeti
                    </div>
                    <a href="#" class="activity-more" onclick="switchSection('markets')">Piyasalar</a>
                </div>
                <div class="activity-list" id="marketSummary">
                    <!-- Market summary will be loaded here -->
                </div>
            </div>
        </div>
    `;
}

// ===== DASHBOARD DATA LOADING =====
async function loadDashboardData() {
    console.log('📊 Dashboard verileri yükleniyor...');
    
    try {
        // Paralel olarak tüm verileri yükle
        const [userInfo, recentTransactions, marketData] = await Promise.allSettled([
            loadUserInfo(),
            loadRecentTransactions(),
            loadMarketSummary()
        ]);
        
        // Kullanıcı bilgilerini güncelle
        if (userInfo.status === 'fulfilled') {
            updateDashboardStats(userInfo.value);
        }
        
        // Son işlemleri güncelle
        if (recentTransactions.status === 'fulfilled') {
            updateRecentTransactions(recentTransactions.value);
        }
        
        // Piyasa özetini güncelle
        if (marketData.status === 'fulfilled') {
            updateMarketSummary(marketData.value);
        }
        
        // Grafikleri yükle
        await loadDashboardCharts();
        
    } catch (error) {
        console.error('❌ Dashboard veri yükleme hatası:', error);
        throw error;
    }
}

// ===== DASHBOARD STATS UPDATE =====
function updateDashboardStats(userInfo) {
    if (!userInfo) return;
    
    const balance = parseFloat(userInfo.balance) || 0;
    const balanceFormatted = formatCurrency(balance);
    
    // Bakiye güncelle
    const balanceElement = document.getElementById('dashboardBalance');
    if (balanceElement) {
        balanceElement.textContent = balanceFormatted;
        
        // Animasyonlu güncelleme
        balanceElement.style.transform = 'scale(1.05)';
        setTimeout(() => {
            balanceElement.style.transform = 'scale(1)';
        }, 200);
    }
    
    // Diğer istatistikleri simüle et (gerçek veriler backend'den gelecek)
    updateStatCard('dashboardTrades', '12', 'positive', '+3 bu ay');
    updateStatCard('dashboardPnL', '₺156.24', 'positive', '+2.34%');
    updateStatCard('dashboardPositions', '3', 'neutral', 'Aktif');
    
    // Global dashboard data'yı güncelle
    dashboardData.stats = {
        balance: balance,
        totalTrades: 12,
        profitLoss: 156.24,
        openPositions: 3
    };
}

// Stat card güncelleme helper fonksiyonu
function updateStatCard(elementId, value, changeType, changeText) {
    const element = document.getElementById(elementId);
    const changeElement = document.getElementById(elementId.replace('dashboard', '') + 'Change');
    
    if (element) {
        element.textContent = value;
        element.style.transform = 'scale(1.05)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);
    }
    
    if (changeElement) {
        changeElement.className = `stat-change ${changeType}`;
        
        const icon = changeType === 'positive' ? 'fa-arrow-up' : 
                    changeType === 'negative' ? 'fa-arrow-down' : 'fa-minus';
        
        changeElement.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${changeText}</span>
        `;
    }
}

// ===== RECENT TRANSACTIONS =====
async function loadRecentTransactions() {
    try {
        // Gerçek API çağrısı (şimdilik mock data)
        const mockTransactions = [
            {
                id: 1,
                type: 'buy',
                description: 'Bitcoin Satın Alma',
                amount: -1250.00,
                time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 2,
                type: 'sell',
                description: 'Ethereum Satış',
                amount: 890.50,
                time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 3,
                type: 'deposit',
                description: 'Para Yatırma',
                amount: 2000.00,
                time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        
        return mockTransactions;
        
    } catch (error) {
        console.error('❌ Recent transactions loading error:', error);
        return [];
    }
}

function updateRecentTransactions(transactions) {
    const container = document.getElementById('recentTransactions');
    if (!container) return;
    
    if (!transactions || transactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <p>Henüz işlem yapılmamış</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = transactions.slice(0, 3).map(transaction => {
        const isPositive = transaction.amount > 0;
        const iconType = transaction.type === 'buy' ? 'buy' : 
                        transaction.type === 'sell' ? 'sell' : 'deposit';
        
        return `
            <div class="activity-item">
                <div class="activity-icon ${iconType}">
                    <i class="fas fa-${transaction.type === 'buy' ? 'arrow-down' : 
                                      transaction.type === 'sell' ? 'arrow-up' : 'plus'}"></i>
                </div>
                <div class="activity-details">
                    <div class="activity-description">${transaction.description}</div>
                    <div class="activity-time">${formatDate(transaction.time, { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div class="activity-amount ${isPositive ? 'positive' : 'negative'}">
                    ${formatCurrency(Math.abs(transaction.amount))}
                </div>
            </div>
        `;
    }).join('');
}

// ===== MARKET SUMMARY =====
async function loadMarketSummary() {
    try {
        // Mock market data
        const mockMarketData = [
            { symbol: 'BTC', name: 'Bitcoin', price: 96480.50, change: 2.35 },
            { symbol: 'ETH', name: 'Ethereum', price: 3420.75, change: -1.22 },
            { symbol: 'BNB', name: 'BNB', price: 685.20, change: 0.88 }
        ];
        
        return mockMarketData;
        
    } catch (error) {
        console.error('❌ Market summary loading error:', error);
        return [];
    }
}

function updateMarketSummary(marketData) {
    const container = document.getElementById('marketSummary');
    if (!container) return;
    
    if (!marketData || marketData.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-chart-bar"></i>
                <p>Piyasa verileri yüklenemedi</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = marketData.map(coin => {
        const isPositive = coin.change > 0;
        
        return `
            <div class="activity-item" onclick="switchSection('markets')">
                <div class="activity-icon ${isPositive ? 'buy' : 'sell'}">
                    <i class="fab fa-bitcoin"></i>
                </div>
                <div class="activity-details">
                    <div class="activity-description">${coin.name}</div>
                    <div class="activity-time">${coin.symbol}</div>
                </div>
                <div class="activity-amount ${isPositive ? 'positive' : 'negative'}">
                    ${formatCurrency(coin.price)}
                    <small style="display: block; font-size: 0.7rem;">
                        ${isPositive ? '+' : ''}${coin.change.toFixed(2)}%
                    </small>
                </div>
            </div>
        `;
    }).join('');
}

// ===== DASHBOARD CHARTS =====
async function loadDashboardCharts() {
    console.log('📈 Dashboard grafikleri yükleniyor...');
    
    try {
        // Portfolio performance chart
        await createPortfolioChart();
        
        // Asset distribution chart
        await createAssetDistributionChart();
        
    } catch (error) {
        console.error('❌ Dashboard charts loading error:', error);
    }
}

async function createPortfolioChart() {
    const canvas = document.getElementById('portfolioChartCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Mock portfolio data
    const data = {
        labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
        datasets: [{
            label: 'Portföy Değeri',
            data: [8000, 8500, 7800, 9200, 9800, 10500],
            borderColor: '#4fc3f7',
            backgroundColor: 'rgba(79, 195, 247, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
        }]
    };
    
    new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#8b8fa3'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#8b8fa3',
                        callback: function(value) {
                            return '₺' + value.toLocaleString('tr-TR');
                        }
                    }
                }
            }
        }
    });
}

async function createAssetDistributionChart() {
    const canvas = document.getElementById('assetDistributionCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Mock asset distribution data
    const data = {
        labels: ['Bitcoin', 'Ethereum', 'BNB', 'Diğer'],
        datasets: [{
            data: [45, 25, 15, 15],
            backgroundColor: [
                '#f7931a',
                '#627eea',
                '#f3ba2f',
                '#8b8fa3'
            ],
            borderWidth: 0
        }]
    };
    
    new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff',
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

// ===== DASHBOARD COMPONENTS INITIALIZATION =====
function initializeDashboardComponents() {
    console.log('🔧 Dashboard bileşenleri başlatılıyor...');
    
    // Chart period buttons
    initializeChartControls();
    
    // Auto refresh
    startDashboardAutoRefresh();
    
    // Animations
    initializeDashboardAnimations();
}

function initializeChartControls() {
    const chartButtons = document.querySelectorAll('.chart-btn');
    
    chartButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            chartButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update chart based on period
            const period = this.dataset.period;
            updateChartPeriod(period);
        });
    });
}

function updateChartPeriod(period) {
    console.log(`📊 Chart period updated to: ${period}`);
    // Chart güncelleme mantığı burada olacak
}

function startDashboardAutoRefresh() {
    // Her 30 saniyede bir dashboard verilerini güncelle
    setInterval(async () => {
        try {
            await loadDashboardData();
            console.log('🔄 Dashboard otomatik güncellendi');
        } catch (error) {
            console.error('❌ Dashboard auto refresh error:', error);
        }
    }, 30000);
}

function initializeDashboardAnimations() {
    // Intersection Observer ile animasyonları tetikle
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    });
    
    // Animasyonlu elementleri gözlemle
    document.querySelectorAll('.animate-slide-up, .animate-fade-scale').forEach(el => {
        observer.observe(el);
    });
}

// ===== DASHBOARD REFRESH =====
async function refreshDashboard() {
    console.log('🔄 Dashboard yenileniyor...');
    
    try {
        showNotification('Dashboard güncelleniyor...', 'info', 2000);
        await loadDashboardData();
        showNotification('Dashboard başarıyla güncellendi', 'success');
    } catch (error) {
        console.error('❌ Dashboard refresh error:', error);
        showNotification('Dashboard güncellenirken hata oluştu', 'error');
    }
}

// ===== EXPORT FUNCTIONS =====
window.loadDashboard = loadDashboard;
window.refreshDashboard = refreshDashboard;

console.log('✅ Dashboard.js initialized successfully');
