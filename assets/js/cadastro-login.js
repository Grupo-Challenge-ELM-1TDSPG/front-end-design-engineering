// assets/js/login.js
document.addEventListener('DOMContentLoaded', function () {
    const loginFormSection = document.getElementById('login-form-section');
    const cadastroFormSection = document.getElementById('cadastro-form-section');
    const esqueciSenhaFormSection = document.getElementById('esqueci-senha-form-section');
    const cadastroSucessoSection = document.getElementById('cadastro-sucesso-section');

    const linkCadastreSe = document.getElementById('linkCadastreSe');
    const linkEsqueciSenha = document.getElementById('linkEsqueciSenha');
    const backToLoginFromCadastro = document.getElementById('backToLoginFromCadastro');
    const backToLoginFromEsqueci = document.getElementById('backToLoginFromEsqueci');
    const goToLoginFromSuccess = document.getElementById('goToLoginFromSuccess');

    const formLogin = document.getElementById('formLogin');
    const formCadastro = document.getElementById('formCadastro');
    const formEsqueciSenha = document.getElementById('formEsqueciSenha');

    const loginStatusDiv = document.getElementById('loginStatus');
    const cadastroStatusDiv = document.getElementById('cadastroStatus');
    const esqueciSenhaStatusDiv = document.getElementById('esqueciSenhaStatus');
    
    // Inputs para máscaras
    const dataNascimentoInput = document.getElementById('dataNascimento');
    const cpfInputs = document.querySelectorAll('input[id*="Cpf"], input[id*="cpf"]'); // Pega todos os inputs de CPF
    const telefoneInputs = document.querySelectorAll('input[type="tel"]'); // Pega todos os inputs de telefone

    cpfInputs.forEach(input => {
        if(input) input.addEventListener('input', maskCPF);
    });
    telefoneInputs.forEach(input => {
        if(input) input.addEventListener('input', maskTelefone);
    });
    if(dataNascimentoInput) dataNascimentoInput.addEventListener('input', maskDate);

    // --- Funções de Navegação entre Seções ---
    function showSection(sectionToShow) {
        [loginFormSection, cadastroFormSection, esqueciSenhaFormSection, cadastroSucessoSection].forEach(section => {
            if (section) section.classList.remove('active');
        });
        if (sectionToShow) sectionToShow.classList.add('active');
        clearAllFormStatuses(); // Limpa mensagens de status ao trocar de seção
    }

    if (linkCadastreSe) {
        linkCadastreSe.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(cadastroFormSection);
            resetCadastroForm();
        });
    }
    if (linkEsqueciSenha) {
        linkEsqueciSenha.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(esqueciSenhaFormSection);
            if (formEsqueciSenha) formEsqueciSenha.reset();
            clearValidationErrors(formEsqueciSenha);
        });
    }
    if (backToLoginFromCadastro) {
        backToLoginFromCadastro.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(loginFormSection);
            if (formLogin) formLogin.reset();
            clearValidationErrors(formLogin);
        });
    }
    if (backToLoginFromEsqueci) {
        backToLoginFromEsqueci.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(loginFormSection);
            if (formLogin) formLogin.reset();
            clearValidationErrors(formLogin);
        });
    }
    if (goToLoginFromSuccess) {
        goToLoginFromSuccess.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(loginFormSection);
            if (formLogin) formLogin.reset();
            clearValidationErrors(formLogin);
        });
    }

    // --- Lógica do Formulário de Cadastro em Etapas ---
    const steps = Array.from(document.querySelectorAll('#cadastro-form-section .form-step'));
    const stepperIndicators = Array.from(document.querySelectorAll('#cadastro-form-section .stepper .step'));
    let currentStep = 0;

    function updateStepper() {
        stepperIndicators.forEach((indicator, index) => {
            indicator.classList.remove('active', 'completed');
            if (index < currentStep) {
                indicator.classList.add('completed');
            } else if (index === currentStep) {
                indicator.classList.add('active');
            }
        });
    }

    function showStep(stepIndex) {
        steps.forEach((step, index) => step.classList.toggle('active', index === stepIndex));
        currentStep = stepIndex;
        updateStepper();
    }
    
    function resetCadastroForm() {
        if (formCadastro) formCadastro.reset();
        clearValidationErrors(formCadastro);
        showStep(0); // Volta para a primeira etapa
    }


    if (formCadastro && steps.length > 0) { // Garante que os steps existem antes de adicionar listeners
        const nextButtons = formCadastro.querySelectorAll('.next-step');
        const prevButtons = formCadastro.querySelectorAll('.prev-step');

        nextButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (validateStep(currentStep)) { // Valida a etapa atual antes de avançar
                    if (currentStep < steps.length - 1) {
                        showStep(currentStep + 1);
                    }
                }
            });
        });

        prevButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (currentStep > 0) {
                    showStep(currentStep - 1);
                }
            });
        });
        showStep(0); // Mostrar a primeira etapa inicialmente
    }
    
    // --- Funções de Validação e Auxiliares ---
    function clearAllFormStatuses() {
        if(loginStatusDiv) { loginStatusDiv.textContent = ''; loginStatusDiv.className = 'form-status-message'; }
        if(cadastroStatusDiv) { cadastroStatusDiv.textContent = ''; cadastroStatusDiv.className = 'form-status-message'; }
        if(esqueciSenhaStatusDiv) { esqueciSenhaStatusDiv.textContent = ''; esqueciSenhaStatusDiv.className = 'form-status-message'; }
    }
    
    function clearValidationErrors(currentForm) {
        if (!currentForm) return;
        currentForm.querySelectorAll('.invalid').forEach(input => input.classList.remove('invalid'));
        currentForm.querySelectorAll('.error-message').forEach(msg => msg.textContent = '');
    }

    function setError(inputElement, message) {
        inputElement.classList.add('invalid');
        const errorMessageElement = inputElement.closest('.form-group').querySelector('.error-message');
        if (errorMessageElement) errorMessageElement.textContent = message;
    }
    
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidCPF(cpf) {
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
        let sum = 0;
        for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        let remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;
        sum = 0;
        for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        return remainder === parseInt(cpf.substring(10, 11));
    }

    function isValidDate(dateString) { // Formato dd/mm/yyyy
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return false;
        const parts = dateString.split("/");
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        if(year < 1900 || year > new Date().getFullYear() || month === 0 || month > 12) return false;
        const monthLength = [31, (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        return day > 0 && day <= monthLength[month - 1];
    }

    // --- Submissão dos Formulários ---

    // Formulário de Login
    if (formLogin) {
        formLogin.addEventListener('submit', function(e) {
            e.preventDefault();
            clearValidationErrors(formLogin);
            let isValid = true;
            const cpfInput = document.getElementById('loginCpf');
            const senhaInput = document.getElementById('loginSenha');

            if (!isValidCPF(cpfInput.value)) { setError(cpfInput, 'CPF inválido.'); isValid = false; }
            if (senhaInput.value.length < 1) { setError(senhaInput, 'Senha é obrigatória.'); isValid = false; }
            
            if (isValid) {
                if (typeof simularLogin === 'function' && simularLogin(cpfInput.value, senhaInput.value)) {
                    loginStatusDiv.textContent = 'Login bem-sucedido! Redirecionando...';
                    loginStatusDiv.className = 'form-status-message success';
                    setTimeout(() => window.location.href = './area-paciente/meu-perfil.html', 1500);
                } else {
                    // Não diferencie entre CPF não encontrado e senha incorreta por segurança
                    loginStatusDiv.textContent = 'CPF ou senha inválidos.';
                    loginStatusDiv.className = 'form-status-message error';
                }
            } else {
                loginStatusDiv.textContent = 'Por favor, corrija os erros.';
                loginStatusDiv.className = 'form-status-message error';
            }
        });
    }

    // Validação por etapa do formulário de Cadastro
    function validateStep(stepIndex) {
        clearValidationErrors(formCadastro);
        let isValid = true;
        // Seleciona apenas inputs, selects e textareas que são required DENTRO da etapa atual
        const currentFields = steps[stepIndex].querySelectorAll('input[required], select[required], textarea[required]');

        currentFields.forEach(field => {
            if (isFieldEmpty(field)) {
                setError(field, 'Este campo é obrigatório.');
                isValid = false;
            } else if (!validateSpecificField(field)) {
                isValid = false; // validateSpecificField já chama setError
            }
        });
        return isValid;
    }

    function isFieldEmpty(field) {
        return (field.type === 'checkbox' && !field.checked) ||
               (field.type !== 'checkbox' && field.value.trim() === '');
    }

    function validateSpecificField(field) {
        const senha = document.getElementById('cadastroSenha'); // Para confirmar senha
        switch (field.id) {
            case 'cadastroNomeCompleto':
                return validateNomeCompleto(field);
            case 'cadastroCpf':
                return validateCpf(field);
            case 'dataNascimento':
                return validateDataNascimento(field);
            case 'cadastroEmail':
                return validateCadastroEmail(field);
            case 'cadastroSenha':
                return validateCadastroSenha(field);
            case 'confirmarSenha':
                return validateConfirmarSenha(field, senha);
            // Adicionar validação para outros campos se necessário
        }
        return true;
    }

    function validateNomeCompleto(field) {
        if (field.value.trim().length < 3) {
            setError(field, 'Nome deve ter pelo menos 3 caracteres.');
            return false;
        }
        return true;
    }

    function validateCpf(field) {
        if (!isValidCPF(field.value)) {
            setError(field, 'CPF inválido.');
            return false;
        }
        // Checar se CPF já existe (simulação)
        if (window.dadosPacientes && window.dadosPacientes[field.value.replace(/\D/g, "")]) {
            setError(field, 'CPF já cadastrado.');
            return false;
        }
        return true;
    }

    function validateDataNascimento(field) {
        if (!isValidDate(field.value)) {
            setError(field, 'Data de nascimento inválida (dd/mm/yyyy).');
            return false;
        }
        return true;
    }

    function validateCadastroEmail(field) {
        if (!isValidEmail(field.value)) {
            setError(field, 'Email inválido.');
            return false;
        }
        return true;
    }

    function validateCadastroSenha(field) {
        if (field.value.length < 8) {
            setError(field, 'Senha deve ter no mínimo 8 caracteres.');
            return false;
        }
        // Adicionar validação de força da senha se desejado (ex: maiúscula, número)
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/.test(field.value)) {
            setError(field, 'Senha fraca. Use letras maiúsculas, minúsculas e números.');
            return false;
        }
        return true;
    }

    function validateConfirmarSenha(field, senha) {
        if (field.value !== senha.value) {
            setError(field, 'As senhas não coincidem.');
            return false;
        }
        return true;
    }


    // Submissão final do formulário de Cadastro
    if (formCadastro) {
        formCadastro.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateStep(currentStep)) { // Valida a última etapa
                const cadastroData = {
                    nome: document.getElementById('cadastroNomeCompleto').value.trim(),
                    cpf: document.getElementById('cadastroCpf').value.trim(), // CPF virá formatado, mas registrarNovoUsuario removerá a formatação para a chave
                    dataNascimento: document.getElementById('dataNascimento').value.trim(),
                    email: document.getElementById('cadastroEmail').value.trim(),
                    telefone: document.getElementById('cadastroTelefone').value.trim(),
                    senha: document.getElementById('cadastroSenha').value // ATENÇÃO: NUNCA FAÇA ISSO EM PRODUÇÃO!
                };

                if (typeof registrarNovoUsuario === 'function' && registrarNovoUsuario(cadastroData)) {
                    showSection(cadastroSucessoSection); // Mostra tela de sucesso
                    formCadastro.reset(); // Limpa o formulário
                    showStep(0); // Volta para a primeira etapa para o próximo cadastro
                } else {
                    // Se registrarNovoUsuario retornar false (ex: CPF já existe, verificado na função)
                    setError(document.getElementById('cadastroCpf'), 'Este CPF já está cadastrado.');
                    cadastroStatusDiv.textContent = 'Erro no cadastro. Verifique os campos.';
                    cadastroStatusDiv.className = 'form-status-message error';
                    showStep(0); // Volta para a etapa do CPF se o erro for lá
                }
            } else {
                cadastroStatusDiv.textContent = 'Por favor, corrija os erros na última etapa.';
                cadastroStatusDiv.className = 'form-status-message error';
            }
        });
    }
    

    // Formulário Esqueci Minha Senha
    if (formEsqueciSenha) {
        formEsqueciSenha.addEventListener('submit', function(e) {
            e.preventDefault();
            clearValidationErrors(formEsqueciSenha);
            let isValid = true;
            const cpf = document.getElementById('esqueciCpf');
            const email = document.getElementById('esqueciEmail');

            if (!isValidCPF(cpf.value)) { setError(cpf, 'CPF inválido.'); isValid = false; }
            if (!isValidEmail(email.value)) { setError(email, 'Email inválido.'); isValid = false; }

            if (isValid) {
                // Simulação: verificar se CPF e email correspondem a um usuário existente
                const cpfLimpo = cpf.value.replace(/\D/g, "");
                if (window.dadosPacientes && window.dadosPacientes[cpfLimpo] && window.dadosPacientes[cpfLimpo].email === email.value) {
                    esqueciSenhaStatusDiv.textContent = 'Instruções de recuperação enviadas para seu email (simulação).';
                    esqueciSenhaStatusDiv.className = 'form-status-message success';
                    formEsqueciSenha.reset();
                } else {
                    esqueciSenhaStatusDiv.textContent = 'CPF ou email não encontrado/correspondente.';
                    esqueciSenhaStatusDiv.className = 'form-status-message error';
                }
            } else {
                 esqueciSenhaStatusDiv.textContent = 'Por favor, corrija os erros.';
                 esqueciSenhaStatusDiv.className = 'form-status-message error';
            }
        });
    }

    // Toggle de visibilidade da senha
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.textContent = type === 'password' ? '👁️' : '🙈';
        });
    });
    
    // --- Máscaras de Input ---
    function maskCPF(event) {
        let value = event.target.value.replace(/\D/g, ""); // Remove tudo que não é dígito
        value = value.substring(0, 11); // Limita a 11 dígitos
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        event.target.value = value;
    }

    function maskTelefone(event) {
        let value = event.target.value.replace(/\D/g, "");
        value = value.substring(0, 11); // (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
        if (value.length > 10) { // Celular com 9 dígitos + DDD
            value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
        } else if (value.length > 6) { // Celular com 8 dígitos + DDD ou Fixo com DDD
            value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d*)/, "($1) $2");
        } else if (value.length > 0) {
            value = value.replace(/^(\d*)/, "($1");
        }
        event.target.value = value;
    }
    
    function maskDate(event) {
        let value = event.target.value.replace(/\D/g, "");
        value = value.substring(0, 8); // dd/mm/yyyy -> 8 dígitos
        if (value.length > 4) { // Se já tem os 4 primeiros (ddmm)
            value = value.replace(/(\d{2})(\d{2})(\d{4})/, "$1/$2/$3");
        } else if (value.length > 2) { // Se já tem os 2 primeiros (dd)
            value = value.replace(/(\d{2})(\d{2})/, "$1/$2");
        }
        event.target.value = value;
    }


    // Limpar erros ao digitar nos campos (em todos os formulários desta página)
    const allFormInputs = document.querySelectorAll(
        '#formLogin input, #formCadastro input, #formCadastro select, #formCadastro textarea, #formEsqueciSenha input'
    );
    allFormInputs.forEach(input => {
        input.addEventListener('input', () => { // 'input' é melhor que 'keyup' para selects e copy/paste
            if (input.classList.contains('invalid')) {
                input.classList.remove('invalid');
                const errorMsgElem = input.closest('.form-group')?.querySelector('.error-message'); // Usar optional chaining se .form-group não for garantido
                if (errorMsgElem) errorMsgElem.textContent = '';
            }
        });
    });

});