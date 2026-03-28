import { IsString } from 'class-validator';

export class FullDayAbsenceDto {
  @IsString()
  absentTeacherId: string;

  @IsString()
  date: string;
}
