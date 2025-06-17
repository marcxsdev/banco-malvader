"use client";
import { useState, useEffect } from "react";

import { FaFilePdf } from "react-icons/fa6";
import { RiFileExcel2Fill } from "react-icons/ri";

export default function Relatorios() {
  const [auditoria, setAuditoria] = useState([]);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    async function fetchAuditoria() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setMensagem("Faça login como funcionário");
          return;
        }
        const response = await fetch("/api/relatorio/auditoria", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setAuditoria(data.auditoria);
        } else {
          setMensagem(data.error || "Erro ao carregar auditoria");
        }
      } catch (error) {
        setMensagem("Erro ao conectar ao servidor");
      }
    }
    fetchAuditoria();
  }, []);

  const handleExportExcel = async () => {
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

  const handleExportPDF = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensagem("Faça login como funcionário");
        return;
      }
      const response = await fetch("/api/relatorio/auditoria/export", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
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
      a.download = "relatorio_auditoria.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setMensagem("Erro ao conectar ao servidor");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-semibold py-6">Relatório de Auditoria</h1>
      {mensagem && <p className="text-red-500 text-center mb-4">{mensagem}</p>}
      <div className="w-3/4 max-w-[800px]">
        <div className="flex gap-4 mb-4">
          <button
            onClick={handleExportExcel}
            className="bg-green-600 text-white font-bold text-lg py-2 px-4 rounded-xl flex flex-row items-center gap-2 hover:bg-green-700 transition duration-500 cursor-pointer"
          >
            <RiFileExcel2Fill />
            <span>Exportar para Excel</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="bg-red-600 text-white font-bold text-lg py-2 px-4 rounded-xl flex flex-row items-center gap-2 hover:bg-red-700 transition duration-500 cursor-pointer"
          >
            <FaFilePdf />
            <span>Exportar para PDF</span>
          </button>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">ID Usuário</th>
              <th className="border p-2">Ação</th>
              <th className="border p-2">Detalhes</th>
              <th className="border p-2">Data/Hora</th>
            </tr>
          </thead>
          <tbody>
            {auditoria.map((item) => (
              <tr key={item.id_auditoria} className="hover:bg-gray-50">
                <td className="border p-2">{item.id_usuario}</td>
                <td className="border p-2">{item.acao}</td>
                <td className="border p-2">{item.detalhes}</td>
                <td className="border p-2">
                  {new Date(item.data_hora).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
