-- ========================================
-- BANCO DE DADOS - TOM STORE
-- ========================================

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS tom_store DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar o banco de dados
USE tom_store;

-- ========================================
-- TABELA DE USUÁRIOS
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'cliente') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- TABELA DE CATEGORIAS
-- ========================================
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- TABELA DE PRODUTOS
-- ========================================
CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    categoria_id INT NOT NULL,
    imagem VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
);

-- ========================================
-- INSERIR DADOS INICIAIS
-- ========================================

-- Usuários iniciais
INSERT INTO users (username, password, role) VALUES
('adminTom', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('cliente1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cliente');

-- Senhas: 'password' (para ambos os usuários)
-- Para gerar hash: password_hash('password', PASSWORD_DEFAULT)

-- Categorias iniciais
INSERT INTO categorias (nome) VALUES
('Camisa'),
('Bermuda'),
('Calça'),
('Vestido'),
('Acessório');

-- Produtos iniciais
INSERT INTO produtos (nome, preco, categoria_id, imagem) VALUES
('Camisa Preta', 130.00, 1, '2.camisa_preta.jpeg'),
('Camisa Branca', 130.00, 1, '3.camisa_branca.jpeg'),
('Camisa Azul Marinho', 130.00, 1, '4.camisa_azul_marinho.jpeg'),
('Camisa Vermelha', 130.00, 1, '5.camisa_vermelha.jpeg'),
('Bermuda Azul Marinho', 90.00, 2, '7.bermuda_azul_marinho.jpeg'),
('Bermuda Verde', 90.00, 2, '8.bermuda_verde.jpeg'),
('Bermuda Preta', 90.00, 2, '9.bermuda_preta.jpeg'),
('Bermuda Azul', 90.00, 2, '10.bermuda_azul.jpeg'),
('Bermuda Vermelha', 90.00, 2, '11.bermuda_vermelha.jpeg'),
('Bermuda Branca', 90.00, 2, '12.bermuda_branca.jpeg');

-- ========================================
-- ÍNDICES PARA MELHORAR PERFORMANCE
-- ========================================

-- Índices para usuários
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- Índices para produtos
CREATE INDEX idx_produtos_categoria ON produtos(categoria_id);
CREATE INDEX idx_produtos_nome ON produtos(nome);

-- Índices para categorias
CREATE INDEX idx_categorias_nome ON categorias(nome);

-- ========================================
-- TRIGGERS PARA AUDITORIA (OPCIONAL)
-- ========================================

DELIMITER //

-- Trigger para registrar alterações em produtos
CREATE TRIGGER before_produto_update
BEFORE UPDATE ON produtos
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

-- Trigger para registrar alterações em categorias
CREATE TRIGGER before_categoria_update
BEFORE UPDATE ON categorias
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

DELIMITER ;

-- ========================================
-- VIEWS PARA CONSULTAS ÚTEIS (OPCIONAL)
-- ========================================

-- View para produtos com nome da categoria
CREATE VIEW produtos_com_categoria AS
SELECT 
    p.id,
    p.nome,
    p.preco,
    p.imagem,
    p.created_at,
    p.updated_at,
    c.nome AS categoria_nome
FROM produtos p
JOIN categorias c ON p.categoria_id = c.id;

-- ========================================
-- RELATÓRIO FINAL
-- ========================================
SELECT 
    'Usuários cadastrados' as info,
    COUNT(*) as quantidade 
FROM users
UNION ALL
SELECT 
    'Categorias cadastradas' as info,
    COUNT(*) as quantidade 
FROM categorias
UNION ALL
SELECT 
    'Produtos cadastrados' as info,
    COUNT(*) as quantidade 
FROM produtos;
