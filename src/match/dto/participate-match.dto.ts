import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ParticipateMatchDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  awayTeamParticipatingMember: string[];
}
