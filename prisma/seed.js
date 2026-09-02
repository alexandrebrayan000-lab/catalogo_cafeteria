import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const catalogData = [
  {
    name: 'Croissants & Cia',
    slug: 'Paes',
    description: 'Croissants artesanais fresquinhos e folhados',
    products: [
      {
        name: 'Croissant',
        price: 7.00,
        description: 'Clássico croissant francês com massa folhada na manteiga.',
        imageUrl: 'https://lirp.cdn-website.com/33406c6e/dms3rep/multi/opt/historia-do-croissant-640w.jpg'
      },
      {
        name: 'Croissant doce',
        price: 8.00,
        description: 'Croissant especial com toque doce e crocância perfeita.',
        imageUrl: 'https://i.pinimg.com/1200x/34/a0/59/34a059a12664dcae118986a011cd897c.jpg'
      }
    ]
  },
  {
    name: 'La Pâtisserie',
    slug: 'doces',
    description: 'Doces finos e sobremesas da confeitaria francesa',
    products: [
      {
        name: 'Entremet Coeur Rouge',
        price: 7.99,
        description: 'Delicado entremet com frutas vermelhas e mousse suave.',
        imageUrl: 'https://i.pinimg.com/1200x/70/cb/1a/70cb1aad524e93679963391a007d6de7.jpg'
      },
      {
        name: 'Tartelette aux Fraises',
        price: 12.99,
        description: 'Torta individual recheada com creme pâtissière e morangos frescos.',
        imageUrl: 'https://i.pinimg.com/736x/e4/e9/d9/e4e9d9bdba57a6de27e4133f9e655118.jpg'
      }
    ]
  },
  {
    name: 'Les Quiches',
    slug: 'salgado',
    description: 'Quiches quentinhas assadas na hora',
    products: [
      {
        name: 'Quiche Lorraine',
        price: 8.99,
        description: 'Tradicional quiche francesa com bacon crocante e queijo gruyère.',
        imageUrl: 'https://i.pinimg.com/1200x/24/2b/14/242b14c63b289cd60141711e5faa3e26.jpg'
      },
      {
        name: 'Quiche aux Fromages',
        price: 14.50,
        description: 'Quiche cremosa com blend nobre de queijos selecionados.',
        imageUrl: 'https://i.pinimg.com/736x/67/16/9c/67169c7ed151e1d7b7cab9acdb7667f1.jpg'
      }
    ]
  },
  {
    name: 'Les Cafés',
    slug: 'cafe',
    description: 'Cafés especiais de grãos selecionados',
    products: [
      {
        name: 'Café Origine',
        price: 11.98,
        description: 'Espresso encorpado de grãos especiais 100% arábica.',
        imageUrl: 'img/coffee1.jfif'
      },
      {
        name: 'Latte Macchiato',
        price: 13.99,
        description: 'Leite vaporizado cremoso com uma dose de espresso artesanal.',
        imageUrl: 'https://i.pinimg.com/736x/c9/8d/04/c98d046bf1085bc59f77893bf9779244.jpg'
      }
    ]
  }
];

async function main() {
  console.log('Iniciando seed no banco de dados Neon...');

  // Limpa registros anteriores para permitir re-execução limpa
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  for (const cat of catalogData) {
    const createdCategory = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        products: {
          create: cat.products.map(p => ({
            name: p.name,
            price: p.price,
            description: p.description,
            imageUrl: p.imageUrl
          }))
        }
      },
      include: {
        products: true
      }
    });

    console.log(`Categoria criada: ${createdCategory.name} (${createdCategory.products.length} produtos)`);
  }

  console.log('Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro ao executar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
