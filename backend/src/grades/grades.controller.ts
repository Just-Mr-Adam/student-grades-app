import { Controller, Get, Post, Put, Delete, Body, UseGuards, Request, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GradesService } from './grades.service';

@Controller('grades')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class GradesController {
    constructor(private gradesService: GradesService) { }

    @Get('my')
    @Roles(3)
    async getMyGrades(@Request() req) {
        return this.gradesService.getGradesByStudent(req.user.userId);
    }

    @Post()
    @Roles(1)
    async createGrade(@Body() body: { studentId: number; subjectId: number; grade: number }) {
        return this.gradesService.createGrade(body.studentId, body.subjectId, body.grade);
    }

    @Get()
    @Roles(1, 2)
    async getAllGrades() {
        return this.gradesService.getAllGrades();
    }

    @Put(':id')
    @Roles(1, 2)
    async updateGrade(@Param('id') id: string, @Body('grade') grade: number) {
        return this.gradesService.updateGrade(+id, grade);
    }

    @Delete(':id')
    @Roles(1, 2)
    async deleteGrade(@Param('id') id: string) {
        return this.gradesService.deleteGrade(+id);
    }
}