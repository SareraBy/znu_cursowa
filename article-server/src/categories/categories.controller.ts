import { Controller, Get } from '@nestjs/common';
import { CategoriesService, Category } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly svc: CategoriesService) {}

  @Get()
  findAll(): Promise<Category[]> {
    return this.svc.findAll();
  }
}
