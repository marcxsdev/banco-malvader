"use client";
import { useState } from "react";

const ConsultaFuncionario = () => {
  const [cpf, setCpf] = useState("");
  const [dados, setDados] = useState(null);
  const [error, setError] = useState(null);

  const handleBuscar = async (e) => {
    e.preventDefault();
    setError(null);
    setDados(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Você precisa estar autenticado.");
      return;
    }

    try {
      const response = await fetch("/api/funcionario/consultar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tipo: "FUNCIONARIO", cpf }),
      });

      const data = await response.json();
      if (data.success) {
        setDados(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor.");
    }
  };

  const formatarEndereco = (endereco) => {
    if (!endereco || !endereco.local) {
      return "Não informado";
    }
    const { local, numero_casa, bairro, cidade, estado, complemento, cep } =
      endereco;
    return `${local}, ${numero_casa}, ${bairro}, ${cidade} - ${estado}${
      complemento ? `, ${complemento}` : ""
    } (CEP: ${cep})`;
  };

  return (
    <div>
      <form onSubmit={handleBuscar} className="flex gap-2 mb-6 max-w-[700px]">
        <input
          type="text"
          placeholder="Digite o CPF do funcionário"
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

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {dados && (
        <div className="space-y-2 text-sm">
          <p>
            <strong>Nome:</strong> {dados.nome}
          </p>
          <p>
            <strong>CPF:</strong> {dados.cpf}
          </p>
          <p>
            <strong>Cargo:</strong> {dados.cargo}
          </p>
          <p>
            <strong>Data de Nascimento:</strong> {dados.nascimento}
          </p>
          <p>
            <strong>Telefone:</strong> {dados.telefone}
          </p>
          <p>
            <strong>Endereço:</strong> {formatarEndereco(dados.endereco)}
          </p>
          <p>
            <strong>Contas abertas:</strong> {dados.contasAbertas}
          </p>
          <p>
            <strong>Desempenho:</strong> R$ {dados.desempenho}
          </p>
        </div>
      )}
    </div>
  );
};

export default ConsultaFuncionario;
