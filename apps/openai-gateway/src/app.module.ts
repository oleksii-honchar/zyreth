import { Module, Logger } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { createHttpLogger } from './infrastructure/logging/pino-logger.factory';
import { OpenAiController } from './infrastructure/controllers/openai.controller';
import { MastraZyrethAgentService } from './infrastructure/mastra-zyreth-agent.service';
import { RunZyrethPromptUseCase } from './use-cases/run-zyreth-prompt.use-case';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        logger: createHttpLogger('ZyrethOpenAIGateway'),
      },
    }),
  ],
  controllers: [OpenAiController],
  providers: [Logger, MastraZyrethAgentService, RunZyrethPromptUseCase],
})
export class AppModule { }

