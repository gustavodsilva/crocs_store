// ========================================
// JAVASCRIPT - DASHBOARD ADMINISTRATIVO TOM STORE
// ========================================

// Configuração da API
const API_BASE_URL = 'api';

// Estado da aplicação
let currentUser = null;
let products = [];
let categories = [];
let currentEditingProduct = null;
let currentEditingCategory = null;

// Elementos do DOM
const loadingOverlay = document.getElementById('loadingOverlay');
const userInfo = document.getElementById('userInfo');
const logoutBtn = document.getElementById('logoutBtn');

// Tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

// Dashboard Stats
const totalProducts = document.getElementById('totalProducts');
const totalCategories = document.getElementById('totalCategories');
const avgPrice = document.getElementById('avgPrice');

// Produtos
const addProductBtn = document.getElementById('addProductBtn');
const productsList = document.getElementById('productsList');
const categoryFilter = document.getElementById('categoryFilter');
const productSearch = document.getElementById('productSearch');

// Categorias
const addCategoryBtn = document.getElementById('addCategoryBtn');
const categoriesList = document.getElementById('categoriesList');

// Modais
const productModal = document.getElementById('productModal');
const categoryModal = document.getElementById('categoryModal');
const productForm = document.getElementById('productForm');
const categoryForm = document.getElementById('categoryForm');

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    checkAuthentication();
});

function initializeEventListeners() {
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Produtos
    addProductBtn.addEventListener('click', () => openProductModal());
    productForm.addEventListener('submit', handleProductSubmit);
    categoryFilter.addEventListener('change', filterProducts);
    productSearch.addEventListener('input', filterProducts);
    
    // Categorias
    addCategoryBtn.addEventListener('click', () => openCategoryModal());
    categoryForm.addEventListener('submit', handleCategorySubmit);
    
    // Modais
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    // Cancel buttons
    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // ESC para fechar modais
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
}

// ========================================
// AUTENTICAÇÃO
// ========================================

