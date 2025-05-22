import { Controller, Get, Post, Body } from '@nestjs/common';
import { TagsService, Tag } from './tags.service';

@Controller('tags')
export class TagsController {
  constructor(private readonly svc: TagsService) {}

  @Get()
  findAll(): Promise<Tag[]> {
    return this.svc.findAll();
  }

  @Post()
  create(@Body() dto: { tag: string }): Promise<Tag> {
    return this.svc.create(dto);
  }
}
