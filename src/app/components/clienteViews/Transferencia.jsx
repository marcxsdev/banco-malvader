"use client";
import { useState } from "react";

const Transferencia = () => {
  const [valor, setValor] = useState("");
  const [contaDestino, setContaDestino] = useState("");
  const [descricao, setDescricao] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Transferência:", { valor, contaDestino, descricao });
    // API e validação depois
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4 max-w-md">
      <input
        type="text"
        name="contaDestino"
        placeholder="Conta de destino"
        value={contaDestino}
        onChange={(e) => setContaDestino(e.target.value)}
        className="py-2 px-3 border rounded-lg"
        required
      />
      <input
        type="number"
        name="valor"
        placeholder="Valor da Transferência (R$)"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className="py-2 px-3 border rounded-lg"
        required
      />
      <input
        type="text"
        name="descricao"
        placeholder="Descrição (opcional)"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        className="py-2 px-3 border rounded-lg"
      />
      <button
        type="submit"
        className="bg-black text-white py-2.5 px-4 rounded-xl hover:bg-neutral-800"
      >
        Confirmar Transferência
      </button>
    </form>
  );
};

export default Transferencia;
