<?php
// ========================================
// CONFIGURAÇÃO DO BANCO DE DADOS - TOM STORE
// ========================================

// Configurações do banco de dados
define('DB_HOST', 'localhost');
define('DB_NAME', 'tom_store');
define('DB_USER', 'root'); // Alterar para seu usuário do MySQL
define('DB_PASS', ''); // Alterar para sua senha do MySQL

// Configurações da aplicação
define('APP_NAME', 'Tom Store');
define('APP_URL', 'http://localhost/crocs_store'); // Alterar para sua URL

// Configurações de sessão
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', 0); // Mudar para 1 em HTTPS

// Timezone
date_default_timezone_set('America/Sao_Paulo');

// ========================================
// CONEXÃO COM O BANCO DE DADOS
// ========================================

class Database {
    private $host = DB_HOST;
    private $db_name = DB_NAME;
    private $username = DB_USER;
    private $password = DB_PASS;
    private $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }

        return $this->conn;
    }
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

/**
 * Inicia sessão segura
 */
function secureSession() {
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
}

/**
 * Verifica se usuário está logado
 */
function isLoggedIn() {
    secureSession();
    return isset($_SESSION['user_id']);
}

/**
 * Verifica se usuário é admin
 */
function isAdmin() {
    secureSession();
    return isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin';
}

/**
 * Redireciona para página específica
 */
function redirect($url) {
    header("Location: $url");
    exit();
}

/**
 * Retorna resposta JSON
 */
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

/**
 * Valida entrada de dados
 */
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

/**
 * Gera token CSRF
 */
function generateCSRFToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Verifica token CSRF
 */
function verifyCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Log de atividades (opcional)
 */
function logActivity($action, $user_id = null) {
    $log_file = 'logs/activity.log';
    $log_dir = dirname($log_file);
    
    if (!file_exists($log_dir)) {
        mkdir($log_dir, 0755, true);
    }
    
    $timestamp = date('Y-m-d H:i:s');
    $user_info = $user_id ? "User ID: $user_id" : "System";
    $log_entry = "[$timestamp] $user_info - $action" . PHP_EOL;
    
    file_put_contents($log_file, $log_entry, FILE_APPEND | LOCK_EX);
}

// ========================================
// CABEÇALHOS DE SEGURANÇA
// ========================================

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');

?>
