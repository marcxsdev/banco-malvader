import Image from "next/image";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      <header className="flex flex-row items-center px-26 py-6 justify-between border-b">
        <div className="">
          <Image
            src="/assets/banco-malvader-logo.png"
            alt="Logo Banco Malvader"
            width={160}
            height={40}
            className="hover:scale-110 transition duration-300 cursor-pointer"
          />
        </div>

        <div className="flex flex-row gap-4">
          <Link href="/pages/login">
            <button className="bg-black flex flex-row items-center justify-center gap-4 py-2.5 px-4 max-h-[45px] rounded-xl cursor-pointer hover:bg-neutral-800 hover:scale-105 transition duration-300">
              <span className="text-white font-bold">Acesse sua conta</span>{" "}
              <FaArrowRight color="white" />
            </button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="flex flex-row gap-8 justify-center items-center">
          <div className="flex flex-col gap-6 text-center">
            <h1 className="text-8xl font-medium text-black">
              Escolha Inteligente
            </h1>
            <p className="text-8xl text-black font-medium">
              Escolha <span className="font-bold">Malvader.</span>
            </p>
            <Link href="">
              <button className="flex flex-row items-center justify-center gap-4 py-2.5 px-4 max-h-[45px] cursor-pointer hover:scale-110 transition duration-300">
                <span className="font-bold text-4xl">Entrar</span>{" "}
                <FaArrowRight size={28} />
              </button>
            </Link>
          </div>

          <div className="">
            <Image
              src="/assets/malvader-card.png"
              alt="Logo Banco Malvader"
              width={780}
              height={496}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
