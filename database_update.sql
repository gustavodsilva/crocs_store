-- ========================================
-- ATUALIZAÇÃO DO BANCO DE DADOS - TOM STORE
-- ========================================

USE tom_store;

-- ========================================
-- ATUALIZAR TABELA USERS PARA CADASTRO COMPLETO
-- ========================================

-- Primeiro, backup da tabela atual (opcional)
-- CREATE TABLE users_backup AS SELECT * FROM users;

-- Remover tabela antiga se existir
DROP TABLE IF EXISTS users;

-- Criar nova tabela users com campos completos
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL UNIQUE,
    cep VARCHAR(10),
    rua VARCHAR(255),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(50),
    numero VARCHAR(20),
    complemento VARCHAR(255),
    username VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'cliente') NOT NULL DEFAULT 'cliente',
    email VARCHAR(255),
    data_nascimento DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    active BOOLEAN DEFAULT TRUE
);

-- ========================================
-- INSERIR USUÁRIOS INICIAIS
-- ========================================

-- Admin existente
INSERT INTO users (
    nome, 
    telefone, 
    username, 
    password, 
    role, 
    email
) VALUES (
    'Administrador Tom Store',
    '11985278370',
    'adminTom',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin',
    'admin@tomstore.com'
);

-- Cliente de exemplo
INSERT INTO users (
    nome,
    telefone,
    cep,
    rua,
    bairro,
    cidade,
    estado,
    numero,
    complemento,
    username,
    password,
    role,
    email,
    data_nascimento
) VALUES (
    'Cliente Exemplo',
    '11999999999',
    '01310200',
    'Avenida Paulista',
    'Bela Vista',
    'São Paulo',
    'SP',
    '1000',
    'Apto 101',
    'cliente1',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'cliente',
    'cliente@tomstore.com',
    '1990-01-01'
);

-- ========================================
-- ÍNDICES PARA MELHORAR PERFORMANCE
-- ========================================

-- Índice único para telefone
CREATE UNIQUE INDEX idx_users_telefone ON users(telefone);

-- Índice para username (se usado)
CREATE INDEX idx_users_username ON users(username);

-- Índice para email
CREATE INDEX idx_users_email ON users(email);

-- Índice para role
CREATE INDEX idx_users_role ON users(role);

-- Índice para active
CREATE INDEX idx_users_active ON users(active);

-- Índice composto para busca
CREATE INDEX idx_users_search ON users(nome, telefone, email);

-- ========================================
-- TRIGGERS PARA AUDITORIA
-- ========================================

DELIMITER //

-- Trigger para atualizar last_login ao fazer login
CREATE TRIGGER before_user_login
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    IF NEW.last_login IS NULL OR NEW.last_login != OLD.last_login THEN
        SET NEW.updated_at = CURRENT_TIMESTAMP;
    END IF;
END//

DELIMITER ;

-- ========================================
-- VIEWS ÚTEIS
-- ========================================

-- View para clientes ativos
CREATE VIEW clientes_ativos AS
SELECT 
    id, nome, telefone, email, cidade, estado,
    created_at, last_login
FROM users 
WHERE role = 'cliente' AND active = TRUE
ORDER BY nome;

-- View para estatísticas
CREATE VIEW user_stats AS
SELECT 
    role,
    COUNT(*) as total,
    COUNT(CASE WHEN active = TRUE THEN 1 END) as ativos,
    COUNT(CASE WHEN last_login IS NOT NULL THEN 1 END) as ja_logaram,
    DATE(created_at) as data_cadastro
FROM users 
GROUP BY role, DATE(created_at);

-- ========================================
-- RELATÓRIO FINAL
-- ========================================

SELECT 
    'Tabela users atualizada com sucesso' as status,
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
    COUNT(CASE WHEN role = 'cliente' THEN 1 END) as clientes
FROM users;
