// ========================================
// JAVASCRIPT - LOGIN TOM STORE
// ========================================

// Configuração da API
const API_BASE_URL = 'api';

// Elementos do DOM
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const btnText = document.querySelector('.btn-text');
const btnLoading = document.querySelector('.btn-loading');
const loginError = document.getElementById('loginError');
const errorText = document.querySelector('.error-text');
const loadingOverlay = document.getElementById('loadingOverlay');

// Event Listeners
loginForm.addEventListener('submit', handleLogin);

// ========================================
// FUNÇÕES PRINCIPAIS
// ========================================

async function handleLogin(e) {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    // Validação básica
    if (!username || !password) {
        showError('Por favor, preencha todos os campos.');
        return;
    }
    
    // Estado de loading
    setLoginLoading(true);
    hideError();
    
    try {
        const response = await fetch(`${API_BASE_URL}/login.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Login bem-sucedido
            showLoadingOverlay();
            
            // Redirecionar conforme o tipo de usuário
            setTimeout(() => {
                window.location.href = data.redirect;
            }, 1500);
            
        } else {
            // Erro de login
            showError(data.error || 'Erro ao fazer login. Tente novamente.');
        }
        
    } catch (error) {
        console.error('Erro na requisição:', error);
        showError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
        setLoginLoading(false);
    }
}

// ========================================
// FUNÇÕES DE UI
// ========================================

function setLoginLoading(loading) {
    if (loading) {
        loginBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
    } else {
        loginBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
}

function showError(message) {
    errorText.textContent = message;
    loginError.style.display = 'flex';
    
    // Focar no primeiro input
    usernameInput.focus();
    
    // Auto-hide após 5 segundos
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    loginError.style.display = 'none';
}

function showLoadingOverlay() {
    loadingOverlay.style.display = 'flex';
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

// Limpar erro ao digitar
[usernameInput, passwordInput].forEach(input => {
    input.addEventListener('input', hideError);
    input.addEventListener('focus', hideError);
});

// Validação em tempo real
usernameInput.addEventListener('blur', function() {
    if (this.value.trim().length < 3) {
        this.setCustomValidity('Usuário deve ter pelo menos 3 caracteres');
    } else {
        this.setCustomValidity('');
    }
});

passwordInput.addEventListener('blur', function() {
    if (this.value.length < 4) {
        this.setCustomValidity('Senha deve ter pelo menos 4 caracteres');
    } else {
        this.setCustomValidity('');
    }
});

// Atalhos de teclado
document.addEventListener('keydown', function(e) {
    // Enter para submeter (já funciona com form submit)
    // Escape para limpar formulário
    if (e.key === 'Escape') {
        loginForm.reset();
        hideError();
        usernameInput.focus();
    }
});

// Prevenir envio múltiplo
let isSubmitting = false;
loginForm.addEventListener('submit', function(e) {
    if (isSubmitting) {
        e.preventDefault();
        return false;
    }
    isSubmitting = true;
    
    // Resetar flag após 2 segundos
    setTimeout(() => {
        isSubmitting = false;
    }, 2000);
});

// ========================================
// DETECÇÃO DE USUÁRIO PARA DEMONSTRAÇÃO
// ========================================

// Adicionar sugestões de usuários para teste (opcional)
function addDemoHints() {
    // Adicionar tooltip ou sugestão para usuários de teste
    const demoUsers = [
        { username: 'adminTom', type: 'Administrador' },
        { username: 'cliente1', type: 'Cliente' }
    ];
    
    // Criar elemento de dica (opcional)
    const hintElement = document.createElement('div');
    hintElement.className = 'demo-hint';
    hintElement.innerHTML = `
        <small style="color: var(--text-secondary); opacity: 0.7;">
            💡 Para teste: adminTom / cliente1 (senha: password)
        </small>
    `;
    
    // Adicionar após o formulário (opcional - remover em produção)
    // loginForm.parentNode.insertBefore(hintElement, loginForm.nextSibling);
}

// Inicializar dicas (apenas em desenvolvimento)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    addDemoHints();
}

// ========================================
// VERIFICAÇÃO DE SESSÃO EXISTENTE
// ========================================

// Verificar se já existe uma sessão ativa
async function checkExistingSession() {
    try {
        // Tentar acessar uma rota protegida para verificar sessão
        const response = await fetch(`${API_BASE_URL}/categorias.php`, {
            method: 'GET'
        });
        
        // Se tiver resposta, verificar se usuário está logado via outra verificação
        // Esta é uma verificação básica - em produção, você pode ter um endpoint específico
        
    } catch (error) {
        // Ignorar erros aqui - apenas verificação inicial
        console.log('Verificação de sessão inicial');
    }
}

// Executar verificação ao carregar
document.addEventListener('DOMContentLoaded', function() {
    checkExistingSession();
    
    // Focar no campo de usuário
    usernameInput.focus();
    
    // Adicionar animação de entrada
    setTimeout(() => {
        document.querySelector('.login-card').style.opacity = '1';
    }, 100);
});

// ========================================
// LOG DE ATIVIDADES (DEBUG)
// ========================================

function logActivity(action, details = '') {
    if (window.location.hostname === 'localhost') {
        console.log(`[Login Activity] ${action}`, details || '');
    }
}

// Log de tentativas de login
usernameInput.addEventListener('blur', function() {
    if (this.value.trim()) {
        logActivity('Username entered', this.value.trim());
    }
});

loginForm.addEventListener('submit', function() {
    logActivity('Login attempt', usernameInput.value.trim());
});
