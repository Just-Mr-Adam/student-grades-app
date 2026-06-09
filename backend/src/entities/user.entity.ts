import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Role } from './role.entity';
import { Student } from './student.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column({ name: 'password_hash' })
    password_hash: string;

    @Column({ name: 'role_id' })
    role_id: number;

    @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @ManyToOne(() => Role)
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @OneToOne(() => Student, student => student.user)
    student: Student;
}