// Script principal para gerenciamento da área do paciente no SimplesHC

document.addEventListener('DOMContentLoaded', function () {
    // Recupera dados do usuário logado e elementos principais da sidebar
    const pacienteLogado = getDadosUsuarioLogado();
    const sidebarUserNameEl = document.querySelector('.paciente-sidebar-header p#sidebarUserName, .paciente-sidebar-header p');
    const path = window.location.pathname;

    // Exibe nome do paciente na sidebar ou "Visitante" se não logado
    handleSidebarUserName(sidebarUserNameEl, pacienteLogado);

    // Redireciona para login se não autenticado e tentando acessar área restrita
    if (redirectIfNotLogged(pacienteLogado, path)) return;

    // Carrega e habilita edição do perfil se na página de perfil
    if (document.getElementById('formInformacoesPessoais') && pacienteLogado) {
        renderPerfilPage(pacienteLogado);
        setupPerfilEdit(pacienteLogado);
    }

    // Configura eventos de logout e navegação por abas
    setupLogout();
    setupTabs();

    // Carrega dados de exames, receitas e consultas conforme a página acessada
    if (path.includes('meus-exames.html') && pacienteLogado) {
        renderMeusExames(pacienteLogado);
    }
    if (path.includes('minhas-receitas.html') && pacienteLogado) {
        renderMinhasReceitas(pacienteLogado);
    }
    if (path.includes('minhas-consultas.html') && pacienteLogado) {
        renderMinhasConsultas(pacienteLogado);
    }
});

// Atualiza o nome do usuário na sidebar
function handleSidebarUserName(sidebarUserNameEl, pacienteLogado) {
    if (sidebarUserNameEl && pacienteLogado) {
        sidebarUserNameEl.textContent = pacienteLogado.nomeCompleto;
    } else if (sidebarUserNameEl) {
        sidebarUserNameEl.textContent = "Visitante";
    }
}

// Redireciona para login se não autenticado e acessando área restrita
function redirectIfNotLogged(pacienteLogado, path) {
    if (!pacienteLogado && path.includes('/area-paciente/')) {
        window.location.href = '../cadastro-login.html';
        return true;
    }
    return false;
}

// Preenche campos de formulário ou elementos de texto
function popularCampo(id, valor, isInput = true) {
    const campo = document.getElementById(id);
    if (campo) {
        if (isInput || campo.tagName === 'INPUT' || campo.tagName === 'TEXTAREA') {
            campo.value = valor !== undefined && valor !== null ? valor : '';
        } else {
            campo.textContent = valor !== undefined && valor !== null ? valor : 'N/A';
        }
    }
}

// Marca/desmarca checkboxes conforme valor booleano
function popularCheckbox(id, valorBooleano) {
    const campo = document.getElementById(id);
    if (campo) {
        campo.checked = valorBooleano === true;
    }
}

// Preenche listas-resumo (consultas, receitas, exames) ou exibe mensagem de vazio
function preencherListaResumo(ulId, items, mensagemVazia, formatadorItem) {
    const ulElement = document.getElementById(ulId);
    if (!ulElement) return;
    ulElement.innerHTML = '';
    if (items && items.length > 0) {
        items.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = formatadorItem(item);
            ulElement.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.innerHTML = `<em>${mensagemVazia}</em>`;
        ulElement.appendChild(li);
    }
}

