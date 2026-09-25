const API_URL = "https://pratica-fullstack-backend-1-k7w5.onrender.com/pets";

const formulario = document.querySelector("#form-pet");
const campoId = document.querySelector("#pet-id");
const campoNome = document.querySelector("#nome");
const campoRaca = document.querySelector("#raca");
const campoIdade = document.querySelector("#idade");
const tituloFormulario = document.querySelector("#titulo-formulario");
const botaoSalvar = document.querySelector("#botao-salvar");
const botaoCancelar = document.querySelector("#botao-cancelar");
const listaPets = document.querySelector("#lista-pets");
const mensagem = document.querySelector("#mensagem");
const formularioBusca = document.querySelector("#form-busca");
const campoBuscaId = document.querySelector("#busca-id");

async function fazerRequisicao(url, opcoes = {}) {
  const resposta = await fetch(url, opcoes);

  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}));
    throw new Error(erro.mensagem || "Não foi possível concluir a operação");
  }

  if (resposta.status === 204) {
    return null;
  }

  return resposta.json();
}

function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.classList.toggle("erro", erro);
}

function criarCartaoPet(pet) {
  const cartao = document.createElement("article");
  cartao.className = "usuario";

  const nome = document.createElement("h3");
  nome.textContent = pet.nome;

  const raca = document.createElement("p");
  raca.textContent = `Raça: ${pet.raca}`;

  const idade = document.createElement("p");
  idade.textContent = `Idade: ${pet.idade ?? "Não informada"}`;

  const id = document.createElement("p");
  id.textContent = `ID: ${pet._id}`;

  const acoes = document.createElement("div");
  acoes.className = "acoes-usuario";

  const botaoEditar = document.createElement("button");
  botaoEditar.type = "button";
  botaoEditar.textContent = "Editar";
  botaoEditar.addEventListener("click", () => carregarPetParaEdicao(pet._id));

  const botaoExcluir = document.createElement("button");
  botaoExcluir.type = "button";
  botaoExcluir.className = "perigo";
  botaoExcluir.textContent = "Excluir";
  botaoExcluir.addEventListener("click", () => excluirPet(pet._id));

  acoes.append(botaoEditar, botaoExcluir);
  cartao.append(nome, raca, idade, id, acoes);

  return cartao;
}

function exibirPets(pets) {
  listaPets.innerHTML = "";

  if (pets.length === 0) {
    mostrarMensagem("Nenhum pet cadastrado");
    return;
  }

  pets.forEach((pet) => {
    listaPets.appendChild(criarCartaoPet(pet));
  });

  mostrarMensagem(`${pets.length} pet(s) encontrado(s)`);
}

async function listarPets() {
  try {
    mostrarMensagem("Carregando pets...");
    const pets = await fazerRequisicao(API_URL);
    exibirPets(pets);
  } catch (erro) {
    listaPets.innerHTML = "";
    mostrarMensagem(erro.message, true);
  }
}

async function buscarPetPorId(id) {
  const pet = await fazerRequisicao(`${API_URL}/${id}`);
  exibirPets([pet]);
  return pet;
}

async function salvarPet(evento) {
  evento.preventDefault();

  const pet = {
    nome: campoNome.value.trim(),
    raca: campoRaca.value.trim()
  };

  if (campoIdade.value !== "") {
    pet.idade = Number(campoIdade.value);
  }

  const id = campoId.value;
  const estaEditando = Boolean(id);
  const url = estaEditando ? `${API_URL}/${id}` : API_URL;
  const metodo = estaEditando ? "PUT" : "POST";

  try {
    await fazerRequisicao(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pet)
    });

    limparFormulario();
    mostrarMensagem(estaEditando ? "Pet atualizado" : "Pet cadastrado");
    await listarPets();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
}

async function carregarPetParaEdicao(id) {
  try {
    const pet = await fazerRequisicao(`${API_URL}/${id}`);

    campoId.value = pet._id;
    campoNome.value = pet.nome;
    campoRaca.value = pet.raca;
    campoIdade.value = pet.idade ?? "";
    tituloFormulario.textContent = "Editar pet";
    botaoSalvar.textContent = "Salvar alterações";
    botaoCancelar.classList.remove("oculto");
    campoNome.focus();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
}

async function excluirPet(id) {
  const confirmou = window.confirm("Deseja excluir este pet?");

  if (!confirmou) {
    return;
  }

  try {
    await fazerRequisicao(`${API_URL}/${id}`, { method: "DELETE" });
    limparFormulario();
    mostrarMensagem("Pet excluído");
    await listarPets();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
}

function limparFormulario() {
  formulario.reset();
  campoId.value = "";
  tituloFormulario.textContent = "Novo pet";
  botaoSalvar.textContent = "Cadastrar";
  botaoCancelar.classList.add("oculto");
}

formulario.addEventListener("submit", salvarPet);
botaoCancelar.addEventListener("click", limparFormulario);
document.querySelector("#botao-atualizar").addEventListener("click", listarPets);
document.querySelector("#botao-limpar-busca").addEventListener("click", () => {
  campoBuscaId.value = "";
  listarPets();
});

formularioBusca.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const id = campoBuscaId.value.trim();

  if (!id) {
    mostrarMensagem("Informe um ID para realizar a busca", true);
    return;
  }

  try {
    await buscarPetPorId(id);
  } catch (erro) {
    listaPets.innerHTML = "";
    mostrarMensagem(erro.message, true);
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

listarPets();