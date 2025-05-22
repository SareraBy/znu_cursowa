import { Injectable, ConflictException } from '@nestjs/common';
import { pool } from '../db';
import { CreateUserDto } from './dto/create-user.dto';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
}

@Injectable()
export class UsersService {
  async create(dto: CreateUserDto): Promise<User> {
    const exists = await pool.query('SELECT 1 FROM users WHERE email=$1', [
      dto.email,
    ]);
    if (exists.rowCount) {
      throw new ConflictException('Email уже используется');
    }
    const res = await pool.query<User>(
      'INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING *',
      [dto.name, dto.email, dto.password, dto.role],
    );
    return res.rows[0];
  }
  async findOne(id: number): Promise<User | null> {
    const res = await pool.query<User>(
      'SELECT id, name, email, password, role FROM users WHERE id = $1',
      [id],
    );
    return res.rows[0] || null;
  }
}

