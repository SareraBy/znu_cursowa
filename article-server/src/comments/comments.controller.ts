import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comment as ServiceComment } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private readonly svc: CommentsService) {}


  @Get('article/:id')
  findByArticle(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ServiceComment[]> {
    return this.svc.findByArticle(id);
  }


  @Post()
  createComment(
    @Body() dto: Partial<ServiceComment>,
  ): Promise<ServiceComment> {

    return this.svc.create({
      content: dto.content!,
      author_id: dto.author_id!,
      article_id: dto.article_id!,
      parent_id: dto.parent_id || null,
    });
  }
}
