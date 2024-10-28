import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { OpenaiHandlerModule } from '../src/openai-handler/openai-handler.module';
import { OpenaiHandlerService } from '../src/openai-handler/openai-handler.service';

describe('OpenaiHandlerController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([{
          ttl: 60000,
          limit: 5,
        }]),
        ConfigModule.forRoot(),
        OpenaiHandlerModule,
      ],
      providers: [
        {
          provide: APP_GUARD,
          useClass: ThrottlerGuard,
        },
      ],
    })
      .overrideProvider(OpenaiHandlerService)
      .useValue({
        getOpenAIResult: jest.fn().mockResolvedValue('This is a mock OpenAI response.'),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/generate-text (POST) should return OpenAI result', async () => {
    const prompt = 'Write a poem about the sea';

    return request(app.getHttpServer())
      .post('/api/generate-text')
      .send({ prompt })
      .expect(201)
      .expect({
        result: 'This is a mock OpenAI response.',
      });
  });

  it('/api/generate-text (POST) should return 400 if prompt is empty', async () => {
    return request(app.getHttpServer())
      .post('/api/generate-text')
      .send({ prompt: '' })
      .expect(400);
  });

  it('/api/generate-text (POST) should return 400 if prompt is not specified', async () => {
    return request(app.getHttpServer())
      .post('/api/generate-text')
      .send({})
      .expect(400);
  });


  it('/api/generate-text (POST) should return 429 if too many requests', async () => {
    const prompt = 'Write a poem about the sea';

    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer()).post('/api/generate-text').send({ prompt });
    }

    return request(app.getHttpServer())
      .post('/api/generate-text')
      .send({ prompt })
      .expect(429);
  });
});
