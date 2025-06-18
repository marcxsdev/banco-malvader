"use client";
import { useState } from "react";

const AlterarConta = () => {
  const [accountNumber, setAccountNumber] = useState("");
  const [conta, setConta] = useState(null);
  const [limite, setLimite] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [taxa, setTaxa] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleBuscar = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setConta(null);

    try {
      const response = await fetch("/api/funcionario/consultar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ tipo: "CONTA", numero_conta: accountNumber }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar conta");
      }
      setConta(data.data);
      setLimite(data.data.limite || "");
      setDataVencimento(
        data.data.vencimento !== "N/A" ? data.data.vencimento : ""
      );
      setTaxa("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAlterar = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const body = {
        tipo: "CONTA",
        numero_conta: accountNumber,
        ...(limite && { limite: parseFloat(limite) }),
        ...(dataVencimento &&
          conta.tipo === "CORRENTE" && { data_vencimento: dataVencimento }),
        ...(taxa && { taxa: parseFloat(taxa) }),
      };

      const response = await fetch("/api/funcionario/alterar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao alterar conta");
      }
      setSuccess("Conta alterada com sucesso!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleBuscar} className="flex gap-2 mb-6 max-w-[700px]">
        <input
          type="text"
          placeholder="Digite o número da conta"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
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

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      {conta && (
        <form onSubmit={handleAlterar} className="max-w-[700px]">
          <div className="mb-4">
            <label className="block mb-1">Tipo: {conta.tipo}</label>
          </div>
          {conta.tipo === "CORRENTE" && (
            <>
              <div className="mb-4">
                <label className="block mb-1">Limite (R$)</label>
                <input
                  type="number"
                  value={limite}
                  onChange={(e) => setLimite(e.target.value)}
                  className="w-full border rounded-lg py-1.5 px-2"
                  placeholder="Novo limite"
                  step="0.01"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Data de Vencimento</label>
                <input
                  type="date"
                  value={dataVencimento}
                  onChange={(e) => setDataVencimento(e.target.value)}
                  className="w-full border rounded-lg py-1.5 px-2"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Taxa de Manutenção (%)</label>
                <input
                  type="number"
                  value={taxa}
                  onChange={(e) => setTaxa(e.target.value)}
                  className="w-full border rounded-lg py-1.5 px-2"
                  placeholder="Nova taxa"
                  step="0.01"
                />
              </div>
            </>
          )}
          {["POUPANCA", "INVESTIMENTO"].includes(conta.tipo) && (
            <div className="mb-4">
              <label className="block mb-1">Taxa de Rendimento (%)</label>
              <input
                type="number"
                value={taxa}
                onChange={(e) => setTaxa(e.target.value)}
                className="w-full border rounded-lg py-1.5 px-2"
                placeholder="Nova taxa"
                step="0.01"
              />
            </div>
          )}
          <button
            type="submit"
            className="bg-black text-white px-4 rounded-lg hover:bg-neutral-800 transition cursor-pointer"
          >
            Alterar
          </button>
        </form>
      )}
    </div>
  );
};

export default AlterarConta;
