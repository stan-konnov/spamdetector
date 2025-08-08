import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePostRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(280)
  content!: string;
}
