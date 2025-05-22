import { Injectable } from '@nestjs/common';
import { pool } from '../db';

export interface Category {
  id: number;
  name: string;
  description?: string;
}

@Injectable()
export class CategoriesService {
  async findAll(): Promise<Category[]> {
    const res = await pool.query<Category>(
      `SELECT id, name, description FROM categories`
    );
    return res.rows;
  }
}
