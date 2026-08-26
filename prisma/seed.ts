import 'dotenv/config';
import { PrismaClient } from '@prisma/client/extension';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const catalog = [
    { brand: 'Gloca', size: '6kg', price: 3500 },
    { brand: 'Gloca', size: '12.5kg', price: 6500 },
    { brand: 'Total', size: '6kg', price: 3500 },
    { brand: 'Total', size: '12.5kg', price: 6500 },
    { brand: 'Tradex', size: '6kg', price: 3500 },
    { brand: 'Tradex', size: '12.5kg', price: 6500 },
  ];

  for (const item of catalog) {
    await prisma.product.create({ data: { ...item, inStock: true } });
  }

  console.log(`Seeded ${catalog.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());