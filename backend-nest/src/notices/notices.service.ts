import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoticeDto } from './dto/create-notice.dto';

@Injectable()
export class NoticesService {
  constructor(private readonly prisma: PrismaService) {}

  async createNotice(dto: CreateNoticeDto, postedBy: string) {
    return this.prisma.notice.create({
      data: {
        title: dto.title,
        content: dto.content,
        postedBy,
      },
    });
  }

  async getAllNotices() {
    return this.prisma.notice.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteNotice(id: string) {
    const notice = await this.prisma.notice.findUnique({ where: { id } });
    if (!notice) throw new NotFoundException('Notice not found');
    return this.prisma.notice.delete({ where: { id } });
  }
}
