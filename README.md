# ☕ Coffee Le Parisien - Catálogo de Cafeteria com Prisma ORM + Neon PostgreSQL

Aplicação web do catálogo da cafeteria **Coffee Le Parisien**, agora integrada com **Prisma ORM** e banco de dados serverless **Neon** (PostgreSQL).

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Fetch API + LocalStorage para o carrinho)
- **Backend**: Node.js, Express.js, CORS, Dotenv
- **ORM & Banco de Dados**: Prisma ORM, Neon PostgreSQL Serverless

---

## 📁 Estrutura do Projeto

```text
catalogo_cafeteria/
│
├── index.html                  # Landing Page imersiva do Coffee Le Parisien
│
├── css/                        # Estilos CSS
│   ├── landing.css             # Estilos da Landing Page
│   ├── styles.css              # Estilos do Cardápio
│   ├── carrinho.css            # Estilos do Carrinho
│   └── auth.css                # Estilos de Login e Cadastro
│
├── js/                         # Lógica JavaScript do frontend
│   ├── script-landing.js       # Script da Landing Page
│   ├── script-cardapio.js      # Script do Cardápio
│   ├── script-carrinho.js      # Script do Carrinho (com trava de login)
│   └── script-auth.js          # Script de Login e Cadastro
│
├── pages/                      # Páginas secundárias
│   ├── cardapio.html           # Catálogo completo de produtos
│   ├── carrinho.html           # Carrinho de compras
│   ├── login.html              # Página de login
│   └── cadastro.html           # Página de cadastro
│
├── img/                        # Imagens e ícones
│   ├── logo.png
│   ├── carrinho.png
│   ├── inicio.png
│   └── coffee1.jfif
│
├── src/                        # Backend Node.js
│   ├── server.js               # Servidor Express & API REST
│   └── lib/
│       └── prisma.js           # Singleton do Prisma Client
│
├── prisma/                     # Modelagem e seed do banco Neon
│   ├── schema.prisma
│   └── seed.js
│
├── .env                        # Variáveis de ambiente
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Como Configurar e Rodar o Projeto

### 1. Pré-requisitos
- Node.js instalado (v18+)
- Conta no [Neon.tech](https://neon.tech) (gratuita)

### 2. Configurar o Banco de Dados no Neon
1. Acesse o console do [Neon](https://console.neon.tech).
2. Crie um novo projeto (ex: `cafeteria-db`).
3. Copie a string de conexão (**Connection String**) fornecida no dashboard do Neon. Ela terá um formato parecido com:
   ```env
   postgresql://neondb_owner:sua_senha@ep-exemplo-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 3. Configurar as Variáveis de Ambiente
Abra ou crie o arquivo `.env` na raiz do projeto e insira sua string de conexão:

```env
PORT=3000
DATABASE_URL="postgresql://usuario:senha@ep-exemplo.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### 4. Sincronizar o Schema com o Banco Neon
Execute o comando abaixo para criar as tabelas (`categories`, `products`, `orders`, `order_items`) diretamente no Neon:

```bash
npx prisma db push
```

### 5. Popular o Banco com os Produtos Iniciais (Seed)
Execute o script de seed para inserir automaticamente todas as categorias e produtos da cafeteria:

```bash
npm run prisma:seed
```

### 6. Iniciar a Aplicação

Para iniciar o servidor:
```bash
npm start
```
*(ou `npm run dev` para desenvolvimento com recarregamento automático via nodemon)*

Acesse no navegador:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📡 Endpoints da API REST

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/status` | Verifica a saúde da API e status da conexão com o Neon |
| `POST` | `/api/auth/register` | Cadastra um novo usuário no banco com hash seguro |
| `POST` | `/api/auth/login` | Realiza login e valida credenciais com o Prisma |
| `GET` | `/api/categorias` | Lista todas as categorias com seus respectivos produtos |
| `GET` | `/api/produtos` | Lista todos os produtos (suporta `?categoria=slug`) |
| `POST` | `/api/produtos` | Cadastra um novo produto |
| `POST` | `/api/pedidos` | Cria um novo pedido vinculado ao usuário/carrinho |
| `GET` | `/api/pedidos` | Lista todos os pedidos realizados |

---

## 🗄️ Interface Visual do Prisma Studio
Para visualizar e gerenciar os dados das tabelas diretamente em uma interface visual web:

```bash
npm run prisma:studio
```
Isso abrirá o Prisma Studio em `http://localhost:5555`.

---

## ⚡ Como Fazer Deploy na Vercel

O projeto já está 100% configurado com suporte a **Serverless Functions** da Vercel (`vercel.json` e `api/index.js`).

### Passo a Passo no Dashboard da Vercel:
1. Conecte o repositório do GitHub na [Vercel](https://vercel.com).
2. Durante o processo de importação do projeto ou em **Project Settings -> Environment Variables**, adicione a variável de ambiente do seu banco Neon:
   - **Key (Nome)**: `DATABASE_URL`
   - **Value (Valor)**: `postgresql://neondb_owner:SENHA@ep-exemplo-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&connect_timeout=15`
3. Clique em **Deploy**.
4. O script `npm run build` executará automaticamente o `prisma generate` na infraestrutura da Vercel e todas as rotas `/api/...` e páginas funcionarão imediatamente.

