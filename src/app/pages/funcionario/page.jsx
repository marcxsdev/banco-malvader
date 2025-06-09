import Image from "next/image";
import Link from "next/link";
import HeaderFuncionario from "../../components/HeaderFuncionario";
import AsideFuncionario from "../../components/AsideFuncionario";

const Funcionario = () => {
  return (
    <div className="h-screen flex flex-col">
      <HeaderFuncionario />
      <div className="flex flex-1 overflow-hidden">
        <AsideFuncionario />
      </div>
    </div>
  );
};

export default Funcionario;
