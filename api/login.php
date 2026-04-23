<?php
// ========================================
// API DE LOGIN - TOM STORE
// ========================================

require_once 'config.php';

// Habilitar CORS para desenvolvimento
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Método não permitido'], 405);
}

// Obter dados do POST
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    jsonResponse(['error' => 'Dados inválidos'], 400);
}

$username = sanitizeInput($data['username'] ?? '');
$password = $data['password'] ?? '';

if (empty($username) || empty($password)) {
    jsonResponse(['error' => 'Usuário e senha são obrigatórios'], 400);
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Buscar usuário no banco
    $query = "SELECT id, username, password, role FROM users WHERE username = :username";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':username', $username);
    $stmt->execute();

    $user = $stmt->fetch();

    if (!$user) {
        jsonResponse(['error' => 'Usuário ou senha inválidos'], 401);
    }

    // Verificar senha
    if (!password_verify($password, $user['password'])) {
        jsonResponse(['error' => 'Usuário ou senha inválidos'], 401);
    }

    // Iniciar sessão
    secureSession();

    // Regenerar ID da sessão para segurança
    session_regenerate_id(true);

    // Salvar dados na sessão
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['user_role'] = $user['role'];
    $_SESSION['login_time'] = time();

    // Log de atividade
    logActivity("Login successful", $user['id']);

    // Retornar resposta de sucesso
    jsonResponse([
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role']
        ],
        'redirect' => $user['role'] === 'admin' ? 'admin.html' : 'index.html'
    ]);

} catch (PDOException $e) {
    jsonResponse(['error' => 'Erro no servidor'], 500);
}

?>
