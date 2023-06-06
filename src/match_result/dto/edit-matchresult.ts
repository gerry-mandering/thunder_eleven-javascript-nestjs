import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class EditMatchResultdto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  homeTeamScore: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  awayTeamScore: number;
}
