import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class EditMatchByHomeLeaderDto {
  @IsString()
  @IsOptional()
  stadiumName: string;

  @IsNumber()
  @IsOptional()
  headCountPerTeam: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  homeTeamParticipatingMember: string[];
}
