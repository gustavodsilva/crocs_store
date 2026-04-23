// Carrinho de compras
let cart = [];

// Variáveis para controle do modal de produto
let currentProduct = null;
let selectedSize = null;
let selectedColor = null;

// Mapeamento de imagens por produto e cor
const productImages = {
    // CAMISAS - usando imagens de camisas quando disponível, bermudas como fallback
    'Camisa Preta': {
        preta: 'images/2.camisa_preta.jpeg',
        branca: 'images/3.camisa_branca.jpeg',
        azul: 'images/4.camisa_azul_marinho.jpeg',
        vermelho: 'images/5.camisa_vermelha.jpeg',
        verde: 'images/8.bermuda_verde.jpeg' // fallback da bermuda verde
    },
    'Camisa Branca': {
        branca: 'images/3.camisa_branca.jpeg',
        preta: 'images/2.camisa_preta.jpeg',
        azul: 'images/4.camisa_azul_marinho.jpeg',
        vermelho: 'images/5.camisa_vermelha.jpeg',
        verde: 'images/8.bermuda_verde.jpeg' // fallback da bermuda verde
    },
    'Camisa Azul Marinho': {
        azul: 'images/4.camisa_azul_marinho.jpeg',
        preta: 'images/2.camisa_preta.jpeg',
        branca: 'images/3.camisa_branca.jpeg',
        vermelho: 'images/5.camisa_vermelha.jpeg',
        verde: 'images/8.bermuda_verde.jpeg' // fallback da bermuda verde
    },
    'Camisa Vermelha': {
        vermelho: 'images/5.camisa_vermelha.jpeg',
        preta: 'images/2.camisa_preta.jpeg',
        branca: 'images/3.camisa_branca.jpeg',
        azul: 'images/4.camisa_azul_marinho.jpeg',
        verde: 'images/8.bermuda_verde.jpeg' // fallback da bermuda verde
    },
    // BERMUDAS - usando todas as cores disponíveis
    'Bermuda Azul Marinho': {
        azul: 'images/7.bermuda_azul_marinho.jpeg',
        preta: 'images/9.bermuda_preta.jpeg',
        branca: 'images/12.bermuda_branca.jpeg',
        vermelho: 'images/11.bermuda_vermelha.jpeg',
        verde: 'images/8.bermuda_verde.jpeg'
    },
    'Bermuda Verde': {
        verde: 'images/8.bermuda_verde.jpeg',
        preta: 'images/9.bermuda_preta.jpeg',
        branca: 'images/12.bermuda_branca.jpeg',
        vermelho: 'images/11.bermuda_vermelha.jpeg',
        azul: 'images/10.bermuda_azul.jpeg'
    },
    'Bermuda Preta': {
        preta: 'images/9.bermuda_preta.jpeg',
        branca: 'images/12.bermuda_branca.jpeg',
        vermelho: 'images/11.bermuda_vermelha.jpeg',
        azul: 'images/10.bermuda_azul.jpeg',
        verde: 'images/8.bermuda_verde.jpeg'
    },
    'Bermuda Azul': {
        azul: 'images/10.bermuda_azul.jpeg',
        preta: 'images/9.bermuda_preta.jpeg',
        branca: 'images/12.bermuda_branca.jpeg',
        vermelho: 'images/11.bermuda_vermelha.jpeg',
        verde: 'images/8.bermuda_verde.jpeg'
    },
    'Bermuda Vermelha': {
        vermelho: 'images/11.bermuda_vermelha.jpeg',
        preta: 'images/9.bermuda_preta.jpeg',
        branca: 'images/12.bermuda_branca.jpeg',
        azul: 'images/10.bermuda_azul.jpeg',
        verde: 'images/8.bermuda_verde.jpeg'
    },
    'Bermuda Branca': {
        branca: 'images/12.bermuda_branca.jpeg',
        preta: 'images/9.bermuda_preta.jpeg',
        vermelho: 'images/11.bermuda_vermelha.jpeg',
        azul: 'images/10.bermuda_azul.jpeg',
        verde: 'images/8.bermuda_verde.jpeg'
    }
};

