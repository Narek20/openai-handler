import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { ChatCompletion } from 'openai/resources';
import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { OpenaiHandlerService } from './openai-handler.service';

jest.mock('openai');

describe('OpenaiHandlerService', () => {
  let service: OpenaiHandlerService;
  let configService: ConfigService;
  let openaiMock: jest.Mocked<OpenAI>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenaiHandlerService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('fake-api-key'),
          },
        },
      ],
    }).compile();

    service = module.get<OpenaiHandlerService>(OpenaiHandlerService);
    configService = module.get<ConfigService>(ConfigService);

    openaiMock = new OpenAI({
      apiKey: 'fake-api-key',
    }) as jest.Mocked<OpenAI>;

    openaiMock.chat = {
      completions: {
        create: jest.fn(), 
      } ,
    } as unknown as jest.Mocked<OpenAI.Chat>;

    service['openai'] = openaiMock;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a valid response from the API', async () => {
    const prompt = 'Test prompt';
    const mockResponse = {
      id: 'chatcmpl-123',
      object: 'chat.completion',
      created: 1677652283,
      model: 'gpt-3.5-turbo',
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'This is the OpenAI response',
          },
          index: 0,
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 9,
        completion_tokens: 12,
        total_tokens: 21,
      },
    } as ChatCompletion

    jest.spyOn(service['openai'].chat.completions, 'create').mockResolvedValue(mockResponse);

    const result = await service.getOpenAIResult(prompt);
    expect(result).toBe('This is the OpenAI response');
  });

  it('should throw an error if API response is invalid (no choices)', async () => {
    const prompt = 'Test prompt';
    const mockInvalidResponse: ChatCompletion = {
      id: 'chatcmpl-123',
      object: 'chat.completion',
      created: 1677652283,
      model: 'gpt-3.5-turbo',
      choices: [],
      usage: {
        prompt_tokens: 9,
        completion_tokens: 12,
        total_tokens: 21,
      },
    };

    jest.spyOn(service['openai'].chat.completions, 'create').mockResolvedValue(mockInvalidResponse);

    await expect(service.getOpenAIResult(prompt)).rejects.toThrow(
      new InternalServerErrorException('Error while communicating with OpenAI.')
    );
  });

  it('should throw an error if OpenAI API returns 401', async () => {
    const prompt = 'Test prompt';

    const mockError = { response: { status: 401 } };
    jest.spyOn(service['openai'].chat.completions, 'create').mockRejectedValue(mockError);

    await expect(service.getOpenAIResult(prompt)).rejects.toThrow(
      new BadRequestException('Invalid API key provided.')
    );
  });

  it('should throw a general InternalServerErrorException for other errors', async () => {
    const prompt = 'Test prompt';

    const mockError = { response: { status: 500 } };
    jest.spyOn(service['openai'].chat.completions, 'create').mockRejectedValue(mockError);

    await expect(service.getOpenAIResult(prompt)).rejects.toThrow(
      new InternalServerErrorException('Error while communicating with OpenAI.')
    );
  });

  it('should throw a BadRequestException if prompt is empty', async () => {
    const prompt = '';
  
    await expect(service.getOpenAIResult(prompt)).rejects.toThrow(
      new BadRequestException('Prmpt field is required')
    );
  });
});
