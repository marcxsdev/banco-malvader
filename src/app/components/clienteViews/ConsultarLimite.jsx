"use client";
import { useState, useEffect } from "react";

const ConsultarLimite = () => {
  const [contas, setContas] = useState([]);
  const [numeroConta, setNumeroConta] = useState("");
  const [limite, setLimite] = useState(null);
  const [projecao, setProjecao] = useState(null);
  const [periodoProjecao, setPeriodoProjecao] = useState(null);
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

  const handleConsultar = async () => {
    setError("");
    setSuccess("");
    setLimite(null);
    setProjecao(null);
    setPeriodoProjecao(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/conta/limite?numero_conta=${numeroConta}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao consultar limite");
      }

      setLimite(data.limite_atual);
      setProjecao(data.projecao);
      setPeriodoProjecao(data.periodo_projecao);
      setSuccess("Consulta realizada com sucesso");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mt-4">
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <select
        name="numero_conta"
        value={numeroConta}
        onChange={(e) => setNumeroConta(e.target.value)}
        className="py-2 px-3 border rounded-lg mb-4"
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
        onClick={handleConsultar}
        className="bg-black text-white py-2.5 px-4 rounded-xl hover:bg-neutral-800 cursor-pointer"
        disabled={!numeroConta}
      >
        Consultar Limite Atual
      </button>
      {limite !== null && (
        <div className="mt-4 space-y-2">
          <p className="text-lg font-medium">
            Limite atual: <span className="font-bold">R${limite}</span>
          </p>
          <p className="text-lg font-medium">
            Projeção:{" "}
            <span className="font-bold">
              R${projecao} {periodoProjecao}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ConsultarLimite;
