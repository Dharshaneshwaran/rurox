import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PeriodAssignment {
  @IsString()
  replacementTeacherId: string;

  @IsNumber()
  @IsOptional()
  period?: number;

  @IsString()
  @IsOptional()
  specialClassId?: string;
}

export class ConfirmFullDayDto {
  @IsString()
  absentTeacherId: string;

  @IsString()
  date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PeriodAssignment)
  assignments: PeriodAssignment[];
}