// Preenche os campos do perfil do paciente
function renderPerfilPage(pacienteLogado) {
    popularCampo('userName', pacienteLogado.nomeCompleto);
    popularCampo('userCpf', pacienteLogado.cpf);
    popularCampo('userDob', pacienteLogado.dataNascimento);
    popularCampo('userEmail', pacienteLogado.email);
    popularCampo('userTelefone', pacienteLogado.telefone);
    popularCampo('userTelegramId', pacienteLogado.telegramId || '');

    if (pacienteLogado.notificacoes) {
        popularCheckbox('notifEmail', pacienteLogado.notificacoes.email);
        popularCheckbox('notifTelegram', pacienteLogado.notificacoes.telegram);
        popularCheckbox('lembreteConsulta', pacienteLogado.notificacoes.lembreteConsulta);
    }

    preencherListaResumo('resumoProximasConsultas', pacienteLogado.proximasConsultas, 'Nenhuma consulta agendada.',
        item => `${item.especialidade} com ${item.medico} <br><small>${item.dataHora} - ${item.local}</small>`
    );
    preencherListaResumo('resumoReceitasAtivas', pacienteLogado.receitasAtivas, 'Nenhuma receita ativa.',
        item => `${item.nome} <br><small>Validade: ${item.validade}</small>`
    );
    preencherListaResumo('resumoUltimosExames', pacienteLogado.ultimosExames, 'Nenhum exame recente.',
        item => `${item.nome} (${item.data}) <br><small>Status: ${item.status}</small>`
    );
}

// Habilita/desabilita edição do perfil e controla botões de ação
function setupPerfilEdit(pacienteLogadoObjeto) {
    const editProfileButton = document.getElementById('editProfileButton');
    const saveProfileButton = document.getElementById('saveProfileButton');
    const cancelEditButton = document.getElementById('cancelEditButton');
    const formInformacoesPessoais = document.getElementById('formInformacoesPessoais');
    const editableFieldsIds = ['userEmail', 'userTelefone', 'userTelegramId', 'notifEmail', 'notifTelegram', 'lembreteConsulta'];
    let originalValues = {};

    // Estado inicial dos botões
    if(saveProfileButton) saveProfileButton.style.display = 'none';
    if(cancelEditButton) cancelEditButton.style.display = 'none';
    if(editProfileButton) editProfileButton.style.display = 'inline-block';

    // Alterna entre modo edição e visualização
    function toggleEditMode(isEditing) {
        editableFieldsIds.forEach(id => {
            const field = document.getElementById(id);
            if (field) {
                field.disabled = !isEditing;
                if (isEditing) {
                    if (field.type === 'checkbox') {
                        originalValues[id] = field.checked;
                    } else {
                        originalValues[id] = field.value;
                    }
                }
            }
        });
        // Campos não editáveis permanecem desabilitados
        ['userName', 'userCpf', 'userDob'].forEach(id => {
            const field = document.getElementById(id);
            if (field) field.disabled = true;
        });

        if (editProfileButton) editProfileButton.style.display = isEditing ? 'none' : 'inline-block';
        if (saveProfileButton) saveProfileButton.style.display = isEditing ? 'inline-block' : 'none';
        if (cancelEditButton) cancelEditButton.style.display = isEditing ? 'inline-block' : 'none';
        
        if (formInformacoesPessoais) {
            isEditing ? formInformacoesPessoais.classList.add('edit-mode') : formInformacoesPessoais.classList.remove('edit-mode');
        }
    }

    // Eventos dos botões de edição
    if (editProfileButton) {
        editProfileButton.addEventListener('click', function () {
            toggleEditMode(true);
        });
    }
    if (cancelEditButton) {
        cancelEditButton.addEventListener('click', function () {
            editableFieldsIds.forEach(id => {
                const field = document.getElementById(id);
                if (field && originalValues.hasOwnProperty(id)) {
                    if (field.type === 'checkbox') {
                        field.checked = originalValues[id];
                    } else {
                        field.value = originalValues[id];
                    }
                }
            });
            toggleEditMode(false);
        });
    }
    if (saveProfileButton) {
        saveProfileButton.addEventListener('click', function () {
            if (pacienteLogadoObjeto) {
                // Atualiza objeto local e persiste alterações
                const pacienteAtualizado = JSON.parse(JSON.stringify(pacienteLogadoObjeto));
                pacienteAtualizado.email = document.getElementById('userEmail').value;
                pacienteAtualizado.telefone = document.getElementById('userTelefone').value;
                pacienteAtualizado.telegramId = document.getElementById('userTelegramId').value;
                if (!pacienteAtualizado.notificacoes) pacienteAtualizado.notificacoes = {};
                pacienteAtualizado.notificacoes.email = document.getElementById('notifEmail').checked;
                pacienteAtualizado.notificacoes.telegram = document.getElementById('notifTelegram').checked;
                pacienteAtualizado.notificacoes.lembreteConsulta = document.getElementById('lembreteConsulta').checked;
                
                if (typeof atualizarDadosPacienteLogado === "function") {
                    atualizarDadosPacienteLogado(pacienteAtualizado);
                    Object.assign(pacienteLogadoObjeto, pacienteAtualizado);
                }
                console.log('Informações salvas com sucesso!');
                toggleEditMode(false);
            }
        });
    }
    toggleEditMode(false);
}

