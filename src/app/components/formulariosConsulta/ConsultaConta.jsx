"use client";
import { useState } from "react";

const ConsultaConta = () => {
  const [cpf, setCpf] = useState("");
  const [dados, setDados] = useState(null);

  const handleBuscar = (e) => {
    e.preventDefault();
    // chamada da API
  };

  return (
    <div>
      <form onSubmit={handleBuscar} className="flex gap-2 mb-6 max-w-[700px]">
        <input
          type="text"
          placeholder="Digite o CPF do cliente"
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
            <strong>Tipo:</strong> {dados.tipo}
          </p>
          <p>
            <strong>Nome:</strong> {dados.nome}
          </p>
          <p>
            <strong>CPF:</strong> {dados.cpf}
          </p>
          <p>
            <strong>Saldo atual:</strong> R$ {dados.saldo}
          </p>
          <p>
            <strong>Limite disponível:</strong> R$ {dados.limite}
          </p>
          <p>
            <strong>Data de vencimento:</strong> {dados.vencimento}
          </p>
          <p>
            <strong>Projeção de rendimentos:</strong> R${" "}
            {dados.rendimentoPrevisto}
          </p>

          <div>
            <p className="font-semibold">Histórico (últimos 90 dias):</p>
            <ul className="list-disc ml-4">
              {dados.historico.map((item, i) => (
                <li key={i}>
                  {item.data} - {item.tipo}: R$ {item.valor}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultaConta;