async function checkAuthentication() {
    showLoading(true);
    
    try {
        // Tentar acessar uma rota para verificar sessão
        const response = await fetch(`${API_BASE_URL}/categorias.php`);
        
        if (response.ok) {
            // Se chegou aqui, está autenticado (middleware PHP verifica)
            await loadDashboardData();
        } else {
            // Não autenticado, redirecionar para login
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Erro na verificação de autenticação:', error);
        // Em caso de erro, redirecionar para login
        window.location.href = 'login.html';
    } finally {
        showLoading(false);
    }
}

async function handleLogout() {
    try {
        await fetch(`${API_BASE_URL}/logout.php`, {
            method: 'POST'
        });
        
        showToast('Logout realizado com sucesso', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    } catch (error) {
        console.error('Erro no logout:', error);
        // Mesmo com erro, redirecionar
        window.location.href = 'login.html';
    }
}

// ========================================
// CARREGAMENTO DE DADOS
// ========================================

async function loadDashboardData() {
    showLoading(true);
    
    try {
        // Carregar categorias primeiro
        await loadCategories();
        
        // Carregar produtos
        await loadProducts();
        
        // Atualizar estatísticas
        updateDashboardStats();
        
        // Atualizar informações do usuário
        updateUserInfo();
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showToast('Erro ao carregar dados do dashboard', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categorias.php`);
        const data = await response.json();
        
        if (data.success) {
            categories = data.data;
            renderCategories();
            updateCategoryFilters();
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        showToast('Erro ao carregar categorias', 'error');
    }
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/produtos.php`);
        const data = await response.json();
        
        if (data.success) {
            products = data.data;
            renderProducts();
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        showToast('Erro ao carregar produtos', 'error');
    }
}

// ========================================
// RENDERIZAÇÃO
// ========================================

function renderProducts() {
    if (products.length === 0) {
        productsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <h3>Nenhum produto cadastrado</h3>
                <p>Clique em "Adicionar Produto" para começar</p>
            </div>
        `;
        return;
    }
    
    const filteredProducts = getFilteredProducts();
    
    if (filteredProducts.length === 0) {
        productsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <h3>Nenhum produto encontrado</h3>
                <p>Tente ajustar os filtros de busca</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    filteredProducts.forEach(product => {
        html += `
            <div class="data-item">
                <div class="data-info">
                    <h3>${product.nome}</h3>
                    <p>Categoria: ${product.categoria_nome || 'N/A'}</p>
                    <div class="data-price">R$ ${parseFloat(product.preco).toFixed(2)}</div>
                    ${product.imagem ? `<p><small>Imagem: ${product.imagem}</small></p>` : ''}
                </div>
                <div class="data-actions">
                    <button class="btn-edit" onclick="editProduct(${product.id})">Editar</button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id})">Excluir</button>
                </div>
            </div>
        `;
    });
    
    productsList.innerHTML = html;
}

function renderCategories() {
    if (categories.length === 0) {
        categoriesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📁</div>
                <h3>Nenhuma categoria cadastrada</h3>
                <p>Clique em "Adicionar Categoria" para começar</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    categories.forEach(category => {
        html += `
            <div class="data-item">
                <div class="data-info">
                    <h3>${category.nome}</h3>
                    <p>Criada em: ${new Date(category.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <div class="data-actions">
                    <button class="btn-edit" onclick="editCategory(${category.id})">Editar</button>
                    <button class="btn-delete" onclick="deleteCategory(${category.id})">Excluir</button>
                </div>
            </div>
        `;
    });
    
    categoriesList.innerHTML = html;
}

// ========================================
// ESTATÍSTICAS
// ========================================

function updateDashboardStats() {
    totalProducts.textContent = products.length;
    totalCategories.textContent = categories.length;
    
    if (products.length > 0) {
        const total = products.reduce((sum, product) => sum + parseFloat(product.preco), 0);
        const average = total / products.length;
        avgPrice.textContent = `R$ ${average.toFixed(2)}`;
    } else {
        avgPrice.textContent = 'R$ 0,00';
    }
}

function updateUserInfo() {
    // Em um sistema real, você obteria essas informações da API
    userInfo.textContent = 'Administrador';
}

// ========================================
// FILTROS
// ========================================

function getFilteredProducts() {
    let filtered = [...products];
    
    // Filtro por categoria
    const categoryId = categoryFilter.value;
    if (categoryId) {
        filtered = filtered.filter(product => product.categoria_id == categoryId);
    }
    
    // Filtro por busca
    const searchTerm = productSearch.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(product => 
            product.nome.toLowerCase().includes(searchTerm)
        );
    }
    
    return filtered;
}

function filterProducts() {
    renderProducts();
}

function updateCategoryFilters() {
    categoryFilter.innerHTML = '<option value="">Todas as Categorias</option>';
    categories.forEach(category => {
        categoryFilter.innerHTML += `<option value="${category.id}">${category.nome}</option>`;
    });
    
    // Atualizar select do modal de produto
    const productCategory = document.getElementById('productCategory');
    productCategory.innerHTML = '<option value="">Selecione...</option>';
    categories.forEach(category => {
        productCategory.innerHTML += `<option value="${category.id}">${category.nome}</option>`;
    });
}

// ========================================
// MODAIS
// ========================================

function openProductModal(product = null) {
    currentEditingProduct = product;
    
    if (product) {
        // Editar produto
        document.getElementById('productModalTitle').textContent = 'Editar Produto';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.nome;
        document.getElementById('productPrice').value = product.preco;
        document.getElementById('productCategory').value = product.categoria_id;
        document.getElementById('productImage').value = product.imagem || '';
    } else {
        // Adicionar produto
        document.getElementById('productModalTitle').textContent = 'Adicionar Produto';
        productForm.reset();
    }
    
    productModal.style.display = 'flex';
}

function openCategoryModal(category = null) {
    currentEditingCategory = category;
    
    if (category) {
        // Editar categoria
        document.getElementById('categoryModalTitle').textContent = 'Editar Categoria';
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryName').value = category.nome;
    } else {
        // Adicionar categoria
        document.getElementById('categoryModalTitle').textContent = 'Adicionar Categoria';
        categoryForm.reset();
    }
    
    categoryModal.style.display = 'flex';
}

// ========================================
// HANDLERS DE FORMULÁRIO
// ========================================

async function handleProductSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: document.getElementById('productId').value,
        nome: document.getElementById('productName').value.trim(),
        preco: parseFloat(document.getElementById('productPrice').value),
        categoria_id: parseInt(document.getElementById('productCategory').value),
        imagem: document.getElementById('productImage').value.trim()
    };
    
    if (!formData.nome || !formData.preco || !formData.categoria_id) {
        showToast('Preencha todos os campos obrigatórios', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const method = formData.id ? 'PUT' : 'POST';
        const response = await fetch(`${API_BASE_URL}/produtos.php`, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            productModal.style.display = 'none';
            await loadProducts();
            updateDashboardStats();
        } else {
            showToast(data.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao salvar produto:', error);
        showToast('Erro ao salvar produto', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleCategorySubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: document.getElementById('categoryId').value,
        nome: document.getElementById('categoryName').value.trim()
    };
    
    if (!formData.nome) {
        showToast('Nome da categoria é obrigatório', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const method = formData.id ? 'PUT' : 'POST';
        const response = await fetch(`${API_BASE_URL}/categorias.php`, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            categoryModal.style.display = 'none';
            await loadCategories();
            updateDashboardStats();
        } else {
            showToast(data.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao salvar categoria:', error);
        showToast('Erro ao salvar categoria', 'error');
    } finally {
        showLoading(false);
    }
}

// ========================================
// CRUD OPERATIONS
// ========================================

async function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        openProductModal(product);
    }
}

async function deleteProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    if (!confirm(`Tem certeza que deseja excluir o produto "${product.nome}"?`)) {
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/produtos.php`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            await loadProducts();
            updateDashboardStats();
        } else {
            showToast(data.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        showToast('Erro ao excluir produto', 'error');
    } finally {
        showLoading(false);
    }
}

async function editCategory(id) {
    const category = categories.find(c => c.id === id);
    if (category) {
        openCategoryModal(category);
    }
}

async function deleteCategory(id) {
    const category = categories.find(c => c.id === id);
    if (!category) return;
    
    if (!confirm(`Tem certeza que deseja excluir a categoria "${category.nome}"?`)) {
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/categorias.php`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            await loadCategories();
            updateDashboardStats();
        } else {
            showToast(data.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        showToast('Erro ao excluir categoria', 'error');
    } finally {
        showLoading(false);
    }
}

// ========================================
// UTILITÁRIOS
// ========================================

function switchTab(tabName) {
    // Atualizar botões
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Atualizar conteúdo
    tabPanes.forEach(pane => {
        pane.classList.remove('active');
        if (pane.id === `${tabName}-tab`) {
            pane.classList.add('active');
        }
    });
}

function showLoading(show) {
    loadingOverlay.style.display = show ? 'flex' : 'none';
}

function showToast(message, type = 'success', title = null) {
    const toastContainer = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">${icons[type]}</div>
        <div class="toast-message">
            ${title ? `<div class="toast-title">${title}</div>` : ''}
            <div class="toast-text">${message}</div>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto-remove após 5 segundos
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 5000);
}

// ========================================
// EXPORTAR FUNÇÕES GLOBAIS
// ========================================

window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
