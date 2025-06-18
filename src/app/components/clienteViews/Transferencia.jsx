"use client";
import { useState, useEffect } from "react";

const Transferencia = () => {
  const [valor, setValor] = useState("");
  const [numeroContaOrigem, setNumeroContaOrigem] = useState("");
  const [numeroContaDestino, setNumeroContaDestino] = useState("");
  const [contas, setContas] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchContas = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/buscar_conta", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Erro ao listar contas");
        }

        setContas(data.contas);
        if (data.contas.length > 0) {
          setNumeroContaOrigem(data.contas[0].numero_conta);
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchContas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/transacao/transferencia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          valor,
          numero_conta_origem: numeroContaOrigem,
          numero_conta_destino: numeroContaDestino,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao realizar transferência");
      }

      setSuccess(data.message);
      setValor("");
      setNumeroContaDestino("");
      setNumeroContaOrigem(contas[0]?.numero_conta || "");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4 max-w-md">
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <select
        name="numero_conta_origem"
        value={numeroContaOrigem}
        onChange={(e) => setNumeroContaOrigem(e.target.value)}
        className="py-2 px-3 border rounded-lg"
        required
      >
        <option value="">Selecione a conta de origem</option>
        {contas.map((conta) => (
          <option key={conta.numero_conta} value={conta.numero_conta}>
            {conta.numero_conta} ({conta.tipo_conta}, Saldo: R$
            {conta.saldo})
          </option>
        ))}
      </select>
      <input
        type="text"
        name="numero_conta_destino"
        placeholder="Conta de destino"
        value={numeroContaDestino}
        onChange={(e) => setNumeroContaDestino(e.target.value)}
        className="py-2 px-3 border rounded-lg"
        required
      />
      <input
        type="number"
        name="valor"
        placeholder="Valor da Transferência (R$)"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className="py-2 px-3 border rounded-lg no-spinner"
        required
      />
      <button
        type="submit"
        className="bg-black text-white py-2.5 px-4 rounded-xl hover:bg-neutral-800 cursor-pointer"
      >
        Confirmar Transferência
      </button>
    </form>
  );
};

export default Transferencia;
