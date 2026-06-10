import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get()
    @Roles(1) // только админ (role_id=1)
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @Roles(1) // можно позже сделать: админ или сам пользователь
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(+id);
    }

    @Post()
    @Roles(1)
    create(@Body() body: { email: string; password: string; roleId: number }) {
        return this.usersService.create(body.email, body.password, body.roleId);
    }
}