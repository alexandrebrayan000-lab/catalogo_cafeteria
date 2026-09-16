import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import prisma from './lib/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Carrega as variáveis de ambiente a partir da raiz do projeto se não estiver na Vercel
if (!process.env.VERCEL) {
  dotenv.config({ path: path.join(rootDir, '.env') });
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do frontend a partir da raiz
app.use(express.static(rootDir));

// ==========================================================
// ROUTER DE API (Compatível com /api/* e chamadas diretas da Vercel)
// ==========================================================
const apiRouter = express.Router();

// Rota de Health Check / Status
apiRouter.get('/status', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'online',
      database: 'Conectado ao Neon PostgreSQL via Prisma',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro na verificação do banco de dados:', error);
    res.status(500).json({
      status: 'offline',
      database: 'Erro de conexão com o banco de dados',
      error: error.message
    });
  }
});

// Resumo da API
apiRouter.get('/', (req, res) => {
  res.json({
    message: 'API Coffee Le Parisien online ☕',
    status: 'online',
    endpoints: [
      '/api/status',
      '/api/categorias',
      '/api/produtos',
      '/api/pedidos',
      '/api/auth/login',
      '/api/auth/register'
    ]
  });
});

// ==========================================================
// ROTAS DE AUTENTICAÇÃO (CADASTRO & LOGIN)
// ==========================================================

// POST /auth/register - Cadastro de novo usuário
apiRouter.post('/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Por favor, preencha todos os campos (nome, e-mail e senha).' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'A senha deve conter no mínimo 6 caracteres.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    // Verifica se o e-mail já está cadastrado
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado. Tente fazer login.' });
    }

    // Hash seguro da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o usuário no banco de dados Neon
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: 'CUSTOMER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'Cadastro realizado com sucesso!',
      user: newUser
    });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ error: 'Erro interno ao realizar cadastro. Tente novamente mais tarde.' });
  }
});

// POST /auth/login - Login de usuário
apiRouter.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Por favor, informe seu e-mail e senha.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    // Busca usuário pelo e-mail
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!user) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    // Compara a senha fornecida com o hash salvo no banco
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    res.json({
      message: 'Login realizado com sucesso!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro ao autenticar usuário:', error);
    res.status(500).json({ error: 'Erro interno ao realizar login. Tente novamente mais tarde.' });
  }
});

// ==========================================================
// ROTAS DE CARDÁPIO & PRODUTOS
// ==========================================================

// GET /categorias - Lista todas as categorias com seus produtos
apiRouter.get('/categorias', async (req, res) => {
  try {
    const categorias = await prisma.category.findMany({
      include: {
        products: {
          orderBy: { id: 'asc' }
        }
      },
      orderBy: { id: 'asc' }
    });
    res.json(categorias);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro ao carregar categorias do cardápio.' });
  }
});

// GET /produtos - Lista produtos (com suporte a filtro por categoria)
apiRouter.get('/produtos', async (req, res) => {
  const { categoria } = req.query;

  try {
    const where = categoria ? { category: { slug: String(categoria) } } : {};
    const produtos = await prisma.product.findMany({
      where,
      include: {
        category: true
      },
      orderBy: { id: 'asc' }
    });
    res.json(produtos);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro ao carregar produtos.' });
  }
});

// POST /produtos - Cadastrar novo produto
apiRouter.post('/produtos', async (req, res) => {
  const { name, price, description, imageUrl, categoryId } = req.body;

  if (!name || price == null || !imageUrl || !categoryId) {
    return res.status(400).json({ error: 'Campos obrigatórios: name, price, imageUrl, categoryId' });
  }

  try {
    const novoProduto = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        description,
        imageUrl,
        categoryId: Number(categoryId)
      }
    });
    res.status(201).json(novoProduto);
  } catch (error) {
    console.error('Erro ao cadastrar produto:', error);
    res.status(500).json({ error: 'Erro ao criar produto.' });
  }
});

// ==========================================================
// ROTAS DE PEDIDOS
// ==========================================================

// POST /pedidos - Registrar um pedido do carrinho
apiRouter.post('/pedidos', async (req, res) => {
  const { customerName, customerPhone, userId, items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'O pedido deve conter pelo menos um item.' });
  }

  try {
    let total = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: Number(item.productId) }
      });

      if (!product) {
        return res.status(404).json({ error: `Produto ID ${item.productId} não encontrado.` });
      }

      const itemTotal = Number(product.price) * (item.quantity || 1);
      total += itemTotal;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity || 1,
        unitPrice: product.price
      });
    }

    const order = await prisma.order.create({
      data: {
        userId: userId ? Number(userId) : null,
        customerName: customerName || 'Cliente Anônimo',
        customerPhone: customerPhone || null,
        totalAmount: total,
        items: {
          create: orderItemsData
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.status(201).json({ message: 'Pedido criado com sucesso!', order });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro ao registrar pedido.' });
  }
});

// GET /pedidos - Listar histórico de pedidos
apiRouter.get('/pedidos', async (req, res) => {
  try {
    const pedidos = await prisma.order.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(pedidos);
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    res.status(500).json({ error: 'Erro ao consultar pedidos.' });
  }
});

// Monta o router tanto em '/api' quanto na raiz '/' para compatibilidade total com Vercel
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Inicia o servidor local se não estiver rodando na infraestrutura Serverless da Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
}

export default app;
