# 🛍️ Tom Store - Sistema Completo de E-commerce

Sistema completo de e-commerce com frontend, backend e banco de dados MySQL.

---

## 📋 **Visão Geral**

- **Frontend:** HTML5, CSS3, JavaScript Vanilla
- **Backend:** PHP Puro com PDO
- **Banco de Dados:** MySQL
- **Autenticação:** Sessões PHP com segurança
- **Design:** Tema escuro com verde (#00A86B)

---

## 🗂️ **Estrutura de Arquivos**

```
crocs_store/
├── 📁 api/                    # API Backend
│   ├── config.php            # Configuração do banco e funções
│   ├── login.php             # Endpoint de login
│   ├── logout.php            # Endpoint de logout
│   ├── produtos.php          # CRUD de produtos
│   └── categorias.php        # CRUD de categorias
├── 📁 images/                 # Imagens dos produtos
├── 📁 logs/                   # Logs de atividades (criado automaticamente)
├── 📄 database.sql           # Estrutura do banco de dados
├── 📄 login.html             # Página de login única
├── 📄 login.css              # Estilos do login
├── 📄 login.js               # JavaScript do login
├── 📄 index.html             # Loja (clientes)
├── 📄 style.css              # Estilos da loja
├── 📄 script.js              # JavaScript da loja
├── 📄 admin-dashboard.html   # Dashboard administrativo
├── 📄 admin-dashboard.css    # Estilos do dashboard
├── 📄 admin-dashboard.js     # JavaScript do dashboard
└── 📄 README.md              # Este arquivo
```

---

## 🚀 **Instalação e Configuração**

### 1️⃣ **Requisitos**

- PHP 7.4+ ou 8.0+
- MySQL 5.7+ ou 8.0+
- Servidor web (Apache, Nginx, ou XAMPP/WAMP)

### 2️⃣ **Configuração do Banco de Dados**

1. **Criar o banco:**
   ```sql
   -- Importe o arquivo database.sql no seu MySQL
   mysql -u root -p tom_store < database.sql
   ```

2. **Configurar acesso:**
   - Edite `api/config.php`
   - Altere as constantes `DB_USER` e `DB_PASS`
   - Ajuste `DB_HOST` se necessário

### 3️⃣ **Configurar Servidor Web**

**Apache (.htaccess):**
```apache
# Habilitar CORS (desenvolvimento)
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"

# Reescrever URLs (opcional)
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]
```

**Permissões de Pastas:**
```bash
chmod 755 api/
chmod 666 api/config.php
chmod 777 logs/  # Criar pasta de logs
```

---

## 🔐 **Acesso ao Sistema**

### **Usuários Padrão:**

| Tipo | Usuário | Senha | Acesso |
|------|---------|-------|---------|
| 👨‍💼 **Admin** | `adminTom` | `password` | Dashboard + Loja |
| 👤 **Cliente** | `cliente1` | `password` | Apenas Loja |

### **Fluxo de Login:**

1. **Acessar:** `http://localhost/crocs_store/login.html`
2. **Login:** Usar credenciais acima
3. **Redirecionamento:**
   - **Admin** → `admin-dashboard.html`
   - **Cliente** → `index.html`

---

## 📊 **Dashboard Administrativo**

### **Funcionalidades:**

📦 **Produtos:**
- ✅ Listar todos produtos
- ✅ Adicionar novo produto
- ✅ Editar produto existente
- ✅ Excluir produto
- ✅ Filtrar por categoria
- ✅ Buscar por nome

📁 **Categorias:**
- ✅ Listar todas categorias
- ✅ Adicionar nova categoria
- ✅ Editar categoria existente
- ✅ Excluir categoria (sem produtos vinculados)

📈 **Estatísticas:**
- ✅ Total de produtos
- ✅ Total de categorias
- ✅ Preço médio dos produtos

---

## 🛒 **Loja Virtual**

### **Funcionalidades:**

🛍️ **Produtos:**
- ✅ Visualização em grid responsivo
- ✅ Filtros por categoria
- ✅ Busca em tempo real
- ✅ Modal de detalhes
- ✅ Seleção de tamanho e cor

🛒 **Carrinho:**
- ✅ Adicionar/remover itens
- ✅ Controle de quantidade (+/-)
- ✅ Persistência no localStorage
- ✅ Total dinâmico
- ✅ Checkout via WhatsApp

🎨 **UX/UI:**
- ✅ Design responsivo (mobile/tablet/desktop)
- ✅ Animações suaves
- ✅ Loading states
- ✅ Toast notifications
- ✅ Botão voltar ao topo

---

## 🔧 **API Endpoints**

### **Autenticação:**
- `POST /api/login.php` - Login
- `POST /api/logout.php` - Logout

### **Produtos:**
- `GET /api/produtos.php` - Listar produtos
- `POST /api/produtos.php` - Criar produto
- `PUT /api/produtos.php` - Atualizar produto
- `DELETE /api/produtos.php` - Excluir produto

### **Categorias:**
- `GET /api/categorias.php` - Listar categorias
- `POST /api/categorias.php` - Criar categoria
- `PUT /api/categorias.php` - Atualizar categoria
- `DELETE /api/categorias.php` - Excluir categoria

---

## 🗄️ **Estrutura do Banco de Dados**

### **Tabelas:**

```sql
-- Usuários
users (id, username, password, role, created_at, updated_at)

-- Categorias  
categorias (id, nome, created_at, updated_at)

-- Produtos
produtos (id, nome, preco, categoria_id, imagem, created_at, updated_at)
```

### **Relacionamentos:**
- `produtos.categoria_id` → `categorias.id` (FOREIGN KEY)

---

## 🔒 **Segurança Implementada**

### **Backend (PHP):**
- ✅ Prepared statements (PDO)
- ✅ Senhas com `password_hash()`
- ✅ Sessões seguras
- ✅ Validação de entrada
- ✅ CORS configurado
- ✅ Headers de segurança

### **Frontend (JavaScript):**
- ✅ Validação de formulários
- ✅ Sanitização de dados
- ✅ Proteção XSS
- ✅ Redirecionamento automático

### **Banco de Dados:**
- ✅ Índices otimizados
- ✅ Foreign keys
- ✅ Triggers de auditoria
- ✅ Views úteis

---

## 🚀 **Deploy em Produção**

### **1. Configurações de Segurança:**
```php
// api/config.php
define('DB_HOST', 'seu-host-mysql');
define('DB_USER', 'seu-usuario');
define('DB_PASS', 'sua-senha-forte');
define('APP_URL', 'https://seusite.com');

// Habilitar HTTPS
ini_set('session.cookie_secure', 1);
```

### **2. Permissões Recomendadas:**
```bash
# Pastas
chmod 755 ./
chmod 755 api/
chmod 755 images/
chmod 777 logs/

# Arquivos
chmod 644 *.html
chmod 644 *.css
chmod 644 *.js
chmod 600 api/config.php
```

### **3. Configuração Apache:**
```apache
# .htaccess
Options -Indexes
ServerSignature Off
<Files "config.php">
    Require all denied
</Files>
```

---

## 🐛 **Troubleshooting**

### **Problemas Comuns:**

**❌ "Erro de conexão com banco":**
- Verifique credenciais em `api/config.php`
- Confirme se o MySQL está rodando
- Teste conexão manualmente

**❌ "CORS error":**
- Verifique headers CORS no PHP
- Confirme URL da API no JavaScript

**❌ "Login não funciona":**
- Verifique se sessões estão habilitadas
- Confirme tabela `users` existe
- Teste com usuário padrão

**❌ "Imagens não carregam":**
- Verifique pasta `/images`
- Confirme permissões
- Teste caminho das imagens

---

## 📱 **Testes e Validação**

### **Testar Funcionalidades:**

1. **Login:**
   - [ ] Admin acessa dashboard
   - [ ] Cliente acessa loja
   - [ ] Logout funciona

2. **Dashboard Admin:**
   - [ ] CRUD produtos
   - [ ] CRUD categorias
   - [ ] Estatísticas atualizam

3. **Loja:**
   - [ ] Produtos carregam
   - [ ] Carrinho funciona
   - [ ] Checkout WhatsApp

4. **Responsividade:**
   - [ ] Mobile (≤480px)
   - [ ] Tablet (≤768px)
   - [ ] Desktop (>768px)

---

## 🔄 **Manutenção**

### **Backup do Banco:**
```bash
mysqldump -u root -p tom_store > backup_$(date +%Y%m%d).sql
```

### **Logs de Atividade:**
- Local: `logs/activity.log`
- Rotação: Manual ou automática
- Monitoramento: Erros e tentativas de acesso

### **Atualizações:**
- Manter PHP atualizado
- Atualizar dependências
- Revisar segurança periodicamente

---

## 📞 **Suporte**

### **Documentação:**
- README.md (este arquivo)
- Comentários no código
- Logs de erro detalhados

### **Contato para Suporte:**
- WhatsApp: (11) 98527-8370
- Email: contato@crocsstore.com

---

## 🎯 **Próximos Passos (Melhorias)**

### **Funcionalidades Futuras:**
- [ ] Upload de imagens
- [ ] Sistema de avaliações
- [ ] Gestão de pedidos
- [ ] Relatórios avançados
- [ ] Integração com pagamento
- [ ] Multi-idiomas

### **Técnicas:**
- [ ] Cache implementado
- [ ] CDN para imagens
- [ ] Testes automatizados
- [ ] CI/CD pipeline

---

## 📜 **Licença**

Este projeto é proprietário da Tom Store.
© 2026 Tom Store - Todos os direitos reservados.

---

**🚀 Sistema pronto para uso em produção!**
