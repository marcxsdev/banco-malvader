"use client";
import { FaUserCircle } from "react-icons/fa";
import Image from "next/image";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AsideFuncionario = ({ activeTab, setActiveTab }) => {
  const [cargo, setCargo] = useState("Carregando...");
  const [isGerente, setIsGerente] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const funcionarioData = async () => {
          const response = await fetch("/api/funcionario/perfil", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          if (data.success) {
            setCargo(data.cargo);
            setIsGerente(data.cargo === "GERENTE");
          } else {
            setCargo("Funcionário");
          }
        };
        funcionarioData();
      } catch (error) {
        setCargo("Funcionário");
      }
    } else {
      setCargo("Funcionário");
    }
  }, []);

  const tabs = [
    { label: "Abrir Conta", key: "abrir" },
    { label: "Fechar Conta", key: "fechar" },
    { label: "Consultar Dados", key: "consultar" },
    { label: "Alterar Dados", key: "alterar" },
    ...(isGerente
      ? [{ label: "Cadastrar Funcionário", key: "funcionario" }]
      : []),
    { label: "Relatórios", key: "relatorios" },
  ];

  return (
    <aside className="w-64 h-full bg-gray-100 flex flex-col justify-between p-4 border-r border-gray-300">
      <div className="flex flex-col gap-6">
        <div className="flex flex-row items-center gap-2">
          <FaUserCircle size={28} />
          <span className="text-lg font-medium">{cargo}</span>
        </div>
        <div className="flex flex-col gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`text-left px-3 py-2 rounded-md font-medium cursor-pointer transition 
              ${
                activeTab === tab.key
                  ? "bg-black text-white"
                  : "hover:bg-gray-200 text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <Image
        src="/assets/banco-malvader-logo.png"
        alt="Logo Banco Malvader"
        width={180}
        height={60}
      />
    </aside>
  );
};

export default AsideFuncionario;
