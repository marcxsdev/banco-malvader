"use client";
import Image from "next/image";
import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import Link from "next/link";

const LoginForm = () => {
  const [cpf, setCpf] = useState("");
  const [selectedRole, setSelectedRole] = useState("cliente");

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
          onClick={() => setSelectedRole("cliente")}
          className={`w-1/2 py-2 text-center transition border-b-2 cursor-pointer ${
            selectedRole === "cliente" ? "border-black" : "border-transparent"
          }`}
        >
          Cliente
        </button>
        <button
          type="button"
          onClick={() => setSelectedRole("funcionario")}
          className={`w-1/2 py-2 text-center transition border-b-2 cursor-pointer ${
            selectedRole === "funcionario"
              ? "border-black"
              : "border-transparent"
          }`}
        >
          Funcionário
        </button>
      </div>

      <form className="w-3/4 max-w-[400px] flex flex-col gap-3 mt-6">
        <label className="flex flex-col gap-1">
          <span>CPF:</span>
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
          <span>Senha:</span>
          <input
            type="password"
            name="password"
            placeholder="Digite sua senha..."
            className="py-1.5 px-2 outline-none rounded-lg border border-transparent focus:border-black transition duration-300"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span>OTP:</span>
          <input
            type="password"
            name="otp"
            placeholder="Digite o OTP fornecido..."
            className="py-1.5 px-2 outline-none rounded-lg border border-transparent focus:border-black transition duration-300"
          />
        </label>

        <input
          type="submit"
          value={"Entrar"}
          className="bg-black text-white font-bold text-xl mt-3 py-3 rounded-xl hover:bg-neutral-800 transition duration-500 cursor-pointer"
        />
        <div className="flex justify-center items-center">
          <Link href="/">
            <button className="flex flex-row items-center justify-center gap-2 py-2.5 px-4 max-h-[45px] cursor-pointer hover:scale-110 transition duration-300">
              <FaArrowLeft /> <span className="font-bold">Voltar</span>
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
