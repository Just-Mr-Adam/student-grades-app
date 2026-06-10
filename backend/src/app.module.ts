import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { SubjectsModule } from './subjects/subjects.module';
import { GradesModule } from './grades/grades.module';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Student } from './entities/student.entity';
import { Subject } from './entities/subject.entity';
import { Grade } from './entities/grade.entity';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DB_HOST'),
                port: +configService.get('DB_PORT'),
                username: configService.get('DB_USERNAME'),
                password: configService.get('DB_PASSWORD'),
                database: configService.get('DB_DATABASE'),
                entities: [User, Role, Student, Subject, Grade],
                synchronize: false,
                logging: true,
            }),
            inject: [ConfigService],
        }),
        AuthModule,
        UsersModule,
        StudentsModule,
        SubjectsModule,
        GradesModule,
    ],
})
export class AppModule { }