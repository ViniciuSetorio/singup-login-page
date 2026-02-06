document.getElementById("ano-atual").textContent = new Date().getFullYear();

function setErro(idInput, idErro, mensagem) {
  const input = document.getElementById(idInput);
  const erro = document.getElementById(idErro);

  if (mensagem) {
    input.classList.add("error");
    erro.textContent = mensagem;
  } else {
    input.classList.remove("error");
    erro.textContent = "";
  }
}

// --- MÁSCARAS E EVENTOS DE INPUT ---
const cpfInput = document.getElementById("cpf");
cpfInput.addEventListener("input", function () {
  let v = this.value.replace(/\D/g, "");
  if (v.length > 11) v = v.slice(0, 11);
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  this.value = v;
});
// Bloqueia letras
cpfInput.addEventListener("keypress", function (e) {
  if (!/[0-9]/.test(String.fromCharCode(e.which))) e.preventDefault();
});

const cepInput = document.getElementById("cep");
cepInput.addEventListener("input", function () {
  let v = this.value.replace(/\D/g, "");
  if (v.length > 8) v = v.slice(0, 8);
  v = v.replace(/(\d{5})(\d)/, "$1-$2");
  this.value = v;
});
cepInput.addEventListener("keypress", function (e) {
  if (!/[0-9]/.test(String.fromCharCode(e.which))) e.preventDefault();
});

const dataInput = document.getElementById("dataNascimento");
dataInput.addEventListener("input", function () {
  let v = this.value.replace(/\D/g, "");
  if (v.length > 8) v = v.slice(0, 8);
  v = v.replace(/(\d{2})(\d)/, "$1/$2");
  v = v.replace(/(\d{2})(\d)/, "$1/$2");
  this.value = v;
});
dataInput.addEventListener("keypress", function (e) {
  if (!/[0-9]/.test(String.fromCharCode(e.which))) e.preventDefault();
});

const telInput = document.getElementById("telefone");
telInput.addEventListener("input", function () {
  let v = this.value.replace(/\D/g, "");
  if (v.length > 11) v = v.slice(0, 11);
  v = v.replace(/^(\d{2})(\d)/g, "($1) $2"); // DDD
  v = v.replace(/(\d{4,5})(\d{4})$/, "$1-$2");
  this.value = v;
});
telInput.addEventListener("keypress", function (e) {
  if (!/[0-9]/.test(String.fromCharCode(e.which))) e.preventDefault();
});

// --- VALIDAÇÕES LÓGICAS ---

function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, "");
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0,
    resto;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;

  return true;
}

function validarDataNascimento(dataStr) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dataStr)) return false;
  const [diaStr, mesStr, anoStr] = dataStr.split("/");
  const dia = parseInt(diaStr, 10);
  const mes = parseInt(mesStr, 10) - 1;
  const ano = parseInt(anoStr, 10);

  const data = new Date(ano, mes, dia);
  const hoje = new Date();

  if (
    data.getDate() !== dia ||
    data.getMonth() !== mes ||
    data.getFullYear() !== ano ||
    data > hoje
  ) {
    return false;
  }
  return true;
}

function calcularIdade(dataStr) {
  const [diaStr, mesStr, anoStr] = dataStr.split("/");
  const ano = parseInt(anoStr, 10);
  const mes = parseInt(mesStr, 10) - 1;
  const dia = parseInt(diaStr, 10);

  const hoje = new Date();
  let idade = hoje.getFullYear() - ano;
  const m = hoje.getMonth() - mes;

  if (m < 0 || (m === 0 && hoje.getDate() < dia)) {
    idade--;
  }
  return idade;
}

function validarCEP(cepStr) {
  const num = cepStr.replace(/\D/g, "");
  return /^\d{8}$/.test(num);
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// --- Integração VIACEP ---
const linkCEP = document.getElementById("link-cep");
const listaCEP = document.getElementById("lista-cep");

linkCEP.addEventListener("click", async function () {
  const uf = document.getElementById("estado").value;
  const cidade = document.getElementById("cidade").value.trim();
  const rua = document.getElementById("rua").value.trim();

  listaCEP.innerHTML = "";

  if (!uf || !cidade || rua.length < 3) {
    listaCEP.style.display = "block";
    listaCEP.innerHTML = `
            <div class="cep-item" style="color: #ff6b6b;">
              Preencha <b>Estado</b>, <b>Cidade</b> e pelo menos 3 letras da <b>Rua</b>.
            </div>`;
    return;
  }

  listaCEP.style.display = "block";
  listaCEP.innerHTML = '<div class="cep-item">Buscando...</div>';

  try {
    const url = `https://viacep.com.br/ws/${encodeURIComponent(uf)}/${encodeURIComponent(cidade)}/${encodeURIComponent(rua)}/json/`;
    const resp = await fetch(url);
    const data = await resp.json();

    listaCEP.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      listaCEP.innerHTML =
        '<div class="cep-item">Nenhum endereço encontrado.</div>';
      return;
    }

    data.forEach((item) => {
      const div = document.createElement("div");
      div.className = "cep-item";
      div.innerHTML = `<strong>${item.cep}</strong> ${item.logradouro}, ${item.bairro}`;

      div.addEventListener("click", () => {
        cepInput.value = item.cep;
        document.getElementById("bairro").value = item.bairro;
        document.getElementById("rua").value = item.logradouro;
        document.getElementById("cidade").value = item.localidade;
        document.getElementById("estado").value = item.uf;

        setErro("cep", "erro-cep", "");
        listaCEP.style.display = "none";
      });

      listaCEP.appendChild(div);
    });
  } catch (e) {
    listaCEP.innerHTML =
      '<div class="cep-item" style="color: #ff6b6b;">Erro ao conectar com ViaCEP.</div>';
  }
});

