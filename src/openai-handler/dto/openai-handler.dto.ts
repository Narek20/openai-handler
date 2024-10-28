import { IsNotEmpty } from 'class-validator';

export class CreatePromptDto {
  @IsNotEmpty()
  prompt: string;
}
