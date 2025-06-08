import Image from "next/image";
import Link from "next/link";
import LoginForm from "../../components/LoginForm";

const Login = () => {
  return (
    <div className="flex h-screen w-screen">
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold">Bem-vindo, Cliente!</h1>
      </div>
    </div>
  );
};

export default Login;
