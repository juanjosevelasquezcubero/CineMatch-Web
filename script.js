/**
 * script.js — fluxo da aplicação (formulário, localStorage, fetch, cálculo)
 */

import { Serie, calcularCompatibilidades, criarContadorDeRecomendacoes, GENEROS } from "./modelo.js";
import {
  $,
  esconder,
  mostrar,
  ocultarEstados,
  exibirCarregamento,
  exibirMensagemDeErro,
  exibirMensagemVazia,
  exibirMensagemDeBoasVindas,
  renderizarResultados,
  pintarGrade,
} from "./ui.js";

const CHAVE_PERFIL = "cinematchPerfil";
const URL_CATALOGO = "https://api.tvmaze.com/shows?page=0";
const contadorRecomendacoes = criarContadorDeRecomendacoes();

let catalogoAtual = [];
let usuarioAtual = null;
let resultadosAtuais = [];

function limparHtml(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function tratarCatalogo(dados) {
  return dados
    .filter((serie) => serie.genres && serie.genres.length > 0 && serie.rating && serie.rating.average)
    .sort((a, b) => b.rating.average - a.rating.average)
    .slice(0, 24)
    .map((serie) => new Serie({
      id: serie.id,
      titulo: serie.name,
      generos: serie.genres,
      duracaoMinutos: serie.runtime || serie.averageRuntime || null,
      temporadas: null,
      imagem: serie.image ? (serie.image.medium || serie.image.original) : null,
      nota: serie.rating.average,
      resumo: serie.summary ? limparHtml(serie.summary) : "",
      premiered: serie.premiered || null,
    }));
}

async function buscarCatalogo() {
  const resposta = await fetch(URL_CATALOGO);
  if (!resposta.ok) {
    throw new Error(`A TVMaze respondeu com status ${resposta.status}. Tente novamente em instantes.`);
  }
  const dados = await resposta.json();
  if (!Array.isArray(dados)) {
    throw new Error("O catálogo chegou em um formato inesperado.");
  }
  return tratarCatalogo(dados);
}

function lerPerfil() {
  const bruto = localStorage.getItem(CHAVE_PERFIL);
  if (bruto === null) return null;
  try {
    const parsed = JSON.parse(bruto);
    if (!parsed || typeof parsed.nome !== "string" || !Array.isArray(parsed.generosFavoritos)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function salvarPerfil(usuario) {
  localStorage.setItem(CHAVE_PERFIL, JSON.stringify(usuario));
}

function validarFormulario(form) {
  const nome = form.nome.value.trim();
  const idadeTexto = form.idade.value.trim();
  const generos = [...form.querySelectorAll('input[name="genero"]:checked')].map((el) => el.value);
  const erroEl = $("#erro-formulario");

  if (nome.length < 2) {
    erroEl.textContent = "Digite um nome com pelo menos 2 caracteres.";
    return null;
  }
  if (idadeTexto === "") {
    erroEl.textContent = "A idade é obrigatória.";
    return null;
  }
  const idade = Number(idadeTexto);
  if (Number.isNaN(idade) || idade < 1 || idade > 120) {
    erroEl.textContent = "Digite uma idade válida entre 1 e 120.";
    return null;
  }
  if (generos.length === 0) {
    erroEl.textContent = "Escolha pelo menos um gênero favorito para montar as recomendações.";
    return null;
  }

  erroEl.textContent = "";
  return { nome, idade, generosFavoritos: generos };
}

async function carregarRecomendacoes(usuario, callbackBoasVindas) {
  usuarioAtual = usuario;
  ocultarEstados();
  exibirCarregamento();

  try {
    await new Promise((resolve) => {
      setTimeout(resolve, 700);
    });

    const catalogo = await buscarCatalogo();
    catalogoAtual = catalogo;

    if (catalogo.length === 0) {
      esconder($("#estado-carregando"));
      exibirMensagemVazia();
      return;
    }

    resultadosAtuais = calcularCompatibilidades(usuario, catalogo);
    const total = contadorRecomendacoes();
    const mensagem = callbackBoasVindas
      ? callbackBoasVindas(usuario.nome)
      : `Catálogo pronto, ${usuario.nome}.`;

    esconder($("#estado-carregando"));
    renderizarResultados(usuario, resultadosAtuais, mensagem, total);
    ligarFiltros();
  } catch (erro) {
    esconder($("#estado-carregando"));
    exibirMensagemDeErro(erro.message || "Não foi possível buscar o catálogo agora.");
  }
}

function ligarFiltros() {
  const chips = $("#chips-filtro");
  const select = $("#ordenar");
  const destaqueEl = $("#destaque");
  const grade = $("#grade-cards");

  chips.onclick = (evento) => {
    const botao = evento.target.closest("button[data-genero]");
    if (!botao) return;
    chips.querySelectorAll(".chip").forEach((el) => el.classList.remove("chip--ativo"));
    botao.classList.add("chip--ativo");
    aplicarVista(botao.dataset.genero, select.value, destaqueEl, grade);
  };

  select.onchange = () => {
    const ativo = chips.querySelector(".chip--ativo");
    const genero = ativo ? ativo.dataset.genero : "todos";
    aplicarVista(genero, select.value, destaqueEl, grade);
  };
}

function aplicarVista(genero, ordenacao, destaqueEl, grade) {
  let lista = resultadosAtuais.slice();
  if (genero !== "todos") {
    lista = lista.filter((item) => item.conteudo.generos.includes(genero));
  }
  if (ordenacao === "titulo") {
    lista.sort((a, b) => a.conteudo.titulo.localeCompare(b.conteudo.titulo, "pt-BR"));
  } else if (ordenacao === "nota") {
    lista.sort((a, b) => (b.conteudo.nota || 0) - (a.conteudo.nota || 0));
  } else {
    lista.sort((a, b) => b.percentual - a.percentual);
  }
  pintarGrade(lista, destaqueEl, grade);
}

function montarCheckboxes() {
  const campo = $("#lista-generos");
  GENEROS.forEach((genero) => {
    const label = document.createElement("label");
    label.className = "chip-check";
    label.innerHTML = `
      <input type="checkbox" name="genero" value="${genero.value}">
      <span>${genero.label}</span>
    `;
    campo.appendChild(label);
  });
}

function iniciar() {
  montarCheckboxes();

  const form = $("#form-perfil");
  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const usuario = validarFormulario(form);
    if (!usuario) return;
    salvarPerfil(usuario);
    carregarRecomendacoes(usuario, exibirMensagemDeBoasVindas);
  });

  $("#btn-trocar-perfil").addEventListener("click", () => {
    localStorage.removeItem(CHAVE_PERFIL);
    usuarioAtual = null;
    resultadosAtuais = [];
    ocultarEstados();
    mostrar($("#secao-perfil"));
    $("#form-perfil").reset();
    $("#erro-formulario").textContent = "";
  });

  $("#btn-recalcular").addEventListener("click", () => {
    if (!usuarioAtual) return;
    carregarRecomendacoes(usuarioAtual, exibirMensagemDeBoasVindas);
  });

  $("#btn-tentar-de-novo").addEventListener("click", () => {
    if (usuarioAtual) {
      carregarRecomendacoes(usuarioAtual, exibirMensagemDeBoasVindas);
    } else {
      ocultarEstados();
      mostrar($("#secao-perfil"));
    }
  });

  $("#btn-voltar-perfil").addEventListener("click", () => {
    localStorage.removeItem(CHAVE_PERFIL);
    ocultarEstados();
    mostrar($("#secao-perfil"));
  });

  const salvo = lerPerfil();
  if (salvo) {
    carregarRecomendacoes(salvo, exibirMensagemDeBoasVindas);
  } else {
    mostrar($("#secao-perfil"));
  }
}

iniciar();
