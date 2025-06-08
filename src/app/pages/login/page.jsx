import Image from "next/image";
import Link from "next/link";
import LoginForm from "../../components/LoginForm";

const Login = () => {
  return (
    <div className="flex h-screen w-screen">
      <div className="w-1/2 h-full">
        <Image
          src="/assets/login-page.png"
          alt="Logo Banco Malvader"
          width={1200}
          height={1600}
          className="w-full h-full object-cover"
        />
      </div>

      <LoginForm />
    </div>
  );
};

export default Login;
