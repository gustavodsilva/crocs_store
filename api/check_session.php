<?php
// ========================================
// API DE VERIFICAÇÃO DE SESSÃO - TOM STORE
// ========================================

require_once 'config.php';

// Habilitar CORS para desenvolvimento
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Método não permitido'], 405);
}

// ========================================
// VERIFICAÇÃO DE SESSÃO
// ========================================

try {
    secureSession();
    
    if (isLoggedIn()) {
        // Usuário está logado
        $userId = $_SESSION['user_id'];
        $username = $_SESSION['username'];
        $userRole = $_SESSION['user_role'];
        
        // Buscar dados completos do usuário
        $database = new Database();
        $db = $database->getConnection();
        
        $query = "SELECT id, nome, username, telefone, email, role FROM users WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $userId);
        $stmt->execute();
        
        $user = $stmt->fetch();
        
        if ($user) {
            jsonResponse([
                'logged_in' => true,
                'user' => [
                    'id' => $user['id'],
                    'nome' => $user['nome'],
                    'username' => $user['username'],
                    'telefone' => $user['telefone'],
                    'email' => $user['email'],
                    'role' => $user['role']
                ],
                'login_time' => $_SESSION['login_time'] ?? null
            ]);
        } else {
            // Usuário não encontrado no banco, limpar sessão
            session_unset();
            session_destroy();
            jsonResponse(['logged_in' => false]);
        }
    } else {
        // Usuário não está logado
        jsonResponse(['logged_in' => false]);
    }
    
} catch (Exception $e) {
    jsonResponse(['error' => 'Erro ao verificar sessão'], 500);
}

?>
