// ========================================
// SISTEMA ADMINISTRATIVO - CROCS STORE
// ========================================

// Credenciais de acesso
const ADMIN_CREDENTIALS = {
    username: 'adminTom',
    password: 'TomAdmin#123@'
};

// Estado da aplicação
let products = [];
let editingProductId = null;

// ========================================
// FUNÇÕES DE LOGIN
// ========================================

// Verificar sessão ao carregar página
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    loadProducts();
});

function checkSession() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    
    if (isLoggedIn === 'true') {
        showAdminPanel();
    } else {
        showLoginScreen();
    }
}

function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
}

function showAdminPanel() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
}

// Login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Login bem-sucedido
        localStorage.setItem('adminLoggedIn', 'true');
        showAdminPanel();
        hideLoginError();
    } else {
        // Login falhou
        showLoginError();
    }
});

function showLoginError() {
    const errorElement = document.getElementById('loginError');
    errorElement.style.display = 'block';
    
    // Limpar erro após 3 segundos
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 3000);
}

function hideLoginError() {
    document.getElementById('loginError').style.display = 'none';
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('adminLoggedIn');
    showLoginScreen();
    
    // Limpar formulários
    document.getElementById('loginForm').reset();
    document.getElementById('addProductForm').reset();
});

// ========================================
// FUNÇÕES DE PRODUTOS
// ========================================

// Carregar produtos do localStorage
function loadProducts() {
    const savedProducts = localStorage.getItem('crocsStoreProducts');
    
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    } else {
        // Produtos padrão se não houver dados salvos
        products = getDefaultProducts();
        saveProducts();
    }
    
    renderProducts();
}

// Produtos padrão
function getDefaultProducts() {
    return [
        {
            id: 1,
            name: 'Camisa Preta',
            price: 130,
            category: 'camisa',
            image: '2.camisa_preta.jpeg'
        },
        {
            id: 2,
            name: 'Camisa Branca',
            price: 130,
            category: 'camisa',
            image: '3.camisa_branca.jpeg'
        },
        {
            id: 3,
            name: 'Camisa Azul Marinho',
            price: 130,
            category: 'camisa',
            image: '4.camisa_azul_marinho.jpeg'
        },
        {
            id: 4,
            name: 'Camisa Vermelha',
            price: 130,
            category: 'camisa',
            image: '5.camisa_vermelha.jpeg'
        },
        {
            id: 5,
            name: 'Bermuda Azul Marinho',
            price: 90,
            category: 'bermuda',
            image: '7.bermuda_azul_marinho.jpeg'
        },
        {
            id: 6,
            name: 'Bermuda Verde',
            price: 90,
            category: 'bermuda',
            image: '8.bermuda_verde.jpeg'
        },
        {
            id: 7,
            name: 'Bermuda Preta',
            price: 90,
            category: 'bermuda',
            image: '9.bermuda_preta.jpeg'
        },
        {
            id: 8,
            name: 'Bermuda Azul',
            price: 90,
            category: 'bermuda',
            image: '10.bermuda_azul.jpeg'
        },
        {
            id: 9,
            name: 'Bermuda Vermelha',
            price: 90,
            category: 'bermuda',
            image: '11.bermuda_vermelha.jpeg'
        },
        {
            id: 10,
            name: 'Bermuda Branca',
            price: 90,
            category: 'bermuda',
            image: '12.bermuda_branca.jpeg'
        }
    ];
}

// Salvar produtos no localStorage
function saveProducts() {
    localStorage.setItem('crocsStoreProducts', JSON.stringify(products));
}

// Renderizar lista de produtos
function renderProducts() {
    const productsList = document.getElementById('productsList');
    
    if (products.length === 0) {
        productsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Nenhum produto cadastrado.</p>';
        return;
    }
    
    let html = '';
    products.forEach(product => {
        html += `
            <div class="product-card-admin">
                <img src="images/${product.image}" alt="${product.name}" onerror="this.src='images/1.logo.jpeg'">
                <div class="product-info-admin">
                    <h3>${product.name}</h3>
                    <p>Categoria: ${product.category}</p>
                    <p class="price">R$ ${product.price.toFixed(2)}</p>
                    <div class="product-actions">
                        <button class="btn-edit" onclick="editProduct(${product.id})">Editar</button>
                        <button class="btn-delete" onclick="deleteProduct(${product.id})">Excluir</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    productsList.innerHTML = html;
}

// Adicionar produto
document.getElementById('addProductForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const category = document.getElementById('productCategory').value;
    const image = document.getElementById('productImage').value.trim();
    
    // Validação
    if (!name || !price || !category || !image) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    
    // Criar novo produto
    const newProduct = {
        id: Date.now(), // ID único baseado no timestamp
        name: name,
        price: price,
        category: category,
        image: image
    };
    
    // Adicionar ao array
    products.push(newProduct);
    
    // Salvar no localStorage
    saveProducts();
    
    // Atualizar interface
    renderProducts();
    
    // Limpar formulário
    document.getElementById('addProductForm').reset();
    
    // Mostrar mensagem de sucesso
    showSuccessMessage('Produto adicionado com sucesso!');
});

// Editar produto
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        alert('Produto não encontrado.');
        return;
    }
    
    // Preencher formulário de edição
    document.getElementById('editProductId').value = product.id;
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductCategory').value = product.category;
    document.getElementById('editProductImage').value = product.image;
    
    // Mostrar modal
    document.getElementById('editModal').style.display = 'flex';
}

// Salvar edição
document.getElementById('editProductForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const productId = parseInt(document.getElementById('editProductId').value);
    const name = document.getElementById('editProductName').value.trim();
    const price = parseFloat(document.getElementById('editProductPrice').value);
    const category = document.getElementById('editProductCategory').value;
    const image = document.getElementById('editProductImage').value.trim();
    
    // Validação
    if (!name || !price || !category || !image) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    
    // Encontrar e atualizar produto
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
        alert('Produto não encontrado.');
        return;
    }
    
    products[productIndex] = {
        id: productId,
        name: name,
        price: price,
        category: category,
        image: image
    };
    
    // Salvar no localStorage
    saveProducts();
    
    // Atualizar interface
    renderProducts();
    
    // Fechar modal
    closeEditModal();
    
    // Mostrar mensagem de sucesso
    showSuccessMessage('Produto atualizado com sucesso!');
});

// Fechar modal de edição
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Excluir produto
function deleteProduct(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        alert('Produto não encontrado.');
        return;
    }
    
    // Confirmar exclusão
    if (confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
        // Remover do array
        products = products.filter(p => p.id !== productId);
        
        // Salvar no localStorage
        saveProducts();
        
        // Atualizar interface
        renderProducts();
        
        // Mostrar mensagem de sucesso
        showSuccessMessage('Produto excluído com sucesso!');
    }
}

// Mostrar mensagem de sucesso
function showSuccessMessage(message) {
    // Criar elemento de mensagem
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = message;
    
    // Inserir no início do painel
    const adminMain = document.querySelector('.admin-main');
    adminMain.insertBefore(messageDiv, adminMain.firstChild);
    
    // Remover após 3 segundos
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

// Fechar modal ao clicar fora
window.addEventListener('click', function(e) {
    const modal = document.getElementById('editModal');
    if (e.target === modal) {
        closeEditModal();
    }
});

// Fechar modal com ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeEditModal();
    }
});