// ========================================
// FUNÇÕES DO CARRINHO
// ========================================

// Salvar carrinho no localStorage
function saveCart() {
    localStorage.setItem('crocsStoreCart', JSON.stringify(cart));
    updateCartCount();
}

// Carregar carrinho do localStorage
function loadCart() {
    const savedCart = localStorage.getItem('crocsStoreCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartModal();
        updateCartCount();
    }
}

// Atualizar quantidade do item no carrinho
function updateQuantity(index, change) {
    if (index < 0 || index >= cart.length) return;
    
    cart[index].quantity += change;
    
    if (cart[index].quantity <= 0) {
        removeFromCart(index);
    } else {
        saveCart();
        updateCartModal();
        updateOrderSummary();
    }
}

// Limpar busca
function clearSearch() {
    document.getElementById('searchInput').value = '';
    searchProducts('');
}

// Toggle menu mobile
function toggleMobileMenu() {
    const navList = document.querySelector('.nav-list');
    navList.classList.toggle('active');
}

// Scroll ao topo
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Confirmar pedido e mostrar resumo
function confirmOrder() {
    if (cart.length === 0) {
        showNotification('Seu carrinho está vazio!');
        return;
    }
    
    const orderSummary = document.getElementById('orderSummary');
    if (orderSummary.style.display === 'none') {
        updateOrderSummary();
        orderSummary.style.display = 'block';
    } else {
        checkout();
    }
}

// Atualizar resumo do pedido
function updateOrderSummary() {
    const summaryItems = document.getElementById('summaryItems');
    const summaryTotal = document.getElementById('summaryTotal');
    
    if (cart.length === 0) {
        summaryItems.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Seu carrinho está vazio</p>';
        summaryTotal.textContent = '0.00';
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        html += `
            <div class="summary-item">
                <span>${item.name} | Tam: ${item.size} | Cor: ${item.color}</span>
                <span>R$ ${itemTotal.toFixed(2)}</span>
            </div>
        `;
    });
    
    summaryItems.innerHTML = html;
    summaryTotal.textContent = total.toFixed(2);
}

// Busca de produtos em tempo real
function searchProducts(searchTerm) {
    const productCards = document.querySelectorAll('.product-card');
    const term = searchTerm.toLowerCase();
    
    productCards.forEach(card => {
        const productName = card.querySelector('.product-name').textContent.toLowerCase();
        
        if (productName.includes(term)) {
            card.style.display = 'block';
            // Adicionar animação de fade-in
            card.style.animation = 'fadeIn 0.5s ease-out';
        } else {
            card.style.display = 'none';
        }
    });
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    loadCart(); // Carregar carrinho salvo
    loadProductsFromAdmin(); // Carregar produtos do admin
    initializeFilters();
    initializeAnimations();
    setupScrollEffects();
    initializeProductModal();
    initializeSearch();
    initializeBackToTop();
});

// Função para adicionar produto ao carrinho
function addToCart(productName, price) {
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: price,
            quantity: 1
        });
    }
    
    showNotification(`${productName} adicionado ao carrinho!`);
    updateCartModal();
    
    // Adiciona efeito visual no botão
    event.target.style.transform = 'scale(0.95)';
    setTimeout(() => {
        event.target.style.transform = 'scale(1)';
    }, 150);
}