// Configura evento de logout do paciente
function setupLogout() {
    const linkSair = document.getElementById('linkSair');
    if (linkSair) {
        linkSair.addEventListener('click', function (e) {
            e.preventDefault();
            if (typeof simularLogout === 'function') {
                simularLogout();
                window.location.href = '../../../index.html';
            }
        });
    }
}

// Configura navegação por abas nas consultas
function setupTabs() {
    const tabLinks = document.querySelectorAll('.consultas-tabs .tab-link');
    const tabContents = document.querySelectorAll('.paciente-content-area .tab-content');

    tabLinks.forEach(link => {
        link.addEventListener('click', function () {
            const targetTabId = this.getAttribute('data-tab');

            tabLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            this.classList.add('active');
            const targetContent = document.getElementById(targetTabId);
            if (targetContent) {
                targetContent.classList.add('active');
                // Renderiza conteúdo da aba selecionada
                const paciente = getDadosUsuarioLogado();
                if (paciente) {
                    if (targetTabId === 'proximas-consultas-content') {
                        renderProximasConsultas(paciente,
                            document.getElementById('proximasConsultasList'),
                            document.getElementById('proximasConsultasPlaceholder')
                        );
                    } else if (targetTabId === 'historico-consultas-content') {
                        renderHistoricoConsultas(paciente,
                            document.getElementById('historicoConsultasList'),
                            document.getElementById('historicoConsultasPlaceholder')
                        );
                    }
                }
            }
        });
    });
}

// Utilitário para exibir mensagens e ícones de placeholder
function setPlaceholderContent(placeholderElement, iconPathOrSvg, mainMessage, subMessage = "") {
    if (placeholderElement) {
        placeholderElement.innerHTML = `
            <img src="${iconPathOrSvg}" alt="${mainMessage}" class="placeholder-icon">
            <p>${mainMessage}</p>
            ${subMessage ? `<p><small>${subMessage}</small></p>` : ''}
        `;
        placeholderElement.classList.remove('hidden');
    }
}

