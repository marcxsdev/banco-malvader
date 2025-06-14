"use client";
import { useState } from "react";

const AlterarCliente = () => {
  const [cpf, setCpf] = useState("");

  const handleBuscar = (e) => {
    e.preventDefault();
    // chamada da API
  };

  return (
    <div>
      <form onSubmit={handleBuscar} className="flex gap-2 mb-6 max-w-[700px]">
        <input
          type="text"
          placeholder="Digite o CPF do cliente"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          className="flex-1 border rounded-lg py-1.5 px-2"
          required
        />
        <button
          type="submit"
          className="bg-black text-white px-4 rounded-lg hover:bg-neutral-800 transition cursor-pointer"
        >
          Buscar
        </button>
      </form>
    </div>
  );
};

export default AlterarCliente;
