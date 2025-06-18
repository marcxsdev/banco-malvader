"use client";
import { useState, useEffect } from "react";

import HeaderCliente from "@/app/components/HeaderCliente";
import Deposito from "@/app/components/clienteViews/Deposito";
import Saque from "@/app/components/clienteViews/Saque";
import Transferencia from "@/app/components/clienteViews/Transferencia";
import ConsultarLimite from "@/app/components/clienteViews/ConsultarLimite";
import Extrato from "@/app/components/clienteViews/Extrato";

import { FaArrowRight } from "react-icons/fa";
import { FaMoneyBillWave } from "react-icons/fa";
import { FaHandHoldingUsd } from "react-icons/fa";
import { FaExchangeAlt } from "react-icons/fa";
import { FaChartLine } from "react-icons/fa";

const Cliente = () => {
  const [formularioAtivo, setFormularioAtivo] = useState(null);
  const [contas, setContas] = useState([]);
  const [contaSelecionada, setContaSelecionada] = useState("");
  const [error, setError] = useState("");

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
          setContaSelecionada(data.contas[0].numero_conta);
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchContas();
  }, []);

  // Obter o saldo da conta selecionada
  const saldoAtual =
    contas.find((conta) => conta.numero_conta === contaSelecionada)?.saldo || 0;

  return (
    <div>
      <HeaderCliente />
      <div className="mt-8 flex justify-center items-center bg-gray-100">
        <div className="w-[1100px] h-[780px] border border-gray-300 rounded-xl bg-white shadow-md">
          <div className="px-5 mt-1.5">
            <button
              onClick={() => setFormularioAtivo("extrato")}
              className="w-full py-4 flex items-center justify-between px-5 cursor-pointer border-b "
            >
              <span className="text-xl font-bold">Extrato</span>
              <FaArrowRight size={20} />
            </button>
          </div>

          <div className="mx-5">
            <div className="mt-8">
              <p className="text-lg">Saldo em conta:</p>
              <p className="text-4xl font-bold">R${saldoAtual}</p>
              {error && <p className="text-red-500">{error}</p>}
              <select
                value={contaSelecionada}
                onChange={(e) => setContaSelecionada(e.target.value)}
                className="mt-2 py-2 px-3 border rounded-lg w-64 cursor-pointer"
              >
                <option value="">Selecione uma conta</option>
                {contas.map((conta) => (
                  <option key={conta.numero_conta} value={conta.numero_conta}>
                    {conta.numero_conta} ({conta.tipo_conta}, Saldo: R$
                    {conta.saldo})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-row gap-2 mt-4">
              <button
                onClick={() => setFormularioAtivo("deposito")}
                className="flex flex-row items-center gap-1.5 border border-black rounded-2xl px-4 py-0.5 cursor-pointer transition duration-800 hover:bg-black hover:text-white"
              >
                <FaMoneyBillWave size={24} />
                <span className="text-lg font-semibold">Depósito</span>
              </button>

              <button
                onClick={() => setFormularioAtivo("saque")}
                className="flex flex-row items-center gap-1.5 border border-black rounded-2xl px-4 py-0.5 cursor-pointer transition duration-800 hover:bg-black hover:text-white"
              >
                <FaHandHoldingUsd size={24} />
                <span className="text-lg font-semibold">Saque</span>
              </button>

              <button
                onClick={() => setFormularioAtivo("transferencia")}
                className="flex flex-row items-center gap-1.5 border border-black rounded-2xl px-4 py-0.5 cursor-pointer transition duration-800 hover:bg-black hover:text-white"
              >
                <FaExchangeAlt size={24} />
                <span className="text-lg font-semibold">Transferência</span>
              </button>

              <button
                onClick={() => setFormularioAtivo("limite")}
                className="flex flex-row items-center gap-1.5 border border-black rounded-2xl px-4 py-0.5 cursor-pointer transition duration-800 hover:bg-black hover:text-white"
              >
                <FaChartLine size={24} />
                <span className="text-lg font-semibold">Consultar Limite</span>
              </button>
            </div>
          </div>

          <div className="mx-5">
            {formularioAtivo === "deposito" && <Deposito />}
            {formularioAtivo === "saque" && <Saque />}
            {formularioAtivo === "transferencia" && <Transferencia />}
            {formularioAtivo === "limite" && <ConsultarLimite />}
            {formularioAtivo === "extrato" && <Extrato />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cliente;
