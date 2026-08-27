import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async checkAvailability(brand: string, size?: string) {
    const products = await this.prisma.product.findMany({
      where: {
        brand: { equals: brand, mode: 'insensitive' },
        ...(size ? { size: { equals: size, mode: 'insensitive' } } : {}),
      },
    });

    if (!products.length) {
      return { found: false, message: `We don't currently list ${brand}${size ? ' ' + size : ''}.` };
    }

    return {
      found: true,
      options: products.map((p) => ({
        brand: p.brand,
        size: p.size,
        price: Number(p.price),
        inStock: p.inStock,
      })),
    };
  }

  async findProduct(brand: string, size: string) {
    return this.prisma.product.findFirst({
      where: {
        brand: { equals: brand, mode: 'insensitive' },
        size: { equals: size, mode: 'insensitive' },
      },
    });
  }

  /** Used by the supplier's admin toggle to mark a product available/unavailable. */
  async setAvailability(brand: string, size: string, inStock: boolean) {
    return this.prisma.product.updateMany({
      where: {
        brand: { equals: brand, mode: 'insensitive' },
        size: { equals: size, mode: 'insensitive' },
      },
      data: { inStock },
    });
  }
}