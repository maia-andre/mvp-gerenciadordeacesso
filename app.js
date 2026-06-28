/* ============================================================================
   GAU — Gestor de Acesso Unificado · Prefeitura de São José dos Campos
   Lógica do protótipo: navegação, renderização e ações sobre os dados em
   memória (DB, definido em data.js). Aprovar/negar e abrir solicitações
   alteram o estado e escrevem no histórico — gerando o "rastro" de cada ato.
   ========================================================================== */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* ----------------------------- utilidades ----------------------------- */
const iniciais = (nome) =>
  nome.split(" ").filter((p) => p[0] && p[0] === p[0].toUpperCase()).slice(0, 2).map((p) => p[0]).join("") || nome.slice(0, 2).toUpperCase();

const fmtData = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) + " · " +
         d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};
const fmtRelativo = (iso) => {
  const dias = Math.round((Date.now() - new Date(iso)) / 86400000);
  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  return `há ${dias} dias`;
};
const rotuloStatus = { pendente: "Pendente", aprovado: "Aprovado", negado: "Negado", ativo: "Ativo", revogado: "Revogado" };
const nomeSistema = (id) => SIST_POR_ID[id]?.nome ?? id;
const ehTerceiro = (id) => SIST_POR_ID[id]?.tipo === "terceirizado";

/* ----------------------------- escopo / texto das views ----------------------------- */
const VIEWS = {
  dashboard:   { titulo: "Visão geral",        sub: "Acompanhe os acessos da sua secretaria em um só lugar." },
  solicitacoes:{ titulo: "Solicitações",       sub: "Analise e decida cada pedido — toda decisão fica registrada." },
  nova:        { titulo: "Nova solicitação",   sub: "Substitui o pedido em papel/PDF por um fluxo rastreável." },
  sistemas:    { titulo: "Sistemas",           sub: "Catálogo de sistemas da Prefeitura e de terceiros." },
  servidores:  { titulo: "Servidores",         sub: "Quem acessa o quê, e com qual papel." },
  secretarias: { titulo: "Secretarias",        sub: "As 15 secretarias e seus administradores de acesso." },
  trilha:      { titulo: "Trilha de auditoria", sub: "O rastro completo de cada solicitação, em ordem cronológica." },
};

/* ============================ NAVEGAÇÃO ============================ */
function navegar(view) {
  $$(".nav__item").forEach((b) => b.classList.toggle("is-active", b.dataset.view === view));
  $("#viewTitle").textContent = VIEWS[view].titulo;
  $("#viewSub").textContent = VIEWS[view].sub;
  $(".sidebar").classList.remove("is-open");
  RENDER[view]();
  window.scrollTo({ top: 0 });
}

/* ============================ RENDERIZADORES ============================ */
const RENDER = {};

/* ---------- Visão geral ---------- */
RENDER.dashboard = () => {
  const pend = DB.solicitacoes.filter((s) => s.status === "pendente");
  const ativos = DB.servidores.reduce((n, s) => n + s.acessos.filter((a) => a.status === "ativo").length, 0);
  const terceiros = DB.sistemas.filter((s) => s.tipo === "terceirizado").length;

  const stats = [
    { k: "Aguardando decisão", v: pend.length, d: "solicitações pendentes", acc: "var(--ambar)" },
    { k: "Acessos ativos", v: ativos, d: "concessões vigentes", acc: "var(--verde)" },
    { k: "Sistemas catalogados", v: DB.sistemas.length, d: `${terceiros} de terceiros`, acc: "var(--azul)" },
    { k: "Secretarias", v: DB.secretarias.length, d: "com administrador definido", acc: "var(--azul-prof)" },
  ];

  $("#content").innerHTML = `
    <div class="view">
      <div class="stats">
        ${stats.map((s) => `
          <div class="stat" style="--accent:${s.acc}">
            <div class="stat__k">${s.k}</div>
            <div class="stat__v">${s.v}</div>
            <div class="stat__d">${s.d}</div>
          </div>`).join("")}
      </div>

      ${pend.some((s) => s.terceiro) ? `
        <div class="note-terceiro" style="margin-bottom:22px">
          <span class="ic">⚠</span>
          <div>
            <b>Há pedidos de sistemas de terceiros na fila.</b>
            <p>Sistemas operados por fornecedores ou outros órgãos (ex.: DATASUS, CAIXA, SEI federal) seguem fluxo próprio: após o aval interno, o acesso é <b>encaminhado ao responsável externo</b> e só vale quando confirmado por ele.</p>
          </div>
        </div>` : ""}

      <div class="cols">
        <div class="panel">
          <div class="panel__head">
            <h2>Fila de decisão</h2>
            <span class="sub">— pedidos aguardando você</span>
            <button class="link" data-view="solicitacoes">Ver todas →</button>
          </div>
          <div class="panel__body">
            ${pend.length ? pend.map(reqRow).join("") : estadoVazio("Sem pendências", "Tudo certo por aqui — nenhuma solicitação aguardando.")}
          </div>
        </div>

        <div class="panel">
          <div class="panel__head"><h2>Movimentação recente</h2></div>
          <div class="panel__body" style="padding:16px 18px">
            <div class="trail">
              ${atividadeRecente().map(trailLine).join("")}
            </div>
          </div>
        </div>
      </div>
    </div>`;
  ligarReqRows();
  ligarLinks();
};