// Renderiza tabela de exames do paciente ou mensagem de vazio
function renderMeusExames(pacienteLogado) {
    const tabelaExamesBody = document.querySelector('#tabelaExames tbody');
    const examesPlaceholder = document.getElementById('examesPlaceholder');
    const tabelaExames = document.getElementById('tabelaExames');

    if (!tabelaExamesBody || !examesPlaceholder || !tabelaExames) return;

    tabelaExamesBody.innerHTML = ''; 

    if (pacienteLogado.ultimosExames && pacienteLogado.ultimosExames.length > 0) {
        pacienteLogado.ultimosExames.forEach(exame => {
            const tr = document.createElement('tr');
            let pdfLinkHtml = 'N/A'; // Default se não houver link

            // LÓGICA DE DOWNLOAD DE PDF:
            // Se o exame possui um link válido para PDF (não é vazio, não é '#'), exibe botão de download.
            // Se o link for '#', exibe botão desabilitado indicando PDF indisponível.
            // Se não houver link, mostra 'N/A'.
            if (exame.pdfLink && exame.pdfLink !== '#' && exame.pdfLink.trim() !== '') {
                // Se existe um pdfLink, não é '#' e não é vazio, cria um link de download
                pdfLinkHtml = `<a href="${exame.pdfLink}" class="btn btn-secondary btn-sm" download="${exame.nome.replace(/\s+/g, '_')}_${exame.data.replace(/\//g, '-')}.pdf">Baixar PDF</a>`;
            } else if (exame.pdfLink === '#') { // Para links de placeholder ou "em breve"
                pdfLinkHtml = `<a href="#" class="btn btn-secondary btn-sm disabled" aria-disabled="true" onclick="return false;">PDF Indisponível</a>`;
            }
            // Se pdfLink for undefined, null ou vazio, permanece 'N/A'

            tr.innerHTML = `
                <td>${exame.nome}</td>
                <td>${exame.data}</td>
                <td>
                    <span class="tag-status ${exame.status === 'Disponível' ? 'disponivel' : 'pendente'}">${exame.status}</span>
                    ${exame.descricaoResultado ? `<span class="resultado-desc">${exame.descricaoResultado}</span>` : ''}
                </td>
                <td>${pdfLinkHtml}</td>
            `;
            tabelaExamesBody.appendChild(tr);
        });
        examesPlaceholder.classList.add('hidden');
        tabelaExames.classList.remove('hidden');
    } else {
        const semExamesIcon = "../../../assets/img/icons/imagem-sem-dados.png";
        setPlaceholderContent(examesPlaceholder, semExamesIcon, 'Você não possui exames registrados.');
        tabelaExames.classList.add('hidden');
    }
}

// Renderiza receitas médicas do paciente ou mensagem de vazio
function renderMinhasReceitas(pacienteLogado) {
    const receitasContainer = document.getElementById('listaReceitasContainer');
    const receitasPlaceholder = document.getElementById('receitasPlaceholder');
    if (!receitasContainer || !receitasPlaceholder) return;

    const currentRecipeCards = receitasContainer.querySelectorAll('.item-card');
    currentRecipeCards.forEach(card => card.remove());

    if (pacienteLogado.receitasAtivas && pacienteLogado.receitasAtivas.length > 0) {
        receitasPlaceholder.classList.add('hidden');
        pacienteLogado.receitasAtivas.forEach(receita => {
            const card = document.createElement('div');
            card.classList.add('item-card');
            
            // Calcula status da receita (ativa ou expirada)
            const [diaV, mesV, anoV] = receita.validade.split('/').map(Number);
            const dataValidade = new Date(anoV, mesV - 1, diaV);
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const status = dataValidade < hoje ? 'Expirada' : 'Ativa';
            const statusClass = status === 'Ativa' ? 'ativa' : 'expirada';

            card.innerHTML = `
                <div class="item-card-header">
                    <h3>${receita.nome}</h3>
                    <span class="tag-status ${statusClass}">${status}</span>
                </div>
                <div class="item-info">
                    <p><strong>Instruções:</strong> ${receita.instrucoes}</p>
                    <p><strong>Médico:</strong> ${receita.medico}</p>
                    <p><strong>Data da Prescrição:</strong> ${receita.dataPrescricao}</p>
                    <p><strong>Validade:</strong> ${receita.validade}</p>
                </div>
                <div class="item-actions">
                    <a href="#" class="btn btn-secondary btn-sm" onclick="console.log('Funcionalidade de download de receita ainda não implementada.'); return false;">Baixar Receita (PDF)</a>
                </div>
            `;
            receitasContainer.appendChild(card);
        });
    } else {
        const semReceitasIcon = "../../../assets/img/icons/imagem-sem-dados.png";
        setPlaceholderContent(receitasPlaceholder, semReceitasIcon, 'Você não possui receitas médicas.');
        receitasPlaceholder.classList.remove('hidden');
    }
}

