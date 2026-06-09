import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Grade } from './grade.entity';

@Entity('students')
export class Student {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id' })
    user_id: number;

    @Column({ name: 'first_name' })
    first_name: string;

    @Column({ name: 'last_name' })
    last_name: string;

    @Column({ name: 'group_name' })
    group_name: string;

    @Column({ default: 1 })
    year: number;

    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => Grade, grade => grade.student)
    grades: Grade[];
}