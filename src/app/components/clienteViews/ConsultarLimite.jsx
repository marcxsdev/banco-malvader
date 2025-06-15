"use client";
import { useState } from "react";

const ConsultarLimite = () => {
  const [limite, setLimite] = useState(null);
  const [projecao, setProjecao] = useState(null);

  const handleConsultar = () => {
    // Simulando dados estáticos por enquanto
    setLimite("R$ 5.000");
    setProjecao("R$ 6.200 em 3 meses");
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleConsultar}
        className="bg-black text-white py-2.5 px-4 rounded-xl hover:bg-neutral-800 cursor-pointer"
      >
        Consultar Limite Atual
      </button>
      {limite && (
        <div className="mt-4 space-y-2">
          <p className="text-lg font-medium">
            Limite atual: <span className="font-bold">{limite}</span>
          </p>
          <p className="text-lg font-medium">
            Projeção: <span className="font-bold">{projecao}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ConsultarLimite;
