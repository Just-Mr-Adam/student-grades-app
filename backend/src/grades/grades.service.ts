import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from '../entities/grade.entity';

@Injectable()
export class GradesService {
    constructor(
        @InjectRepository(Grade)
        private gradesRepository: Repository<Grade>,
    ) { }

    async createGrade(studentId: number, subjectId: number, gradeValue: number, userId: number, roleId: number) {
        const grade = this.gradesRepository.create({
            student_id: studentId,
            subject_id: subjectId,
            grade: gradeValue,
        });
        const saved = await this.gradesRepository.save(grade);
        return this.gradesRepository.findOne({
            where: { id: saved.id },
            relations: { student: { user: true }, subject: true },
        });
    }

    async getGradesByStudent(studentId: number) {
        return this.gradesRepository.find({
            where: { student_id: studentId },
            relations: { subject: true },
        });
    }

    async getAllGrades() {
        return this.gradesRepository.find({
            relations: { student: { user: true }, subject: true },
        });
    }

    async updateGrade(id: number, grade: number, userId: number, roleId: number) {
        const gradeEntity = await this.gradesRepository.findOne({ where: { id } });
        if (!gradeEntity) {
            throw new NotFoundException(`Grade with id ${id} not found`);
        }
        gradeEntity.grade = grade;
        await this.gradesRepository.save(gradeEntity);
        return this.gradesRepository.findOne({
            where: { id },
            relations: { student: { user: true }, subject: true },
        });
    }

    async deleteGrade(id: number, userId: number, roleId: number) {
        const gradeEntity = await this.gradesRepository.findOne({ where: { id } });
        if (!gradeEntity) {
            throw new NotFoundException(`Grade with id ${id} not found`);
        }
        return this.gradesRepository.remove(gradeEntity);
    }
}