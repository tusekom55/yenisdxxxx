// Portfolio Management Functions

// Initialize Portfolio
function initializePortfolio() {
    console.log('💼 Portfolio modülü başlatılıyor...');
    loadPortfolioData();
}

// Load Portfolio Data
async function loadPortfolioData() {
    try {
        const portfolio = await getPortfolio();
        displayPortfolio(portfolio);
        
        // Load transaction history
        const transactions = await getTransactionHistory();
        displayTransactionHistory(transactions);
        
    } catch (error) {
        console.error('Portfolio verileri yüklenemedi:', error);
        handleApiError(error);
    }
}

// Display Portfolio
function displayPortfolio(portfolio) {
    const portfolioContainer = document.getElementById('portfolioContainer');
    if (!portfolioContainer || !portfolio.data) return;
    
    const { total_value, total_pnl, assets } = portfolio.data;
    
    // Update portfolio summary
    updatePortfolioSummary(total_value, total_pnl);
    
    // Display assets
    displayAssets(assets);
}

// Update Portfolio Summary
function updatePortfolioSummary(totalValue, totalPnl) {
    const summaryElements = {
        'totalPortfolioValue': totalValue,
        'totalPortfolioPnl': totalPnl,
        'portfolioChangePercent': calculateChangePercent(totalValue, totalPnl)
    };
    
    Object.keys(summaryElements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (id === 'totalPortfolioValue') {
                element.textContent = formatCurrency(totalValue);
            } else if (id === 'totalPortfolioPnl') {
                element.textContent = formatCurrency(totalPnl);
                element.className = totalPnl >= 0 ? 'positive' : 'negative';
            } else if (id === 'portfolioChangePercent') {
                element.textContent = `${totalPnl >= 0 ? '+' : ''}${summaryElements[id]}%`;
                element.className = totalPnl >= 0 ? 'positive' : 'negative';
            }
        }
    });
}

// Calculate Change Percent
function calculateChangePercent(totalValue, pnl) {
    const tv = Number(totalValue);
    const p = Number(pnl);
    if (!Number.isFinite(tv) || !Number.isFinite(p) || tv === 0 || tv === p) return 0;
    const denom = tv - p;
    if (!Number.isFinite(denom) || denom === 0) return 0;
    return ((p / denom) * 100).toFixed(2);
}

// Display Assets
function displayAssets(assets) {
    const assetsContainer = document.getElementById('assetsList');
    if (!assetsContainer) return;
    
    if (!assets || assets.length === 0) {
        assetsContainer.innerHTML = `
            <div class="empty-portfolio">
                <i class="fas fa-briefcase" style="font-size: 64px; color: #8896ab; margin-bottom: 20px;"></i>
                <h3>Portföyünüz Boş</h3>
                <p>Henüz hiç coin satın almadınız. İlk işleminizi yapmak için trading sayfasına gidin.</p>
                <button class="btn btn-primary" onclick="showSection('trading')">
                    <i class="fas fa-exchange-alt"></i> Trading'e Git
                </button>
            </div>
        `;
        return;
    }
    
    assetsContainer.innerHTML = assets.map(asset => `
        <div class="asset-item ${asset.pnl >= 0 ? 'profit' : 'loss'}">
            <div class="asset-header">
                <div class="asset-info">
                    <h4>${asset.symbol}</h4>
                    <span class="asset-category">${asset.category || 'Crypto'}</span>
                </div>
                <div class="asset-value">
                    <div class="current-value">₺${(Number.isFinite(Number(asset.current_value)) ? Number(asset.current_value) : 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                    <div class="asset-pnl ${asset.pnl >= 0 ? 'positive' : 'negative'}">
                        ${Number(asset.pnl) >= 0 ? '+' : ''}₺${(Number.isFinite(Number(asset.pnl)) ? Number(asset.pnl) : 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </div>
                </div>
            </div>
            <div class="asset-details">
                <div class="detail-row">
                    <span>Miktar:</span>
                    <span>${(Number.isFinite(Number(asset.amount)) ? Number(asset.amount) : 0).toLocaleString('tr-TR', { minimumFractionDigits: 4 })}</span>
                </div>
                <div class="detail-row">
                    <span>Ortalama Alış:</span>
                    <span>₺${(Number.isFinite(Number(asset.avg_buy_price)) ? Number(asset.avg_buy_price) : 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="detail-row">
                    <span>Mevcut Fiyat:</span>
                    <span>₺${(Number.isFinite(Number(asset.current_price)) ? Number(asset.current_price) : 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="detail-row">
                    <span>Değişim:</span>
                    <span class="${asset.price_change >= 0 ? 'positive' : 'negative'}">
                        ${asset.price_change >= 0 ? '+' : ''}${asset.price_change}%
                    </span>
                </div>
            </div>
            <div class="asset-actions">
                <button class="btn btn-primary" onclick="showSection('trading')">
                    <i class="fas fa-plus"></i> Daha Al
                </button>
                <button class="btn btn-warning" onclick="sellAsset('${asset.symbol}')">
                    <i class="fas fa-minus"></i> Sat
                </button>
            </div>
        </div>
    `).join('');
}

// Display Transaction History
function displayTransactionHistory(transactions) {
    const historyContainer = document.getElementById('transactionHistory');
    if (!historyContainer || !transactions || !transactions.data) return;
    
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
                ${Number(transaction.amount) >= 0 ? '+' : ''}₺${(Number.isFinite(Number(transaction.amount)) ? Number(transaction.amount) : 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
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

// Sell Asset
async function sellAsset(symbol) {
    try {
        // Show confirmation dialog
        if (!confirm(`${symbol} varlığını satmak istediğinizden emin misiniz?`)) {
            return;
        }
        
        // Redirect to trading page with pre-filled sell order
        showSection('trading');
        
        // You can add logic here to pre-fill the trading form
        showNotification(`${symbol} satış işlemi için trading sayfasına yönlendirildiniz`, 'info');
        
    } catch (error) {
        console.error('Varlık satış hatası:', error);
        handleApiError(error);
    }
}

// Refresh Portfolio
async function refreshPortfolio() {
    try {
        showNotification('Portföy yenileniyor...', 'info');
        await loadPortfolioData();
        showNotification('Portföy başarıyla yenilendi', 'success');
    } catch (error) {
        console.error('Portföy yenilenemedi:', error);
        handleApiError(error);
    }
}

// Export functions
window.initializePortfolio = initializePortfolio;
window.loadPortfolioData = loadPortfolioData;
window.refreshPortfolio = refreshPortfolio;
window.sellAsset = sellAsset;
