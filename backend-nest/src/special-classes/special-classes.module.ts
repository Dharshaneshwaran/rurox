import { Module } from '@nestjs/common';
import { SpecialClassesController } from './special-classes.controller';
import { SpecialClassesService } from './special-classes.service';

@Module({
  controllers: [SpecialClassesController],
  providers: [SpecialClassesService],
})
export class SpecialClassesModule {}
