import { IsArray, IsInt, IsNotEmpty, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ExamResultEntryDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsInt()
  @Min(0)
  marksObtained: number;
}

export class SubmitMarksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamResultEntryDto)
  results: ExamResultEntryDto[];
}
