"use client";
import { useState } from "react";

const AlterarFuncionario = () => {
  const [cpf, setCpf] = useState("");
  const [funcionario, setFuncionario] = useState(null);
  const [cargo, setCargo] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState({
    cep: "",
    local: "",
    numero_casa: "",
    bairro: "",
    cidade: "",
    estado: "",
    complemento: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleBuscar = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFuncionario(null);

    try {
      const response = await fetch("/api/funcionario/consultar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ tipo: "FUNCIONARIO", cpf }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar funcionário");
      }
      setFuncionario(data.data);
      setCargo(data.data.cargo);
      setTelefone(data.data.telefone);
      setEndereco({
        cep: data.data.endereco?.cep || "",
        local: data.data.endereco?.local || "",
        numero_casa: data.data.endereco?.numero_casa || "",
        bairro: data.data.endereco?.bairro || "",
        cidade: data.data.endereco?.cidade || "",
        estado: data.data.endereco?.estado || "",
        complemento: data.data.endereco?.complemento || "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAlterar = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const body = {
        tipo: "FUNCIONARIO",
        cpf,
        ...(cargo && cargo !== funcionario.cargo && { cargo }),
        ...(telefone && telefone !== funcionario.telefone && { telefone }),
        ...(endereco.cep && {
          endereco: {
            cep: endereco.cep,
            local: endereco.local,
            numero_casa: parseInt(endereco.numero_casa),
            bairro: endereco.bairro,
            cidade: endereco.cidade,
            estado: endereco.estado,
            complemento: endereco.complemento || null,
          },
        }),
      };

      const response = await fetch("/api/funcionario/alterar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao alterar funcionário");
      }
      setSuccess("Funcionário alterado com sucesso!");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEnderecoChange = (field, value) => {
    setEndereco((prev) => ({ ...prev, [field]: value }));
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

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      {funcionario && (
        <form onSubmit={handleAlterar} className="max-w-[700px]">
          <div className="mb-4">
            <label className="block mb-1">Cargo</label>
            <select
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              className="w-full border rounded-lg py-1.5 px-2"
            >
              <option value="ESTAGIARIO">Estagiário</option>
              <option value="ATENDENTE">Atendente</option>
              <option value="GERENTE">Gerente</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1">Telefone</label>
            <input
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full border rounded-lg py-1.5 px-2"
              placeholder="Novo telefone"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">CEP</label>
            <input
              type="text"
              value={endereco.cep}
              onChange={(e) => handleEnderecoChange("cep", e.target.value)}
              className="w-full border rounded-lg py-1.5 px-2"
              placeholder="CEP"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Logradouro</label>
            <input
              type="text"
              value={endereco.local}
              onChange={(e) => handleEnderecoChange("local", e.target.value)}
              className="w-full border rounded-lg py-1.5 px-2"
              placeholder="Logradouro"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Número</label>
            <input
              type="number"
              value={endereco.numero_casa}
              onChange={(e) =>
                handleEnderecoChange("numero_casa", e.target.value)
              }
              className="w-full border rounded-lg py-1.5 px-2"
              placeholder="Número"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Bairro</label>
            <input
              type="text"
              value={endereco.bairro}
              onChange={(e) => handleEnderecoChange("bairro", e.target.value)}
              className="w-full border rounded-lg py-1.5 px-2"
              placeholder="Bairro"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Cidade</label>
            <input
              type="text"
              value={endereco.cidade}
              onChange={(e) => handleEnderecoChange("cidade", e.target.value)}
              className="w-full border rounded-lg py-1.5 px-2"
              placeholder="Cidade"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Estado</label>
            <input
              type="text"
              value={endereco.estado}
              onChange={(e) => handleEnderecoChange("estado", e.target.value)}
              className="w-full border rounded-lg py-1.5 px-2"
              placeholder="Estado (ex.: DF)"
              maxLength={2}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Complemento</label>
            <input
              type="text"
              value={endereco.complemento}
              onChange={(e) =>
                handleEnderecoChange("complemento", e.target.value)
              }
              className="w-full border rounded-lg py-1.5 px-2"
              placeholder="Complemento (opcional)"
            />
          </div>
          <button
            type="submit"
            className="bg-black text-white px-4 rounded-lg hover:bg-neutral-800 transition cursor-pointer"
          >
            Alterar
          </button>
        </form>
      )}
    </div>
  );
};

export default AlterarFuncionario;
