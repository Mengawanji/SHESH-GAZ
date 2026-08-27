import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}