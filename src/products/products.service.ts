import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async listProducts() {
    const products = await this.prisma.product.findMany({
      orderBy: [{ brand: 'asc' }, { size: 'asc' }],
    });

    return products.map((p) => ({
      id: p.id,
      brand: p.brand,
      size: p.size,
      price: Number(p.price),
      inStock: p.inStock,
      updatedAt: p.updatedAt,
    }));
  }

  async checkAvailability(brand: string, size?: string) {
    const products = await this.prisma.product.findMany({
      where: {
        brand: { equals: brand, mode: 'insensitive' },
        ...(size ? { size: { equals: size, mode: 'insensitive' } } : {}),
      },
      orderBy: { size: 'asc' },
    });

    if (!products.length) {
      return {
        found: false,
        available: false,
        message: `We don't currently list ${brand}${size ? ' ' + size : ''}.`,
        options: [],
      };
    }

    const options = products.map((p) => ({
      id: p.id,
      brand: p.brand,
      size: p.size,
      price: Number(p.price),
      inStock: p.inStock,
    }));

    return {
      found: true,
      available: options.some((p) => p.inStock),
      options,
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

  async setAvailabilityById(id: number, inStock: boolean) {
    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: { inStock },
      });

      return {
        id: product.id,
        brand: product.brand,
        size: product.size,
        price: Number(product.price),
        inStock: product.inStock,
        updatedAt: product.updatedAt,
      };
    } catch {
      throw new NotFoundException(`Product ${id} not found.`);
    }
  }
}
