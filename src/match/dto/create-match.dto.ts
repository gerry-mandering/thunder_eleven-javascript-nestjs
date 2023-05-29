import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMatchDto {
  @IsString()
  @IsNotEmpty()
  stadiumName: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  headCountPerTeam: number;

  //수정필요
  //   @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  homeTeamParticipatingMember: string[];
}
