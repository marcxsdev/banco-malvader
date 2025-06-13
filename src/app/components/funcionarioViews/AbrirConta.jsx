"use client";
import { useState } from "react";

import FormularioPoupanca from "../formulariosConta/FormularioPoupanca";
import FormularioCorrente from "../formulariosConta/FormularioCorrente";
import FormularioInvestimento from "../formulariosConta/FormularioInvestimento";

const AbrirConta = () => {
  const [tipoConta, setTipoConta] = useState("poupanca");

  const handleTipoChange = (e) => {
    setTipoConta(e.target.value);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Criação de conta:</h1>
      <form className="pt-2">
        <label className="flex flex-col gap-1">
          <span className="text-lg font-medium">Escolha o tipo de conta:</span>
          <select
            name="account-type"
            id="account-type"
            className="py-1.5 px-2 border rounded-lg cursor-pointer max-w-lg"
            value={tipoConta}
            onChange={handleTipoChange}
          >
            <option value="poupanca">Conta Poupança</option>
            <option value="corrente">Conta Corrente</option>
            <option value="investimento">Conta Investimento</option>
          </select>
        </label>
      </form>

      <div className="mt-4">
        {tipoConta === "poupanca" && <FormularioPoupanca />}
        {tipoConta === "corrente" && <FormularioCorrente />}
        {tipoConta === "investimento" && <FormularioInvestimento />}
      </div>
    </div>
  );
};

export default AbrirConta;