/* ---------- Solicitações ---------- */
let filtroSolic = "todas";
RENDER.solicitacoes = () => {
  const lista = DB.solicitacoes.filter((s) => filtroSolic === "todas" || s.status === filtroSolic);
  $("#content").innerHTML = `
    <div class="view">
      <div class="toolbar">
        <div class="filters">
          ${["todas", "pendente", "aprovado", "negado"].map((f) => `
            <button class="filter ${f === filtroSolic ? "is-on" : ""}" data-filtro="${f}">
              ${f === "todas" ? "Todas" : rotuloStatus[f]}
            </button>`).join("")}
        </div>
        <span class="count">${lista.length} ${lista.length === 1 ? "registro" : "registros"}</span>
      </div>
      <div class="panel">
        <div class="panel__body">
          ${lista.length ? lista.map(reqRow).join("") : estadoVazio("Nada por aqui", "Nenhuma solicitação neste filtro.")}
        </div>
      </div>
    </div>`;
  $$(".filter").forEach((b) => b.addEventListener("click", () => { filtroSolic = b.dataset.filtro; RENDER.solicitacoes(); }));
  ligarReqRows();
};

function reqRow(s) {
  return `
    <button class="req" data-proto="${s.protocolo}">
      <div class="req__icon">${iniciais(s.servidor)}</div>
      <div class="req__main">
        <div class="req__top">
          <span class="req__name">${s.servidor}</span>
          <span class="req__proto">${s.protocolo}</span>
          ${ehTerceiro(s.sistema) ? `<span class="tag tag--terceiro">⚠ terceiro</span>` : ""}
        </div>
        <div class="req__meta">Quer <b>${s.papel}</b> em <b>${nomeSistema(s.sistema)}</b> · ${s.secretaria}</div>
      </div>
      <div class="req__right">
        <span class="pill pill--${s.status}">${rotuloStatus[s.status]}</span>
        <span class="req__when">${fmtRelativo(s.criadoEm)}</span>
      </div>
    </button>`;
}
function ligarReqRows() {
  $$(".req").forEach((b) => b.addEventListener("click", () => abrirSolicitacao(b.dataset.proto)));
}

