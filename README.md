# front-end-design-engineering

# SimplesHC - Simplificando o Acesso à Saúde

## Objetivo do Projeto

O SimplesHC é uma plataforma web desenvolvida como parte da disciplina de Front-End Design Engineering. O principal objetivo é criar uma interface digital intuitiva e acessível para os serviços oferecidos pelo Hospital das Clínicas, com um foco especial em facilitar o uso por pacientes idosos e aqueles com menor familiaridade com tecnologia. O projeto visa simplificar processos como agendamento de consultas, acesso a resultados de exames, visualização de receitas médicas e teleconsultas.

## Estrutura de Pastas e Arquivos

O projeto está organizado da seguinte forma:

<pre>
/ (raiz)
|-- index.html (Página Inicial)
|-- README.md (Este arquivo)
|-- assets/
|   |-- css/
|   |   |-- style.css (Estilos globais e da página inicial)
|   |   |-- area-paciente.css (Estilos para a área logada do paciente)
|   |   |-- cadastro-login.css (Estilos para as páginas de login e cadastro)
|   |   |-- contato.css (Estilos para a página de contato)
|   |   |-- faq.css (Estilos para a página de FAQ)
|   |   |-- guia-interativo.css (Estilos para o Guia Interativo)
|   |   |-- hospitais.css (Estilos para a página de hospitais/unidades)
|   |   |-- integrantes.css (Estilos para a página da equipe)
|   |   |-- servicos.css (Estilos para a página de serviços)
|   |-- js/
|   |   |-- script.js (JavaScript geral, como menu mobile)
|   |   |-- area-paciente.js (Lógica para a área logada do paciente)
|   |   |-- cadastro-login.js (Lógica para login, cadastro, esqueci senha)
|   |   |-- contato.js (Lógica para o formulário de contato)
|   |   |-- dados-pacientes.js (Simulação de banco de dados de pacientes)
|   |   |-- faq.js (Lógica para o accordion do FAQ)
|   |   |-- guia-interativo.js (Lógica para o Guia Interativo)
|   |-- img/
|       |-- icons/ (Ícones gerais, redes sociais, favicon, etc.)
|       |-- imagem-index/ (Imagens específicas da página inicial)
|       |-- imagens-hospitais/ (Imagens para a página de hospitais)
|       |-- imagens-integrantes/ (Fotos dos integrantes)
|       |-- imagens-servicos/ (Imagens para a página de serviços)
|-- paginas/
|   |-- contato.html
|   |-- faq.html
|   |-- hospitais.html
|   |-- integrantes.html
|   |-- servicos.html
|   |-- cadastro-login.html
|   |-- area-paciente/
|       |-- meu-perfil.html
|       |-- meus-exames.html
|       |-- minhas-consultas.html
|       |-- minhas-receitas.html
</pre>

## Tecnologia Utilizada

O projeto foi desenvolvido utilizando exclusivamente:

* **HTML5:** Para a estruturação semântica do conteúdo.
* **CSS3:** Para a estilização e design responsivo, seguindo a abordagem Mobile First.
* **JavaScript (ES6+):** Para interatividade, manipulação do DOM, validação de formulários e lógica do Guia Interativo.


## Detalhamento das Páginas e Arquivos

### Arquivos HTML

* **`index.html`**: Página inicial do SimplesHC, apresentando a plataforma, benefícios e serviços. Inclui o Guia Interativo para orientação de novos usuários.

* **`assets/paginas/cadastro-login.html`**: Centraliza autenticação e registro com:
  * Formulário de Login
  * Cadastro em etapas (stepper)
  * Recuperação de senha
  * Inclui Guia Interativo para auxiliar no processo.

* **`./assets/paginas/servicos.html`**: Catálogo de serviços com cards informativos e descrições detalhadas.

* **`./assets/paginas/hospitais.html`**: Informações das unidades com mapa interativo e cards detalhados.

* **`./assets/paginas/faq.html`**: Sistema de acordeão para perguntas frequentes.

* **`./assets/paginas/contato.html`**: Formulário de contato e informações institucionais.

* **`./assets/paginas/integrantes.html`**: Apresentação da equipe de desenvolvimento.

