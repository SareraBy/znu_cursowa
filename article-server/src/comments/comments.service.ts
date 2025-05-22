import { Injectable, NotFoundException } from '@nestjs/common';
import { pool } from '../db';

export interface Comment {
  id: number;
  content: string;
  author_id: number;
  article_id: number;
  created_date: Date;
  parent_id: number | null;
  author_name: string;
}

@Injectable()
export class CommentsService {
  async findByArticle(articleId: number): Promise<Comment[]> {
    const res = await pool.query<Comment>(
      `
        SELECT
          c.id,
          c.content,
          c.author_id,
          c.article_id,
          c.created_date,
          c.parent_id,
          u.name AS author_name
        FROM comments c
               JOIN users u ON c.author_id = u.id
        WHERE c.article_id = $1
        ORDER BY c.created_date
      `,
      [articleId],
    );
    return res.rows;
  }

  async create(data: Partial<Comment>): Promise<Comment> {
    const res = await pool.query<Comment>(
      `
        INSERT INTO comments (content, author_id, article_id, parent_id)
        VALUES ($1,$2,$3,$4)
          RETURNING id, content, author_id, article_id, created_date, parent_id
      `,
      [data.content, data.author_id, data.article_id, data.parent_id || null],
    );
    const comment = res.rows[0];


    const userRes = await pool.query<{ name: string }>(
      `SELECT name FROM users WHERE id = $1`,
      [comment.author_id],
    );
    return { ...comment, author_name: userRes.rows[0].name };
  }
}