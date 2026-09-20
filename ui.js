/**
 * ui.js — tudo que toca a tela (RF08, RF12, RF14)
 */

import { rotuloGenero } from "./modelo.js";

export function $(seletor) {
  return document.querySelector(seletor);
}

export function escapeHtml(texto) {
  const el = document.createElement("span");
  el.textContent = String(texto);
  return el.innerHTML;
}

export function mostrar(el) {
  el.hidden = false;
}

export function esconder(el) {
  el.hidden = true;
}

export function exibirMensagemDeErro(texto) {
  const caixa = $("#estado-erro");
  const paragrafo = $("#texto-erro");
  paragrafo.textContent = texto;
  mostrar(caixa);
}

export function exibirMensagemVazia() {
  mostrar($("#estado-vazio"));
}

export function exibirCarregamento() {
  mostrar($("#estado-carregando"));
}

export function ocultarEstados() {
  esconder($("#estado-carregando"));
  esconder($("#estado-erro"));
  esconder($("#estado-vazio"));
  esconder($("#secao-resultados"));
  esconder($("#secao-perfil"));
}

function classeBadge(classificacao) {
  if (classificacao === "Alta afinidade") return "badge badge-alta";
  if (classificacao === "Média afinidade") return "badge badge-media";
  return "badge badge-baixa";
}

export function renderizarCard(resultado, destaque) {
  const serie = resultado.conteudo;
  const card = document.createElement("article");
  card.className = destaque ? "card-serie card-serie--destaque" : "card-serie";

  const imagem = serie.imagem
    ? `<img src="${escapeHtml(serie.imagem)}" alt="Pôster da série ${escapeHtml(serie.titulo)}" loading="lazy">`
    : `<div class="card-serie__placeholder">${escapeHtml(serie.titulo)}</div>`;

  const emComum = resultado.generosEmComum.length
    ? resultado.generosEmComum.map(rotuloGenero).join(", ")
    : "nenhum";
  const naoExplorados = resultado.generosNaoExplorados.length
    ? resultado.generosNaoExplorados.map(rotuloGenero).join(", ")
    : "nenhum";
  const ano = serie.anoEstreia ? serie.anoEstreia() : null;
  const nota = typeof serie.nota === "number" ? `nota ${serie.nota.toFixed(1)}` : "";
  const resumo = destaque && serie.resumo
    ? `<p class="card-serie__resumo">${escapeHtml(serie.resumo)}</p>`
    : "";

  card.innerHTML = `
    <div class="card-serie__poster">
      ${imagem}
      <span class="card-serie__percentual">${resultado.percentual}%</span>
    </div>
    <div class="card-serie__corpo">
      <div class="card-serie__meta">
        <span class="${classeBadge(resultado.classificacao)}">${escapeHtml(resultado.classificacao)}</span>
        ${ano ? `<span>${escapeHtml(ano)}</span>` : ""}
        ${nota ? `<span>${escapeHtml(nota)}</span>` : ""}
      </div>
      <h3>${escapeHtml(serie.titulo)}</h3>
      <p class="card-serie__linha">${escapeHtml(serie.exibirResumo())}</p>
      ${resumo}
      <p><span class="muted">Em comum:</span> ${escapeHtml(emComum)}</p>
      <p><span class="muted">Ainda não explorados:</span> ${escapeHtml(naoExplorados)}</p>
    </div>
  `;
  return card;
}

export function renderizarResultados(usuario, resultados, mensagem, recalculos) {
  const secao = $("#secao-resultados");
  const saudacao = $("#mensagem-boas-vindas");
  const perfil = $("#resumo-perfil");
  const contador = $("#contador-recalculos");
  const destaqueEl = $("#destaque");
  const grade = $("#grade-cards");
  const chips = $("#chips-filtro");

  saudacao.textContent = mensagem;
  perfil.textContent = `Gêneros do perfil: ${usuario.generosFavoritos.map(rotuloGenero).join(", ")}.`;
  contador.textContent = String(recalculos);

  destaqueEl.innerHTML = "";
  grade.innerHTML = "";
  chips.innerHTML = "";

  const botaoTodos = document.createElement("button");
  botaoTodos.type = "button";
  botaoTodos.className = "chip chip--ativo";
  botaoTodos.dataset.genero = "todos";
  botaoTodos.textContent = "Todos";
  chips.appendChild(botaoTodos);

  const generos = [];
  resultados.forEach((item) => {
    item.conteudo.generos.forEach((g) => {
      if (!generos.includes(g)) generos.push(g);
    });
  });
  generos.sort().forEach((g) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "chip";
    botao.dataset.genero = g;
    botao.textContent = rotuloGenero(g);
    chips.appendChild(botao);
  });

  pintarGrade(resultados, destaqueEl, grade);
  mostrar(secao);
}

export function pintarGrade(lista, destaqueEl, grade) {
  destaqueEl.innerHTML = "";
  grade.innerHTML = "";

  if (lista.length === 0) {
    const vazio = document.createElement("p");
    vazio.className = "aviso";
    vazio.textContent = "Não encontramos recomendações agora para esse filtro.";
    grade.appendChild(vazio);
    return;
  }

  destaqueEl.appendChild(renderizarCard(lista[0], true));
  lista.slice(1).forEach((item) => {
    grade.appendChild(renderizarCard(item, false));
  });
}

export function exibirMensagemDeBoasVindas(nome) {
  const hora = new Date().getHours();
  let saudacao = "Boa noite";
  if (hora < 12) saudacao = "Bom dia";
  else if (hora < 18) saudacao = "Boa tarde";
  return `${saudacao}, ${nome}. O catálogo chegou — boa maratona.`;
}
