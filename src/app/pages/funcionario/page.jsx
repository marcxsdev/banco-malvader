"use client";
import { useState } from "react";
import HeaderFuncionario from "../../components/HeaderFuncionario";
import AsideFuncionario from "../../components/AsideFuncionario";

import AbrirConta from "../../components/aside/AbrirConta";
import FecharConta from "../../components/aside/FecharConta";
import ConsultarConta from "../../components/aside/ConsultarConta";
import AlterarConta from "../../components/aside/AlterarConta";
import Relatorios from "../../components/aside/Relatorios";

const Funcionario = () => {
  const [activeTab, setActiveTab] = useState("abrir");

  const renderConteudo = () => {
    switch (activeTab) {
      case "abrir":
        return <AbrirConta />;
      case "fechar":
        return <FecharConta />;
      case "consultar":
        return <ConsultarConta />;
      case "alterar":
        return <AlterarConta />;
      case "relatorios":
        return <Relatorios />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <HeaderFuncionario />
      <div className="flex flex-1 overflow-hidden">
        <AsideFuncionario activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-y-auto p-6 bg-white">
          {renderConteudo()}
        </main>
      </div>
    </div>
  );
};

export default Funcionario;