// Gera HTML de um card de consulta (próxima ou histórico)
function renderizarConsultaCard(consulta, isProxima = true) {
    const isTeleconsulta = consulta.local && consulta.local.toLowerCase().includes('teleconsulta');
    let actionsHtml = '';

    if (isProxima) {
        actionsHtml = `<a href="#" class="btn btn-secondary btn-sm cancelar-consulta-btn" data-consulta-id="${consulta.dataHora}-${consulta.medico.replace(/\s+/g, '')}">Cancelar</a>`;
        if (isTeleconsulta) {
            actionsHtml += `<a href="https://meet.google.com/" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Entrar na Teleconsulta</a>`;
        } else {
            actionsHtml += `<a href="#" class="btn btn-secondary btn-sm ver-detalhes-btn">Ver Detalhes</a>`;
        }
    } else {
        actionsHtml = `<a href="#" class="btn btn-secondary btn-sm ver-resumo-btn">Ver Resumo</a>`;
    }

    return `
        <div class="item-card">
            <div class="item-card-header">
                <h3>${consulta.especialidade} ${isTeleconsulta && isProxima ? '(Teleconsulta)' : ''}</h3>
                <span class="tag-status ${isProxima ? 'ativa' : 'realizada'}">${isProxima ? 'Agendada' : 'Realizada'}</span>
            </div>
            <div class="item-info">
                <p><strong>Médico:</strong> ${consulta.medico}</p>
                <p><strong>Data e Horário:</strong> ${consulta.dataHora}</p>
                <p><strong>Local:</strong> ${consulta.local}</p>
                ${consulta.observacoes ? `<p><strong>Observações:</strong> ${consulta.observacoes}</p>` : ''}
            </div>
            <div class="item-actions">
                ${actionsHtml}
            </div>
        </div>`;
}

// Renderiza lista de próximas consultas ou placeholder
function renderProximasConsultas(pacienteLogado, listElement, placeholderElement) {
    if (!listElement || !placeholderElement) return;
    listElement.innerHTML = ''; 
    const consultas = Array.isArray(pacienteLogado?.proximasConsultas) ? pacienteLogado.proximasConsultas : [];

    if (consultas.length > 0) {
        consultas.forEach(consulta => {
            listElement.innerHTML += renderizarConsultaCard(consulta, true);
        });
        placeholderElement.classList.add('hidden');
        listElement.classList.remove('hidden');
    } else {
        const calendarioIcon = "../../../assets/img/icons/imagem-sem-dados.png"; 
        setPlaceholderContent(placeholderElement, calendarioIcon, 'Sem consultas agendadas', 'Você não possui consultas agendadas para os próximos dias.');
        listElement.classList.add('hidden');
    }
}

// Renderiza histórico de consultas ou placeholder
function renderHistoricoConsultas(pacienteLogado, listElement, placeholderElement) {
    if (!listElement || !placeholderElement) return;
    listElement.innerHTML = '';
    const historico = Array.isArray(pacienteLogado?.historicoConsultas) ? pacienteLogado.historicoConsultas : [];

    if (historico.length > 0) {
        historico.forEach(consulta => {
            listElement.innerHTML += renderizarConsultaCard(consulta, false);
        });
        placeholderElement.classList.add('hidden');
        listElement.classList.remove('hidden');
    } else {
        const relogioIcon = "../../../assets/img/icons/imagem-sem-dados.png";
        setPlaceholderContent(placeholderElement, relogioIcon, 'Seu histórico de consultas está vazio.');
        listElement.classList.add('hidden');
    }
}

