import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from './student.entity';
import { Subject } from './subject.entity';

@Entity('grades')
export class Grade {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'student_id' })
    student_id: number;

    @Column({ name: 'subject_id' })
    subject_id: number;

    @Column()
    grade: number;

    @Column({ type: 'date', default: () => 'CURRENT_DATE' })
    date: string;

    @ManyToOne(() => Student, student => student.grades)
    @JoinColumn({ name: 'student_id' })
    student: Student;

    @ManyToOne(() => Subject, subject => subject.grades)
    @JoinColumn({ name: 'subject_id' })
    subject: Subject;
}