import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { NoticesService } from './notices.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/notices')
@UseGuards(AuthGuard, RolesGuard)
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  // Admin: Post a notice
  @Post()
  @Roles('ADMIN')
  async createNotice(@Body() dto: CreateNoticeDto, @Request() req: any) {
    const postedBy = req.user.email;
    return this.noticesService.createNotice(dto, postedBy);
  }

  // All roles: View notices
  @Get()
  @Roles('ADMIN', 'TEACHER', 'STUDENT')
  async getAllNotices() {
    return this.noticesService.getAllNotices();
  }

  // Admin: Delete a notice
  @Delete(':id')
  @Roles('ADMIN')
  async deleteNotice(@Param('id') id: string) {
    return this.noticesService.deleteNotice(id);
  }
}
