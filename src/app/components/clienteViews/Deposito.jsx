"use client";
import { useState, useEffect } from "react";

const Deposito = () => {
  const [valor, setValor] = useState("");
  const [numeroConta, setNumeroConta] = useState("");
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
          setNumeroConta(data.contas[0].numero_conta);
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
      const response = await fetch("/api/transacao/deposito", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ valor, numero_conta: numeroConta }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao realizar depósito");
      }

      setSuccess(data.message);
      setValor("");
      setNumeroConta(contas[0]?.numero_conta || "");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4 max-w-md">
      <p className="text-sm text-gray-600 mt-1 mb-[-0.5rem]">
        Limite diário de R$10.000*
      </p>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <input
        type="number"
        name="valor"
        placeholder="Valor do Depósito (R$)"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className="py-2 px-3 border rounded-lg no-spinner"
        required
      />
      <select
        name="numero_conta"
        value={numeroConta}
        onChange={(e) => setNumeroConta(e.target.value)}
        className="py-2 px-3 border rounded-lg"
        required
      >
        <option value="">Selecione uma conta</option>
        {contas.map((conta) => (
          <option key={conta.numero_conta} value={conta.numero_conta}>
            {conta.numero_conta} ({conta.tipo_conta}, Saldo: R$
            {conta.saldo})
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="bg-black text-white py-2.5 px-4 rounded-xl hover:bg-neutral-800 cursor-pointer"
      >
        Confirmar Depósito
      </button>
    </form>
  );
};

export default Deposito;
