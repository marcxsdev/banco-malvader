"use client";
import { useState } from "react";

const FecharConta = () => {
  const [formData, setFormData] = useState({
    numero: "",
    senha: "",
    otp: "",
    motivo: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dados enviados:", formData);
    // envio via API
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Fechar conta:</h1>
      <form className="flex flex-col gap-3 mt-4 max-w-lg w-full">
        <input
          type="text"
          name="numero"
          value={formData.numero}
          onChange={handleChange}
          placeholder="Número da conta"
          className="py-1.5 px-2 rounded-lg border transition duration-300 w-full"
        />
        <input
          type="password"
          name="senha"
          placeholder="Senha de administrador"
          value={formData.senha}
          onChange={handleChange}
          className="py-1.5 px-2 border rounded-lg"
          required
        />

        <input
          type="text"
          name="otp"
          value={formData.otp}
          onChange={handleChange}
          placeholder="OTP"
          className="py-1.5 px-2 border rounded-lg"
        />

        <select
          name="motivo"
          value={formData.motivo}
          onChange={handleChange}
          className="py-1.5 px-2 border rounded-lg text-gray-700 cursor-pointer"
          required
        >
          <option value="" disabled>
            Motivo do Encerramento
          </option>
          <option value="baixo">Inadimplência</option>
          <option value="medio">Solicitação do Cliente</option>
          <option value="alto">Outros</option>
        </select>

        <button
          type="submit"
          className="bg-black text-white py-2.5 px-4 rounded-xl cursor-pointer hover:bg-neutral-800 transition duration-300"
        >
          Encerrar Conta
        </button>
      </form>
    </div>
  );
};

export default FecharConta;
