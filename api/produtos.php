<?php
// ========================================
// API DE PRODUTOS - TOM STORE
// ========================================

require_once 'config.php';

// Habilitar CORS para desenvolvimento
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Verificar autenticação (exceto para GET - produtos públicos)
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    if (!isLoggedIn()) {
        jsonResponse(['error' => 'Não autorizado'], 401);
    }
    
    // Verificar se é admin para POST, PUT, DELETE
    if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'DELETE']) && !isAdmin()) {
        jsonResponse(['error' => 'Apenas administradores podem gerenciar produtos'], 403);
    }
}

$database = new Database();
$db = $database->getConnection();

// ========================================
// MÉTODOS HTTP
// ========================================

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        getProdutos($db);
        break;
    case 'POST':
        createProduto($db);
        break;
    case 'PUT':
        updateProduto($db);
        break;
    case 'DELETE':
        deleteProduto($db);
        break;
    default:
        jsonResponse(['error' => 'Método não permitido'], 405);
}

// ========================================
// FUNÇÕES CRUD
// ========================================

function getProdutos($db) {
    try {
        // Obter parâmetros de filtro
        $categoriaId = isset($_GET['categoria_id']) ? (int) $_GET['categoria_id'] : null;
        $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : null;
        $offset = isset($_GET['offset']) ? (int) $_GET['offset'] : 0;
        
        // Construir query base
        $query = "SELECT p.id, p.nome, p.preco, p.imagem, p.categoria_id, 
                         c.nome as categoria_nome, 
                         p.created_at, p.updated_at
                  FROM produtos p
                  JOIN categorias c ON p.categoria_id = c.id";
        
        $params = [];
        
        // Adicionar filtro de categoria se especificado
        if ($categoriaId) {
            $query .= " WHERE p.categoria_id = :categoria_id";
            $params[':categoria_id'] = $categoriaId;
        }
        
        $query .= " ORDER BY p.nome";
        
        // Adicionar limit/offset se especificado
        if ($limit) {
            $query .= " LIMIT :limit OFFSET :offset";
            $params[':limit'] = $limit;
            $params[':offset'] = $offset;
        }
        
        $stmt = $db->prepare($query);
        
        // Bind dos parâmetros
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value, is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
        }
        
        $stmt->execute();
        $produtos = $stmt->fetchAll();
        
        // Formatar preço para 2 casas decimais
        foreach ($produtos as &$produto) {
            $produto['preco'] = number_format((float) $produto['preco'], 2, '.', '');
        }
        
        jsonResponse([
            'success' => true,
            'data' => $produtos
        ]);
        
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Erro ao buscar produtos'], 500);
    }
}

function createProduto($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        jsonResponse(['error' => 'Dados inválidos'], 400);
    }
    
    // Validar campos obrigatórios
    $requiredFields = ['nome', 'preco', 'categoria_id'];
    foreach ($requiredFields as $field) {
        if (empty($data[$field])) {
            jsonResponse(['error' => ucfirst($field) . ' é obrigatório'], 400);
        }
    }
    
    $nome = sanitizeInput($data['nome']);
    $preco = (float) $data['preco'];
    $categoriaId = (int) $data['categoria_id'];
    $imagem = sanitizeInput($data['imagem'] ?? '');
    
    // Validações
    if (strlen($nome) < 2 || strlen($nome) > 150) {
        jsonResponse(['error' => 'Nome deve ter entre 2 e 150 caracteres'], 400);
    }
    
    if ($preco <= 0) {
        jsonResponse(['error' => 'Preço deve ser maior que zero'], 400);
    }
    
    try {
        // Verificar se categoria existe
        $checkCategoriaQuery = "SELECT id FROM categorias WHERE id = :categoria_id";
        $checkCategoriaStmt = $db->prepare($checkCategoriaQuery);
        $checkCategoriaStmt->bindParam(':categoria_id', $categoriaId);
        $checkCategoriaStmt->execute();
        
        if (!$checkCategoriaStmt->fetch()) {
            jsonResponse(['error' => 'Categoria não encontrada'], 404);
        }
        
        // Inserir produto
        $query = "INSERT INTO produtos (nome, preco, categoria_id, imagem) 
                  VALUES (:nome, :preco, :categoria_id, :imagem)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':nome', $nome);
        $stmt->bindParam(':preco', $preco);
        $stmt->bindParam(':categoria_id', $categoriaId);
        $stmt->bindParam(':imagem', $imagem);
        
        if ($stmt->execute()) {
            $produtoId = $db->lastInsertId();
            
            logActivity("Created product: $nome (ID: $produtoId)", $_SESSION['user_id']);
            
            jsonResponse([
                'success' => true,
                'message' => 'Produto criado com sucesso',
                'data' => [
                    'id' => $produtoId,
                    'nome' => $nome,
                    'preco' => number_format($preco, 2, '.', ''),
                    'categoria_id' => $categoriaId,
                    'imagem' => $imagem
                ]
            ]);
        } else {
            jsonResponse(['error' => 'Erro ao criar produto'], 500);
        }
        
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Erro no servidor'], 500);
    }
}