// Controla exibição de abas e delega eventos de agendamento/cancelamento de consultas
function renderMinhasConsultas(pacienteLogado) {
    const proximasConsultasList = document.getElementById('proximasConsultasList');
    const proximasConsultasPlaceholder = document.getElementById('proximasConsultasPlaceholder');
    const historicoConsultasList = document.getElementById('historicoConsultasList');
    const historicoConsultasPlaceholder = document.getElementById('historicoConsultasPlaceholder');

    const activeTabLink = document.querySelector('.consultas-tabs .tab-link.active');
    const activeTabId = activeTabLink ? activeTabLink.getAttribute('data-tab') : 'proximas-consultas-content';

    if (activeTabId === 'proximas-consultas-content') {
        renderProximasConsultas(pacienteLogado, proximasConsultasList, proximasConsultasPlaceholder);
        if (historicoConsultasList) historicoConsultasList.classList.add('hidden');
        renderHistoricoConsultas(pacienteLogado, document.createElement('div'), historicoConsultasPlaceholder);
    } else if (activeTabId === 'historico-consultas-content') {
        renderHistoricoConsultas(pacienteLogado, historicoConsultasList, historicoConsultasPlaceholder);
        if (proximasConsultasList) proximasConsultasList.classList.add('hidden');
        renderProximasConsultas(pacienteLogado, document.createElement('div'), proximasConsultasPlaceholder);
    }
    
    setupAgendamentoModal(pacienteLogado, proximasConsultasList, proximasConsultasPlaceholder);
    setupConsultasDelegation(pacienteLogado, proximasConsultasList, proximasConsultasPlaceholder, historicoConsultasList);
}

// Utilitário para calcular largura da barra de rolagem (para evitar "jump" ao abrir modal)
function getScrollbarWidth() {
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    document.body.appendChild(outer);
    const inner = document.createElement('div');
    outer.appendChild(inner);
    const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);
    outer.parentNode.removeChild(outer);
    return scrollbarWidth;
}

// Configura modal de agendamento de consulta, incluindo abertura, fechamento e submit
function setupAgendamentoModal(pacienteLogadoObjeto, proximasConsultasListElement, proximasConsultasPlaceholderElement) {
    const modalAgendarConsulta = document.getElementById('modalAgendarConsulta');
    const agendarNovaConsultaBtn = document.getElementById('agendarNovaConsultaBtn');
    const closeModalBtn = modalAgendarConsulta ? modalAgendarConsulta.querySelector('.modal-close-btn') : null;
    const formAgendarConsulta = document.getElementById('formAgendarConsulta');
    const agendamentoStatus = document.getElementById('agendamentoStatus');

    const scrollbarWidth = getScrollbarWidth();

    function openModal() {
        document.body.classList.add('guide-active-no-scroll');
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        if (typeof modalAgendarConsulta.showModal === "function") {
            modalAgendarConsulta.showModal();
        } else {
            modalAgendarConsulta.classList.add('active');
            modalAgendarConsulta.setAttribute('aria-hidden', 'false');
        }
    }

    function closeModal() {
        if (formAgendarConsulta) formAgendarConsulta.reset();
        if (agendamentoStatus) agendamentoStatus.textContent = '';

        document.body.classList.remove('guide-active-no-scroll');
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = '';
        }
    }

    if (agendarNovaConsultaBtn && modalAgendarConsulta) {
        agendarNovaConsultaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    }

    if (closeModalBtn && modalAgendarConsulta) {
        closeModalBtn.addEventListener('click', () => {
            if (typeof modalAgendarConsulta.close === "function") {
                modalAgendarConsulta.close();
            } else {
                modalAgendarConsulta.classList.remove('active');
                modalAgendarConsulta.setAttribute('aria-hidden', 'true');
                closeModal();
            }
        });
    }

    if (modalAgendarConsulta) {
        modalAgendarConsulta.addEventListener('close', closeModal);

        modalAgendarConsulta.addEventListener('click', (event) => {
            if (event.target === modalAgendarConsulta && typeof modalAgendarConsulta.showModal !== "function") {
                modalAgendarConsulta.classList.remove('active');
                modalAgendarConsulta.setAttribute('aria-hidden', 'true');
                closeModal();
            }
        });
    }

    if (formAgendarConsulta && pacienteLogadoObjeto) {
        formAgendarConsulta.addEventListener('submit', function (e) {
            e.preventDefault();
            // Cria nova consulta a partir dos campos do formulário
            const novaConsulta = {
                especialidade: document.getElementById('especialidadeConsulta').value,
                medico: document.getElementById('medicoConsulta').value || 'A ser definido',
                dataHora: formatarDataHora(document.getElementById('dataConsulta').value),
                local: document.getElementById('localConsulta').value,
                observacoes: document.getElementById('observacoesConsulta').value,
            };
            const pacienteAtualizado = JSON.parse(JSON.stringify(pacienteLogadoObjeto));
            if (!pacienteAtualizado.proximasConsultas) pacienteAtualizado.proximasConsultas = [];
            pacienteAtualizado.proximasConsultas.unshift(novaConsulta);
            if (typeof atualizarDadosPacienteLogado === "function") {
                atualizarDadosPacienteLogado(pacienteAtualizado);
                Object.assign(pacienteLogadoObjeto, pacienteAtualizado);
            }
            renderProximasConsultas(pacienteLogadoObjeto, proximasConsultasListElement, proximasConsultasPlaceholderElement);

            if (agendamentoStatus) {
                agendamentoStatus.textContent = 'Consulta agendada com sucesso!';
                agendamentoStatus.className = 'form-status-message success';
            }

            setTimeout(() => {
                if (typeof modalAgendarConsulta.close === "function") {
                    modalAgendarConsulta.close();
                } else {
                    modalAgendarConsulta.classList.remove('active');
                    modalAgendarConsulta.setAttribute('aria-hidden', 'true');
                    closeModal();
                }
            }, 1500);
        });
    }
}

