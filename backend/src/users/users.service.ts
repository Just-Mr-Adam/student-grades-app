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

    async findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async findOne(id: number): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) throw new NotFoundException(`User ${id} not found`);
        return user;
    }

    async create(email: string, password: string, roleId: number): Promise<User> {
        const existing = await this.usersRepository.findOne({ where: { email } });
        if (existing) throw new ConflictException('Email already exists');

        const hashed = await bcrypt.hash(password, 10);
        const user = this.usersRepository.create({
            email,
            password_hash: hashed,
            role_id: roleId,
        });
        return this.usersRepository.save(user);
    }
}