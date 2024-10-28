import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenaiHandlerService } from './openai-handler/openai-handler.service';
import { OpenaiHandlerController } from './openai-handler/openai-handler.controller';
import { OpenaiHandlerModule } from './openai-handler/openai-handler.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [ 
  ThrottlerModule.forRoot([{
    ttl: 60000,
    limit: 5,
  }]),
  ConfigModule.forRoot(), 
  OpenaiHandlerModule
],
  providers: [
    OpenaiHandlerService, 
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
  controllers: [OpenaiHandlerController],
})

export class AppModule {}
