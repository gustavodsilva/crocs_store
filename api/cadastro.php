<?php
// ========================================
// API DE CADASTRO - TOM STORE
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

// ========================================
// VALIDAÇÃO DOS DADOS
// ========================================

$requiredFields = ['nome', 'telefone', 'cep', 'rua', 'numero', 'bairro', 'cidade', 'estado', 'senha'];

foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
        jsonResponse(['error' => "Campo '$field' é obrigatório"], 400);
    }
}

// Sanitizar dados
$nome = sanitizeInput($data['nome']);
$telefone = sanitizeInput($data['telefone']);
$email = !empty($data['email']) ? sanitizeInput($data['email']) : null;
$cep = sanitizeInput($data['cep']);
$rua = sanitizeInput($data['rua']);
$numero = sanitizeInput($data['numero']);
$complemento = !empty($data['complemento']) ? sanitizeInput($data['complemento']) : null;
$bairro = sanitizeInput($data['bairro']);
$cidade = sanitizeInput($data['cidade']);
$estado = sanitizeInput($data['estado']);
$senha = $data['senha'];
$dataNascimento = !empty($data['data_nascimento']) ? $data['data_nascimento'] : null;

// Validações específicas
if (strlen($nome) < 3) {
    jsonResponse(['error' => 'Nome deve ter pelo menos 3 caracteres'], 400);
}

if (strlen($telefone) < 10 || strlen($telefone) > 11) {
    jsonResponse(['error' => 'Telefone inválido'], 400);
}

if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['error' => 'E-mail inválido'], 400);
}

if (strlen($cep) !== 8) {
    jsonResponse(['error' => 'CEP inválido'], 400);
}

if (strlen($senha) < 6) {
    jsonResponse(['error' => 'Senha deve ter pelo menos 6 caracteres'], 400);
}

if ($dataNascimento && !DateTime::createFromFormat('Y-m-d', $dataNascimento)) {
    jsonResponse(['error' => 'Data de nascimento inválida'], 400);
}

// ========================================
// BANCO DE DADOS
// ========================================

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Verificar se telefone já existe
    $query = "SELECT id FROM users WHERE telefone = :telefone";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':telefone', $telefone);
    $stmt->execute();
    
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'Telefone já cadastrado'], 409);
    }
    
    // Verificar se email já existe (se fornecido)
    if ($email) {
        $query = "SELECT id FROM users WHERE email = :email";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        if ($stmt->fetch()) {
            jsonResponse(['error' => 'E-mail já cadastrado'], 409);
        }
    }
    
    // Gerar username a partir do nome (opcional)
    $username = strtolower(str_replace(' ', '', $nome)) . '_' . substr($telefone, -4);
    
    // Hash da senha
    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
    
    // Inserir novo usuário
    $query = "INSERT INTO users (
        nome, telefone, email, cep, rua, bairro, cidade, estado, 
        numero, complemento, username, password, role, data_nascimento
    ) VALUES (
        :nome, :telefone, :email, :cep, :rua, :bairro, :cidade, :estado,
        :numero, :complemento, :username, :password, 'cliente', :data_nascimento
    )";
    
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':nome', $nome);
    $stmt->bindParam(':telefone', $telefone);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':cep', $cep);
    $stmt->bindParam(':rua', $rua);
    $stmt->bindParam(':bairro', $bairro);
    $stmt->bindParam(':cidade', $cidade);
    $stmt->bindParam(':estado', $estado);
    $stmt->bindParam(':numero', $numero);
    $stmt->bindParam(':complemento', $complemento);
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':password', $senhaHash);
    $stmt->bindParam(':data_nascimento', $dataNascimento);
    
    if ($stmt->execute()) {
        $userId = $db->lastInsertId();
        
        // Log de atividade
        logActivity("User registered: $nome (Phone: $telefone)", $userId);
        
        jsonResponse([
            'success' => true,
            'message' => 'Cadastro realizado com sucesso!',
            'data' => [
                'id' => $userId,
                'nome' => $nome,
                'telefone' => $telefone,
                'username' => $username
            ]
        ]);
    } else {
        jsonResponse(['error' => 'Erro ao realizar cadastro'], 500);
    }
    
} catch (PDOException $e) {
    // Verificar erro de duplicação
    if ($e->getCode() == 23000) {
        $errorInfo = $e->getMessage();
        if (strpos($errorInfo, 'telefone') !== false) {
            jsonResponse(['error' => 'Telefone já cadastrado'], 409);
        } elseif (strpos($errorInfo, 'email') !== false) {
            jsonResponse(['error' => 'E-mail já cadastrado'], 409);
        } else {
            jsonResponse(['error' => 'Dados duplicados'], 409);
        }
    }
    
    jsonResponse(['error' => 'Erro no servidor'], 500);
}

?>
