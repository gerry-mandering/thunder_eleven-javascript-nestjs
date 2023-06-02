import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Level } from '@prisma/client';

export class EditTeamDto {
  @IsString()
  @IsOptional()
  teamName?: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  teamMemberString?: string;
}
