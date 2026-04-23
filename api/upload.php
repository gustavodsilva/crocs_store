<?php
// ========================================
// API DE UPLOAD DE IMAGENS - TOM STORE
// ========================================

require_once 'config.php';

// Habilitar CORS para desenvolvimento
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Método não permitido'], 405);
}

// Verificar autenticação
if (!isLoggedIn()) {
    jsonResponse(['error' => 'Não autorizado'], 401);
}

// Verificar se é admin
if (!isAdmin()) {
    jsonResponse(['error' => 'Apenas administradores podem fazer upload de imagens'], 403);
}

// ========================================
// CONFIGURAÇÕES DE UPLOAD
// ========================================

$uploadDir = '../uploads/';
$maxFileSize = 2 * 1024 * 1024; // 2MB
$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

// Criar diretório se não existir
if (!file_exists($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        jsonResponse(['error' => 'Não foi possível criar o diretório de uploads'], 500);
    }
}

// ========================================
// VALIDAÇÃO DO ARQUIVO
// ========================================

if (!isset($_FILES['imagem']) || $_FILES['imagem']['error'] !== UPLOAD_ERR_OK) {
    $uploadErrors = [
        UPLOAD_ERR_INI_SIZE => 'O arquivo é maior que o permitido pelo PHP',
        UPLOAD_ERR_FORM_SIZE => 'O arquivo é maior que o permitido pelo formulário',
        UPLOAD_ERR_PARTIAL => 'O upload foi feito parcialmente',
        UPLOAD_ERR_NO_FILE => 'Nenhum arquivo foi enviado',
        UPLOAD_ERR_NO_TMP_DIR => 'Pasta temporária não encontrada',
        UPLOAD_ERR_CANT_WRITE => 'Não foi possível escrever o arquivo no disco',
        UPLOAD_ERR_EXTENSION => 'Uma extensão PHP interrompeu o upload'
    ];
    
    $errorCode = $_FILES['imagem']['error'] ?? UPLOAD_ERR_NO_FILE;
    $errorMessage = $uploadErrors[$errorCode] ?? 'Erro desconhecido no upload';
    
    jsonResponse(['error' => $errorMessage], 400);
}

$file = $_FILES['imagem'];
$fileName = $file['name'];
$fileTmpName = $file['tmp_name'];
$fileSize = $file['size'];
$fileType = $file['type'];

// Validar tamanho do arquivo
if ($fileSize > $maxFileSize) {
    jsonResponse(['error' => 'O arquivo é muito grande. Tamanho máximo: 2MB'], 400);
}

// Validar tipo MIME
if (!in_array($fileType, $allowedTypes)) {
    jsonResponse(['error' => 'Tipo de arquivo não permitido. Apenas: JPG, PNG, GIF, WebP'], 400);
}

// Validar extensão do arquivo
$fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
if (!in_array($fileExtension, $allowedExtensions)) {
    jsonResponse(['error' => 'Extensão de arquivo não permitida. Apenas: jpg, jpeg, png, gif, webp'], 400);
}

// ========================================
// VALIDAÇÃO DE SEGURANÇA
// ========================================

// Verificar se é realmente uma imagem
if (!getimagesize($fileTmpName)) {
    jsonResponse(['error' => 'O arquivo não é uma imagem válida'], 400);
}

// Verificar se o arquivo não contém código malicioso
$imageInfo = getimagesize($fileTmpName);
if ($imageInfo === false) {
    jsonResponse(['error' => 'Arquivo de imagem inválido'], 400);
}

// ========================================
// GERAR NOME ÚNICO
// ========================================

// Remover caracteres especiais do nome original
$cleanFileName = preg_replace('/[^a-zA-Z0-9.-]/', '_', pathinfo($fileName, PATHINFO_FILENAME));
$cleanFileName = preg_replace('/_{2,}/', '_', $cleanFileName);

// Gerar nome único
$uniqueId = uniqid('img_', true);
$timestamp = date('Y-m-d_H-i-s');
$newFileName = $timestamp . '_' . $uniqueId . '.' . $fileExtension;

$uploadPath = $uploadDir . $newFileName;

// ========================================
// FAZER UPLOAD
// ========================================

if (!move_uploaded_file($fileTmpName, $uploadPath)) {
    jsonResponse(['error' => 'Não foi possível salvar o arquivo no servidor'], 500);
}

// ========================================
// VERIFICAR UPLOAD E RETORNAR RESPOSTA
// ========================================

// Verificar se o arquivo foi realmente salvo
if (!file_exists($uploadPath)) {
    jsonResponse(['error' => 'Erro ao verificar o arquivo salvo'], 500);
}

// Obter informações do arquivo salvo
$savedFileSize = filesize($uploadPath);
$savedImageInfo = getimagesize($uploadPath);

// Log de atividade
logActivity("Image uploaded: $newFileName (Size: $savedFileSize bytes)", $_SESSION['user_id']);

// Retornar sucesso
jsonResponse([
    'success' => true,
    'message' => 'Imagem enviada com sucesso',
    'data' => [
        'fileName' => $newFileName,
        'originalName' => $fileName,
        'filePath' => 'uploads/' . $newFileName,
        'fileSize' => $savedFileSize,
        'mimeType' => $savedImageInfo['mime'],
        'dimensions' => [
            'width' => $savedImageInfo[0],
            'height' => $savedImageInfo[1]
        ],
        'uploadTime' => date('Y-m-d H:i:s')
    ]
]);

?>
