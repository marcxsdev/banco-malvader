"use client";
import Image from "next/image";
import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import Link from "next/link";

const LoginForm = () => {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [otp, setOtp] = useState("");
  const [selectedRole, setSelectedRole] = useState("CLIENTE");
  const [mensagem, setMensagem] = useState("");

  function formatCpf(value) {
    value = value.replace(/\D/g, "");
    value = value.slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return value;
  }

  function handleCpfChange(e) {
    const formatted = formatCpf(e.target.value);
    setCpf(formatted);
  }

  async function handleGenerateOtp() {
    try {
      const response = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cpf: cpf.replace(/\D/g, ""),
          tipoUsuario: selectedRole.toUpperCase(),
        }),
      });
      const data = await response.json();
      if (data.success) {
        setMensagem(`OTP gerado: ${data.otp}`); // Exibe o OTP para teste
      } else {
        setMensagem(data.error || "Erro ao gerar OTP");
      }
    } catch (error) {
      setMensagem("Erro ao conectar ao servidor");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cpf: cpf.replace(/\D/g, ""),
          senha,
          otp,
          tipoUsuario: selectedRole.toUpperCase(),
        }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("token", data.token); // Armazena o token
        window.location.href =
          selectedRole === "CLIENTE" ? "/pages/cliente" : "/pages/funcionario";
      } else {
        setMensagem(data.error || "Erro ao fazer login");
      }
    } catch (error) {
      setMensagem("Erro ao conectar ao servidor");
    }
  }

  return (
    <div className="w-1/2 h-full flex flex-col items-center justify-center">
      <Image
        src="/assets/banco-malvader-logo.png"
        alt="Logo Banco Malvader"
        width={180}
        height={60}
      />
      <h1 className="text-2xl font-semibold py-6">Acesse sua conta</h1>

      <div className="w-3/4 max-w-[400px] flex">
        <button
          type="button"
          onClick={() => setSelectedRole("CLIENTE")}
          className={`w-1/2 py-2 text-center transition border-b-2 cursor-pointer ${
            selectedRole === "CLIENTE" ? "border-black" : "border-transparent"
          }`}
        >
          Cliente
        </button>
        <button
          type="button"
          onClick={() => setSelectedRole("FUNCIONARIO")}
          className={`w-1/2 py-2 text-center transition border-b-2 cursor-pointer ${
            selectedRole === "FUNCIONARIO"
              ? "border-black"
              : "border-transparent"
          }`}
        >
          Funcionário
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-3/4 max-w-[400px] flex flex-col gap-3 mt-6"
      >
        <label className="flex flex-col gap-1">
          <span className="font-semibold">CPF:</span>
          <input
            type="text"
            name="cpf"
            value={cpf}
            onChange={handleCpfChange}
            placeholder="Digite seu CPF..."
            inputMode="numeric"
            className="py-1.5 px-2 outline-none rounded-lg border border-transparent focus:border-black transition duration-300 w-full"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold">Senha:</span>
          <input
            type="password"
            name="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Digite sua senha..."
            className="py-1.5 px-2 outline-none rounded-lg border border-transparent focus:border-black transition duration-300"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold">OTP:</span>
          <div className="flex gap-2">
            <input
              type="text"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Digite o OTP fornecido..."
              className="py-1.5 px-2 outline-none rounded-lg border border-transparent focus:border-black transition duration-300 flex-1"
            />
            <button
              type="button"
              onClick={handleGenerateOtp}
              className="bg-black text-white font-bold py-1.5 px-4 rounded-lg hover:bg-neutral-800 transition duration-500 cursor-pointer"
            >
              Gerar OTP
            </button>
          </div>
        </label>

        <input
          type="submit"
          value="Entrar"
          className="bg-black text-white font-bold text-xl mt-3 py-3 rounded-xl hover:bg-neutral-800 transition duration-500 cursor-pointer"
        />
        <div className="flex justify-center items-center">
          <Link href="/">
            <button className="flex flex-row items-center justify-center gap-2 py-2.5 px-4 max-h-[45px] cursor-pointer hover:scale-110 transition duration-300">
              <FaArrowLeft /> <span className="font-bold">Voltar</span>
            </button>
          </Link>
        </div>
        {mensagem && (
          <p className="text-red-500 text-center mt-4">{mensagem}</p>
        )}
      </form>
    </div>
  );
};

export default LoginForm;
