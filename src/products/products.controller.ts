import { Body, Controller, Get, Header, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { AdminKeyGuard } from './admin-key.guard';
import { DASHBOARD_HTML } from './dashboard.html';

@Controller()
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get('dashboard')
  @Header('Content-Type', 'text/html; charset=utf-8')
  dashboard() {
    return DASHBOARD_HTML;
  }

  @Get('products')
  @UseGuards(AdminKeyGuard)
  list() {
    return this.products.listProducts();
  }

  @Patch('products/:id')
  @UseGuards(AdminKeyGuard)
  setAvailability(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAvailabilityDto) {
    return this.products.setAvailabilityById(id, dto.inStock);
  }
}
