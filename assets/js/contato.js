// Script para validação e envio do formulário de contato do SimplesHC

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('formContato');
    const formStatusDiv = document.getElementById('formStatus');

    if (form) {
        // Evento de envio do formulário
        form.addEventListener('submit', function (event) {
            event.preventDefault(); // Impede o envio padrão do formulário
            clearErrors(); // Limpa erros anteriores

            if (validateForm()) {
                // Simula o envio dos dados do formulário
                const formData = new FormData(form);
                const data = {};
                formData.forEach((value, key) => {
                    data[key] = value;
                });

                console.log('Dados do formulário (simulado):', data); // Veja no console do navegador

                // Exibe mensagem de sucesso para o usuário
                formStatusDiv.textContent = 'Mensagem enviada com sucesso! Entraremos em contato em breve.';
                formStatusDiv.className = 'form-status-message success'; // Aplica classe de sucesso
                form.reset(); // Limpa o formulário

                // Remove a mensagem de sucesso após alguns segundos
                setTimeout(() => {
                    formStatusDiv.textContent = '';
                    formStatusDiv.className = 'form-status-message';
                }, 5000);

            } else {
                // Exibe mensagem de erro se houver campos inválidos
                formStatusDiv.textContent = 'Por favor, corrija os erros no formulário.';
                formStatusDiv.className = 'form-status-message error'; // Aplica classe de erro
            }
        });
    }

    // Valida todos os campos obrigatórios do formulário
    function validateForm() {
        let isValid = true;

        const nomeCompleto = document.getElementById('nomeCompleto');
        const email = document.getElementById('email');
        const assunto = document.getElementById('assunto');
        const mensagem = document.getElementById('mensagem');

        // Validação do Nome Completo
        if (nomeCompleto.value.trim() === '') {
            setError(nomeCompleto, 'Nome completo é obrigatório.');
            isValid = false;
        } else if (nomeCompleto.value.trim().length < 3) {
            setError(nomeCompleto, 'Nome deve ter pelo menos 3 caracteres.');
            isValid = false;
        }

        // Validação do Email
        if (email.value.trim() === '') {
            setError(email, 'Email é obrigatório.');
            isValid = false;
        } else if (!isValidEmail(email.value.trim())) {
            setError(email, 'Por favor, insira um email válido.');
            isValid = false;
        }

        // Validação do Assunto
        if (assunto.value === '') {
            setError(assunto, 'Por favor, selecione um assunto.');
            isValid = false;
        }

        // Validação da Mensagem
        if (mensagem.value.trim() === '') {
            setError(mensagem, 'Mensagem é obrigatória.');
            isValid = false;
        } else if (mensagem.value.trim().length < 10) {
            setError(mensagem, 'Mensagem deve ter pelo menos 10 caracteres.');
            isValid = false;
        }

        return isValid;
    }

    // Marca campo como inválido e exibe mensagem de erro
    function setError(inputElement, message) {
        inputElement.classList.add('invalid');
        const errorMessageElement = inputElement.parentElement.querySelector('.error-message');
        if (errorMessageElement) {
            errorMessageElement.textContent = message;
        }
    }

    // Limpa todos os erros de validação do formulário
    function clearErrors() {
        const invalidInputs = form.querySelectorAll('.invalid');
        invalidInputs.forEach(input => input.classList.remove('invalid'));

        const errorMessages = form.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.textContent = '');

        if (formStatusDiv) {
            formStatusDiv.textContent = '';
            formStatusDiv.className = 'form-status-message';
        }
    }

    // Valida formato de email usando expressão regular simples
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Adiciona listener para limpar erro ao digitar em qualquer campo do formulário
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            if (input.classList.contains('invalid')) {
                input.classList.remove('invalid');
                const errorMessageElement = input.parentElement.querySelector('.error-message');
                if (errorMessageElement) {
                    errorMessageElement.textContent = '';
                }
            }
        });
    });

});