#### Área do Paciente:

* **`./assets/paginas/area-paciente/meu-perfil.html`**: Painel do paciente com dados cadastrais e preferências.

* **`./assets/paginas/area-paciente/meus-exames.html`**: Lista de resultados dos exames com status e "downloads".

* **`./assets/paginas/area-paciente/minhas-consultas.html`**: Gerenciamento de consultas com agendamento.

* **`./assets/paginas/area-paciente/minhas-receitas.html`**: Visualização de receitas ativas e expiradas.

### Arquivos CSS (`./assets/css/`)

* **`style.css`**: Estilos globais e base do site.
* **`guia-interativo.css`**: Estilização do sistema de guia.
* **`area-paciente.css`**: Estilos da área restrita.
* **`cadastro-login.css`**: Formulários de autenticação.
* **`contato.css`**: Estilos da página de contato.
* **`faq.css`**: Sistema de acordeão.
* **`hospitais.css`**: Layout das unidades.
* **`integrantes.css`**: Página da equipe.
* **`servicos.css`**: Catálogo de serviços.

### Arquivos JavaScript (`./assets/js/`)

O JavaScript é responsável por toda a interatividade, validação, simulação de dados e experiência dinâmica do usuário no SimplesHC. Cada arquivo tem um papel específico, conforme detalhado abaixo:

---

#### `script.js`
- **Função:** Responsável por scripts globais, principalmente o controle do menu de navegação responsivo (menu hambúrguer).
- **Principais funcionalidades:**
  - Abre/fecha o menu em dispositivos móveis.
  - Atualiza atributos ARIA para garantir acessibilidade.
  - Pode conter funções utilitárias usadas em mais de uma página.
- **Exemplo de uso:** Sempre incluído no `<head>`.

---

#### `dados-pacientes.js`
- **Função:** Simula um banco de dados local de pacientes usando o `localStorage` do navegador.
- **Principais funcionalidades:**
  - Armazena, recupera e atualiza dados de pacientes (nome, CPF, consultas, exames, receitas, etc).
  - Realiza autenticação (login) e registro de novos usuários.
  - Permite atualização de perfil e logout.
- **Funções principais:**
  - `getAllPacientesData()`: Inicializa ou carrega os dados dos pacientes.
  - `simularLogin(cpf, senha)`: Valida as credenciais e autentica o usuário.
  - `registrarNovoUsuario(dados)`: Adiciona um novo paciente ao banco simulado.
  - `getDadosUsuarioLogado()`: Retorna os dados do paciente autenticado.
  - `atualizarDadosPacienteLogado(dados)`: Salva alterações no perfil.
  - `simularLogout()`: Encerra a sessão do usuário.
- **Observação:** Todos os dados são fictícios e armazenados apenas no navegador do usuário, sem backend real.

---

#### `cadastro-login.js`
- **Função:** Gerencia toda a lógica da página de login, cadastro e recuperação de senha.
- **Principais funcionalidades:**
  - Alterna entre formulários de login, cadastro e recuperação de senha.
  - Valida campos em tempo real (CPF, e-mail, senha, etc).
  - Aplica máscaras de formatação (CPF, telefone, data).
  - Controla o stepper visual do cadastro em etapas.
  - Exibe mensagens de erro e sucesso.
  - Integra com `dados-pacientes.js` para autenticação e registro.
- **Exemplo de uso:** Incluído apenas em `cadastro-login.html`.

---

#### `area-paciente.js`
- **Função:** Controla toda a lógica das páginas da área restrita do paciente.
- **Principais funcionalidades:**
  - Verifica se o usuário está autenticado ao acessar qualquer página da área do paciente.
  - Carrega dinamicamente os dados do paciente logado (perfil, exames, consultas, receitas).
  - Permite edição do perfil e atualização de preferências.
  - Gerencia o sistema de abas em consultas (próximas/histórico).
  - Controla o modal de agendamento de consultas e o cancelamento.
  - Realiza logout seguro.
- **Exemplo de uso:** Incluído em todas as páginas dentro de `./area-paciente/`.

---

