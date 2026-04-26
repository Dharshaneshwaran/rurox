import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateTimetableDto {
  @IsString()
  teacherId: string;

  @IsString()
  day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';

  @IsInt()
  @Min(1)
  @Max(8)
  period: number;

  @IsString()
  subject: string;

  @IsString()
  className: string;

  @IsOptional()
  @IsString()
  room?: string;

  @IsOptional()
  @IsString()
  schoolClassId?: string;
}
