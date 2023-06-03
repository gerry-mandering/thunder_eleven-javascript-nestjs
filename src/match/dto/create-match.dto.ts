import { Type } from 'class-transformer';
import { IsArray, IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateMatchDto {
  @IsString()
  @IsNotEmpty()
  stadiumName: string;

  @IsString()
  @IsNotEmpty()
  stadiumAddress: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  matchDateTime: Date;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  matchLevelBitMask: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  headCountPerTeam: number;

  @IsString()
  @IsNotEmpty()
  homeTeamParticipatingMemberString: string;
}
