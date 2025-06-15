"use client";
import { useState } from "react";

const Deposito = () => {
  const [valor, setValor] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Depósito:", { valor });
    // Envio via API futuramente
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4 max-w-md">
      <p className="text-sm text-gray-600 mt-1 mb-[-0.5rem]">
        Limite diário de R$10.000*
      </p>
      <input
        type="number"
        name="valor"
        placeholder="Valor do Depósito (R$)"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className="py-2 px-3 border rounded-lg no-spinner"
        required
      />

      <button
        type="submit"
        className="bg-black text-white py-2.5 px-4 rounded-xl hover:bg-neutral-800 cursor-pointer"
      >
        Confirmar Depósito
      </button>
    </form>
  );
};

export default Deposito;
