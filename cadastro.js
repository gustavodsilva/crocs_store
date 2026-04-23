// ========================================
// JAVASCRIPT - CADASTRO TOM STORE
// ========================================

// Configuração da API
const API_BASE_URL = 'api';

// Elementos do DOM
const cadastroForm = document.getElementById('cadastroForm');
const cadastroBtn = document.getElementById('cadastroBtn');
const btnText = document.querySelector('.btn-text');
const btnLoading = document.querySelector('.btn-loading');
const cadastroError = document.getElementById('cadastroError');
const cadastroSuccess = document.getElementById('cadastroSuccess');
const errorText = document.querySelector('.error-text');
const successText = document.querySelector('.success-text');
const loadingOverlay = document.getElementById('loadingOverlay');

// Event Listeners
cadastroForm.addEventListener('submit', handleCadastro);

// Máscaras de input
document.getElementById('telefone').addEventListener('input', maskTelefone);
document.getElementById('cep').addEventListener('input', maskCEP);

// Auto-preenchimento de CEP
document.getElementById('cep').addEventListener('blur', buscarCEP);

// Validação em tempo real
document.getElementById('senha').addEventListener('input', validarSenhas);
document.getElementById('confirmarSenha').addEventListener('input', validarSenhas);

// ========================================
// MÁSCARAS DE INPUT
// ========================================

function maskTelefone(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
        if (value.length <= 2) {
            value = `(${value}`;
        } else if (value.length <= 6) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else if (value.length <= 10) {
            value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
        } else {
            value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        }
    }
    
    e.target.value = value;
}

function maskCEP(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 5) {
        value = `${value.slice(0, 5)}-${value.slice(5)}`;
    }
    
    e.target.value = value;
}

// ========================================
// BUSCA DE CEP (VIA CEP)
// ========================================

async function buscarCEP() {
    const cepInput = document.getElementById('cep');
    const cep = cepInput.value.replace(/\D/g, '');
    
    if (cep.length !== 8) {
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        
        if (!response.ok) {
            throw new Error('Erro ao buscar CEP');
        }
        
        const data = await response.json();
        
        if (data.erro) {
            throw new Error('CEP não encontrado');
        }
        
        // Preencher campos do endereço
        document.getElementById('rua').value = data.logradouro || '';
        document.getElementById('bairro').value = data.bairro || '';
        document.getElementById('cidade').value = data.localidade || '';
        document.getElementById('estado').value = data.uf || '';
        
        // Focar no número
        document.getElementById('numero').focus();
        
        showSuccess('Endereço preenchido automaticamente!');
        
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        showError('CEP não encontrado. Tente novamente.');
        
        // Limpar campos de endereço
        document.getElementById('rua').value = '';
        document.getElementById('bairro').value = '';
        document.getElementById('cidade').value = '';
        document.getElementById('estado').value = '';
    } finally {
        showLoading(false);
    }
}

// ========================================
// VALIDAÇÕES
// ========================================

function validarFormulario() {
    const nome = document.getElementById('nome').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const cep = document.getElementById('cep').value.trim();
    const rua = document.getElementById('rua').value.trim();
    const numero = document.getElementById('numero').value.trim();
    const bairro = document.getElementById('bairro').value.trim();
    const cidade = document.getElementById('cidade').value.trim();
    const estado = document.getElementById('estado').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    const email = document.getElementById('email').value.trim();
    
    // Limpar validações anteriores
    limparValidacoes();
    
    let erros = [];
    
    // Validação nome
    if (nome.length < 3) {
        mostrarErroCampo('nome', 'Nome deve ter pelo menos 3 caracteres');
        erros.push('nome');
    }
    
    // Validação telefone
    const telefoneLimpo = telefone.replace(/\D/g, '');
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
        mostrarErroCampo('telefone', 'Telefone inválido');
        erros.push('telefone');
    }
    
    // Validação email (se preenchido)
    if (email && !isValidEmail(email)) {
        mostrarErroCampo('email', 'E-mail inválido');
        erros.push('email');
    }
    
    // Validação CEP
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
        mostrarErroCampo('cep', 'CEP inválido');
        erros.push('cep');
    }
    
    // Validação endereço
    if (!rua) {
        mostrarErroCampo('rua', 'Rua é obrigatória');
        erros.push('rua');
    }
    
    if (!numero) {
        mostrarErroCampo('numero', 'Número é obrigatório');
        erros.push('numero');
    }
    
    if (!bairro) {
        mostrarErroCampo('bairro', 'Bairro é obrigatório');
        erros.push('bairro');
    }
    
    if (!cidade) {
        mostrarErroCampo('cidade', 'Cidade é obrigatória');
        erros.push('cidade');
    }
    
    if (!estado || estado.length !== 2) {
        mostrarErroCampo('estado', 'Estado inválido');
        erros.push('estado');
    }
    
    // Validação senha
    if (senha.length < 6) {
        mostrarErroCampo('senha', 'Senha deve ter pelo menos 6 caracteres');
        erros.push('senha');
    }
    
    if (senha !== confirmarSenha) {
        mostrarErroCampo('confirmarSenha', 'As senhas não coincidem');
        erros.push('confirmarSenha');
    }
    
    return erros.length === 0;
}

