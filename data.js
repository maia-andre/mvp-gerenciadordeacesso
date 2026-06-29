/* ============================================================================
   GAU — Gestor de Acesso Unificado · Prefeitura de São José dos Campos
   Dados-semente do protótipo (em memória). Tudo aqui é fictício e serve
   apenas para demonstrar o funcionamento. Nenhuma informação é persistida.
   ========================================================================== */

const DB = {
  /* Servidor logado no protótipo — administrador de acessos de uma secretaria.
     É por este perfil que as aprovações são assinadas na trilha. */
  sessao: {
    nome: "Helena Marques",
    cargo: "Administradora de Acessos",
    secretaria: "SGAF",
    email: "helena.marques@sjc.sp.gov.br",
  },

  /* As 15 secretarias da Prefeitura. Cada uma tem ao menos um administrador
     responsável por decidir as liberações dos sistemas sob sua guarda. */
  secretarias: [
    { sigla: "SGAF", nome: "Gestão Administrativa e Finanças", admin: "Helena Marques", servidores: 412 },
    { sigla: "SMS",  nome: "Saúde",                            admin: "Dr. Paulo Tavares", servidores: 3870 },
    { sigla: "SME",  nome: "Educação",                         admin: "Cláudia Risério",  servidores: 6240 },
    { sigla: "SMU",  nome: "Mobilidade Urbana",                admin: "Rogério Lemes",    servidores: 318 },
    { sigla: "SEURBS",nome: "Urbanismo e Sustentabilidade",    admin: "Ana Beatriz Cruz", servidores: 287 },
    { sigla: "SEOBI",nome: "Obras e Infraestrutura",           admin: "Marcos Aurélio",   servidores: 503 },
    { sigla: "SEDS", nome: "Desenvolvimento Social",           admin: "Fátima Nogueira",  servidores: 642 },
    { sigla: "SEQV", nome: "Esportes e Qualidade de Vida",     admin: "Diego Sampaio",    servidores: 196 },
    { sigla: "SEID", nome: "Inovação e Desenvolvimento Econômico", admin: "Letícia Vargas", servidores: 88 },
    { sigla: "SEC",  nome: "Cultura",                          admin: "Rita Bonfim",      servidores: 231 },
    { sigla: "SSM",  nome: "Serviços e Manutenção da Cidade",  admin: "João Pedro Alves", servidores: 1190 },
    { sigla: "SEGOV",nome: "Governança Municipal",             admin: "Carla Tenório",    servidores: 144 },
    { sigla: "SEDC", nome: "Defesa do Cidadão",                admin: "Cel. Renato Dias", servidores: 980 },
    { sigla: "SEPA", nome: "Proteção e Bem-Estar Animal",      admin: "Bianca Moraes",    servidores: 73 },
    { sigla: "PGM",  nome: "Procuradoria-Geral do Município",  admin: "Dr. Sérgio Maia",  servidores: 119 },
  ],

  /* Catálogo de sistemas e subsistemas. `tipo` separa o que é da Prefeitura
     do que é operado por terceiros — estes exigem tratamento próprio
     (encaminhamento ao fornecedor/órgão externo após o aval interno). */
  sistemas: [
    { id: "sigm",   nome: "SIGM — Gestão Municipal Integrada", area: "SGAF", tipo: "interno",
      desc: "Espinha dorsal administrativa: protocolo, contratos e processos internos.",
      papeis: ["Consulta", "Operador", "Gestor", "Administrador"] },
    { id: "folha",  nome: "Folha de Pagamento", area: "SGAF", tipo: "terceirizado",
      fornecedor: "Senior Sistemas", desc: "Processamento de folha e encargos dos servidores.",
      papeis: ["Consulta", "Lançamento", "Homologação"] },
    { id: "rh",     nome: "Portal do Servidor (RH)", area: "SGAF", tipo: "interno",
      desc: "Holerite, férias, frequência e dados funcionais.",
      papeis: ["Servidor", "RH Operador", "RH Gestor"] },
    { id: "sei",    nome: "SEI — Processo Eletrônico", area: "SEGOV", tipo: "terceirizado",
      fornecedor: "Governo Federal (cessão TRF4)", desc: "Tramitação eletrônica de documentos e processos.",
      papeis: ["Básico", "Unidade", "Administrador da Unidade"] },
    { id: "prontuario", nome: "Prontuário Eletrônico (e-SUS APS)", area: "SMS", tipo: "terceirizado",
      fornecedor: "Ministério da Saúde / DATASUS", desc: "Registro clínico nas unidades básicas de saúde.",
      papeis: ["Recepção", "Profissional de Saúde", "Coordenação"] },
    { id: "sgsaude", nome: "Regulação e Agendamento — Saúde", area: "SMS", tipo: "interno",
      desc: "Fila, marcação de consultas e regulação de leitos.",
      papeis: ["Consulta", "Regulador", "Coordenação"] },
    { id: "sge",    nome: "Gestão Escolar (Diário Online)", area: "SME", tipo: "interno",
      desc: "Matrícula, frequência e diário de classe da rede municipal.",
      papeis: ["Professor", "Secretaria Escolar", "Direção", "Coordenação SME"] },
    { id: "merenda", nome: "Gestão de Alimentação Escolar", area: "SME", tipo: "terceirizado",
      fornecedor: "Nutriweb Serviços", desc: "Cardápios, estoque e controle nutricional da merenda.",
      papeis: ["Consulta", "Nutricionista", "Gestor de Contrato"] },
    { id: "geo",    nome: "GeoSJC — Geoprocessamento", area: "SEURBS", tipo: "interno",
      desc: "Base cartográfica, zoneamento e licenciamento territorial.",
      papeis: ["Consulta", "Analista", "Administrador GIS"] },
    { id: "nfse",   nome: "Nota Fiscal de Serviços Eletrônica", area: "SGAF", tipo: "terceirizado",
      fornecedor: "Ábaco Tecnologia", desc: "Emissão e fiscalização de NFS-e municipal.",
      papeis: ["Consulta", "Fiscal", "Auditor Fiscal"] },
    { id: "obras",  nome: "Gestão de Obras e Medições", area: "SEOBI", tipo: "interno",
      desc: "Cronograma físico-financeiro e medição de contratos de obra.",
      papeis: ["Consulta", "Fiscal de Obra", "Gestor de Contrato"] },
    { id: "social", nome: "Cadastro Único / Benefícios", area: "SEDS", tipo: "terceirizado",
      fornecedor: "Governo Federal / CAIXA", desc: "Programas sociais e concessão de benefícios.",
      papeis: ["Entrevistador", "Supervisor", "Gestor Municipal"] },
    { id: "frota",  nome: "Gestão de Frota e Combustível", area: "SSM", tipo: "interno",
      desc: "Controle de veículos, abastecimento e manutenção.",
      papeis: ["Consulta", "Operador", "Gestor de Frota"] },
    { id: "guarda", nome: "Despacho da Guarda Civil", area: "SEDC", tipo: "interno",
      desc: "Ocorrências, despacho de viaturas e videomonitoramento.",
      papeis: ["Operador de Câmera", "Despachante", "Comando"] },
    { id: "jur",    nome: "Gestão de Processos Judiciais", area: "PGM", tipo: "terceirizado",
      fornecedor: "Projuris", desc: "Acompanhamento de demandas judiciais do Município.",
      papeis: ["Consulta", "Advogado", "Procurador-Chefe"] },
  ],

  /* Servidores e seus acessos vigentes. */
  servidores: [
    { nome: "João Batista Furtado", matricula: "84.221-0", cargo: "Agente Administrativo", secretaria: "SGAF",
      acessos: [ { sistema: "sigm", papel: "Operador", status: "ativo" }, { sistema: "rh", papel: "Servidor", status: "ativo" } ] },
    { nome: "Maria Aparecida Lopes", matricula: "77.430-5", cargo: "Enfermeira", secretaria: "SMS",
      acessos: [ { sistema: "prontuario", papel: "Profissional de Saúde", status: "ativo" }, { sistema: "sgsaude", papel: "Consulta", status: "ativo" } ] },
    { nome: "Carlos Eduardo Pinto", matricula: "90.118-2", cargo: "Professor PEB II", secretaria: "SME",
      acessos: [ { sistema: "sge", papel: "Professor", status: "ativo" } ] },
    { nome: "Beatriz Almeida", matricula: "65.902-8", cargo: "Fiscal Tributário", secretaria: "SGAF",
      acessos: [ { sistema: "nfse", papel: "Fiscal", status: "ativo" }, { sistema: "sigm", papel: "Consulta", status: "revogado" } ] },
    { nome: "Rafael Quirino", matricula: "88.774-1", cargo: "Engenheiro Civil", secretaria: "SEOBI",
      acessos: [ { sistema: "obras", papel: "Fiscal de Obra", status: "ativo" }, { sistema: "geo", papel: "Consulta", status: "ativo" } ] },
    { nome: "Patrícia Sales", matricula: "71.205-4", cargo: "Assistente Social", secretaria: "SEDS",
      acessos: [ { sistema: "social", papel: "Entrevistador", status: "ativo" } ] },
  ],

  /* Solicitações de acesso. Cada uma carrega seu histórico — o rastro
     completo de quem pediu, quem analisou e o que foi decidido. */
  solicitacoes: [
    {
      protocolo: "SJC-2026-00871", servidor: "Beatriz Almeida", secretaria: "SGAF",
      sistema: "nfse", papel: "Auditor Fiscal", status: "pendente",
      justificativa: "Designada para a força-tarefa de auditoria de ISS sobre prestadores de serviço; preciso do perfil de auditor para abrir e instruir os autos de infração.",
      criadoEm: "2026-06-27T09:12:00",
      historico: [
        { quando: "2026-06-27T09:12:00", quem: "Beatriz Almeida", acao: "Solicitação aberta", tom: "neutro" },
        { quando: "2026-06-27T09:12:01", quem: "Sistema", acao: "Encaminhada à administração da SGAF", tom: "neutro" },
      ],
    },
    {
      protocolo: "SJC-2026-00868", servidor: "Maria Aparecida Lopes", secretaria: "SMS",
      sistema: "prontuario", papel: "Coordenação", status: "pendente",
      justificativa: "Assumi a coordenação da UBS Jardim Satélite e preciso do perfil de coordenação para liberar escalas e relatórios da equipe.",
      criadoEm: "2026-06-26T16:40:00",
      terceiro: true,
      historico: [
        { quando: "2026-06-26T16:40:00", quem: "Maria Aparecida Lopes", acao: "Solicitação aberta", tom: "neutro" },
        { quando: "2026-06-26T16:41:00", quem: "Sistema", acao: "Sistema de terceiro (DATASUS) — exige encaminhamento externo após aval interno", tom: "alerta" },
      ],
    },
    {
      protocolo: "SJC-2026-00855", servidor: "Carlos Eduardo Pinto", secretaria: "SME",
      sistema: "sge", papel: "Coordenação SME", status: "pendente",
      justificativa: "Cessão temporária à coordenação pedagógica regional; necessito visão consolidada das turmas da regional sul.",
      criadoEm: "2026-06-25T11:05:00",
      historico: [
        { quando: "2026-06-25T11:05:00", quem: "Carlos Eduardo Pinto", acao: "Solicitação aberta", tom: "neutro" },
      ],
    },
    {
      protocolo: "SJC-2026-00840", servidor: "João Batista Furtado", secretaria: "SGAF",
      sistema: "sigm", papel: "Gestor", status: "aprovado",
      justificativa: "Promovido a chefe de setor; preciso do perfil gestor para homologar processos do meu setor.",
      criadoEm: "2026-06-22T08:30:00",
      historico: [
        { quando: "2026-06-22T08:30:00", quem: "João Batista Furtado", acao: "Solicitação aberta", tom: "neutro" },
        { quando: "2026-06-22T14:10:00", quem: "Helena Marques", acao: "Aprovada", detalhe: "Promoção confirmada junto ao RH.", tom: "sucesso" },
        { quando: "2026-06-22T14:11:00", quem: "Sistema", acao: "Acesso provisionado no SIGM", tom: "neutro" },
      ],
    },
    {
      protocolo: "SJC-2026-00829", servidor: "Rafael Quirino", secretaria: "SEOBI",
      sistema: "frota", papel: "Operador", status: "negado",
      justificativa: "Gostaria de acompanhar o abastecimento dos veículos da obra.",
      criadoEm: "2026-06-20T13:55:00",
      historico: [
        { quando: "2026-06-20T13:55:00", quem: "Rafael Quirino", acao: "Solicitação aberta", tom: "neutro" },
        { quando: "2026-06-21T10:02:00", quem: "João Pedro Alves", acao: "Negada", detalhe: "Atribuição é da SSM; acompanhamento já disponível em relatório semanal.", tom: "erro" },
      ],
    },
    {
      protocolo: "SJC-2026-00814", servidor: "Patrícia Sales", secretaria: "SEDS",
      sistema: "social", papel: "Supervisor", status: "aprovado",
      justificativa: "Designada supervisora do CRAS Centro; preciso revisar e validar as entrevistas da equipe.",
      criadoEm: "2026-06-18T10:20:00",
      terceiro: true,
      historico: [
        { quando: "2026-06-18T10:20:00", quem: "Patrícia Sales", acao: "Solicitação aberta", tom: "neutro" },
        { quando: "2026-06-18T15:30:00", quem: "Fátima Nogueira", acao: "Aprovada internamente", detalhe: "Designação publicada no diário oficial.", tom: "sucesso" },
        { quando: "2026-06-19T09:00:00", quem: "Sistema", acao: "Encaminhado à CAIXA para provisionamento externo", tom: "alerta" },
        { quando: "2026-06-19T17:45:00", quem: "CAIXA (externo)", acao: "Acesso confirmado pelo órgão gestor", tom: "sucesso" },
      ],
    },
  ],
};

/* Índices auxiliares para lookup rápido na interface. */
const SIST_POR_ID = Object.fromEntries(DB.sistemas.map((s) => [s.id, s]));
const SEC_POR_SIGLA = Object.fromEntries(DB.secretarias.map((s) => [s.sigla, s]));
