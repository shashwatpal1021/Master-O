import bcrypt from 'bcrypt';
import 'dotenv/config';
import { prisma } from '../src/config/db.js';

async function main() {
  const hashed = await bcrypt.hash('adminpass123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { name: 'Admin', password: hashed, role: 'ADMIN' },
    create: { name: 'Admin', email: 'admin@example.com', password: hashed, role: 'ADMIN' },
  });
  console.log('Admin user created/updated:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
