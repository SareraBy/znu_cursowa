

import { Injectable, NotFoundException } from '@nestjs/common';
import { pool } from '../db';

export interface Article {
  id: number;
  title: string;
  content: string;
  author_id: number;
  category_id: number;
  status: string;
  created_date: Date;
  updated_date: Date;
  category_name?: string;
  tags?: string[];
}

export interface ArticleInput {
  title: string;
  content: string;
  author_id: number;
  category_id: number;
  status: string;
  tags?: number[];
}

@Injectable()
export class ArticlesService {

  async findAll(): Promise<Article[]> {
    const client = await pool.connect();
    try {

      const res = await client.query<Article>(`
        SELECT a.*, c.name AS category_name
        FROM articles a
        LEFT JOIN categories c ON a.category_id = c.id
        ORDER BY a.created_date DESC
      `);
      const articles = res.rows;

      const tagsRes = await client.query<{ article_id: number; tag: string }>(`
        SELECT at.article_id, t.tag
        FROM article_tags at
        JOIN tags t ON at.tag_id = t.id
      `);
      const tagsMap = new Map<number, string[]>();
      for (const row of tagsRes.rows) {
        if (!tagsMap.has(row.article_id)) tagsMap.set(row.article_id, []);
        tagsMap.get(row.article_id)!.push(row.tag);
      }


      for (const art of articles) {
        art.tags = tagsMap.get(art.id) || [];
      }

      return articles;
    } finally {
      client.release();
    }
  }


  async findOne(id: number): Promise<Article> {
    const client = await pool.connect();
    try {
      const res = await client.query<Article>(`
        SELECT a.*, c.name AS category_name
        FROM articles a
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE a.id = $1
      `, [id]);
      if (res.rowCount === 0) {
        throw new NotFoundException(`Статья с id=${id} не найдена`);
      }
      const article = res.rows[0];

      const tagsRes = await client.query<{ tag: string }>(`
        SELECT t.tag
        FROM article_tags at
        JOIN tags t ON at.tag_id = t.id
        WHERE at.article_id = $1
      `, [id]);
      article.tags = tagsRes.rows.map(r => r.tag);

      return article;
    } finally {
      client.release();
    }
  }


  async create(data: ArticleInput): Promise<Article> {
    const client = await pool.connect();
    try {
      const res = await client.query<Article>(`
        INSERT INTO articles (title, content, author_id, category_id, status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [
        data.title,
        data.content,
        data.author_id,
        data.category_id,
        data.status,
      ]);
      const article = res.rows[0];


      if (data.tags?.length) {
        for (const raw of data.tags) {
          const tagId = Number(raw);
          if (Number.isInteger(tagId) && tagId > 0) {
            await client.query(
              `INSERT INTO article_tags(article_id, tag_id) VALUES ($1, $2)`,
              [article.id, tagId]
            );
          }
        }
      }

      return article;
    } finally {
      client.release();
    }
  }


  async update(id: number, data: Partial<ArticleInput>): Promise<Article> {
    const client = await pool.connect();
    try {

      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      for (const [key, val] of Object.entries(data)) {
        if (key === 'tags' || val === undefined) continue;
        fields.push(`"${key}" = $${idx}`);
        values.push(val);
        idx++;
      }

      if (fields.length) {
        values.push(id);
        await client.query(
          `UPDATE articles SET ${fields.join(', ')} WHERE id = $${idx}`,
          values
        );
      }


      if (data.tags !== undefined) {

        await client.query(
          `DELETE FROM article_tags WHERE article_id = $1`,
          [id]
        );

        for (const raw of data.tags) {
          const tagId = Number(raw);
          if (Number.isInteger(tagId) && tagId > 0) {
            await client.query(
              `INSERT INTO article_tags(article_id, tag_id) VALUES ($1, $2)`,
              [id, tagId]
            );
          }
        }
      }

      return this.findOne(id);
    } finally {
      client.release();
    }
  }


  async remove(id: number): Promise<void> {
    const client = await pool.connect();
    try {

      await client.query(
        `DELETE FROM article_tags WHERE article_id = $1`,
        [id]
      );

      await client.query(
        `DELETE FROM comments WHERE article_id = $1`,
        [id]
      );

      await client.query(
        `DELETE FROM articles WHERE id = $1`,
        [id]
      );
    } finally {
      client.release();
    }
  }
}
