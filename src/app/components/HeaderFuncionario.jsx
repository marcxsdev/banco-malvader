import Link from "next/link";

const HeaderFuncionario = () => {
  return (
    <div className="flex flex-row items-center justify-between px-26 py-6 border-b ">
      <h1 className="text-2xl font-bold">Bem vindo, João</h1>
      <Link href="/pages/login">
        <button className="bg-black flex flex-row items-center justify-center gap-4 py-2.5 px-8 max-h-[45px] rounded-xl cursor-pointer hover:bg-neutral-800 hover:scale-105 transition duration-300">
          <span className="text-white font-bold">Sair</span>{" "}
        </button>
      </Link>
    </div>
  );
};

export default HeaderFuncionario;
