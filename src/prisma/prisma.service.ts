import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL is not set. Check your .env file.');
    }

    const adapter = new PrismaPg({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });

    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      await this.$queryRaw`SELECT 1`; // forces a real round trip to the DB
      this.logger.log('✅ Prisma connected to the database.');
    } catch (error) {
      this.logger.error(
        'Could not connect to the database',
        error instanceof Error ? error.stack : String(error),
      );
      throw error; // fail fast so the app doesn't run half-broken
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma disconnected from the database.');
  }
}