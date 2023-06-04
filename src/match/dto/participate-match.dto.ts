import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ParticipateMatchDto {
  @IsString()
  @IsNotEmpty()
  awayTeamParticipatingMemberString: string;
}