const senhaInput = document.getElementById("senha");
const requisitos = {
  tamanho: document.getElementById("req-tamanho"),
  maiuscula: document.getElementById("req-maiuscula"),
  minuscula: document.getElementById("req-minuscula"),
  numero: document.getElementById("req-numero"),
  especial: document.getElementById("req-especial"),
};

function atualizarRequisitosSenha(senha) {
  const checks = {
    tamanho: senha.length >= 8,
    maiuscula: /[A-Z]/.test(senha),
    minuscula: /[a-z]/.test(senha),
    numero: /\d/.test(senha),
    especial: /[^A-Za-z0-9]/.test(senha),
  };

  for (const [key, element] of Object.entries(requisitos)) {
    element.classList.toggle("invalido", !checks[key]);
  }
  return Object.values(checks).every(Boolean);
}

senhaInput.addEventListener("input", function () {
  atualizarRequisitosSenha(this.value);
});

document.querySelectorAll(".toggle-password").forEach((icon) => {
  icon.addEventListener("click", function () {
    const input = document.getElementById(this.dataset.target);
    const type =
      input.getAttribute("type") === "password" ? "text" : "password";
    input.setAttribute("type", type);
    this.style.color = type === "text" ? "#7e57c2" : "";
  });
});

// --- SUBMISSÃO DO FORMULÁRIO ---
document
  .getElementById("pagina-formulario")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    let valido = true;
    let primeiroErro = null;

    const campos = [
      "nome",
      "cpf",
      "dataNascimento",
      "telefone",
      "sexo",
      "rua",
      "numero",
      "bairro",
      "cep",
      "cidade",
      "estado",
      "apelido",
      "email",
      "senha",
      "confirmarSenha",
    ];

    campos.forEach((id) => {
      const el = document.getElementById(id);
      if (!el.value.trim()) {
        setErro(id, "erro-" + id, "Campo obrigatório.");
        valido = false;
        if (!primeiroErro) primeiroErro = el;
      } else {
        setErro(id, "erro-" + id, "");
      }
    });

    const cpfEl = document.getElementById("cpf");
    if (cpfEl.value && !validarCPF(cpfEl.value)) {
      setErro("cpf", "erro-cpf", "CPF inválido.");
      valido = false;
      if (!primeiroErro) primeiroErro = cpfEl;
    }

    const dtEl = document.getElementById("dataNascimento");
    if (dtEl.value && !validarDataNascimento(dtEl.value)) {
      setErro(
        "dataNascimento",
        "erro-dataNascimento",
        "Data inválida ou futura.",
      );
      valido = false;
      if (!primeiroErro) primeiroErro = dtEl;
    }

    const cepEl = document.getElementById("cep");
    if (cepEl.value && !validarCEP(cepEl.value)) {
      setErro("cep", "erro-cep", "CEP inválido.");
      valido = false;
      if (!primeiroErro) primeiroErro = cepEl;
    }

    const emailEl = document.getElementById("email");
    if (emailEl.value && !validarEmail(emailEl.value)) {
      setErro(
        "email",
        "erro-email",
        "E-mail inválido.",
      );
      valido = false;
      if (!primeiroErro) primeiroErro = emailEl;
    }

    const senhaEl = document.getElementById("senha");
    const confSenhaEl = document.getElementById("confirmarSenha");
    if (senhaEl.value !== confSenhaEl.value) {
      setErro("confirmarSenha", "erro-confirmarSenha", "Senhas não coincidem.");
      valido = false;
      if (!primeiroErro) primeiroErro = confSenhaEl;
    }

    if (senhaEl.value && !atualizarRequisitosSenha(senhaEl.value)) {
      setErro("senha", "erro-senha", "A senha não atende aos requisitos.");
      valido = false;
      if (!primeiroErro) primeiroErro = senhaEl;
    }

    if (valido) {
      const dadosUsuario = {
        apelido: document.getElementById("apelido").value,
        dataNascimento: document.getElementById("dataNascimento").value,
        idade: calcularIdade(document.getElementById("dataNascimento").value),
      };

      localStorage.setItem("dadosCadastro", JSON.stringify(dadosUsuario));
      window.location.href = "resultado.html";
    } else {
      if (primeiroErro) primeiroErro.focus();
    }
  });
