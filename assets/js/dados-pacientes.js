// assets/js/dados-pacientes.js

const DADOS_PACIENTES_STORAGE_KEY = 'dadosPacientesStorage';
const USUARIO_LOGADO_CPF_KEY = 'usuarioLogadoCpf';

// Dados iniciais/padrão se não houver nada no localStorage
const dadosIniciaisPacientes = {
    "39294208052": { // CPF Enzo (chave: só números)
        nomeCompleto: "Enzo Okuizumi",
        cpf: "392.942.080-52", // CPF formatado para exibição
        dataNascimento: "30/10/2006",
        email: "enzo.okuizumi@gmail.com", // Corrigido email para consistência
        telefone: "(11) 98765-4321",
        senhaPlana: "123@mudar", // Senha conforme solicitado
        telegramId: "123456789",
        notificacoes: { email: false, telegram: true, lembreteConsulta: true },
        proximasConsultas: [
            { tipo: "Consulta Presencial", especialidade: "Cardiologia", medico: "Dr. Ricardo Alves", dataHora: "25/08/2025 às 10:00", local: "HC Clínicas - Unidade Central", observacoes: "Trazer exames anteriores." },
            { tipo: "Teleconsulta", especialidade: "Clínica Geral", medico: "Dra. Ana Martins", dataHora: "25/06/2025 às 14:30", local: "Teleconsulta", observacoes: "Verificar conexão antes."}
        ],
        receitasAtivas: [
            { nome: "Losartana Potássica 50mg", instrucoes: "1 comprimido, 1x ao dia", medico: "Dr. Ricardo Alves", dataPrescricao: "10/07/2024", validade: "10/01/2025" },
            { nome: "Metformina 500mg", instrucoes: "1 comprimido, 2x ao dia após as refeições", medico: "Dra. Beatriz Costa", dataPrescricao: "15/06/2025", validade: "15/12/2025" }
        ],
        ultimosExames: [
            { nome: "Hemograma Completo", data: "30/04/2025", status: "Disponível", descricaoResultado: "Dentro dos parâmetros normais", pdfLink: "../../PDF/Relatorio_Lazarus.pdf" },
            { nome: "Glicemia em Jejum", data: "19/04/2025", status: "Disponível", descricaoResultado: "Elevada - 110 mg/dL", pdfLink: "../../PDF/Relatorio_Lazarus.pdf" },
            { nome: "Colesterol Total", data: "19/04/2025", status: "Disponível", descricaoResultado: "Normal - 180 mg/dL", pdfLink: "../../PDF/Relatorio_Lazarus.pdf" }
        ],
        historicoConsultas: [
            { tipo: "Teleconsulta", especialidade: "Endocrinologia", medico: "Dra. Beatriz Costa", dataHora: "18/05/2024 às 14:00", local: "Teleconsulta" },
            { tipo: "Consulta Presencial", especialidade: "Clínica Geral", medico: "Dr. Carlos Martins", dataHora: "02/03/2024 às 09:30", local: "IMREA Vila Mariana" }
        ]
    },
    "76913995881": { // CPF Lucas (chave: só números - CPF VÁLIDO GERADO PARA TESTE)
        nomeCompleto: "Lucas Barros Gouveia",
        cpf: "769.139.958-81", // CPF formatado
        dataNascimento: "22/09/1992",
        email: "lucas.barros@example.com",
        telefone: "(11) 91234-5678",
        senhaPlana: "123@mudar", // Senha conforme solicitado
        telegramId: "",
        notificacoes: { email: true, telegram: false, lembreteConsulta: true },
        proximasConsultas: [
            { tipo: "Teleconsulta", especialidade: "Dermatologia", medico: "Dra. Sofia Pereira", dataHora: "10/09/2024 às 15:30", local: "Teleconsulta", observacoes: "Tenha boa iluminação no ambiente."}
        ],
        receitasAtivas: [
            { nome: "Isotretinoína 20mg", instrucoes: "1 cápsula ao dia, após o almoço", medico: "Dra. Sofia Pereira", dataPrescricao: "01/08/2024", validade: "01/11/2024" }
        ],
        ultimosExames: [
            { nome: "Perfil Lipídico", data: "15/07/2024", status: "Disponível", descricaoResultado: "HDL baixo, demais normais", pdfLink: "../../PDF/Relatorio_Lazarus.pdf" }
        ],
        historicoConsultas: []
    },
    "60363928855": { // CPF Milton (chave: só números - CPF VÁLIDO GERADO PARA TESTE)
        nomeCompleto: "Milton Marcelino",
        cpf: "603.639.288-55", // CPF formatado
        dataNascimento: "05/03/1978",
        email: "milton.marcelino@example.com",
        telefone: "(11) 90987-6543",
        senhaPlana: "123@mudar", // Senha conforme solicitado
        telegramId: "555666777",
        notificacoes: { email: false, telegram: true, lembreteConsulta: false },
        proximasConsultas: [],
        receitasAtivas: [],
        ultimosExames: [],
        historicoConsultas: [
             { tipo: "Consulta Presencial", especialidade: "Gastroenterologia", medico: "Dr. Antônio Silva", dataHora: "20/07/2024 às 16:00", local: "HC Clínicas - Unidade Central" }
        ]
    }
};

