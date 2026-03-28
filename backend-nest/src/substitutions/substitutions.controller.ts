import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { AuthUser } from '../auth/auth.types';
import { BaseSubstitutionDto } from './dto/base-substitution.dto';
import { ManualSubstitutionDto } from './dto/manual-substitution.dto';
import { SubstitutionsService } from './substitutions.service';

@Controller('api/substitutions')
@UseGuards(AuthGuard, RolesGuard)
export class SubstitutionsController {
  constructor(private readonly substitutionsService: SubstitutionsService) {}

  @Get()
  async findAll(@Req() req: Request & { user?: AuthUser }) {
    if (!req.user) {
      return { substitutions: [] };
    }
    return this.substitutionsService.findAll(req.user);
  }

  @Post('manual')
  @Roles('ADMIN')
  async createManual(@Body() body: ManualSubstitutionDto) {
    return this.substitutionsService.createManual(body);
  }

  @Post('auto')
  @Roles('ADMIN')
  async createAuto(@Body() body: BaseSubstitutionDto) {
    return this.substitutionsService.createAuto(body);
  }
}
