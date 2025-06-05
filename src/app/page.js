import Image from "next/image";

export default function Home() {
  return (
    <div className="">
      <header>
        <div className="">
          <Image
            src="/assets/banco-malvader-logo.png"
            alt="Logo Banco Malvader"
            width={160}
            height={40}
            className="hover:scale-110 transition duration-300 cursor-pointer"
          />
        </div>

        <div className="flex flex-col">
          <button>
            <span>Cadastrar</span>
          </button>
          <button>
            <span>Acesse sua conta</span>
          </button>
        </div>
      </header>
      <main></main>
    </div>
  );
}
