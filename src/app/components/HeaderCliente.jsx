import Link from "next/link";
import Image from "next/image";

const HeaderCliente = () => {
  return (
    <div className="flex flex-row items-center justify-between px-26 py-4 border-b ">
      <Image
        src="/assets/banco-malvader-logo.png"
        alt="Logo Banco Malvader"
        width={160}
        height={40}
        className="hover:scale-110 transition duration-300 cursor-pointer"
      />
      <Link href="/pages/login">
        <button className="bg-black flex flex-row items-center justify-center gap-4 py-2.5 px-8 max-h-[45px] rounded-xl cursor-pointer hover:bg-neutral-800 hover:scale-105 transition duration-300">
          <span className="text-white font-bold">Sair</span>{" "}
        </button>
      </Link>
    </div>
  );
};

export default HeaderCliente;
