import { IsString, IsOptional } from 'class-validator';

export class CreateSpecialClassDto {
  @IsString()
  teacherId: string;

  @IsString()
  date: string;

  @IsString()
  fromTime: string;

  @IsString()
  toTime: string;

  @IsString()
  subject: string;

  @IsString()
  className: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
