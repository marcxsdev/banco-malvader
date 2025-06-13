"use client";
import { useState } from "react";

const FormularioCorrente = () => {
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
    limiteDinamico: "",
    dataVencimento: "",
    taxaManutencao: "",
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
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 mt-4 max-w-lg w-full"
    >
      <input
        type="text"
        name="agencia"
        placeholder="Agência"
        value={formData.agencia}
        onChange={handleChange}
        className="py-1.5 px-2 border rounded-lg"
        required
      />
      <input
        type="text"
        name="numeroConta"
        placeholder="Número da Conta"
        value={formData.numeroConta}
        onChange={handleChange}
        className="py-1.5 px-2 border rounded-lg"
        required
      />
      <input
        type="text"
        name="nome"
        placeholder="Nome completo"
        value={formData.nome}
        onChange={handleChange}
        className="py-1.5 px-2 border rounded-lg"
        required
      />
      <input
        type="text"
        name="cpf"
        placeholder="CPF"
        value={formData.cpf}
        onChange={handleChange}
        className="py-1.5 px-2 border rounded-lg"
        required
      />

      <div className="relative">
        <input
          type="date"
          id="dataNascimento"
          name="dataNascimento"
          value={formData.dataNascimento}
          onChange={handleChange}
          className="peer py-1.5 px-2 border rounded-lg w-full text-gray-900 placeholder-transparent"
          required
        />
        <label
          htmlFor="dataNascimento"
          className={`absolute left-2 top-1.5 text-gray-500 text-sm transition-all cursor-pointer peer-placeholder-shown:top-1.5 peer-placeholder-shown:text-sm peer-focus:top-[-0.6rem] peer-focus:text-xs bg-white px-1 ${
            formData.dataNascimento ? "top-[-0.6rem] text-xs" : ""
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
        className="py-1.5 px-2 border rounded-lg"
        required
      />
      <input
        type="text"
        name="endereco"
        placeholder="Endereço completo"
        value={formData.endereco}
        onChange={handleChange}
        className="py-1.5 px-2 border rounded-lg"
        required
      />
      <input
        type="password"
        name="senha"
        placeholder="Senha"
        value={formData.senha}
        onChange={handleChange}
        className="py-1.5 px-2 border rounded-lg"
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
      <input
        type="number"
        name="limiteDinamico"
        placeholder="Limite Dinâmico (R$)"
        value={formData.limiteDinamico}
        onChange={handleChange}
        className="py-1.5 px-2 border rounded-lg no-spinner"
        required
      />

      <div className="relative">
        <input
          type="date"
          id="dataVencimento"
          name="dataVencimento"
          value={formData.dataVencimento}
          onChange={handleChange}
          className="peer py-1.5 px-2 border rounded-lg w-full text-gray-900 placeholder-transparent"
          required
        />
        <label
          htmlFor="dataVencimento"
          className={`absolute left-2 top-1.5 text-gray-500 text-sm transition-all cursor-pointer peer-placeholder-shown:top-1.5 peer-placeholder-shown:text-sm peer-focus:top-[-0.6rem] peer-focus:text-xs bg-white px-1 ${
            formData.dataVencimento ? "top-[-0.6rem] text-xs" : ""
          }`}
        >
          Data de Vencimento
        </label>
      </div>

      <input
        type="number"
        name="taxaManutencao"
        placeholder="Taxa de Manutenção (%)"
        step="0.01"
        value={formData.taxaManutencao}
        onChange={handleChange}
        className="py-1.5 px-2 border rounded-lg no-spinner"
        required
      />

      <button
        type="submit"
        className="bg-black text-white py-2.5 px-4 rounded-xl cursor-pointer hover:bg-neutral-800 transition duration-300"
      >
        Criar Conta Corrente
      </button>
    </form>
  );
};

export default FormularioCorrente;
