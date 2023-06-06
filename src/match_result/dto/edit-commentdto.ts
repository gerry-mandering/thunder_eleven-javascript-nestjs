import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class EditCommentdto {
  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  commentString: string;
}
