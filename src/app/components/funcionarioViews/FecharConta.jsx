"use client";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";

const FecharConta = () => {
  const [formData, setFormData] = useState({
    numero: "",
    senha: "",
    otp: "",
    motivo: "",
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateOtp = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Token:", token);
      if (!token) {
        setError("Você precisa estar autenticado para gerar um OTP.");
        return;
      }

      const decoded = jwtDecode(token);
      console.log("Decoded JWT:", decoded);
      const { id_usuario } = decoded;

      // Buscar CPF do usuário autenticado
      const responsePerfil = await fetch("/api/funcionario/perfil", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Resposta /api/funcionario/perfil:", responsePerfil);
      const perfilData = await responsePerfil.json();
      console.log("Dados perfil:", perfilData);
      if (!perfilData.success || !perfilData.cpf) {
        setError("Erro ao obter CPF do usuário.");
        return;
      }
      const cpf = perfilData.cpf;
      console.log("CPF obtido:", cpf);

      // Chamar API para gerar OTP
      const response = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cpf: cpf.replace(/\D/g, ""),
          tipoUsuario: "FUNCIONARIO",
        }),
      });
      console.log("Resposta /api/auth/otp:", response);
      const data = await response.json();
      console.log("Dados OTP:", data);

      if (data.success) {
        setMessage(`OTP gerado: ${data.otp}`);
        setFormData((prev) => ({ ...prev, otp: data.otp }));
      } else {
        setError(data.error || "Erro ao gerar OTP");
      }
    } catch (error) {
      console.error("Erro em handleGenerateOtp:", error);
      setError("Erro ao conectar ao servidor");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Você precisa estar autenticado para encerrar uma conta.");
      return;
    }

    try {
      const response = await fetch("/api/funcionario/encerrar_conta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setMessage(data.message);
        setFormData({ numero: "", senha: "", otp: "", motivo: "" });
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Fechar conta:</h1>
      {message && <p className="text-green-600 mt-2">{message}</p>}
      {error && <p className="text-red-600 mt-2">{error}</p>}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 mt-4 max-w-lg w-full"
      >
        <input
          type="text"
          name="numero"
          value={formData.numero}
          onChange={handleChange}
          placeholder="Número da conta"
          className="py-1.5 px-2 rounded-lg border transition duration-300 w-full"
          required
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
        <div className="flex gap-2">
          <input
            type="text"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            placeholder="Digite o OTP fornecido..."
            className="py-1.5 px-2 rounded-lg border transition duration-300 flex-1"
            required
          />
          <button
            type="button"
            onClick={handleGenerateOtp}
            className="bg-black text-white py-1.5 px-4 rounded-lg hover:bg-neutral-800 transition duration-500 cursor-pointer"
          >
            Gerar OTP
          </button>
        </div>
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
          <option value="INADIMPLENCIA">Inadimplência</option>
          <option value="SOLICITACAO_CLIENTE">Solicitação do Cliente</option>
          <option value="OUTROS">Outros</option>
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
