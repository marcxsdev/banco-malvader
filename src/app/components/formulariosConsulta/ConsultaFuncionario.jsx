"use client";
import { useState } from "react";

const ConsultaFuncionario = () => {
  const [cpf, setCpf] = useState("");
  const [dados, setDados] = useState(null);

  const handleBuscar = (e) => {
    e.preventDefault();
    // chamda da API
  };

  return (
    <div>
      <form onSubmit={handleBuscar} className="flex gap-2 mb-6 max-w-[700px]">
        <input
          type="text"
          placeholder="Digite o CPF do funcionário"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          className="flex-1 border rounded-lg py-1.5 px-2"
          required
        />
        <button
          type="submit"
          className="bg-black text-white px-4 rounded-lg hover:bg-neutral-800 transition cursor-pointer"
        >
          Buscar
        </button>
      </form>

      {dados && (
        <div className="space-y-2 text-sm">
          <p>
            <strong>Nome:</strong> {dados.nome}
          </p>
          <p>
            <strong>CPF:</strong> {dados.cpf}
          </p>
          <p>
            <strong>Cargo:</strong> {dados.cargo}
          </p>
          <p>
            <strong>Data de Nascimento:</strong> {dados.nascimento}
          </p>
          <p>
            <strong>Telefone:</strong> {dados.telefone}
          </p>
          <p>
            <strong>Endereço:</strong> {dados.endereco}
          </p>
          <p>
            <strong>Contas abertas:</strong> {dados.contasAbertas}
          </p>
          <p>
            <strong>Desempenho:</strong> {dados.desempenho}
          </p>
        </div>
      )}
    </div>
  );
};

export default ConsultaFuncionario;