#### `faq.js`
- **Função:** Adiciona interatividade ao FAQ (Perguntas Frequentes).
- **Principais funcionalidades:**
  - Permite expandir/recolher respostas ao clicar nas perguntas.
  - Atualiza atributos ARIA para acessibilidade.
  - Suporta navegação por teclado.
- **Exemplo de uso:** Incluído apenas em `faq.html`.

---

#### `contato.js`
- **Função:** Gerencia a validação do formulário de contato.
- **Principais funcionalidades:**
  - Valida campos obrigatórios e formato de e-mail.
  - Exibe mensagens de erro específicas.
  - Simula o envio do formulário e exibe mensagem de sucesso.
- **Exemplo de uso:** Incluído apenas em `contato.html`.

---

#### `guia-interativo.js`
- **Função:** Controla o Guia Interativo, que orienta o usuário sobre o uso da plataforma.
- **Principais funcionalidades:**
  - Identifica elementos com o atributo `data-guide-step` para criar o passo a passo.
  - Gera dinamicamente o overlay, balão de informações, setas e botões de navegação.
  - Salva no `localStorage` se o usuário já concluiu ou pulou o guia em cada página.
  - Inclui botão flutuante de acessibilidade no canto inferior esquerdo (♿) para reabrir o guia a qualquer momento.
  - Garante acessibilidade e foco nos elementos destacados.
- **Exemplo de uso:** Incluído em todas as páginas que possuem o Guia Interativo.

---

## 👥 Integrantes da Equipe

<table>
  <tr>
    <th>Foto</th>
    <th>Nome</th>
    <th>RM</th>
    <th>Turma</th>
    <th>GitHub</th>
    <th>LinkedIn</th>
  </tr>
  <tr>
    <td align="center">
      <img src="assets/img/imagens-integrantes/foto-enzo.jpeg" width="100px" alt="Foto de Enzo"/>
    </td>
    <td>Enzo Okuizumi</td>
    <td>561432</td>
    <td>1TDSPG</td>
    <td><a href="https://github.com/EnzoOkuizumiFiap">EnzoOkuizumiFiap</a></td>
    <td><a href="https://www.linkedin.com/in/enzo-okuizumi-b60292256/">Enzo Okuizumi</a></td>
  </tr>
  <tr>
    <td align="center">
      <img src="assets/img/imagens-integrantes/foto-lucas.jpg" width="100px" alt="Foto de Lucas"/>
    </td>
    <td>Lucas Barros Gouveia</td>
    <td>566422</td>
    <td>1TDSPG</td>
    <td><a href="https://github.com/LuzBGouveia">LuzBGouveia</a></td>
    <td><a href="https://www.linkedin.com/in/luz-barros-gouveia-09b147355/">Lucas Barros Gouveia</a></td>
  </tr>
  <tr>
    <td align="center">
      <img src="assets/img/imagens-integrantes/foto-milton.jpeg" width="100px" alt="Foto de Milton"/>
    </td>
    <td>Milton Marcelino</td>
    <td>564836</td>
    <td>1TDSPG</td>
    <td><a href="https://github.com/MiltonMarcelino">MiltonMarcelino</a></td>
    <td><a href="http://linkedin.com/in/milton-marcelino-250298142">Milton Marcelino</a></td>
  </tr>
</table>


## Endereço do Repositório do Projeto no GitHub

[Link Repositório Front-end](https://github.com/Grupo-Challenge-EML-1TDSPG/front-end-design-engineering)

---

Este projeto não apenas aplica os conhecimentos técnicos em design de interfaces, usabilidade e manipulação do DOM com JavaScript puro, mas também tem como missão gerar impacto social. O SimplesHC foi concebido para enfrentar um problema real de saúde pública: o alto índice de faltas em teleconsultas, especialmente entre pacientes com baixa familiaridade com tecnologia. A plataforma propõe uma solução educativa e acessível, que orienta o paciente de forma visual, clara e humanizada, promovendo inclusão digital e fortalecendo o vínculo entre o cidadão e o serviço de saúde pública. Nossa meta é tornar o cuidado em saúde mais acessível, eficiente e acolhedor.
