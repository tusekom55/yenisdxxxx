// Trading Functions
let selectedCoin = null;
let tradeDirection = 'buy';

// Initialize Trading
function initializeTrading() {
    console.log('📈 Trading modülü başlatılıyor...');
    setupTradingEventListeners();
    loadTradingData();
}

// Setup Trading Event Listeners
function setupTradingEventListeners() {
    // Trade direction buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('trade-direction-btn')) {
            setTradeDirection(e.target.dataset.direction);
        }
        
        if (e.target.classList.contains('forex-pair-item')) {
            selectForexPair(e.target);
        }
        
        if (e.target.classList.contains('trade-open-btn')) {
            openTrade();
        }
    });
    
    // Amount input changes
    document.addEventListener('input', function(e) {
        if (e.target.id === 'tradeAmount') {
            calculateTrade();
        }
    });
}

// Set Trade Direction
function setTradeDirection(direction) {
    tradeDirection = direction;
    
    // Update button states
    document.querySelectorAll('.trade-direction-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelector(`[data-direction="${direction}"]`).classList.add('active');
    
    // Update calculation panel
    calculateTrade();
}

// Select Forex Pair
function selectForexPair(pairElement) {
    // Remove previous selection
    document.querySelectorAll('.forex-pair-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Add selection to clicked item
    pairElement.classList.add('selected');
    
    // Get pair data
    const symbol = pairElement.dataset.symbol;
    const price = pairElement.dataset.price;
    
    selectedCoin = {
        symbol: symbol,
        price: parseFloat(price)
    };
    
    // Update trading interface
    updateTradingInterface();
    
    // Load chart data
    loadChartData(symbol);
}

// Update Trading Interface
function updateTradingInterface() {
    if (!selectedCoin) return;
    
    // Update coin info
    const coinInfoElement = document.getElementById('selectedCoinInfo');
    if (coinInfoElement) {
        coinInfoElement.innerHTML = `
            <h3>${selectedCoin.symbol}</h3>
            <p class="price">₺${selectedCoin.price.toLocaleString('tr-TR', {minimumFractionDigits: 2})}</p>
        `;
    }
    
    // Update calculation
    calculateTrade();
}

// Calculate Trade
function calculateTrade() {
    if (!selectedCoin) return;
    
    const amount = parseFloat(document.getElementById('tradeAmount')?.value) || 0;
    const price = selectedCoin.price;
    
    if (amount <= 0) return;
    
    const totalValue = amount * price;
    const commission = totalValue * 0.001; // %0.1 komisyon
    const netAmount = totalValue - commission;
    
    // Update calculation panel
    const calculationPanel = document.querySelector('.trade-calculation-panel');
    if (calculationPanel) {
        calculationPanel.innerHTML = `
            <div class="calculation-row">
                <span class="calculation-label">İşlem Tutarı</span>
                <span class="calculation-value">₺${totalValue.toLocaleString('tr-TR', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="calculation-row">
                <span class="calculation-label">Komisyon</span>
                <span class="calculation-value">₺${commission.toLocaleString('tr-TR', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="calculation-row">
                <span class="calculation-label">Net Tutar</span>
                <span class="calculation-value">₺${netAmount.toLocaleString('tr-TR', {minimumFractionDigits: 2})}</span>
            </div>
        `;
    }
}

// Load Chart Data
async function loadChartData(symbol) {
    try {
        const chartContainer = document.getElementById('priceChart');
        if (!chartContainer) return;
        
        // Show loading
        chartContainer.innerHTML = `
            <div class="chart-loading">
                <i class="fas fa-chart-line chart-icon"></i>
                <h3>Grafik Yükleniyor</h3>
                <p>${symbol} fiyat grafiği hazırlanıyor...</p>
            </div>
        `;
        
        // Get price data
        const priceData = await getCoinPrice(symbol);
        
        // Create chart (simplified for now)
        setTimeout(() => {
            createPriceChart(chartContainer, symbol, priceData);
        }, 1000);
        
    } catch (error) {
        console.error('Grafik yüklenemedi:', error);
        handleApiError(error);
    }
}

// Create Price Chart
function createPriceChart(container, symbol, data) {
    // Simple chart placeholder
    container.innerHTML = `
        <div class="chart-container">
            <div class="chart-header">
                <h4>${symbol} Fiyat Grafiği</h4>
                <div class="timeframe-buttons">
                    <button class="timeframe-btn active">1G</button>
                    <button class="timeframe-btn">1H</button>
                    <button class="timeframe-btn">1A</button>
                </div>
            </div>
            <div class="chart-placeholder">
                <div style="text-align: center; color: #8896ab;">
                    <i class="fas fa-chart-line" style="font-size: 64px; margin-bottom: 20px; opacity: 0.3;"></i>
                    <h3>Grafik Görünümü</h3>
                    <p>${symbol} için fiyat verileri burada görüntülenecek</p>
                </div>
            </div>
        </div>
    `;
}

// Open Trade
async function openTrade() {
    if (!selectedCoin) {
        showNotification('Lütfen bir coin seçin', 'warning');
        return;
    }
    
    const amount = parseFloat(document.getElementById('tradeAmount')?.value);
    if (!amount || amount <= 0) {
        showNotification('Lütfen geçerli bir miktar girin', 'warning');
        return;
    }
    
    try {
        const tradeData = {
            symbol: selectedCoin.symbol,
            direction: tradeDirection,
            amount: amount,
            price: selectedCoin.price
        };
        
        const result = await openPosition(tradeData);
        
        if (result.success) {
            showNotification('İşlem başarıyla açıldı!', 'success');
            
            // Reset form
            document.getElementById('tradeAmount').value = '';
            calculateTrade();
            
            // Refresh positions
            if (typeof loadPositionsData === 'function') {
                loadPositionsData();
            }
        } else {
            showNotification(result.message || 'İşlem açılamadı', 'error');
        }
        
    } catch (error) {
        console.error('İşlem hatası:', error);
        handleApiError(error);
    }
}

// Load Trading Data
async function loadTradingData() {
    try {
        // Load markets
        const markets = await getMarkets();
        displayMarkets(markets);
        
        // Load user positions
        const positions = await getPositions();
        displayPositions(positions);
        
    } catch (error) {
        console.error('Trading verileri yüklenemedi:', error);
        handleApiError(error);
    }
}

// Display Markets
function displayMarkets(markets) {
    const marketsContainer = document.getElementById('marketsList');
    if (!marketsContainer || !markets.data) return;
    
    marketsContainer.innerHTML = markets.data.map(coin => `
        <div class="forex-pair-item" data-symbol="${coin.symbol}" data-price="${coin.price}">
            <div class="pair-info">
                <div class="pair-symbol">${coin.symbol}</div>
                <div class="pair-category">${coin.category || 'Crypto'}</div>
            </div>
            <div class="pair-price">
                <div class="price ${coin.price_change >= 0 ? 'price-up' : 'price-down'}">
                    ₺${parseFloat(coin.price).toLocaleString('tr-TR', {minimumFractionDigits: 2})}
                </div>
                <div class="pair-spread">${coin.price_change >= 0 ? '+' : ''}${coin.price_change}%</div>
            </div>
        </div>
    `).join('');
}

// Display Positions
function displayPositions(positions) {
    const positionsContainer = document.getElementById('positionsList');
    if (!positionsContainer || !positions.data) return;
    
    if (positions.data.length === 0) {
        positionsContainer.innerHTML = `
            <div class="no-selection-message">
                <div class="no-selection-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <h3>Henüz pozisyon yok</h3>
                <p>İlk işleminizi yapmak için yukarıdan bir coin seçin</p>
            </div>
        `;
        return;
    }
    
    positionsContainer.innerHTML = positions.data.map(position => `
        <div class="position-item ${position.pnl >= 0 ? 'profit' : 'loss'}">
            <div class="position-header">
                <h4>${position.symbol}</h4>
                <span class="position-type ${position.direction}">${position.direction === 'buy' ? 'LONG' : 'SHORT'}</span>
            </div>
            <div class="position-details">
                <div class="position-row">
                    <span>Miktar:</span>
                    <span>${position.amount}</span>
                </div>
                <div class="position-row">
                    <span>Giriş Fiyatı:</span>
                    <span>₺${position.entry_price}</span>
                </div>
                <div class="position-row">
                    <span>Mevcut Fiyat:</span>
                    <span>₺${position.current_price}</span>
                </div>
                <div class="position-row">
                    <span>K/Z:</span>
                    <span class="${position.pnl >= 0 ? 'positive' : 'negative'}">
                        ${position.pnl >= 0 ? '+' : ''}₺${position.pnl}
                    </span>
                </div>
            </div>
            <div class="position-actions">
                <button class="btn btn-danger" onclick="closePosition('${position.id}')">
                    <i class="fas fa-times"></i> Kapat
                </button>
            </div>
        </div>
    `).join('');
}

// Export functions
window.initializeTrading = initializeTrading;
window.setTradeDirection = setTradeDirection;
window.selectForexPair = selectForexPair;
window.openTrade = openTrade;
window.loadTradingData = loadTradingData;