// Função para mostrar notificação
function showNotification(message) {
    // Remove notificação existente se houver
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Cria nova notificação
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #00A86B, #0F3D2E);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 168, 107, 0.4);
        z-index: 3000;
        font-weight: 600;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Remove a notificação após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Função para atualizar o modal do carrinho
function updateCartModal() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #B0B0B0;">Seu carrinho está vazio</p>';
        cartTotal.textContent = '0.00';
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        html += `
            <div class="cart-item">
                <div>
                    <strong>${item.name}</strong><br>
                    <small>Quantidade: ${item.quantity} × R$ ${item.price.toFixed(2)}</small>
                </div>
                <div style="text-align: right;">
                    <strong>R$ ${itemTotal.toFixed(2)}</strong><br>
                    <button onclick="removeFromCart(${index})" style="
                        background: #ff4444;
                        color: white;
                        border: none;
                        padding: 4px 8px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                        margin-top: 5px;
                    ">Remover</button>
                </div>
            </div>
        `;
    });
    
    cartItems.innerHTML = html;
    cartTotal.textContent = total.toFixed(2);
}

// Função para remover item do carrinho
function removeFromCart(index) {
    const item = cart[index];
    cart.splice(index, 1);
    showNotification(`${item.name} removido do carrinho`);
    updateCartModal();
}

// Função para abrir o modal do carrinho
function openCartModal() {
    document.getElementById('cartModal').style.display = 'block';
    updateCartModal();
}

// Função para fechar o modal
function closeModal() {
    document.getElementById('cartModal').style.display = 'none';
}

// Função para montar mensagem do WhatsApp
function buildWhatsAppMessage() {
    if (cart.length === 0) {
        return null;
    }
    
    let message = "Olá! Vim através do site Crocs Store e gostaria de fazer um pedido:\n\n";
    message += "🛍️ Pedido:\n";
    message += "----------------------------------\n\n";
    
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        message += `${index + 1}) ${item.name}\n`;
        message += `Tamanho: ${item.size}\n`;
        message += `Cor: ${item.color}\n`;
        message += `Quantidade: ${item.quantity}\n`;
        message += `Valor: R$ ${itemTotal.toFixed(2)}\n\n`;
    });
    
    message += "----------------------------------\n\n";
    message += `Total: R$ ${total.toFixed(2)}\n\n`;
    message += "Forma de retirada: A combinar\n";
    message += "🙏 Aguardo confirmação para prosseguir com o pagamento!";
    
    return message;
}

// Função para finalizar compra via WhatsApp
function checkout() {
    if (cart.length === 0) {
        showNotification('Seu carrinho está vazio!');
        return;
    }
    
    const message = buildWhatsAppMessage();
    
    if (message) {
        // Codificar a mensagem para URL
        const encodedMessage = encodeURIComponent(message);
        
        // Número do WhatsApp do proprietário
        const whatsappNumber = "5511985278370";
        
        // Montar URL do WhatsApp
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        // Redirecionar para WhatsApp
        window.open(whatsappURL, '_blank');
        
        // Opcional: limpar carrinho após redirecionamento
        // cart = [];
        // updateCartModal();
        // updateCartCount();
        // closeModal();
        
        showNotification('Redirecionando para WhatsApp...');
    }
}

// Função para scroll suave até a seção de produtos
function scrollToProdutos() {
    const produtosSection = document.getElementById('produtos');
    produtosSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Inicialização dos filtros de produtos
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.btn-filter');
    const productCards = document.querySelectorAll('.product-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove a classe active de todos os botões
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Adiciona a classe active ao botão clicado
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            productCards.forEach(card => {
                if (filter === 'todos') {
                    card.classList.remove('hidden');
                    // Re-animar os cards
                    card.style.animation = 'none';
                    setTimeout(() => {
                        card.style.animation = '';
                    }, 10);
                } else {
                    const category = card.getAttribute('data-category');
                    if (category === filter) {
                        card.classList.remove('hidden');
                        // Re-animar os cards visíveis
                        card.style.animation = 'none';
                        setTimeout(() => {
                            card.style.animation = '';
                        }, 10);
                    } else {
                        card.classList.add('hidden');
                    }
                }
            });
        });
    });
}

