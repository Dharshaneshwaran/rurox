import { IsString } from 'class-validator';
import { BaseSubstitutionDto } from './base-substitution.dto';

export class ManualSubstitutionDto extends BaseSubstitutionDto {
  @IsString()
  replacementTeacherId: string;
}
