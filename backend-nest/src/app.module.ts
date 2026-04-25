import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { TeachersModule } from './teachers/teachers.module';
import { TimetablesModule } from './timetables/timetables.module';
import { SubstitutionsModule } from './substitutions/substitutions.module';
import { SpecialClassesModule } from './special-classes/special-classes.module';
import { StudentsModule } from './students/students.module';
import { MailModule } from './mail/mail.module';
import { LeavesModule } from './leaves/leaves.module';
import { ExamsModule } from './exams/exams.module';
import { NoticesModule } from './notices/notices.module';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AdminModule,
    TeachersModule,
    TimetablesModule,
    SubstitutionsModule,
    SpecialClassesModule,
    StudentsModule,
    MailModule,
    LeavesModule,
    ExamsModule,
    NoticesModule,
    AttendanceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
