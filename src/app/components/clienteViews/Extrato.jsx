"use client";
import { useState, useEffect } from "react";
import { FaFilePdf } from "react-icons/fa6";
import { RiFileExcel2Fill } from "react-icons/ri";

const Extrato = () => {
  const [transacoes, setTransacoes] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchExtrato = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/transacao/extrato", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Erro ao consultar extrato");
        }

        setTransacoes(data.transacoes);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchExtrato();
  }, []);

  const handleExport = async (format) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/transacao/extrato/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ format }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao exportar extrato");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = format === "excel" ? "extrato.xlsx" : "extrato.pdf";
      a.click();
      window.URL.revokeObjectURL(url);

      setSuccess(`Extrato exportado com sucesso em ${format.toUpperCase()}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mt-4">
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => handleExport("excel")}
          className="bg-green-600 text-white font-bold text-lg py-2 px-4 rounded-xl flex flex-row items-center gap-2 hover:bg-green-700 transition duration-500 cursor-pointer"
        >
          <RiFileExcel2Fill />
          <span>Exportar para Excel</span>
        </button>
        <button
          onClick={() => handleExport("pdf")}
          className="bg-red-600 text-white font-bold text-lg py-2 px-4 rounded-xl flex flex-row items-center gap-2 hover:bg-red-700 transition duration-500 cursor-pointer"
        >
          <FaFilePdf />
          <span>Exportar para PDF</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Conta
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Tipo
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Valor
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Data/Hora
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Descrição
              </th>
            </tr>
          </thead>
          <tbody>
            {transacoes.map((transacao) => (
              <tr key={transacao.id_transacao}>
                <td className="border border-gray-300 px-4 py-2">
                  {transacao.id_transacao}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {transacao.numero_conta}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {transacao.tipo_transacao}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  R$ {transacao.valor}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(transacao.data_hora).toLocaleString("pt-BR")}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {transacao.descricao}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Extrato;
