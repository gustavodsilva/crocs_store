// ========================================
// JAVASCRIPT - TOM STORE (C# .NET)
// ========================================

// Carrinho de compras
let cart = [];
let selectedProduct = null;
let selectedSize = null;
let selectedColor = null;

// ========================================
// FUNÇÕES DO CARRINHO
// ========================================

function openProductModal(name, price, image, category) {
    selectedProduct = { name, price, image, category };
    selectedSize = null;
    selectedColor = null;
    
    document.getElementById('modalProductName').textContent = name;
    document.getElementById('modalProductPrice').textContent = price.toFixed(2);
    document.getElementById('modalProductCategory').textContent = `Categoria: ${category}`;
    document.getElementById('modalProductImage').src = image;
    document.getElementById('modalProductImage').alt = name;
    document.getElementById('quantity').value = 1;
    
    // Reset selections
    document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('selected'));
    
    document.getElementById('productModal').style.display = 'flex';
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

function closeModal() {
    document.getElementById('cartModal').style.display = 'none';
}

function selectSize(size) {
    selectedSize = size;
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.size === size) {
            btn.classList.add('selected');
        }
    });
}

function selectColor(color) {
    selectedColor = color;
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.color === color) {
            btn.classList.add('selected');
        }
    });
}

function increaseQuantity() {
    const quantityInput = document.getElementById('quantity');
    const currentValue = parseInt(quantityInput.value);
    if (currentValue < 10) {
        quantityInput.value = currentValue + 1;
    }
}

function decreaseQuantity() {
    const quantityInput = document.getElementById('quantity');
    const currentValue = parseInt(quantityInput.value);
    if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
    }
}

function addToCart() {
    if (!selectedProduct) return;
    
    const quantity = parseInt(document.getElementById('quantity').value);
    const cartItem = {
        ...selectedProduct,
        size: selectedSize || 'P',
        color: selectedColor || 'preto',
        quantity: quantity
    };
    
    const existingItem = cart.find(item => 
        item.name === cartItem.name && 
        item.size === cartItem.size && 
        item.color === cartItem.color
    );
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push(cartItem);
    }
    
    updateCartCount();
    showNotification('Produto adicionado ao carrinho!', 'success');
    closeProductModal();
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    // Você pode adicionar um contador no header se quiser
}

function clearCart() {
    if (cart.length === 0) {
        showNotification('Seu carrinho já está vazio.');
        return;
    }
    if (confirm('Tem certeza que deseja limpar todo o carrinho?')) {
        cart = [];
        showNotification('Carrinho limpo com sucesso!');
    }
}

function checkout() {
    if (cart.length === 0) {
        showNotification('Seu carrinho está vazio!');
        return;
    }
    
    const message = buildWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "5511985278370";
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
}

function buildWhatsAppMessage() {
    let message = "🛍️ *PEDIDO - TOM STORE*\n\n";
    message += "📦 *Produtos:*\n";
    
    let total = 0;
    cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        message += `${index + 1}. ${item.name}\n`;
        message += `   - Tamanho: ${item.size}\n`;
        message += `   - Cor: ${item.color}\n`;
        message += `   - Quantidade: ${item.quantity}\n`;
        message += `   - Preço: R$ ${item.price.toFixed(2)}\n`;
        message += `   - Subtotal: R$ ${subtotal.toFixed(2)}\n\n`;
    });
    
    message += `💰 *Total: R$ ${total.toFixed(2)}*\n\n`;
    message += `📍 *Forma de retirada:* (a combinar)\n\n`;
    message += `📞 *WhatsApp:* (11) 98527-8370`;
    
    return message;
}

// ========================================
// BUSCA E FILTROS
// ========================================

function clearSearch() {
    document.getElementById('searchInput').value = '';
    filterProducts();
}

function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const products = document.querySelectorAll('.product-card');
    
    products.forEach(product => {
        const productName = product.querySelector('.product-name').textContent.toLowerCase();
        const productCategory = product.dataset.category;
        
        const matchesSearch = productName.includes(searchTerm);
        const matchesCategory = !categoryFilter || productCategory === categoryFilter;
        
        if (matchesSearch && matchesCategory) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

// Event listeners para busca e filtro
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }
    
    // Size buttons
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', () => selectSize(btn.dataset.size));
    });
    
    // Color buttons
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => selectColor(btn.dataset.color));
    });
});

// ========================================
// UTILITÁRIOS
// ========================================

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function showNotification(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✅' : '❌'}</span>
        <span class="toast-message">${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Back to top button
window.addEventListener('scroll', function() {
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        if (window.pageYOffset > 300) {
            backToTop.style.display = 'block';
        } else {
            backToTop.style.display = 'none';
        }
    }
});

// Close modals when clicking outside
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
});
