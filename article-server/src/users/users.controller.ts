// users.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { UsersService, User } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Post()
  register(@Body() dto: CreateUserDto): Promise<User> {
    return this.svc.create(dto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    const user = await this.svc.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id=${id} not found`);
    }
    return user;
  }
}
