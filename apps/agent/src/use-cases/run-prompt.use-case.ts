import { BasePinoLogger } from '@/infrastructure/logging/base-pino-logger';
import { MastraAgentService } from '@/infrastructure/services/mastra-agent.service';
import { Injectable } from '@nestjs/common';

export interface ZyrethChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface RunPromptParams {
  model: string;
  messages: ZyrethChatMessage[];
}

export interface RunPromptResult {
  content: string;
}

@Injectable()
export class RunPromptUseCase {
  constructor(
    private readonly logger: BasePinoLogger,
    private readonly mastraAgentService: MastraAgentService,
  ) {
    this.logger.setContext(RunPromptUseCase.name);
  }

  async execute(params: RunPromptParams): Promise<RunPromptResult> {
    this.logger.debug('Executing Zyreth prompt', {
      model: params.model,
      hasUserMessage: params.messages.some(message => message.role === 'user'),
    });

    const responseContent = await this.mastraAgentService.run(params.messages);

    return { content: responseContent };
  }
}
