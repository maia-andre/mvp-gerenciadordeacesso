# GAU — Gestor de Acesso Unificado

Protótipo de demonstração de um sistema **único** para gerir quem acessa qual
sistema na Prefeitura de São José dos Campos — e com qual papel. Substitui o
processo atual, feito em papel/PDF e despachado manualmente para o TI ou para o
órgão dono de cada sistema, por um fluxo digital, rápido e **com rastro**.

> **Protótipo.** Tudo roda no navegador, com dados fictícios em memória.
> Nada é salvo, não há back-end e nenhuma informação real é usada. O objetivo é
> mostrar como o sistema funcionaria.

## O problema que ele resolve

- Hoje cada acesso vira um **PDF** que circula entre setores até chegar em quem
  provisiona — burocrático, lento e sem histórico confiável.
- São **15 secretarias** e um número enorme de sistemas e subsistemas.
- Não há um **rastro** padronizado de quem pediu, quem decidiu e o que foi feito.

## Como ele funciona

- Cada secretaria tem um ou mais **administradores de acesso**, que decidem as
  liberações dentro da sua área (liberar o sistema X para o servidor Y, com o
  papel Z).
- Toda solicitação nasce com **protocolo** e gera um **rastro** completo:
  abertura, análise, aprovação/recusa e — quando for o caso — encaminhamento
  externo. Cada ato registra autor, data e hora.
- **Papéis** (perfis de acesso) são definidos por sistema e geridos no mesmo
  lugar.

### Sistemas de terceiros

Nem todo sistema é da Prefeitura: alguns são operados por **fornecedores** ou por
**outros órgãos** (ex.: DATASUS, CAIXA, SEI federal). Esses exigem **tratamento
próprio** — o aval do administrador é interno, mas o provisionamento é
**encaminhado ao responsável externo**, que confirma o acesso na própria trilha.
No protótipo eles aparecem sempre sinalizados em **âmbar** (`⚠ terceiro`).

## Telas

| Tela | O que mostra |
|------|--------------|
| **Visão geral** | Indicadores, fila de decisão e movimentação recente |
| **Solicitações** | Lista filtrável; abrir um pedido mostra o rastro e permite aprovar/negar |
| **Nova solicitação** | Formulário que substitui o PDF; sinaliza sistemas de terceiros |
| **Sistemas** | Catálogo, separando o que é da Prefeitura do que é de terceiros |
| **Servidores** | Quem acessa o quê, com qual papel e status |
| **Secretarias** | As 15 secretarias e seus administradores |
| **Trilha de auditoria** | O rastro cronológico de todos os atos |

Aprovar ou negar uma solicitação altera o estado da demonstração em tempo real e
escreve novos eventos na trilha — é possível ver o rastro sendo construído.

## Como abrir

Sem build e sem dependências. Basta abrir o `index.html` no navegador
(ou servir a pasta):

```bash
python3 -m http.server 8000
# acesse http://localhost:8000
```

## Estrutura

```
index.html   estrutura e layout
styles.css   identidade visual (paleta institucional de SJC)
data.js      dados-semente fictícios (secretarias, sistemas, solicitações…)
app.js       navegação, renderização e ações (aprovar/negar, nova solicitação)
```

## Identidade visual

Paleta institucional de São José dos Campos — azul institucional e verde — com
uma leitura de "sala de controle / telemetria" que conversa com a vocação
tecnológica e aeroespacial da cidade. Âmbar é reservado, em toda a interface,
para sinalizar sistemas de terceiros.
