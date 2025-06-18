"use client";
import { useState } from "react";

const ConsultaCliente = () => {
  const [cpf, setCpf] = useState("");
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
        body: JSON.stringify({ tipo: "CLIENTE", cpf }),
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

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {dados && (
        <div className="space-y-2 text-sm">
          <p>
            <strong>Nome:</strong> {dados.nome}
          </p>
          <p>
            <strong>CPF:</strong> {dados.cpf}
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
            <strong>Score de Crédito:</strong> {dados.score}
          </p>

          <div>
            <p className="font-semibold">Contas:</p>
            <ul className="list-disc ml-4">
              {dados.contas.map((conta, index) => (
                <li key={index}>
                  {conta.tipo} - {conta.status}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultaCliente;