function validarSenhas() {
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    
    limparValidacaoCampo('senha');
    limparValidacaoCampo('confirmarSenha');
    
    if (senha.length > 0 && senha.length < 6) {
        mostrarErroCampo('senha', 'Senha deve ter pelo menos 6 caracteres');
    } else if (senha.length >= 6) {
        mostrarSucessoCampo('senha');
    }
    
    if (confirmarSenha.length > 0) {
        if (senha !== confirmarSenha) {
            mostrarErroCampo('confirmarSenha', 'As senhas não coincidem');
        } else {
            mostrarSucessoCampo('confirmarSenha');
        }
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ========================================
// FUNÇÕES DE UI
// ========================================

function setCadastroLoading(loading) {
    if (loading) {
        cadastroBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
    } else {
        cadastroBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
}

function showError(message) {
    errorText.textContent = message;
    cadastroError.style.display = 'flex';
    cadastroSuccess.style.display = 'none';
    
    // Auto-hide após 5 segundos
    setTimeout(() => {
        cadastroError.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    successText.textContent = message;
    cadastroSuccess.style.display = 'flex';
    cadastroError.style.display = 'none';
    
    // Auto-hide após 3 segundos
    setTimeout(() => {
        cadastroSuccess.style.display = 'none';
    }, 3000);
}

function showLoading(show) {
    loadingOverlay.style.display = show ? 'flex' : 'none';
}

function mostrarErroCampo(campoId, mensagem) {
    const campo = document.getElementById(campoId);
    campo.classList.add('error');
    campo.classList.remove('success');
    
    // Adicionar mensagem de erro (opcional)
    const existingError = campo.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    const errorElement = document.createElement('small');
    errorElement.className = 'field-error';
    errorElement.style.color = 'var(--error-color)';
    errorElement.style.fontSize = '0.8rem';
    errorElement.textContent = mensagem;
    campo.parentNode.appendChild(errorElement);
}

function mostrarSucessoCampo(campoId) {
    const campo = document.getElementById(campoId);
    campo.classList.add('success');
    campo.classList.remove('error');
    
    // Remover mensagem de erro
    const existingError = campo.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function limparValidacaoCampo(campoId) {
    const campo = document.getElementById(campoId);
    campo.classList.remove('error', 'success');
    
    // Remover mensagem de erro
    const existingError = campo.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function limparValidacoes() {
    document.querySelectorAll('.form-group input').forEach(input => {
        input.classList.remove('error', 'success');
    });
    
    document.querySelectorAll('.field-error').forEach(error => {
        error.remove();
    });
}

// ========================================
// CADASTRO
// ========================================

async function handleCadastro(e) {
    e.preventDefault();
    
    if (!validarFormulario()) {
        showError('Por favor, corrija os erros no formulário');
        return;
    }
    
    setCadastroLoading(true);
    hideMessages();
    
    const formData = {
        nome: document.getElementById('nome').value.trim(),
        telefone: document.getElementById('telefone').value.replace(/\D/g, ''),
        email: document.getElementById('email').value.trim() || null,
        cep: document.getElementById('cep').value.replace(/\D/g, ''),
        rua: document.getElementById('rua').value.trim(),
        numero: document.getElementById('numero').value.trim(),
        complemento: document.getElementById('complemento').value.trim() || null,
        bairro: document.getElementById('bairro').value.trim(),
        cidade: document.getElementById('cidade').value.trim(),
        estado: document.getElementById('estado').value.trim(),
        senha: document.getElementById('senha').value,
        data_nascimento: document.getElementById('dataNascimento').value || null
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/cadastro.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('Cadastro realizado com sucesso! Redirecionando para o login...');
            
            // Limpar formulário
            cadastroForm.reset();
            limparValidacoes();
            
            // Redirecionar para login após 2 segundos
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            showError(data.error || 'Erro ao realizar cadastro');
        }
        
    } catch (error) {
        console.error('Erro no cadastro:', error);
        showError('Erro de conexão. Tente novamente.');
    } finally {
        setCadastroLoading(false);
    }
}

function hideMessages() {
    cadastroError.style.display = 'none';
    cadastroSuccess.style.display = 'none';
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

// Limpar erro ao digitar
document.querySelectorAll('.form-group input').forEach(input => {
    input.addEventListener('input', function() {
        limparValidacaoCampo(this.id);
        hideMessages();
    });
    
    input.addEventListener('focus', function() {
        limparValidacaoCampo(this.id);
        hideMessages();
    });
});

// Atalhos de teclado
document.addEventListener('keydown', function(e) {
    // Enter para submeter (já funciona com form submit)
    // Escape para limpar formulário
    if (e.key === 'Escape') {
        if (confirm('Deseja limpar o formulário?')) {
            cadastroForm.reset();
            limparValidacoes();
            hideMessages();
            document.getElementById('nome').focus();
        }
    }
});

// Prevenir envio múltiplo
let isSubmitting = false;
cadastroForm.addEventListener('submit', function(e) {
    if (isSubmitting) {
        e.preventDefault();
        return false;
    }
    isSubmitting = true;
    
    // Resetar flag após 3 segundos
    setTimeout(() => {
        isSubmitting = false;
    }, 3000);
});

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Focar no primeiro campo
    document.getElementById('nome').focus();
    
    // Adicionar animação de entrada
    setTimeout(() => {
        document.querySelector('.cadastro-card').style.opacity = '1';
    }, 100);
});

// ========================================
// LOG DE ATIVIDADES (DEBUG)
// ========================================

function logActivity(action, details = '') {
    if (window.location.hostname === 'localhost') {
        console.log(`[Cadastro Activity] ${action}`, details || '');
    }
}

// Log de tentativas de cadastro
cadastroForm.addEventListener('submit', function() {
    logActivity('Cadastro attempt', document.getElementById('telefone').value.replace(/\D/g, ''));
});