// Delegação de eventos para cancelar consultas e ver detalhes/resumo
function setupConsultasDelegation(pacienteLogadoObjeto, proximasConsultasList, proximasConsultasPlaceholder, historicoConsultasList) {
    if (proximasConsultasList) {
        proximasConsultasList.addEventListener('click', function (event) {
            if (event.target.classList.contains('cancelar-consulta-btn')) {
                event.preventDefault();
                const consultaId = event.target.dataset.consultaId;
                if (confirm('Tem certeza que deseja cancelar esta consulta?')) {
                    const pacienteAtualizado = JSON.parse(JSON.stringify(pacienteLogadoObjeto));
                    pacienteAtualizado.proximasConsultas = pacienteAtualizado.proximasConsultas.filter(
                        c => `${c.dataHora}-${c.medico.replace(/\s+/g, '')}` !== consultaId
                    );
                    
                    if (typeof atualizarDadosPacienteLogado === "function") {
                        atualizarDadosPacienteLogado(pacienteAtualizado);
                        Object.assign(pacienteLogadoObjeto, pacienteAtualizado);
                    }
                    
                    renderProximasConsultas(pacienteLogadoObjeto, proximasConsultasList, proximasConsultasPlaceholder);
                    console.log('Consulta cancelada com sucesso.');
                }
            } else if (event.target.classList.contains('ver-detalhes-btn')) {
                event.preventDefault();
                console.log("Funcionalidade 'Ver Detalhes' da consulta ainda não implementada.");
            }
        });
    }

    if (historicoConsultasList) {
        historicoConsultasList.addEventListener('click', function (event) {
            if (event.target.classList.contains('ver-resumo-btn')) {
                event.preventDefault();
                console.log("Funcionalidade 'Ver Resumo' do histórico de consultas ainda não implementada.");
            }
        });
    }
}

// Formata data/hora para exibição amigável
function formatarDataHora(dateTimeString) {
    if (!dateTimeString) return '';
    try {
        const date = new Date(dateTimeString);
        if (isNaN(date)) return 'Data inválida';

        const dia = String(date.getDate()).padStart(2, '0');
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const ano = date.getFullYear();
        const horas = String(date.getHours()).padStart(2, '0');
        const minutos = String(date.getMinutes()).padStart(2, '0');
        return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
    } catch (e) {
        console.error("Erro ao formatar data:", e);
        return "Data inválida";
    }
}