function updateProduto($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        jsonResponse(['error' => 'Dados inválidos'], 400);
    }
    
    // Validar campos obrigatórios
    $requiredFields = ['id', 'nome', 'preco', 'categoria_id'];
    foreach ($requiredFields as $field) {
        if (empty($data[$field])) {
            jsonResponse(['error' => ucfirst($field) . ' é obrigatório'], 400);
        }
    }
    
    $id = (int) $data['id'];
    $nome = sanitizeInput($data['nome']);
    $preco = (float) $data['preco'];
    $categoriaId = (int) $data['categoria_id'];
    $imagem = sanitizeInput($data['imagem'] ?? '');
    
    // Validações
    if (strlen($nome) < 2 || strlen($nome) > 150) {
        jsonResponse(['error' => 'Nome deve ter entre 2 e 150 caracteres'], 400);
    }
    
    if ($preco <= 0) {
        jsonResponse(['error' => 'Preço deve ser maior que zero'], 400);
    }
    
    try {
        // Verificar se produto existe
        $checkQuery = "SELECT id FROM produtos WHERE id = :id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':id', $id);
        $checkStmt->execute();
        
        if (!$checkStmt->fetch()) {
            jsonResponse(['error' => 'Produto não encontrado'], 404);
        }
        
        // Verificar se categoria existe
        $checkCategoriaQuery = "SELECT id FROM categorias WHERE id = :categoria_id";
        $checkCategoriaStmt = $db->prepare($checkCategoriaQuery);
        $checkCategoriaStmt->bindParam(':categoria_id', $categoriaId);
        $checkCategoriaStmt->execute();
        
        if (!$checkCategoriaStmt->fetch()) {
            jsonResponse(['error' => 'Categoria não encontrada'], 404);
        }
        
        // Atualizar produto
        $query = "UPDATE produtos 
                  SET nome = :nome, preco = :preco, categoria_id = :categoria_id, imagem = :imagem 
                  WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':nome', $nome);
        $stmt->bindParam(':preco', $preco);
        $stmt->bindParam(':categoria_id', $categoriaId);
        $stmt->bindParam(':imagem', $imagem);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            logActivity("Updated product ID: $id to: $nome", $_SESSION['user_id']);
            
            jsonResponse([
                'success' => true,
                'message' => 'Produto atualizado com sucesso',
                'data' => [
                    'id' => $id,
                    'nome' => $nome,
                    'preco' => number_format($preco, 2, '.', ''),
                    'categoria_id' => $categoriaId,
                    'imagem' => $imagem
                ]
            ]);
        } else {
            jsonResponse(['error' => 'Erro ao atualizar produto'], 500);
        }
        
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Erro no servidor'], 500);
    }
}

function deleteProduto($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || empty($data['id'])) {
        jsonResponse(['error' => 'ID do produto é obrigatório'], 400);
    }
    
    $id = (int) $data['id'];
    
    try {
        // Verificar se produto existe
        $checkQuery = "SELECT id, nome FROM produtos WHERE id = :id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':id', $id);
        $checkStmt->execute();
        
        $produto = $checkStmt->fetch();
        
        if (!$produto) {
            jsonResponse(['error' => 'Produto não encontrado'], 404);
        }
        
        // Excluir produto
        $query = "DELETE FROM produtos WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            logActivity("Deleted product ID: $id ({$produto['nome']})", $_SESSION['user_id']);
            
            jsonResponse([
                'success' => true,
                'message' => 'Produto excluído com sucesso'
            ]);
        } else {
            jsonResponse(['error' => 'Erro ao excluir produto'], 500);
        }
        
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Erro no servidor'], 500);
    }
}

?>
