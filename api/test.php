<?php
// ========================================
// TESTE DE CONEXÃO - TOM STORE
// ========================================

echo "<h1>Teste de Conexão - Tom Store</h1>";

// Testar se o config.php existe
if (file_exists('config.php')) {
    echo "<p style='color: green;'>✅ config.php encontrado</p>";
    
    try {
        require_once 'config.php';
        echo "<p style='color: green;'>✅ config.php carregado com sucesso</p>";
        
        // Testar conexão com banco
        $database = new Database();
        $db = $database->getConnection();
        
        if ($db) {
            echo "<p style='color: green;'>✅ Conexão com banco de dados OK</p>";
            
            // Verificar se tabela users existe
            $query = "SHOW TABLES LIKE 'users'";
            $stmt = $db->prepare($query);
            $stmt->execute();
            
            if ($stmt->fetch()) {
                echo "<p style='color: green;'>✅ Tabela 'users' existe</p>";
                
                // Verificar se tem dados
                $query = "SELECT COUNT(*) as total FROM users";
                $stmt = $db->prepare($query);
                $stmt->execute();
                $result = $stmt->fetch();
                
                echo "<p style='color: blue;'>📊 Total de usuários: " . $result['total'] . "</p>";
                
                // Listar usuários
                $query = "SELECT id, username, telefone, role FROM users";
                $stmt = $db->prepare($query);
                $stmt->execute();
                $users = $stmt->fetchAll();
                
                echo "<h3>Usuários cadastrados:</h3>";
                echo "<table border='1' style='border-collapse: collapse; margin: 10px 0;'>";
                echo "<tr><th>ID</th><th>Username</th><th>Telefone</th><th>Role</th></tr>";
                
                foreach ($users as $user) {
                    echo "<tr>";
                    echo "<td>" . $user['id'] . "</td>";
                    echo "<td>" . $user['username'] . "</td>";
                    echo "<td>" . $user['telefone'] . "</td>";
                    echo "<td>" . $user['role'] . "</td>";
                    echo "</tr>";
                }
                
                echo "</table>";
                
            } else {
                echo "<p style='color: red;'>❌ Tabela 'users' não existe!</p>";
                echo "<p><strong>Solução:</strong> Execute o arquivo database_update.sql no MySQL</p>";
                echo "<p>Comando: mysql -u root -p tom_store < database_update.sql</p>";
            }
            
        } else {
            echo "<p style='color: red;'>❌ Erro na conexão com banco de dados</p>";
            echo "<p>Verifique as configurações em config.php:</p>";
            echo "<ul>";
            echo "<li>DB_HOST: " . DB_HOST . "</li>";
            echo "<li>DB_NAME: " . DB_NAME . "</li>";
            echo "<li>DB_USER: " . DB_USER . "</li>";
            echo "<li>DB_PASS: " . (empty(DB_PASS) ? '(vazio)' : '(preenchido)') . "</li>";
            echo "</ul>";
        }
        
    } catch (Exception $e) {
        echo "<p style='color: red;'>❌ Erro: " . $e->getMessage() . "</p>";
    }
    
} else {
    echo "<p style='color: red;'>❌ config.php não encontrado!</p>";
}

// Testar se as APIs existem
$apis = ['login.php', 'cadastro.php', 'logout.php', 'check_session.php'];

echo "<h3>APIs encontradas:</h3>";
foreach ($apis as $api) {
    if (file_exists($api)) {
        echo "<p style='color: green;'>✅ $api</p>";
    } else {
        echo "<p style='color: red;'>❌ $api</p>";
    }
}

echo "<hr>";
echo "<p><a href='login.html'>🔐 Ir para página de login</a></p>";
echo "<p><a href='../index.html'>🏠 Ir para loja</a></p>";

?>
