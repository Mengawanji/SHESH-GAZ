import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';

interface CreateOrderInput {
  conversationId: number;
  customerPhone: string;
  brand: string;
  size: string;
  quantity: number;
  deliveryType: 'delivery' | 'pickup';
  address?: string;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly products: ProductsService,
  ) {}

  async createOrder(input: CreateOrderInput) {
    const product = await this.products.findProduct(input.brand, input.size);

    if (!product) {
      return {
        created: false as const,
        available: false,
        message: `We don't currently list ${input.brand} ${input.size}.`,
      };
    }

    if (!product.inStock) {
      return {
        created: false as const,
        available: false,
        message: `${product.brand} ${product.size} is currently unavailable.`,
      };
    }

    const order = await this.prisma.order.create({
      data: {
        conversationId: input.conversationId,
        customerPhone: input.customerPhone,
        productId: product.id,
        quantity: input.quantity,
        deliveryType: input.deliveryType,
        deliveryAddress: input.address,
        status: 'pending',
      },
    });

    return {
      created: true as const,
      orderId: order.id,
      brand: input.brand,
      size: input.size,
      quantity: input.quantity,
      unitPrice: Number(product.price),
      total: Number(product.price) * input.quantity,
      deliveryType: input.deliveryType,
      address: input.address ?? null,
    };
  }
}
