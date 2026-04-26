import { Module } from '@nestjs/common';
import { SchoolClassesController } from './school-classes.controller';
import { SchoolClassesService } from './school-classes.service';

@Module({
  controllers: [SchoolClassesController],
  providers: [SchoolClassesService]
})
export class SchoolClassesModule {}
