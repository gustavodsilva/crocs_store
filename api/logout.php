<?php
// ========================================
// API DE LOGOUT - TOM STORE
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

try {
    // Iniciar sessão
    secureSession();

    // Log de atividade se usuário estava logado
    if (isLoggedIn()) {
        logActivity("Logout successful", $_SESSION['user_id']);
    }

    // Destruir sessão
    session_unset();
    session_destroy();

    // Limpar cookie de sessão
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params["path"],
            $params["domain"],
            $params["secure"],
            $params["httponly"]
        );
    }

    jsonResponse(['success' => true, 'message' => 'Logout realizado com sucesso']);

} catch (Exception $e) {
    jsonResponse(['error' => 'Erro no servidor'], 500);
}

?>
