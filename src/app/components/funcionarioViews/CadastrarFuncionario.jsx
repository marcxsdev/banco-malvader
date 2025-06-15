"use client";
import { useState } from "react";

const CadastrarFuncionario = () => {
  const [formData, setFormData] = useState({
    codigo: "",
    cargo: "",
    nome: "",
    cpf: "",
    dataNascimento: "",
    telefone: "",
    endereco: "",
    senha: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Funcionário cadastrado:", formData);
    // envio via API
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
          name="codigo"
          placeholder="Código do Funcionário"
          value={formData.codigo}
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
          <option value="estagiario">Estagiário</option>
          <option value="atendente">Atendente</option>
          <option value="gerente">Gerente</option>
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
          className="py-1.5 px-2 border rounded-lg cursor-text"
          required
        />
        <input
          type="text"
          name="endereco"
          placeholder="Endereço completo"
          value={formData.endereco}
          onChange={handleChange}
          className="py-1.5 px-2 border rounded-lg cursor-text"
          required
        />
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
    </div>
  );
};

export default CadastrarFuncionario;
