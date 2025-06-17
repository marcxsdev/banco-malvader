"use client";
import { useState, useEffect } from "react";

export default function Relatorios() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    async function fetchMovimentacoes() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setMensagem("Faça login como funcionário");
          return;
        }
        const response = await fetch("/api/relatorio/movimentacoes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setMovimentacoes(data.movimentacoes);
        } else {
          setMensagem(data.error || "Erro ao carregar movimentações");
        }
      } catch (error) {
        setMensagem("Erro ao conectar ao servidor");
      }
    }
    fetchMovimentacoes();
  }, []);

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensagem("Faça login como funcionário");
        return;
      }
      const response = await fetch("/api/relatorio/movimentacoes/export", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const data = await response.json();
        setMensagem(data.error || "Erro ao exportar relatório");
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "relatorio_movimentacoes.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setMensagem("Erro ao conectar ao servidor");
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-semibold py-6">
        Relatório de Movimentações
      </h1>
      {mensagem && <p className="text-red-500 text-center mb-4">{mensagem}</p>}
      <div className="w-3/4 max-w-[800px]">
        <button
          onClick={handleExport}
          className="bg-black text-white font-bold text-lg py-2 px-4 rounded-xl hover:bg-neutral-800 transition duration-500 mb-4 cursor-pointer"
        >
          Exportar para Excel
        </button>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">ID Transação</th>
              <th className="border p-2">Conta Origem</th>
              <th className="border p-2">Tipo</th>
              <th className="border p-2">Valor</th>
              <th className="border p-2">Data/Hora</th>
              <th className="border p-2">Cliente</th>
            </tr>
          </thead>
          <tbody>
            {movimentacoes.map((mov) => (
              <tr key={mov.id_transacao} className="hover:bg-gray-50">
                <td className="border p-2">{mov.id_transacao}</td>
                <td className="border p-2">{mov.numero_conta}</td>
                <td className="border p-2">{mov.tipo_transacao}</td>
                <td className="border p-2">R$ {mov.valor}</td>
                <td className="border p-2">
                  {new Date(mov.data_hora).toLocaleString()}
                </td>
                <td className="border p-2">{mov.cliente}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
