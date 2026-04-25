import { Module } from '@nestjs/common';
import { NoticesService } from './notices.service';
import { NoticesController } from './notices.controller';

@Module({
  providers: [NoticesService],
  controllers: [NoticesController]
})
export class NoticesModule {}
