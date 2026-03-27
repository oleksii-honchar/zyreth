import { Injectable, Logger } from '@nestjs/common';
import { MastraZyrethAgentService } from '../infrastructure/mastra-zyreth-agent.service';

export interface ZyrethChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface RunZyrethPromptParams {
  model: string;
  messages: ZyrethChatMessage[];
}

export interface RunZyrethPromptResult {
  content: string;
}

@Injectable()
export class RunZyrethPromptUseCase {
  constructor(
    private readonly logger: Logger,
    private readonly mastraZyrethAgentService: MastraZyrethAgentService,
  ) {
  }

  async execute(params: RunZyrethPromptParams): Promise<RunZyrethPromptResult> {
    this.logger.debug('Executing Zyreth prompt', {
      model: params.model,
      hasUserMessage: params.messages.some((message) => message.role === 'user'),
    });

    const responseContent = await this.mastraZyrethAgentService.run(params.messages);

    return { content: responseContent };
  }
}

