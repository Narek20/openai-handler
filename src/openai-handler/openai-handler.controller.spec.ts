import { Test, TestingModule } from '@nestjs/testing';
import { CreatePromptDto } from './dto/openai-handler.dto';
import { OpenaiHandlerService } from './openai-handler.service';
import { OpenaiHandlerController } from './openai-handler.controller';

describe('OpenaiHandlerController', () => {
  let controller: OpenaiHandlerController;
  let service: OpenaiHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpenaiHandlerController],
      providers: [
        {
          provide: OpenaiHandlerService,
          useValue: {
            getOpenAIResult: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OpenaiHandlerController>(OpenaiHandlerController);
    service = module.get<OpenaiHandlerService>(OpenaiHandlerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a result from the service', async () => {
    const prompt = 'Test prompt';
    const mockResult = 'This is the mocked OpenAI response.';
    const createPromptDto: CreatePromptDto = { prompt };

    jest.spyOn(service, 'getOpenAIResult').mockResolvedValue(mockResult);

    const result = await controller.handlePrompt(createPromptDto);

    expect(result).toEqual({ result: mockResult });
    expect(service.getOpenAIResult).toHaveBeenCalledWith(prompt);
  });

  it('should throw an error if the service throws an error', async () => {
    const prompt = 'Test prompt';
    const createPromptDto: CreatePromptDto = { prompt };

    jest.spyOn(service, 'getOpenAIResult').mockRejectedValue(new Error('Service error'));

    await expect(controller.handlePrompt(createPromptDto)).rejects.toThrow('Service error');
  });
});
