import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PeriodAssignment {
  @IsString()
  replacementTeacherId: string;

  period: number;
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
