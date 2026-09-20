/**
 * modelo.js — classes do motor (RF06, RF14)
 * Adaptadas do CineMatch JS (terminal) para o catálogo da TVMaze.
 *
 * Serie extends Conteudo: a subclasse chama super() e acrescenta
 * cartaz, nota, resumo e estreia — comportamento que a classe-mãe não tem.
 */

export class Conteudo {
  constructor(id, titulo, tipo, generos, duracaoMinutos) {
    this.id = id;
    this.titulo = titulo;
    this.tipo = tipo;
    this.generos = generos;
    this.duracaoMinutos = duracaoMinutos;
  }

  exibirResumo() {
    const duracao = this.duracaoMinutos
      ? `${this.duracaoMinutos} min`
      : "duração variável";
    return `${this.titulo} (${this.tipo}) — ${duracao}`;
  }
}

export class Serie extends Conteudo {
  constructor({ id, titulo, generos, duracaoMinutos, temporadas, imagem, nota, resumo, premiered }) {
    super(id, titulo, "Série", generos, duracaoMinutos);
    this.temporadas = temporadas;
    this.imagem = imagem;
    this.nota = nota;
    this.resumo = resumo;
    this.premiered = premiered;
  }

  exibirTemporadas() {
    if (!this.temporadas) {
      return `${this.titulo} — temporadas não informadas`;
    }
    return `${this.titulo} tem ${this.temporadas} temporada(s)`;
  }

  anoEstreia() {
    return this.premiered ? this.premiered.slice(0, 4) : null;
  }
}

export function removerAcentos(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function classificarAfinidade(percentual) {
  if (percentual >= 80) return "Alta afinidade";
  if (percentual >= 50) return "Média afinidade";
  return "Baixa afinidade";
}

/** Mesma regra do CineMatch JS: gêneros em comum / total do conteúdo × 100. */
export function calcularCompatibilidadeItem(usuario, conteudo) {
  const generosUsuario = usuario.generosFavoritos.map((g) => removerAcentos(g.trim()));
  const generosConteudo = conteudo.generos.map((g) => removerAcentos(g.trim()));

  const emComumNormalizados = generosConteudo.filter((g) => generosUsuario.includes(g));
  const totalGeneros = generosConteudo.length || 1;
  const percentual = Math.round((emComumNormalizados.length / totalGeneros) * 100);

  const generosEmComum = conteudo.generos.filter((g) =>
    generosUsuario.includes(removerAcentos(g)),
  );
  const generosNaoExplorados = [];
  for (let i = 0; i < conteudo.generos.length; i += 1) {
    const genero = conteudo.generos[i];
    if (!generosUsuario.includes(removerAcentos(genero))) {
      generosNaoExplorados.push(genero);
    }
  }

  return {
    conteudo,
    percentual,
    classificacao: classificarAfinidade(percentual),
    generosEmComum,
    generosNaoExplorados,
  };
}

export function calcularCompatibilidades(usuario, catalogo) {
  return catalogo
    .map((item) => calcularCompatibilidadeItem(usuario, item))
    .sort((a, b) => b.percentual - a.percentual);
}

export function encontrarMaiorCompatibilidade(usuario, catalogo) {
  if (catalogo.length === 0) return null;
  const resultados = catalogo.map((c) => calcularCompatibilidadeItem(usuario, c));
  return resultados.reduce((maior, atual) =>
    atual.percentual > maior.percentual ? atual : maior,
  );
}

/** Closure: o total fica preso no escopo interno e só cresce a cada chamada. */
export function criarContadorDeRecomendacoes() {
  let total = 0;
  return function incrementar() {
    total += 1;
    return total;
  };
}

export const GENEROS = [
  { value: "Drama", label: "Drama" },
  { value: "Comedy", label: "Comédia" },
  { value: "Action", label: "Ação" },
  { value: "Thriller", label: "Thriller" },
  { value: "Science-Fiction", label: "Ficção científica" },
  { value: "Horror", label: "Terror" },
  { value: "Romance", label: "Romance" },
  { value: "Crime", label: "Crime" },
  { value: "Adventure", label: "Aventura" },
  { value: "Fantasy", label: "Fantasia" },
  { value: "Mystery", label: "Mistério" },
  { value: "Supernatural", label: "Sobrenatural" },
];

export function rotuloGenero(value) {
  const encontrado = GENEROS.find((g) => g.value === value);
  return encontrado ? encontrado.label : value;
}