// Função para obter todos os dados de pacientes do localStorage
function getAllPacientesData() {
    const dadosString = localStorage.getItem(DADOS_PACIENTES_STORAGE_KEY);
    if (dadosString) {
        return JSON.parse(dadosString);
    }
    localStorage.setItem(DADOS_PACIENTES_STORAGE_KEY, JSON.stringify(dadosIniciaisPacientes));
    return dadosIniciaisPacientes;
}

// Função para salvar todos os dados de pacientes no localStorage
function saveAllPacientesData(todosOsDados) {
    localStorage.setItem(DADOS_PACIENTES_STORAGE_KEY, JSON.stringify(todosOsDados));
}

let dadosPacientes = getAllPacientesData();


function simularLogin(cpfInput, senhaInput) {
    const todosOsDados = getAllPacientesData(); 
    const cpfLimpo = cpfInput.replace(/\D/g, "");
    // Debug:
    // console.log("Tentando login com CPF (limpo):", cpfLimpo, "Senha:", senhaInput);
    // console.log("Dados do usuário no sistema:", todosOsDados[cpfLimpo]);

    if (todosOsDados[cpfLimpo] && todosOsDados[cpfLimpo].senhaPlana === senhaInput) {
        localStorage.setItem(USUARIO_LOGADO_CPF_KEY, cpfLimpo);
        return true;
    }
    return false;
}

function registrarNovoUsuario(dadosNovoUsuario) {
    let todosOsDados = getAllPacientesData(); 
    const cpfLimpo = dadosNovoUsuario.cpf.replace(/\D/g, "");
    if (todosOsDados[cpfLimpo]) {
        return false; 
    }
    todosOsDados[cpfLimpo] = {
        nomeCompleto: dadosNovoUsuario.nome,
        cpf: formatarCPF(cpfLimpo),
        dataNascimento: dadosNovoUsuario.dataNascimento,
        email: dadosNovoUsuario.email,
        telefone: dadosNovoUsuario.telefone || "",
        senhaPlana: dadosNovoUsuario.senha,
        telegramId: "",
        notificacoes: { email: true, telegram: false, lembreteConsulta: true },
        proximasConsultas: [],
        receitasAtivas: [],
        ultimosExames: [],
        historicoConsultas: []
    };
    saveAllPacientesData(todosOsDados); 
    dadosPacientes = todosOsDados; 
    return true;
}

function formatarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function getUsuarioLogadoCpf() {
    return localStorage.getItem(USUARIO_LOGADO_CPF_KEY);
}

function getDadosUsuarioLogado() {
    const cpfLogado = getUsuarioLogadoCpf();
    if (!cpfLogado) return null;
    const todosOsDados = getAllPacientesData(); 
    return todosOsDados[cpfLogado] || null;
}

function simularLogout() {
    localStorage.removeItem(USUARIO_LOGADO_CPF_KEY);
}

function atualizarDadosPacienteLogado(pacienteAtualizado) {
    const cpfLimpo = pacienteAtualizado.cpf.replace(/\D/g, "");
    let todosOsDados = getAllPacientesData();
    if (todosOsDados[cpfLimpo]) {
        todosOsDados[cpfLimpo] = pacienteAtualizado;
        saveAllPacientesData(todosOsDados);
        dadosPacientes = todosOsDados; 
        return true;
    }
    return false;
}