// Inicialização das animações
function initializeAnimations() {
    // Animação de entrada para os produtos quando a página carrega
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observa todos os cards de produto
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Configuração de efeitos de scroll
function setupScrollEffects() {
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Efeito no header ao fazer scroll
        if (scrollTop > 100) {
            header.style.backgroundColor = 'rgba(13, 13, 13, 0.95)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
        } else {
            header.style.backgroundColor = '#0D0D0D';
            header.style.boxShadow = 'none';
        }
        
        lastScrollTop = scrollTop;
    });
}

// Adiciona estilos CSS para animações adicionais
const additionalStyles = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
`;

// Adiciona os estilos ao head do documento
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Função para adicionar comportamento de carrinho flutuante
function setupFloatingCart() {
    // Cria botão flutuante do carrinho
    const floatingCart = document.createElement('div');
    floatingCart.innerHTML = `
        <button onclick="openCartModal()" style="
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: linear-gradient(135deg, #00A86B, #0F3D2E);
            color: white;
            border: none;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(0, 168, 107, 0.4);
            z-index: 1000;
            font-size: 24px;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        ">
            🛒
            <span id="cartCount" style="
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ff4444;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            ">0</span>
        </button>
    `;
    
    document.body.appendChild(floatingCart);
    
    // Atualiza o contador do carrinho
    updateCartCount();
}

// Função para atualizar o contador do carrinho
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Atualiza o contador quando o carrinho muda
const originalAddToCart = addToCart;
addToCart = function(productName, price) {
    originalAddToCart(productName, price);
    updateCartCount();
};

const originalRemoveFromCart = removeFromCart;
removeFromCart = function(index) {
    originalRemoveFromCart(index);
    updateCartCount();
};

// Inicializa o carrinho flutuante quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    setupFloatingCart();
});

// Fecha o modal quando clicar fora dele
window.onclick = function(event) {
    const modal = document.getElementById('cartModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Adiciona efeitos de hover nos produtos
document.addEventListener('DOMContentLoaded', function() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Função para pesquisa de produtos (funcionalidade extra)
function searchProducts(searchTerm) {
    const productCards = document.querySelectorAll('.product-card');
    const term = searchTerm.toLowerCase();
    
    productCards.forEach(card => {
        const productName = card.querySelector('.product-name').textContent.toLowerCase();
        
        if (productName.includes(term)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
    
    // Se não houver termo de busca, mostra todos
    if (term === '') {
        productCards.forEach(card => {
            card.classList.remove('hidden');
        });
    }
}

// Adiciona atalhos de teclado
document.addEventListener('keydown', function(event) {
    // Ctrl + K para focar na busca (se implementada)
    if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        // Implementar busca se necessário
    }
    
    // ESC para fechar modal
    if (event.key === 'Escape') {
        closeModal();
    }
});

// Melhora a acessibilidade
document.addEventListener('DOMContentLoaded', function() {
    // Adiciona aria-labels para melhor acessibilidade
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        if (!button.getAttribute('aria-label')) {
            button.setAttribute('aria-label', button.textContent);
        }
    });
    
    // Adiciona role para navegação
    const nav = document.querySelector('nav');
    if (nav) {
        nav.setAttribute('role', 'navigation');
    }
    
    // Adiciona role para main content
    const main = document.querySelector('main') || document.querySelector('.hero');
    if (main) {
        main.setAttribute('role', 'main');
    }
});

// ========================================
// FUNÇÕES DO MODAL DE PRODUTO
// ========================================

// Inicialização do modal de produto
function initializeProductModal() {
    // Fecha o modal ao clicar fora
    window.onclick = function(event) {
        const productModal = document.getElementById('productModal');
        if (event.target === productModal) {
            closeProductModal();
        }
    };
    
    // Adiciona evento ESC para fechar modal
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const productModal = document.getElementById('productModal');
            if (productModal.style.display === 'block') {
                closeProductModal();
            }
        }
    });
}

// FUNÇÃO REMOVIDA: updateProductImage
// A imagem do produto agora permanece fixa, sem troca dinâmica por cor

// Abrir modal de produto
function openProductModal(productName, price, image, category) {
    currentProduct = {
        name: productName,
        price: price,
        image: image,
        category: category
    };
    
    // Resetar seleções
    selectedSize = null;
    selectedColor = null;
    resetSelections();
    
    // Preencher informações do produto
    document.getElementById('modalProductName').textContent = productName;
    document.getElementById('modalProductPrice').textContent = `R$ ${price.toFixed(2)}`;
    document.getElementById('modalProductImage').src = image;
    document.getElementById('modalProductImage').alt = productName;
    
    // Adicionar estilo de transição à imagem
    const modalImage = document.getElementById('modalProductImage');
    modalImage.style.transition = 'all 0.3s ease';
    
    // Desabilitar botão de adicionar ao carrinho inicialmente
    updateAddToCartButton();
    
    // Mostrar modal
    document.getElementById('productModal').style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevenir scroll do fundo
}

// Fechar modal de produto
function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
    document.body.style.overflow = 'auto'; // Restaurar scroll
    currentProduct = null;
    selectedSize = null;
    selectedColor = null;
}

// Resetar seleções visuais
function resetSelections() {
    // Remover classe selected de todos os botões
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
}

// Selecionar tamanho
function selectSize(size) {
    selectedSize = size;
    
    // Atualizar visualização
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.getAttribute('data-size') === size) {
            btn.classList.add('selected');
        }
    });
    
    updateAddToCartButton();
}

// Selecionar cor
function selectColor(color) {
    selectedColor = color;
    
    // Atualizar visualização
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.getAttribute('data-color') === color) {
            btn.classList.add('selected');
        }
    });
    
    // REMOVIDO: Não atualizar mais a imagem dinamicamente
    // A imagem do produto permanece fixa
    
    updateAddToCartButton();
}

// Atualizar estado do botão "Adicionar ao Carrinho"
function updateAddToCartButton() {
    const addToCartBtn = document.getElementById('addToCartBtn');
    
    if (selectedSize && selectedColor) {
        addToCartBtn.disabled = false;
        addToCartBtn.textContent = 'Adicionar ao Carrinho';
        addToCartBtn.style.backgroundColor = '#00A86B';
    } else {
        addToCartBtn.disabled = true;
        addToCartBtn.textContent = 'Selecione tamanho e cor';
        addToCartBtn.style.backgroundColor = '#333';
    }
}

// Adicionar produto ao carrinho a partir do modal
function addProductToCart() {
    if (!selectedSize || !selectedColor) {
        showNotification('Selecione tamanho e cor');
        return;
    }
    
    if (!currentProduct) {
        showNotification('Erro: produto não encontrado');
        return;
    }
    
    // Verificar se já existe um produto igual no carrinho
    const existingItem = cart.find(item => 
        item.name === currentProduct.name && 
        item.size === selectedSize && 
        item.color === selectedColor
    );
    
    if (existingItem) {
        existingItem.quantity += 1;
        showNotification(`${currentProduct.name} (${selectedSize}, ${selectedColor}) quantidade atualizada!`);
    } else {
        cart.push({
            name: currentProduct.name,
            price: currentProduct.price,
            size: selectedSize,
            color: selectedColor,
            image: currentProduct.image,
            quantity: 1
        });
        showNotification(`${currentProduct.name} (${selectedSize}, ${selectedColor}) adicionado ao carrinho!`);
    }
    
    // Atualizar interface
    updateCartModal();
    saveCart(); // Salvar no localStorage
    
    // Efeito visual no botão
    const addToCartBtn = document.getElementById('addToCartBtn');
    addToCartBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        addToCartBtn.style.transform = 'scale(1)';
    }, 150);
    
    // Fechar modal após 1 segundo
    setTimeout(() => {
        closeProductModal();
    }, 1000);
}

// Atualizar função updateCartModal para exibir tamanho e cor com controle de quantidade
function updateCartModalEnhanced() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Seu carrinho está vazio</p>';
        cartTotal.textContent = '0.00';
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        html += `
            <div class="cart-item">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${item.image}" alt="${item.name}" style="
                        width: 60px;
                        height: 60px;
                        object-fit: cover;
                        border-radius: var(--border-radius);
                    ">
                    <div style="flex: 1;">
                        <strong>${item.name}</strong><br>
                        <small style="color: var(--text-secondary);">
                            Tamanho: ${item.size} | Cor: ${item.color}
                        </small>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <button onclick="updateQuantity(${index}, -1)" style="
                            background: var(--dark-green);
                            color: white;
                            border: none;
                            width: 24px;
                            height: 24px;
                            border-radius: 50%;
                            cursor: pointer;
                            font-size: 16px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">-</button>
                        <span style="min-width: 30px; text-align: center; font-weight: bold;">${item.quantity}</span>
                        <button onclick="updateQuantity(${index}, 1)" style="
                            background: var(--primary-green);
                            color: white;
                            border: none;
                            width: 24px;
                            height: 24px;
                            border-radius: 50%;
                            cursor: pointer;
                            font-size: 16px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">+</button>
                    </div>
                    <strong>R$ ${itemTotal.toFixed(2)}</strong><br>
                    <button onclick="removeFromCart(${index})" style="
                        background: #ff4444;
                        color: white;
                        border: none;
                        padding: 4px 8px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                        margin-top: 5px;
                    ">Remover</button>
                </div>
            </div>
        `;
    });
    
    cartItems.innerHTML = html;
    cartTotal.textContent = total.toFixed(2);
}

// Função para limpar o carrinho
function clearCart() {
    if (cart.length === 0) {
        showNotification('Seu carrinho já está vazio');
        return;
    }
    
    // Confirmar antes de limpar
    if (confirm('Tem certeza que deseja limpar todo o carrinho?')) {
        cart = [];
        saveCart();
        updateCartModal();
        showNotification('Carrinho limpo com sucesso!');
        
        // Esconder resumo do pedido
        document.getElementById('orderSummary').style.display = 'none';
    }
}

// Atualizar função removeFromCart para usar saveCart()
const originalRemoveFromCartFn = removeFromCart;
removeFromCart = function(index) {
    originalRemoveFromCartFn(index);
    saveCart();
    updateOrderSummary();
};

// Carregar produtos do localStorage administrativo
function loadProductsFromAdmin() {
    const savedProducts = localStorage.getItem('crocsStoreProducts');
    
    if (savedProducts) {
        const products = JSON.parse(savedProducts);
        updateProductsGrid(products);
    }
}

// Atualizar grid de produtos dinamicamente
function updateProductsGrid(products) {
    const productsGrid = document.querySelector('.products-grid');
    
    if (!productsGrid) return;
    
    let html = '';
    
    products.forEach(product => {
        html += `
            <div class="product-card" data-category="${product.category}">
                <div class="product-image">
                    <img src="images/${product.image}" alt="${product.name}" onerror="this.src='images/1.logo.jpeg'">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">R$ ${product.price.toFixed(2)}</p>
                    <button class="btn btn-buy" onclick="openProductModal('${product.name}', ${product.price}, 'images/${product.image}', '${product.category}')">Ver Detalhes</button>
                </div>
            </div>
        `;
    });
    
    productsGrid.innerHTML = html;
}

// Inicialização da busca
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function(e) {
        searchProducts(e.target.value);
    });
}

// Inicialização do botão voltar ao topo
function initializeBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
}

// Sobrescrever a função updateCartModal original
const originalUpdateCartModalFn = updateCartModal;
updateCartModal = updateCartModalEnhanced;
