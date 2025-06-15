"use client";
import { useState } from "react";

const Saque = () => {
  const [valor, setValor] = useState("");
  const [senha, setSenha] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saque:", { valor, senha });
    // Validação de saldo e taxa virão depois
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4 max-w-md">
      <input
        type="number"
        name="valor"
        placeholder="Valor do Saque (R$)"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className="py-2 px-3 border rounded-lg"
        required
      />
      <input
        type="password"
        name="senha"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        className="py-2 px-3 border rounded-lg"
        required
      />
      <button
        type="submit"
        className="bg-black text-white py-2.5 px-4 rounded-xl hover:bg-neutral-800"
      >
        Confirmar Saque
      </button>
    </form>
  );
};

export default Saque;
