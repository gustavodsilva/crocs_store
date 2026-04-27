// ========================================
// JAVASCRIPT - LOGIN TOM STORE (C# .NET)
// ========================================

// Máscara de telefone
document.addEventListener('DOMContentLoaded', function() {
    const usernameInput = document.getElementById('Username');
    if (usernameInput) {
        usernameInput.addEventListener('input', maskTelefone);
        usernameInput.addEventListener('blur', function() {
            const value = this.value;
            const hasLetters = /[a-zA-Z]/.test(value);
            const numbersOnly = value.replace(/\D/g, '');
            
            if (hasLetters || numbersOnly.length < 10) {
                this.placeholder = 'nome de usuário';
            } else {
                this.placeholder = '(11) 99999-9999';
            }
        });
    }
});

function maskTelefone(e) {
    let value = e.target.value;
    
    // Verificar se é um username (contém letras) ou número de telefone
    const hasLetters = /[a-zA-Z]/.test(value);
    
    // Se tiver letras, não aplicar máscara (é um username)
    if (hasLetters) {
        return; // Não fazer nada, deixar o usuário digitar normalmente
    }
    
    // Se for número, aplicar máscara de telefone
    let numbersOnly = value.replace(/\D/g, '');
    
    if (numbersOnly.length === 0) return;
    
    if (numbersOnly.length <= 11) {
        if (numbersOnly.length <= 2) {
            value = `(${numbersOnly}`;
        } else if (numbersOnly.length <= 6) {
            value = `(${numbersOnly.slice(0, 2)}) ${numbersOnly.slice(2)}`;
        } else if (numbersOnly.length <= 10) {
            value = `(${numbersOnly.slice(0, 2)}) ${numbersOnly.slice(2, 6)}-${numbersOnly.slice(6)}`;
        } else {
            value = `(${numbersOnly.slice(0, 2)}) ${numbersOnly.slice(2, 7)}-${numbersOnly.slice(7)}`;
        }
    }
    
    e.target.value = value;
}
