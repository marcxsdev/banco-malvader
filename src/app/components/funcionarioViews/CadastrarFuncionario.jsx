"use client";
import { useState, useEffect } from "react";

const CadastrarFuncionario = () => {
  const [formData, setFormData] = useState({
    codigo_funcionario: "",
    cargo: "",
    nome: "",
    cpf: "",
    data_nascimento: "",
    telefone: "",
    endereco: {
      cep: "",
      local: "",
      numero_casa: "",
      bairro: "",
      cidade: "",
      estado: "",
      complemento: "",
    },
    senha: "",
    id_supervisor: "",
  });
  const [gerentes, setGerentes] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchGerentes = async () => {
      try {
        const response = await fetch("/api/funcionario/consultar_gerentes", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Erro ao buscar gerentes");
        }
        setGerentes(data.gerentes);
      } catch (err) {
        console.error("Erro ao carregar gerentes:", err);
      }
    };
    fetchGerentes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("endereco.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        endereco: { ...prev.endereco, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/funcionario/cadastrar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao cadastrar funcionário");
      }
      setSuccess("Funcionário cadastrado com sucesso!");
      setFormData({
        codigo_funcionario: "",
        cargo: "",
        nome: "",
        cpf: "",
        data_nascimento: "",
        telefone: "",
        endereco: {
          cep: "",
          local: "",
          numero_casa: "",
          bairro: "",
          cidade: "",
          estado: "",
          complemento: "",
        },
        senha: "",
        id_supervisor: "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="">
      <h1 className="text-2xl font-bold">Cadastrar funcionário:</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 mt-4 max-w-lg"
      >
        <input
          type="text"
          name="codigo_funcionario"
          placeholder="Código do Funcionário"
          value={formData.codigo_funcionario}
          onChange={handleChange}
          className="py-1.5 px-2 border rounded-lg cursor-text"
          required
        />
        <select
          name="cargo"
          value={formData.cargo}
          onChange={handleChange}
          className="py-1.5 px-2 border rounded-lg cursor-pointer"
          required
        >
          <option value="" disabled>
            Selecione o cargo
          </option>
          <option value="ESTAGIARIO">Estagiário</option>
          <option value="ATENDENTE">Atendente</option>
          <option value="GERENTE">Gerente</option>
        </select>
        <input
          type="text"
          name="nome"
          placeholder="Nome completo"
          value={formData.nome}
          onChange={handleChange}
          className="py-1.5 px-2 border rounded-lg cursor-text"
          required
        />
        <input
          type="text"
          name="cpf"
          placeholder="CPF"
          value={formData.cpf}
          onChange={handleChange}
          className="py-1.5 px-2 border rounded-lg cursor-text"
          required
        />
        <div className="relative">
          <input
            type="date"
            id="data_nascimento"
            name="data_nascimento"
            value={formData.data_nascimento}
            onChange={handleChange}
            className="peer py-1.5 px-2 border rounded-lg w-full text-gray-900 placeholder-transparent"
            required
          />
          <label
            htmlFor="data_nascimento"
            className={`absolute left-2 top-1.5 text-gray-500 text-sm transition-all cursor-pointer peer-placeholder-shown:top-1.5 peer-placeholder-shown:text-sm peer-focus:top-[-0.6rem] peer-focus:text-xs bg-white px-1 ${
              formData.data_nascimento ? "top-[-0.6rem] text-xs" : ""
            }`}
          >
            Data de Nascimento
          </label>
        </div>
        <input
          type="tel"
          name="telefone"
          placeholder="Telefone"
          value={formData.telefone}
          onChange={handleChange}
          className="py-1.5 px-2 border rounded-lg cursor-text"
          required
        />
        <input
          type="text"
          name="endereco.cep"
          placeholder="CEP"
          value={formData.endereco.cep}
          onChange={handleChange}
          className="py-1.5 px-2 border rounded-lg cursor-text"
          required
        />
        <input
          type="text"
          name="endereco.local"
          placeholder="Logradouro"
          value={formData.endereco.local}
          onChange={handleChange}
          className="py-1.5 px-2 border rounded-lg cursor-text"
          required
        />
        <input
          type="number"
          name="endereco.numero_casa"
          placeholder="Número"
          value={formData.endereco.numero_casa}
          onChange={handleChange}
          className="py-1.5 px-2 border rounded-lg cursor-text"
          required
        />
        <input
          type="text"
          name="endereco.bairro"
          placeholder="Bairro"
          value={formData.endereco.bairro}
          onChange={handleChange}
          className="py-1.5 px-2 border rounded-lg cursor-text"
          required
        />
        <input
          type="text"
          name="endereco.cidade"
          placeholder="Cidade"
          value={formData.endereco.cidade}
          onChange={handleChange}
          className="py-1.5 px-2 border rounded-lg cursor-text"
          required
        />
        <input
          type="text"
          name="endereco.estado"
          placeholder="Estado (ex.: DF)"
          value={formData.endereco.estado}
          onChange={handleChange}
          className="py-1.5 px-2 border rounded-lg cursor-text"
          maxLength={2}
          required
        />
        <input
          type="text"
          name="endereco.complemento"
          placeholder="Complemento (opcional)"
          value={formData.endereco.complemento}
          onChange={handleChange}
          className="py-1.5 px-2 border rounded-lg cursor-text"
        />
        <select
          name="id_supervisor"
          value={formData.id_supervisor}
          onChange={handleChange}
          className="py-1.5 px-2 border rounded-lg cursor-pointer"
        >
          <option value="">Sem supervisor</option>
          {gerentes.map((gerente) => (
            <option key={gerente.id_funcionario} value={gerente.id_funcionario}>
              {gerente.nome}
            </option>
          ))}
        </select>
        <input
          type="password"
          name="senha"
          placeholder="Senha"
          value={formData.senha}
          onChange={handleChange}
          className="py-1.5 px-2 border rounded-lg cursor-text"
          required
        />
        <button
          type="submit"
          className="bg-black text-white py-2.5 px-4 rounded-xl cursor-pointer hover:bg-neutral-800 transition duration-300"
        >
          Cadastrar Funcionário
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-500 mt-4">{success}</p>}
    </div>
  );
};

export default CadastrarFuncionario;
