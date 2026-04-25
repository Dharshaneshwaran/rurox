import { IsDateString, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateExamDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  className: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsInt()
  @Min(1)
  maxMarks: number;

  @IsDateString()
  @IsNotEmpty()
  examDate: string;
}
