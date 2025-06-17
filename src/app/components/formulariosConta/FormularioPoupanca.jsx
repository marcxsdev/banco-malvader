"use client";
import { useState } from "react";

const FormularioPoupanca = () => {
  const [formData, setFormData] = useState({
    agencia: "",
    numero_conta: "",
    nome: "",
    cpf: "",
    data_nascimento: "",
    telefone: "",
    senha: "",
    taxa_rendimento: "",
    endereco: {
      cep: "",
      local: "",
      numero_casa: "",
      bairro: "",
      cidade: "",
      estado: "",
      complemento: "",
    },
  });
  const [mensagem, setMensagem] = useState("");

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

  const formatCpf = (value) => {
    value = value.replace(/\D/g, "");
    value = value.slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return value;
  };

  const handleCpfChange = (e) => {
    const formatted = formatCpf(e.target.value);
    setFormData((prev) => ({ ...prev, cpf: formatted }));
  };

  const formatTelefone = (value) => {
    value = value.replace(/\D/g, "");
    value = value.slice(0, 11);
    value = value.replace(/(\d{2})(\d)/, "($1) $2");
    value = value.replace(/(\d{5})(\d)/, "$1-$2");
    return value;
  };

  const handleTelefoneChange = (e) => {
    const formatted = formatTelefone(e.target.value);
    setFormData((prev) => ({ ...prev, telefone: formatted }));
  };

  const formatCep = (value) => {
    value = value.replace(/\D/g, "");
    value = value.slice(0, 8);
    value = value.replace(/(\d{5})(\d)/, "$1-$2");
    return value;
  };

  const handleCepChange = (e) => {
    const formatted = formatCep(e.target.value);
    setFormData((prev) => ({
      ...prev,
      endereco: { ...prev.endereco, cep: formatted },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setMensagem("Você precisa estar logado como funcionário");
      return;
    }

    const payload = {
      ...formData,
      cpf: formData.cpf.replace(/\D/g, ""),
      telefone: formData.telefone.replace(/\D/g, ""),
      tipo_conta: "POUPANCA",
    };

    console.log("Dados enviados:", payload);

    try {
      const response = await fetch("/api/funcionario/abrir_conta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        setMensagem("Conta Poupança criada com sucesso!");
        setFormData({
          agencia: "",
          numero_conta: "",
          nome: "",
          cpf: "",
          data_nascimento: "",
          telefone: "",
          senha: "",
          taxa_rendimento: "",
          endereco: {
            cep: "",
            local: "",
            numero_casa: "",
            bairro: "",
            cidade: "",
            estado: "",
            complemento: "",
          },
        });
      } else {
        setMensagem(data.error || "Erro ao criar conta");
      }
    } catch (error) {
      setMensagem("Erro ao conectar ao servidor");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4 max-w-lg">
      <input
        type="text"
        name="agencia"
        placeholder="Agência"
        value={formData.agencia}
        onChange={handleChange}
        className="py-1.5 px-2 border rounded-lg cursor-text max-w-lg"
        required
      />
      <input
        type="text"
        name="numero_conta"
        placeholder="Número da Conta"
        value={formData.numero_conta}
        onChange={handleChange}
        className="py-1.5 px-2 border rounded-lg cursor-text max-w-lg"
        required
      />
      <input
        type="text"
        name="nome"
        placeholder="Nome completo"
        value={formData.nome}
        onChange={handleChange}
        className="py-1.5 px-2 border rounded-lg cursor-text max-w-lg"
        required
      />
      <input
        type="text"
        name="cpf"
        placeholder="CPF"
        value={formData.cpf}
        onChange={handleCpfChange}
        className="py-1.5 px-2 border rounded-lg cursor-text max-w-lg"
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
        type="text"
        name="telefone"
        placeholder="Telefone"
        value={formData.telefone}
        onChange={handleTelefoneChange}
        className="py-1.5 px-2 border rounded-lg cursor-text max-w-lg"
        required
      />
      <input
        type="text"
        name="endereco.cep"
        placeholder="CEP"
        value={formData.endereco.cep}
        onChange={handleCepChange}
        className="py-1.5 px-2 border rounded-lg cursor-text max-w-lg"
        required
      />
      <input
        type="text"
        name="endereco.local"
        placeholder="Logradouro"
        value={formData.endereco.local}
        onChange={handleChange}
        className="py-1.5 px-2 border rounded-lg cursor-text max-w-lg"
        required
      />
      <input
        type="number"
        name="endereco.numero_casa"
        placeholder="Número"
        value={formData.endereco.numero_casa}
        onChange={handleChange}
        className="py-1.5 px-2 border rounded-lg cursor-text max-w-lg"
        required
      />
      <input
        type="text"
        name="endereco.bairro"
        placeholder="Bairro"
        value={formData.endereco.bairro}
        onChange={handleChange}
        className="py-1.5 px-2 border rounded-lg cursor-text max-w-lg"
        required
      />
      <input
        type="text"
        name="endereco.cidade"
        placeholder="Cidade"
        value={formData.endereco.cidade}
        onChange={handleChange}
        className="py-1.5 px-2 border rounded-lg cursor-text max-w-lg"
        required
      />
      <input
        type="text"
        name="endereco.estado"
        placeholder="Estado (ex.: DF)"
        value={formData.endereco.estado}
        onChange={handleChange}
        className="py-1.5 px-2 border rounded-lg cursor-text max-w-lg"
        required
      />
      <input
        type="text"
        name="endereco.complemento"
        placeholder="Complemento (opcional)"
        value={formData.endereco.complemento}
        onChange={handleChange}
        className="py-1.5 px-2 border rounded-lg cursor-text max-w-lg"
      />
      <input
        type="password"
        name="senha"
        placeholder="Senha"
        value={formData.senha}
        onChange={handleChange}
        className="py-1.5 px-2 border rounded-lg cursor-text max-w-lg"
        required
      />
      <input
        type="number"
        name="taxa_rendimento"
        placeholder="Taxa de Rendimento (%)"
        step="0.01"
        value={formData.taxa_rendimento}
        onChange={handleChange}
        className="py-1.5 px-2 border rounded-lg cursor-text max-w-lg no-spinner"
        required
      />
      <button
        type="submit"
        className="bg-black text-white py-2.5 px-4 rounded-xl cursor-pointer hover:bg-neutral-800 transition duration-300"
      >
        Criar Conta Poupança
      </button>
      {mensagem && <p className="text-center mt-4 text-red-500">{mensagem}</p>}
    </form>
  );
};

export default FormularioPoupanca;
