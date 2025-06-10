"use client";
import { useState } from "react";

const FormularioPoupanca = () => {
  const [formData, setFormData] = useState({
    agencia: "",
    numeroConta: "",
    nome: "",
    cpf: "",
    dataNascimento: "",
    telefone: "",
    endereco: "",
    senha: "",
    taxaRendimento: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dados enviados:", formData);
    // envio via API
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 mt-4 max-w-lg">
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
        name="numeroConta"
        placeholder="Número da Conta"
        value={formData.numeroConta}
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
        onChange={handleChange}
        className="py-1.5 px-2 border rounded-lg cursor-text max-w-lg"
        required
      />
      <input
        type="date"
        name="dataNascimento"
        placeholder="Data de Nascimento"
        value={formData.dataNascimento}
        onChange={handleChange}
        className="py-1.5 px-2 border rounded-lg cursor-text max-w-lg"
        required
      />
      <input
        type="tel"
        name="telefone"
        placeholder="Telefone"
        value={formData.telefone}
        onChange={handleChange}
        className="py-1.5 px-2 border rounded-lg cursor-text max-w-lg"
        required
      />
      <input
        type="text"
        name="endereco"
        placeholder="Endereço completo"
        value={formData.endereco}
        onChange={handleChange}
        className="py-1.5 px-2 border rounded-lg cursor-text max-w-lg"
        required
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
        name="taxaRendimento"
        placeholder="Taxa de Rendimento (%)"
        step="0.01"
        value={formData.taxaRendimento}
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
    </form>
  );
};

export default FormularioPoupanca;
