"use client";
import { useState } from "react";

const Deposito = () => {
  const [valor, setValor] = useState("");
  const [numeroConta, setNumeroConta] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      setNumeroConta("");
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
      <input
        type="text"
        name="numero_conta"
        placeholder="Número da Conta"
        value={numeroConta}
        onChange={(e) => setNumeroConta(e.target.value)}
        className="py-2 px-3 border rounded-lg"
        required
      />
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
