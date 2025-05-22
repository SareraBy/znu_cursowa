import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { pool } from '../db';
import { UserEntity } from './user.entity';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(
    dto: Omit<UserEntity, 'id'>,
  ): Promise<Omit<UserEntity, 'password'>> {

    const hash = await bcrypt.hash(dto.password, 10);

    try {
      const result = await pool.query<Omit<UserEntity, 'password'>>(
        `
          INSERT INTO users (name, email, password, role)
          VALUES ($1, $2, $3, $4)
          RETURNING id, name, email, role
        `,
        [dto.name, dto.email, hash, dto.role || 'user'],
      );
      return result.rows[0];
    } catch (error: any) {

      if (error.code === '23505' && error.constraint === 'users_email_key') {
        throw new ConflictException('Пользователь с таким email уже существует');
      }

      throw error;
    }
  }


  async login(dto: { email: string; password: string }): Promise<{
    access_token: string;
    user: Omit<UserEntity, 'password'>;
  }> {
    const res = await pool.query<UserEntity>(
      'SELECT * FROM users WHERE email = $1',
      [dto.email],
    );

    const user = res.rows[0];
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    const payload = { sub: user.id, role: user.role };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }


  async getUserFromToken(token: string): Promise<Omit<UserEntity, 'password'>> {
    const payload = await this.jwtService.verifyAsync<{ sub: number; role: string }>(token);
    const res = await pool.query<Omit<UserEntity, 'password'>>(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [payload.sub],
    );
    return res.rows[0];
  }
}
