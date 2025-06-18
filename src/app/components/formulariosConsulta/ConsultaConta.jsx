"use client";
import { useState } from "react";

const ConsultaConta = () => {
  const [numero, setNumero] = useState("");
  const [dados, setDados] = useState(null);
  const [error, setError] = useState(null);

  const handleBuscar = async (e) => {
    e.preventDefault();
    setError(null);
    setDados(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Você precisa estar autenticado.");
      return;
    }

    try {
      const response = await fetch("/api/funcionario/consultar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tipo: "CONTA", numero_conta: numero }),
      });

      const data = await response.json();
      if (data.success) {
        setDados(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor.");
    }
  };

  return (
    <div>
      <form onSubmit={handleBuscar} className="flex gap-2 mb-6 max-w-[700px]">
        <input
          type="text"
          placeholder="Digite o número da conta"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
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

      {error && <p className="text-red-600 mb-4">{error}</p>}
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