/* ---------- Nova solicitação ---------- */
RENDER.nova = () => {
  $("#content").innerHTML = `
    <div class="view form-wrap">
      <p class="section-intro">
        Hoje cada acesso vira um PDF que circula entre setores até chegar no TI ou no órgão dono do sistema.
        Aqui o pedido é instantâneo e já nasce com protocolo e rastro — pronto para o administrador da secretaria decidir.
      </p>
      <form class="form" id="formNova">
        <div class="row2">
          <div class="field">
            <label for="fServidor">Servidor</label>
            <select class="input" id="fServidor" required>
              <option value="" disabled selected>Selecione…</option>
              ${DB.servidores.map((s) => `<option value="${s.nome}">${s.nome} — ${s.cargo}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label for="fSistema">Sistema</label>
            <select class="input" id="fSistema" required>
              <option value="" disabled selected>Selecione…</option>
              ${DB.sistemas.map((s) => `<option value="${s.id}">${s.nome}${s.tipo === "terceirizado" ? " · terceiro" : ""}</option>`).join("")}
            </select>
          </div>
        </div>

        <div id="terceiroAviso"></div>

        <div class="field">
          <label for="fPapel">Papel desejado <span class="hint">— o que o servidor poderá fazer no sistema</span></label>
          <select class="input" id="fPapel" required disabled>
            <option value="" disabled selected>Escolha o sistema primeiro</option>
          </select>
        </div>

        <div class="field">
          <label for="fJust">Justificativa <span class="hint">— por que esse acesso é necessário</span></label>
          <textarea class="input" id="fJust" placeholder="Ex.: assumi a coordenação da unidade e preciso liberar as escalas da equipe." required></textarea>
        </div>

        <div class="form__foot">
          <button type="submit" class="btn btn--primary">Enviar solicitação</button>
          <span class="note">Será protocolada e encaminhada ao administrador da secretaria.</span>
        </div>
      </form>
    </div>`;

  const selSis = $("#fSistema"), selPapel = $("#fPapel"), aviso = $("#terceiroAviso");
  selSis.addEventListener("change", () => {
    const sis = SIST_POR_ID[selSis.value];
    selPapel.disabled = false;
    selPapel.innerHTML = `<option value="" disabled selected>Selecione o papel…</option>` +
      sis.papeis.map((p) => `<option value="${p}">${p}</option>`).join("");
    aviso.innerHTML = sis.tipo === "terceirizado" ? `
      <div class="note-terceiro">
        <span class="ic">⚠</span>
        <div>
          <b>Sistema de terceiro — ${sis.fornecedor}</b>
          <p>Após a aprovação interna, este acesso será <b>encaminhado ao fornecedor/órgão externo</b> para provisionamento. Ele só passa a valer quando confirmado por eles.</p>
        </div>
      </div>` : "";
  });

  $("#formNova").addEventListener("submit", (e) => {
    e.preventDefault();
    criarSolicitacao($("#fServidor").value, selSis.value, selPapel.value, $("#fJust").value.trim());
  });
};

/* ---------- Sistemas ---------- */
let filtroSis = "todos";
RENDER.sistemas = () => {
  const lista = DB.sistemas.filter((s) =>
    filtroSis === "todos" || (filtroSis === "interno" ? s.tipo === "interno" : s.tipo === "terceirizado"));
  $("#content").innerHTML = `
    <div class="view">
      <p class="section-intro">
        Todos os sistemas e subsistemas em um só catálogo. Os marcados como <b style="color:var(--ambar)">terceiros</b>
        não são da Prefeitura — pertencem a fornecedores ou a outros órgãos e exigem encaminhamento externo após o aval interno.
      </p>
      <div class="toolbar">
        <div class="filters">
          ${[["todos","Todos"],["interno","Da Prefeitura"],["terceirizado","De terceiros"]].map(([f,r]) => `
            <button class="filter ${f === filtroSis ? "is-on" : ""}" data-filtro="${f}">${r}</button>`).join("")}
        </div>
        <span class="count">${lista.length} sistemas</span>
      </div>
      <div class="grid grid--3">
        ${lista.map(sisCard).join("")}
      </div>
    </div>`;
  $$(".filter").forEach((b) => b.addEventListener("click", () => { filtroSis = b.dataset.filtro; RENDER.sistemas(); }));
};
function sisCard(s) {
  const ter = s.tipo === "terceirizado";
  return `
    <div class="card">
      <div class="card__top">
        <h3>${s.nome}</h3>
        <span class="tag tag--${ter ? "terceiro" : "interno"}">${ter ? "⚠ terceiro" : "interno"}</span>
      </div>
      <p class="card__desc">${s.desc}</p>
      <div class="papeis">${s.papeis.map((p) => `<span>${p}</span>`).join("")}</div>
      <div class="card__foot">
        <span class="chip-mini">${SEC_POR_SIGLA[s.area]?.sigla ?? s.area}</span>
        ${ter ? `<span class="chip-mini" style="color:var(--ambar)">${s.fornecedor}</span>` : `<span class="chip-mini">Prefeitura</span>`}
      </div>
    </div>`;
}

/* ---------- Servidores ---------- */
RENDER.servidores = () => {
  $("#content").innerHTML = `
    <div class="view">
      <div class="panel">
        <div class="panel__head"><h2>Servidores e acessos</h2><span class="sub">— ${DB.servidores.length} cadastrados</span></div>
        <div class="panel__body">
          ${DB.servidores.map((s) => `
            <div class="serv">
              <div class="serv__head">
                <div class="serv__av">${iniciais(s.nome)}</div>
                <div>
                  <div style="font-weight:600;font-size:14.5px">${s.nome}</div>
                  <div class="serv__id">${s.matricula} · ${s.cargo} · ${s.secretaria}</div>
                </div>
              </div>
              <div class="serv__acc">
                ${s.acessos.length ? s.acessos.map((a) => `
                  <div class="acc">
                    <b>${nomeSistema(a.sistema)}</b>
                    <span class="papel">${a.papel}</span>
                    <span class="pill pill--${a.status}">${rotuloStatus[a.status]}</span>
                  </div>`).join("") : `<span class="serv__id">Sem acessos.</span>`}
              </div>
            </div>`).join("")}
        </div>
      </div>
    </div>`;
};

/* ---------- Secretarias ---------- */
RENDER.secretarias = () => {
  $("#content").innerHTML = `
    <div class="view">
      <p class="section-intro">
        Cada secretaria tem ao menos um <b>administrador de acesso</b> — é quem decide liberar o sistema X para o servidor Y
        dentro da sua área. A decisão deixa de depender de papel circulando entre setores.
      </p>
      <div class="grid grid--3">
        ${DB.secretarias.map((s) => `
          <div class="card sec-card">
            <div class="sec-card__sig">${s.sigla}</div>
            <div class="sec-card__info">
              <h3>${s.nome}</h3>
              <div class="adm">Adm.: <b>${s.admin}</b></div>
              <div class="cnt">${s.servidores.toLocaleString("pt-BR")} servidores</div>
            </div>
          </div>`).join("")}
      </div>
    </div>`;
};

/* ---------- Trilha de auditoria ---------- */
RENDER.trilha = () => {
  const eventos = DB.solicitacoes
    .flatMap((s) => s.historico.map((h) => ({ ...h, protocolo: s.protocolo, servidor: s.servidor })))
    .sort((a, b) => new Date(b.quando) - new Date(a.quando));
  $("#content").innerHTML = `
    <div class="view">
      <p class="section-intro">
        Cada ato — abertura, aprovação, recusa, encaminhamento externo — fica registrado com autor, data e hora.
        É o rastro que hoje não existe quando o pedido vai no papel.
      </p>
      <div class="panel">
        <div class="panel__body" style="padding:18px">
          <div class="trail">
            ${eventos.map((e) => trailLine(e, true)).join("")}
          </div>
        </div>
      </div>
    </div>`;
};

/* ---------- helpers de trilha ---------- */
function atividadeRecente() {
  return DB.solicitacoes
    .flatMap((s) => s.historico.map((h) => ({ ...h, protocolo: s.protocolo })))
    .sort((a, b) => new Date(b.quando) - new Date(a.quando))
    .slice(0, 6);
}
function trailLine(e, comProto = false) {
  return `
    <div class="trail__line" data-tom="${e.tom || "neutro"}">
      <span class="trail__dot"></span>
      <div class="trail__head">
        <span class="trail__act">${e.acao}</span>
        <span class="trail__who">${e.quem}${comProto ? ` · ${e.protocolo}` : ""}</span>
        <span class="trail__time">${fmtData(e.quando)}</span>
      </div>
      ${e.detalhe ? `<div class="trail__detail">${e.detalhe}</div>` : ""}
      ${!comProto && e.protocolo ? `<div class="trail__detail" style="font-family:var(--ff-mono);font-size:11px">${e.protocolo}</div>` : ""}
    </div>`;
}
function estadoVazio(t, p) {
  return `<div class="empty"><div class="ic">✓</div><h3>${t}</h3><p>${p}</p></div>`;
}

/* ============================ GAVETA DE DETALHE ============================ */
function abrirSolicitacao(proto) {
  const s = DB.solicitacoes.find((x) => x.protocolo === proto);
  if (!s) return;
  const sis = SIST_POR_ID[s.sistema];
  const ter = sis.tipo === "terceirizado";

  $("#drawerBody").innerHTML = `
    <div class="dr-proto">${s.protocolo}</div>
    <h2 class="dr-title">${s.servidor}</h2>
    <div class="dr-meta">
      <span class="pill pill--${s.status}">${rotuloStatus[s.status]}</span>
      &nbsp; aberta ${fmtRelativo(s.criadoEm)}
    </div>

    ${ter ? `
      <div class="note-terceiro">
        <span class="ic">⚠</span>
        <div>
          <b>Sistema de terceiro — ${sis.fornecedor}</b>
          <p>O aval aqui é interno. Confirmada a aprovação, o GAU encaminha o provisionamento ao responsável externo, que confirma na própria trilha.</p>
        </div>
      </div>` : ""}

    <div class="dr-block">
      <h4>Pedido</h4>
      <div class="dr-kv"><span>Sistema</span><b>${sis.nome}</b></div>
      <div class="dr-kv"><span>Papel</span><b>${s.papel}</b></div>
      <div class="dr-kv"><span>Secretaria</span><b>${s.secretaria} · ${SEC_POR_SIGLA[s.secretaria]?.nome ?? ""}</b></div>
      <div class="dr-kv"><span>Tipo</span><b style="color:${ter ? "var(--ambar)" : "var(--azul)"}">${ter ? "Terceiro" : "Da Prefeitura"}</b></div>
    </div>

    <div class="dr-block">
      <h4>Justificativa</h4>
      <p class="dr-just">${s.justificativa}</p>
    </div>

    <div class="dr-block">
      <h4>Rastro da solicitação</h4>
      <div class="trail">${s.historico.slice().reverse().map((h) => trailLine(h)).join("")}</div>
    </div>

    ${s.status === "pendente" ? `
      <div class="dr-actions">
        <button class="btn btn--ok" id="btnAprovar">✓ Aprovar</button>
        <button class="btn btn--no" id="btnNegar">✕ Negar</button>
      </div>` : ""}
  `;

  if (s.status === "pendente") {
    $("#btnAprovar").addEventListener("click", () => decidir(s.protocolo, "aprovado"));
    $("#btnNegar").addEventListener("click", () => decidir(s.protocolo, "negado"));
  }
  abrirDrawer();
}

function abrirDrawer() { $("#drawer").setAttribute("aria-hidden", "false"); }
function fecharDrawer() { $("#drawer").setAttribute("aria-hidden", "true"); }

/* ============================ AÇÕES SOBRE OS DADOS ============================ */
function decidir(proto, decisao) {
  const s = DB.solicitacoes.find((x) => x.protocolo === proto);
  if (!s || s.status !== "pendente") return;
  const agora = new Date().toISOString();
  const adm = DB.sessao.nome;
  const ter = ehTerceiro(s.sistema);

  s.status = decisao;
  if (decisao === "aprovado") {
    s.historico.push({ quando: agora, quem: adm, acao: ter ? "Aprovada internamente" : "Aprovada",
      detalhe: "Decisão registrada pelo administrador da secretaria.", tom: "sucesso" });
    if (ter) {
      s.historico.push({ quando: agora, quem: "Sistema", acao: `Encaminhado a ${SIST_POR_ID[s.sistema].fornecedor} para provisionamento externo`, tom: "alerta" });
    } else {
      s.historico.push({ quando: agora, quem: "Sistema", acao: `Acesso provisionado em ${nomeSistema(s.sistema)}`, tom: "neutro" });
      registrarAcesso(s);
    }
    toast(`${s.protocolo} aprovada`, ter ? "Encaminhada ao fornecedor externo." : "Acesso provisionado e registrado na trilha.", ter ? "ambar" : "ok");
  } else {
    s.historico.push({ quando: agora, quem: adm, acao: "Negada", detalhe: "Decisão registrada pelo administrador da secretaria.", tom: "erro" });
    toast(`${s.protocolo} negada`, "Decisão registrada na trilha.", "");
  }
  fecharDrawer();
  atualizarBadge();
  navegar($(".nav__item.is-active").dataset.view);
}

function registrarAcesso(s) {
  const serv = DB.servidores.find((x) => x.nome === s.servidor);
  if (!serv) return;
  const existente = serv.acessos.find((a) => a.sistema === s.sistema);
  if (existente) { existente.papel = s.papel; existente.status = "ativo"; }
  else serv.acessos.push({ sistema: s.sistema, papel: s.papel, status: "ativo" });
}

let seq = 900;
function criarSolicitacao(servidor, sistemaId, papel, justificativa) {
  if (!servidor || !sistemaId || !papel || !justificativa) return;
  const serv = DB.servidores.find((x) => x.nome === servidor);
  const proto = `SJC-2026-00${++seq}`;
  const agora = new Date().toISOString();
  const ter = ehTerceiro(sistemaId);
  const nova = {
    protocolo: proto, servidor, secretaria: serv?.secretaria ?? DB.sessao.secretaria,
    sistema: sistemaId, papel, status: "pendente", justificativa, criadoEm: agora, terceiro: ter,
    historico: [
      { quando: agora, quem: servidor, acao: "Solicitação aberta", tom: "neutro" },
      { quando: agora, quem: "Sistema", acao: ter
          ? `Sistema de terceiro (${SIST_POR_ID[sistemaId].fornecedor}) — exige encaminhamento externo após aval interno`
          : "Encaminhada à administração da secretaria", tom: ter ? "alerta" : "neutro" },
    ],
  };
  DB.solicitacoes.unshift(nova);
  atualizarBadge();
  toast(`${proto} protocolada`, "Encaminhada ao administrador da secretaria.", "ok");
  filtroSolic = "pendente";
  navegar("solicitacoes");
}

/* ============================ AVISOS (TOAST) ============================ */
function toast(titulo, texto, tipo = "") {
  const el = document.createElement("div");
  el.className = "toast" + (tipo === "ok" ? " toast--ok" : tipo === "ambar" ? " toast--ambar" : "");
  el.innerHTML = `<span class="toast__ic">${tipo === "ambar" ? "⚠" : "✓"}</span><div><b>${titulo}</b><div style="font-size:12.5px;opacity:.9">${texto}</div></div>`;
  $("#toasts").appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translateX(20px)"; el.style.transition = "all .3s"; setTimeout(() => el.remove(), 300); }, 3800);
}

/* ============================ BADGE / SESSÃO ============================ */
function atualizarBadge() {
  const n = DB.solicitacoes.filter((s) => s.status === "pendente").length;
  const b = $("#navBadge");
  b.textContent = n;
  b.dataset.zero = n === 0;
}

/* ============================ LIGAÇÕES GLOBAIS ============================ */
function ligarLinks() {
  $$("[data-view]").forEach((b) => {
    if (b.dataset.bound) return;
    b.dataset.bound = "1";
    b.addEventListener("click", () => navegar(b.dataset.view));
  });
}

function init() {
  // sessão
  $("#whoName").textContent = DB.sessao.nome;
  $("#whoRole").textContent = `${DB.sessao.cargo} · ${DB.sessao.secretaria}`;
  $("#whoAv").textContent = iniciais(DB.sessao.nome);

  // navegação
  $$(".nav__item").forEach((b) => b.addEventListener("click", () => navegar(b.dataset.view)));
  // menu mobile
  $("#menuBtn").addEventListener("click", () => $(".sidebar").classList.toggle("is-open"));
  // gaveta
  $$("[data-close]").forEach((el) => el.addEventListener("click", fecharDrawer));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") fecharDrawer(); });

  atualizarBadge();
  navegar("dashboard");
}

document.addEventListener("DOMContentLoaded", init);
