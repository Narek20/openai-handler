import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { OpenaiHandlerService } from './openai-handler.service';
import { CreatePromptDto } from './dto/openai-handler.dto';

@Controller('api')
export class OpenaiHandlerController {
  constructor(private readonly openAiHandlerService: OpenaiHandlerService) {}

  @Post('generate-text')
  async handlePrompt(@Body() createPromptDto: CreatePromptDto): Promise<{ result: string }> {
    const { prompt } = createPromptDto;

    if (!prompt || prompt.trim() === '') {
      throw new BadRequestException('Prompt cannot be empty.');
    }
    
    const result = await this.openAiHandlerService.getOpenAIResult(prompt);
    return { result };
  }
}
