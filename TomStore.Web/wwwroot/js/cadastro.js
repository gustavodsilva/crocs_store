// ========================================
// JAVASCRIPT - CADASTRO TOM STORE (C# .NET)
// ========================================

// Máscaras de input
document.addEventListener('DOMContentLoaded', function() {
    const telefoneInput = document.getElementById('Telefone');
    const cepInput = document.getElementById('Cep');
    
    if (telefoneInput) {
        telefoneInput.addEventListener('input', maskTelefone);
    }
    
    if (cepInput) {
        cepInput.addEventListener('input', maskCEP);
        cepInput.addEventListener('blur', buscarCEP);
    }
    
    // Validação de senhas
    const senhaInput = document.getElementById('Password');
    const confirmarSenhaInput = document.getElementById('ConfirmPassword');
    
    if (senhaInput) {
        senhaInput.addEventListener('input', validarSenhas);
    }
    
    if (confirmarSenhaInput) {
        confirmarSenhaInput.addEventListener('input', validarSenhas);
    }
});

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
    const cepInput = document.getElementById('Cep');
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
        document.getElementById('Rua').value = data.logradouro || '';
        document.getElementById('Bairro').value = data.bairro || '';
        document.getElementById('Cidade').value = data.localidade || '';
        document.getElementById('Estado').value = data.uf || '';
        
        // Focar no número
        document.getElementById('Numero').focus();
        
        showSuccess('Endereço preenchido automaticamente!');
        
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        showError('CEP não encontrado. Tente novamente.');
        
        // Limpar campos de endereço
        document.getElementById('Rua').value = '';
        document.getElementById('Bairro').value = '';
        document.getElementById('Cidade').value = '';
        document.getElementById('Estado').value = '';
    } finally {
        showLoading(false);
    }
}

// ========================================
// VALIDAÇÕES
// ========================================

function validarSenhas() {
    const senha = document.getElementById('Password').value;
    const confirmarSenha = document.getElementById('ConfirmPassword').value;
    
    limparValidacaoCampo('Password');
    limparValidacaoCampo('ConfirmPassword');
    
    if (senha.length > 0 && senha.length < 6) {
        mostrarErroCampo('Password', 'Senha deve ter pelo menos 6 caracteres');
    } else if (senha.length >= 6) {
        mostrarSucessoCampo('Password');
    }
    
    if (confirmarSenha.length > 0) {
        if (senha !== confirmarSenha) {
            mostrarErroCampo('ConfirmPassword', 'As senhas não coincidem');
        } else {
            mostrarSucessoCampo('ConfirmPassword');
        }
    }
}

// ========================================
// FUNÇÕES DE UI
// ========================================

function showLoading(show) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }
}

function showError(message) {
    const validationSummary = document.querySelector('.validation-summary-errors');
    if (validationSummary) {
        validationSummary.style.display = 'flex';
        validationSummary.querySelector('.error-text').textContent = message;
    }
}

function showSuccess(message) {
    // Você pode implementar uma notificação de sucesso se quiser
    console.log('Success:', message);
}

function mostrarErroCampo(campoId, mensagem) {
    const campo = document.getElementById(campoId);
    if (campo) {
        campo.classList.add('error');
        campo.classList.remove('success');
        
        // Adicionar mensagem de erro
        const existingError = campo.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.textContent = mensagem;
        }
    }
}

function mostrarSucessoCampo(campoId) {
    const campo = document.getElementById(campoId);
    if (campo) {
        campo.classList.add('success');
        campo.classList.remove('error');
        
        // Remover mensagem de erro
        const existingError = campo.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.textContent = '';
        }
    }
}

function limparValidacaoCampo(campoId) {
    const campo = document.getElementById(campoId);
    if (campo) {
        campo.classList.remove('error', 'success');
        
        // Remover mensagem de erro
        const existingError = campo.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.textContent = '';
        }
    }
}

// Limpar erro ao digitar
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', function() {
        limparValidacaoCampo(this.id);
        const validationSummary = document.querySelector('.validation-summary-errors');
        if (validationSummary) {
            validationSummary.style.display = 'none';
        }
    });
    
    input.addEventListener('focus', function() {
        limparValidacaoCampo(this.id);
        const validationSummary = document.querySelector('.validation-summary-errors');
        if (validationSummary) {
            validationSummary.style.display = 'none';
        }
    });
});
