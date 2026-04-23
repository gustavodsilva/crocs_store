<?php
// ========================================
// INSTALAÇÃO AUTOMÁTICA - TOM STORE
// ========================================

echo "<h1>🔧 Instalação Automática - Tom Store</h1>";

// Configurações do banco
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');

try {
    // Conectar ao MySQL (sem banco específico)
    $pdo = new PDO("mysql:host=" . DB_HOST, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<p style='color: green;'>✅ Conexão com MySQL OK</p>";
    
    // Criar banco se não existir
    $pdo->exec("CREATE DATABASE IF NOT EXISTS tom_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "<p style='color: green;'>✅ Banco 'tom_store' criado/verificado</p>";
    
    // Usar o banco
    $pdo->exec("USE tom_store");
    
    // Remover tabela antiga se existir
    $pdo->exec("DROP TABLE IF EXISTS users");
    echo "<p style='color: blue;'>🔄 Tabela users antiga removida</p>";
    
    // Criar nova tabela users
    $createTableSQL = "
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $pdo->exec($createTableSQL);
    echo "<p style='color: green;'>✅ Tabela users criada com sucesso</p>";
    
    // Inserir usuários iniciais
    $insertAdmin = "
    INSERT INTO users (nome, telefone, username, password, role, email) 
    VALUES ('Administrador Tom Store', '11985278370', 'adminTom', 
            '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
            'admin', 'admin@tomstore.com')";
    
    $pdo->exec($insertAdmin);
    echo "<p style='color: green;'>✅ Usuário admin criado</p>";
    
    $insertClient = "
    INSERT INTO users (nome, telefone, cep, rua, bairro, cidade, estado, numero, complemento, username, password, role, email, data_nascimento) 
    VALUES ('Cliente Exemplo', '11999999999', '01310200', 'Avenida Paulista', 'Bela Vista', 'São Paulo', 'SP', '1000', 'Apto 101', 'cliente1', 
            '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
            'cliente', 'cliente@tomstore.com', '1990-01-01')";
    
    $pdo->exec($insertClient);
    echo "<p style='color: green;'>✅ Usuário cliente criado</p>";
    
    // Verificar usuários criados
    $stmt = $pdo->query("SELECT id, username, role, nome FROM users");
    $users = $stmt->fetchAll();
    
    echo "<h2>👥 Usuários Criados:</h2>";
    echo "<table border='1' style='border-collapse: collapse; margin: 20px 0;'>";
    echo "<tr style='background: #f0f0f0;'><th>ID</th><th>Username</th><th>Senha</th><th>Role</th><th>Nome</th></tr>";
    
    foreach ($users as $user) {
        $senha = $user['role'] === 'admin' ? 'password' : 'password';
        echo "<tr>";
        echo "<td>" . $user['id'] . "</td>";
        echo "<td><strong>" . $user['username'] . "</strong></td>";
        echo "<td><code>" . $senha . "</code></td>";
        echo "<td>" . $user['role'] . "</td>";
        echo "<td>" . $user['nome'] . "</td>";
        echo "</tr>";
    }
    
    echo "</table>";
    
    // Testar login
    echo "<h2>🧪 Teste de Login:</h2>";
    
    // Testar login admin
    $stmt = $pdo->prepare("SELECT id, username, password, role FROM users WHERE (username = :username OR telefone = :username)");
    $stmt->execute([':username' => 'adminTom']);
    $admin = $stmt->fetch();
    
    if ($admin && password_verify('password', $admin['password'])) {
        echo "<p style='color: green;'>✅ Login adminTom: SUCESSO</p>";
    } else {
        echo "<p style='color: red;'>❌ Login adminTom: FALHA</p>";
    }
    
    // Testar login cliente
    $stmt->execute([':username' => 'cliente1']);
    $client = $stmt->fetch();
    
    if ($client && password_verify('password', $client['password'])) {
        echo "<p style='color: green;'>✅ Login cliente1: SUCESSO</p>";
    } else {
        echo "<p style='color: red;'>❌ Login cliente1: FALHA</p>";
    }
    
    echo "<hr>";
    echo "<h2>🎉 Instalação Concluída!</h2>";
    echo "<p><strong>Próximos passos:</strong></p>";
    echo "<ol>";
    echo "<li>Acesse: <a href='../login.html'>🔐 Página de Login</a></li>";
    echo "<li>Use as credenciais acima para testar</li>";
    echo "<li>Admin: <code>adminTom / password</code></li>";
    echo "<li>Cliente: <code>cliente1 / password</code></li>";
    echo "</ol>";
    
    echo "<p><a href='../login.html' style='background: #00A86B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>🔐 Ir para Login</a></p>";
    
} catch (PDOException $e) {
    echo "<p style='color: red;'>❌ Erro: " . $e->getMessage() . "</p>";
    echo "<p><strong>Soluções possíveis:</strong></p>";
    echo "<ul>";
    echo "<li>Verifique se o MySQL está rodando</li>";
    echo "<li>Verifique usuário/senha do MySQL (root/senha)</li>";
    echo "<li>Verifique se o servidor PHP permite conexões MySQL</li>";
    echo "</ul>";
}

?>
