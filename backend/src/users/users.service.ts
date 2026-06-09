import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async findAll(): Promise<Partial<User>[]> {
        const users = await this.usersRepository.find();
        // Убираем password_hash из ответа для безопасности
        return users.map(({ password_hash, ...rest }) => rest);
    }

    async findOne(id: number): Promise<Partial<User>> {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) throw new NotFoundException(`User with id ${id} not found`);
        const { password_hash, ...rest } = user;
        return rest;
    }

    async create(email: string, password: string, roleId: number): Promise<Partial<User>> {
        const existing = await this.usersRepository.findOne({ where: { email } });
        if (existing) throw new ConflictException('Email already exists');
        const hashed = await bcrypt.hash(password, 10);
        const user = this.usersRepository.create({
            email,
            password_hash: hashed,
            role_id: roleId,
        });
        await this.usersRepository.save(user);
        const { password_hash, ...rest } = user;
        return rest;
    }
}