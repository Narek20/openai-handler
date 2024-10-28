import { Module } from '@nestjs/common';
import { OpenaiHandlerService } from './openai-handler.service';
import { OpenaiHandlerController } from './openai-handler.controller';

@Module({
  controllers: [OpenaiHandlerController],
  providers: [OpenaiHandlerService],
})

export class OpenaiHandlerModule {}
