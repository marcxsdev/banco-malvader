# Banco Malvader

Banco Malvader é um sistema bancário completo que simula operações essenciais de uma instituição financeira, como abertura de contas, movimentações financeiras, e autenticação segura com validação via OTP. A aplicação utiliza Next.js com React no front-end, enquanto o back-end é alimentado por uma API em Node.js com banco de dados MySQL.

## Tecnologias Utilizadas

- Front-end: Next.js, React

- Back-end: Node.js, Express

- Banco de Dados: MySQL

- Outros: Bcrypt para hashing de senhas, JWT para autenticação, entre outras bibliotecas

## Configuração Inicial

1. Criar o Banco de Dados

No seu terminal do MySQL, execute:

```sql
CREATE DATABASE IF NOT EXISTS banco_malvader;
```

Em seguida, importe o script banco_app.sql incluído no projeto.

2. Clonar o Repositório

```bash
git clone https://github.com/marcxsdev/banco-malvader
cd banco-malvader
```

3. Instalar Dependências

```bash
npm install
```

4. Configurar o Ambiente
   Crie um arquivo chamado .env na raiz do projeto com as seguintes variáveis (substitua pelos seus dados):

```
JWT_SECRET=sua_chave
DB_HOST=localhost
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_NAME=banco_malvader
```

## Executando o Projeto

Para rodar a aplicação localmente:

```bash
npm run dev
```

## Observações

- O projeto está em desenvolvimento acadêmico e não deve ser utilizado em produção sem adaptações.

- Todas as instruções para configuração, execução e personalização estão neste README.
