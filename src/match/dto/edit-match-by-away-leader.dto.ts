import { IsArray, IsOptional, IsString } from 'class-validator';

export class EditMatchByAwayLeaderDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  homeTeamParticipatingMember: string[];
}
