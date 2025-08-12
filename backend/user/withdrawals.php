<?php
session_start();
require_once '../config.php';

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Kullanıcı oturum kontrolü
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Oturum bulunamadı. Lütfen giriş yapın.',
        'redirect' => 'login.html'
    ]);
    exit();
}

$user_id = $_SESSION['user_id'];
$action = $_GET['action'] ?? $_POST['action'] ?? 'list';

try {
    switch ($action) {
        case 'create':
            createWithdrawalRequest($pdo, $user_id);
            break;
            
        case 'list':
            getWithdrawalRequests($pdo, $user_id);
            break;
            
        case 'cancel':
            cancelWithdrawalRequest($pdo, $user_id);
            break;
            
        default:
            throw new Exception('Geçersiz işlem');
    }
} catch (Exception $e) {
    error_log("Withdrawal API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

// Para çekme talebi oluştur
function createWithdrawalRequest($pdo, $user_id) {
    // POST verilerini al
    $yontem = $_POST['yontem'] ?? '';
    $tutar = floatval($_POST['tutar'] ?? 0);
    $detay_bilgiler = $_POST['detay_bilgiler'] ?? '';
    $aciklama = $_POST['aciklama'] ?? '';
    
    // Validasyon
    if (empty($yontem)) {
        throw new Exception('Çekme yöntemi seçilmedi');
    }
    
    if ($tutar < 50) {
        throw new Exception('Minimum çekme tutarı ₺50\'dir');
    }
    
    if ($tutar > 100000) {
        throw new Exception('Maksimum çekme tutarı ₺100,000\'dir');
    }
    
    // Kullanıcının bakiyesini kontrol et
    $stmt = $pdo->prepare("SELECT balance FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();
    
    if (!$user) {
        throw new Exception('Kullanıcı bulunamadı');
    }
    
    $current_balance = floatval($user['balance']);
    
    if ($current_balance < $tutar) {
        throw new Exception('Yetersiz bakiye. Mevcut bakiye: ₺' . number_format($current_balance, 2));
    }
    
    // Günlük çekme limitini kontrol et
    $today = date('Y-m-d');
    $stmt = $pdo->prepare("
        SELECT COALESCE(SUM(tutar), 0) as daily_total 
        FROM withdrawals 
        WHERE user_id = ? AND DATE(tarih) = ? AND durum != 'reddedildi'
    ");
    $stmt->execute([$user_id, $today]);
    $daily_total = floatval($stmt->fetchColumn());
    
    if (($daily_total + $tutar) > 50000) {
        throw new Exception('Günlük çekme limitini aşıyorsunuz. Kalan limit: ₺' . number_format(50000 - $daily_total, 2));
    }
    
    // Bekleyen talep kontrolü
    $stmt = $pdo->prepare("
        SELECT COUNT(*) 
        FROM withdrawals 
        WHERE user_id = ? AND durum = 'beklemede'
    ");
    $stmt->execute([$user_id]);
    $pending_count = $stmt->fetchColumn();
    
    if ($pending_count >= 3) {
        throw new Exception('En fazla 3 bekleyen çekme talebiniz olabilir');
    }
    
    // Detay bilgilerini JSON olarak parse et
    $detay_array = [];
    if (!empty($detay_bilgiler)) {
        $detay_array = json_decode($detay_bilgiler, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $detay_array = ['raw_data' => $detay_bilgiler];
        }
    }
    
    // Yönteme göre validasyon
    switch ($yontem) {
        case 'papara':
            if (empty($detay_array['papara_number'])) {
                throw new Exception('Papara numarası gerekli');
            }
            break;
            
        case 'iban':
            if (empty($detay_array['iban']) || empty($detay_array['account_holder'])) {
                throw new Exception('IBAN ve hesap sahibi bilgisi gerekli');
            }
            // IBAN formatını kontrol et
            $iban = preg_replace('/\s+/', '', $detay_array['iban']);
            if (!preg_match('/^TR\d{24}$/', $iban)) {
                throw new Exception('Geçersiz IBAN formatı');
            }
            break;
            
        default:
            throw new Exception('Desteklenmeyen çekme yöntemi');
    }
    
    // Transaction başlat
    $pdo->beginTransaction();
    
    try {
        // Para çekme talebini kaydet
        $stmt = $pdo->prepare("
            INSERT INTO withdrawals (user_id, yontem, tutar, detay_bilgiler, aciklama, durum, tarih) 
            VALUES (?, ?, ?, ?, ?, 'beklemede', NOW())
        ");
        $stmt->execute([
            $user_id,
            $yontem,
            $tutar,
            json_encode($detay_array, JSON_UNESCAPED_UNICODE),
            $aciklama
        ]);
        
        $withdrawal_id = $pdo->lastInsertId();
        
        // Kullanıcının bakiyesini güncelle (beklemede olan tutar için rezerve et)
        $stmt = $pdo->prepare("UPDATE users SET balance = balance - ? WHERE id = ?");
        $stmt->execute([$tutar, $user_id]);
        
        // Transaction history'ye kaydet
        $stmt = $pdo->prepare("
            INSERT INTO transaction_history (user_id, type, sub_type, amount, description, date) 
            VALUES (?, 'withdrawal', 'beklemede', ?, ?, NOW())
        ");
        $stmt->execute([
            $user_id,
            -$tutar,
            "Para çekme talebi - {$yontem} - ₺" . number_format($tutar, 2)
        ]);
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Para çekme talebiniz başarıyla oluşturuldu',
            'data' => [
                'id' => $withdrawal_id,
                'tutar' => $tutar,
                'yontem' => $yontem,
                'durum' => 'beklemede',
                'tarih' => date('Y-m-d H:i:s')
            ]
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}

// Para çekme taleplerini listele
function getWithdrawalRequests($pdo, $user_id) {
    $limit = intval($_GET['limit'] ?? 20);
    $offset = intval($_GET['offset'] ?? 0);
    
    $stmt = $pdo->prepare("
        SELECT 
            id,
            yontem,
            tutar,
            detay_bilgiler,
            aciklama,
            durum,
            tarih,
            admin_notu,
            islem_tarihi
        FROM withdrawals 
        WHERE user_id = ? 
        ORDER BY tarih DESC 
        LIMIT ? OFFSET ?
    ");
    $stmt->execute([$user_id, $limit, $offset]);
    $withdrawals = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Detay bilgilerini parse et
    foreach ($withdrawals as &$withdrawal) {
        $withdrawal['detay_bilgiler'] = json_decode($withdrawal['detay_bilgiler'], true);
        $withdrawal['tutar'] = floatval($withdrawal['tutar']);
    }
    
    // Toplam sayıyı al
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM withdrawals WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $total = $stmt->fetchColumn();
    
    // Özet istatistikleri
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(*) as total_requests,
            COALESCE(SUM(CASE WHEN durum = 'onaylandi' THEN tutar ELSE 0 END), 0) as total_withdrawn,
            COALESCE(SUM(CASE WHEN durum = 'beklemede' THEN tutar ELSE 0 END), 0) as pending_amount,
            COUNT(CASE WHEN durum = 'beklemede' THEN 1 END) as pending_count
        FROM withdrawals 
        WHERE user_id = ?
    ");
    $stmt->execute([$user_id]);
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $withdrawals,
        'pagination' => [
            'total' => intval($total),
            'limit' => $limit,
            'offset' => $offset,
            'has_more' => ($offset + $limit) < $total
        ],
        'stats' => [
            'total_requests' => intval($stats['total_requests']),
            'total_withdrawn' => floatval($stats['total_withdrawn']),
            'pending_amount' => floatval($stats['pending_amount']),
            'pending_count' => intval($stats['pending_count'])
        ]
    ]);
}

// Para çekme talebini iptal et
function cancelWithdrawalRequest($pdo, $user_id) {
    $withdrawal_id = intval($_POST['withdrawal_id'] ?? 0);
    
    if (!$withdrawal_id) {
        throw new Exception('Geçersiz talep ID');
    }
    
    // Talebi kontrol et
    $stmt = $pdo->prepare("
        SELECT id, tutar, durum 
        FROM withdrawals 
        WHERE id = ? AND user_id = ?
    ");
    $stmt->execute([$withdrawal_id, $user_id]);
    $withdrawal = $stmt->fetch();
    
    if (!$withdrawal) {
        throw new Exception('Talep bulunamadı');
    }
    
    if ($withdrawal['durum'] !== 'beklemede') {
        throw new Exception('Sadece beklemede olan talepler iptal edilebilir');
    }
    
    // Transaction başlat
    $pdo->beginTransaction();
    
    try {
        // Talebi iptal et
        $stmt = $pdo->prepare("
            UPDATE withdrawals 
            SET durum = 'iptal', admin_notu = 'Kullanıcı tarafından iptal edildi', islem_tarihi = NOW() 
            WHERE id = ?
        ");
        $stmt->execute([$withdrawal_id]);
        
        // Bakiyeyi geri ver
        $stmt = $pdo->prepare("UPDATE users SET balance = balance + ? WHERE id = ?");
        $stmt->execute([$withdrawal['tutar'], $user_id]);
        
        // Transaction history'ye kaydet
        $stmt = $pdo->prepare("
            INSERT INTO transaction_history (user_id, type, sub_type, amount, description, date) 
            VALUES (?, 'withdrawal', 'iptal', ?, ?, NOW())
        ");
        $stmt->execute([
            $user_id,
            $withdrawal['tutar'],
            "Para çekme talebi iptal edildi - ₺" . number_format($withdrawal['tutar'], 2)
        ]);
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Para çekme talebiniz iptal edildi ve bakiyeniz iade edildi'
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}
?>
