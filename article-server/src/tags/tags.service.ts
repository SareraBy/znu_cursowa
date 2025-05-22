import { Injectable } from '@nestjs/common';
import { pool } from '../db';

export interface Tag {
  id: number;
  tag: string;
}

@Injectable()
export class TagsService {
  async findAll(): Promise<Tag[]> {
    const res = await pool.query<Tag>(`SELECT id, tag FROM tags`);
    return res.rows;
  }

  async create(dto: { tag: string }): Promise<Tag> {
    const res = await pool.query<Tag>(
      `INSERT INTO tags(tag) VALUES($1) RETURNING *`,
      [dto.tag],
    );
    return res.rows[0];
  }
}
