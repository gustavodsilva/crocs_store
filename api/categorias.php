<?php
// ========================================
// API DE CATEGORIAS - TOM STORE
// ========================================

require_once 'config.php';

// Habilitar CORS para desenvolvimento
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Verificar autenticação (exceto para GET - categorias públicas)
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    if (!isLoggedIn()) {
        jsonResponse(['error' => 'Não autorizado'], 401);
    }
    
    // Verificar se é admin para POST, PUT, DELETE
    if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'DELETE']) && !isAdmin()) {
        jsonResponse(['error' => 'Apenas administradores podem gerenciar categorias'], 403);
    }
}

$database = new Database();
$db = $database->getConnection();

// ========================================
// MÉTODOS HTTP
// ========================================

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        getCategorias($db);
        break;
    case 'POST':
        createCategoria($db);
        break;
    case 'PUT':
        updateCategoria($db);
        break;
    case 'DELETE':
        deleteCategoria($db);
        break;
    default:
        jsonResponse(['error' => 'Método não permitido'], 405);
}

// ========================================
// FUNÇÕES CRUD
// ========================================

function getCategorias($db) {
    try {
        $query = "SELECT id, nome, created_at, updated_at FROM categorias ORDER BY nome";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $categorias = $stmt->fetchAll();
        
        jsonResponse([
            'success' => true,
            'data' => $categorias
        ]);
        
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Erro ao buscar categorias'], 500);
    }
}

function createCategoria($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || empty($data['nome'])) {
        jsonResponse(['error' => 'Nome da categoria é obrigatório'], 400);
    }
    
    $nome = sanitizeInput($data['nome']);
    
    if (strlen($nome) < 2 || strlen($nome) > 100) {
        jsonResponse(['error' => 'Nome deve ter entre 2 e 100 caracteres'], 400);
    }
    
    try {
        // Verificar se categoria já existe
        $checkQuery = "SELECT id FROM categorias WHERE nome = :nome";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':nome', $nome);
        $checkStmt->execute();
        
        if ($checkStmt->fetch()) {
            jsonResponse(['error' => 'Categoria já existe'], 409);
        }
        
        // Inserir nova categoria
        $query = "INSERT INTO categorias (nome) VALUES (:nome)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':nome', $nome);
        
        if ($stmt->execute()) {
            $categoriaId = $db->lastInsertId();
            
            logActivity("Created category: $nome", $_SESSION['user_id']);
            
            jsonResponse([
                'success' => true,
                'message' => 'Categoria criada com sucesso',
                'data' => [
                    'id' => $categoriaId,
                    'nome' => $nome
                ]
            ]);
        } else {
            jsonResponse(['error' => 'Erro ao criar categoria'], 500);
        }
        
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Erro no servidor'], 500);
    }
}

function updateCategoria($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || empty($data['id']) || empty($data['nome'])) {
        jsonResponse(['error' => 'ID e nome são obrigatórios'], 400);
    }
    
    $id = (int) $data['id'];
    $nome = sanitizeInput($data['nome']);
    
    if (strlen($nome) < 2 || strlen($nome) > 100) {
        jsonResponse(['error' => 'Nome deve ter entre 2 e 100 caracteres'], 400);
    }
    
    try {
        // Verificar se categoria existe
        $checkQuery = "SELECT id FROM categorias WHERE id = :id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':id', $id);
        $checkStmt->execute();
        
        if (!$checkStmt->fetch()) {
            jsonResponse(['error' => 'Categoria não encontrada'], 404);
        }
        
        // Verificar se nome já existe em outra categoria
        $checkNomeQuery = "SELECT id FROM categorias WHERE nome = :nome AND id != :id";
        $checkNomeStmt = $db->prepare($checkNomeQuery);
        $checkNomeStmt->bindParam(':nome', $nome);
        $checkNomeStmt->bindParam(':id', $id);
        $checkNomeStmt->execute();
        
        if ($checkNomeStmt->fetch()) {
            jsonResponse(['error' => 'Nome já está em uso por outra categoria'], 409);
        }
        
        // Atualizar categoria
        $query = "UPDATE categorias SET nome = :nome WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':nome', $nome);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            logActivity("Updated category ID: $id to: $nome", $_SESSION['user_id']);
            
            jsonResponse([
                'success' => true,
                'message' => 'Categoria atualizada com sucesso',
                'data' => [
                    'id' => $id,
                    'nome' => $nome
                ]
            ]);
        } else {
            jsonResponse(['error' => 'Erro ao atualizar categoria'], 500);
        }
        
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Erro no servidor'], 500);
    }
}

function deleteCategoria($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || empty($data['id'])) {
        jsonResponse(['error' => 'ID da categoria é obrigatório'], 400);
    }
    
    $id = (int) $data['id'];
    
    try {
        // Verificar se categoria existe
        $checkQuery = "SELECT id, nome FROM categorias WHERE id = :id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':id', $id);
        $checkStmt->execute();
        
        $categoria = $checkStmt->fetch();
        
        if (!$categoria) {
            jsonResponse(['error' => 'Categoria não encontrada'], 404);
        }
        
        // Verificar se há produtos vinculados
        $checkProdutosQuery = "SELECT COUNT(*) as total FROM produtos WHERE categoria_id = :id";
        $checkProdutosStmt = $db->prepare($checkProdutosQuery);
        $checkProdutosStmt->bindParam(':id', $id);
        $checkProdutosStmt->execute();
        
        $produtosCount = $checkProdutosStmt->fetch()['total'];
        
        if ($produtosCount > 0) {
            jsonResponse(['error' => 'Não é possível excluir categoria com produtos vinculados'], 400);
        }
        
        // Excluir categoria
        $query = "DELETE FROM categorias WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            logActivity("Deleted category ID: $id ({$categoria['nome']})", $_SESSION['user_id']);
            
            jsonResponse([
                'success' => true,
                'message' => 'Categoria excluída com sucesso'
            ]);
        } else {
            jsonResponse(['error' => 'Erro ao excluir categoria'], 500);
        }
        
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Erro no servidor'], 500);
    }
}

?>
