import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenaiHandlerService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async getOpenAIResult(prompt: string): Promise<string> {
    if (!prompt) {
      throw new BadRequestException('Prompt field is required');
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      });

      if (!response || !response.choices || !response.choices.length) {
        throw new InternalServerErrorException('Invalid response from OpenAI API.');
      }

      return response.choices[0].message.content.trim();
    } catch (error) {
      if (error.response && error.response.status === 401) {
        throw new BadRequestException('Invalid API key provided.');
      }

      throw new InternalServerErrorException('Error while communicating with OpenAI.');
    }
  }
}
