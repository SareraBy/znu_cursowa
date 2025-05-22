
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ArticlesService, Article, ArticleInput } from './articles.service';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly svc: ArticlesService) {}

  @Get()
  findAll(): Promise<Article[]> {
    return this.svc.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number
  ): Promise<Article> {
    return this.svc.findOne(id);
  }

  @Post()
  create(
    @Body() data: ArticleInput
  ): Promise<Article> {
    return this.svc.create(data);
  }


  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<ArticleInput>
  ): Promise<Article> {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number
  ): Promise<void> {
    return this.svc.remove(id);
  }
}
