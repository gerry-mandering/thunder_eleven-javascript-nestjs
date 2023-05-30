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

  @IsEnum(Level)
  @IsOptional()
  teamLevel?: Level;

  @IsNumber()
  @IsOptional()
  mannerRate?: number;

  @IsNumber()
  @IsOptional()
  headCount?: number;

  @IsNumber()
  @IsOptional()
  leaderId?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  teamMember?: string[];
}
