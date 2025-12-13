import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Create adapter using DATABASE_URL from environment
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const createPrismaClient = () => new PrismaClient({ adapter });

const globalPrisma = globalThis.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = globalPrisma;
}

export const prisma = globalPrisma;
