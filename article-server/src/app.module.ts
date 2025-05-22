import { Module } from '@nestjs/common';
import { ArticlesModule } from './articles/articles.module';
import { AuthModule } from './users/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    ArticlesModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    TagsModule,
    CommentsModule,
  ],
})
export class AppModule {}
