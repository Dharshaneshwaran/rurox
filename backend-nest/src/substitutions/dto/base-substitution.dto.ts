import { IsInt, IsString, Max, Min } from 'class-validator';

export class BaseSubstitutionDto {
  @IsString()
  absentTeacherId: string;

  @IsString()
  day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';

  @IsInt()
  @Min(1)
  @Max(8)
  period: number;

  @IsString()
  date: string;
}
