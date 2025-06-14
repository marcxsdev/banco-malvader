"use client";
import { useState } from "react";

import AlterarConta from "../formulariosAlterar/AlterarConta";
import AlterarCliente from "../formulariosAlterar/AlterarCliente";
import AlterarFuncionario from "../formulariosAlterar/AlterarFuncionario";

const AlterarDados = () => {
  const [selectedOption, setSelectedOption] = useState("CONTA");

  return (
    <div>
      <h1 className="text-2xl font-bold">Alterar dados:</h1>

      <div className="w-3/4 max-w-[700px] flex mt-4">
        <button
          type="button"
          onClick={() => setSelectedOption("CONTA")}
          className={`w-1/2 py-2 text-center transition border-b-2 cursor-pointer ${
            selectedOption === "CONTA" ? "border-black" : "border-transparent"
          }`}
        >
          Conta
        </button>
        <button
          type="button"
          onClick={() => setSelectedOption("FUNCIONARIO")}
          className={`w-1/2 py-2 text-center transition border-b-2 cursor-pointer ${
            selectedOption === "FUNCIONARIO"
              ? "border-black"
              : "border-transparent"
          }`}
        >
          Funcionário
        </button>
        <button
          type="button"
          onClick={() => setSelectedOption("CLIENTE")}
          className={`w-1/2 py-2 text-center transition border-b-2 cursor-pointer ${
            selectedOption === "CLIENTE" ? "border-black" : "border-transparent"
          }`}
        >
          Cliente
        </button>
      </div>

      <div className="mt-6">
        {selectedOption === "CONTA" && <AlterarConta />}
        {selectedOption === "FUNCIONARIO" && <AlterarFuncionario />}
        {selectedOption === "CLIENTE" && <AlterarCliente />}
      </div>
    </div>
  );
};

export default AlterarDados;
