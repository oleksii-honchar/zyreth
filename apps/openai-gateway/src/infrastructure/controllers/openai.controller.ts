import { Body, Controller, Post } from '@nestjs/common';
import {
  OpenAiChatCompletionsRequestDto,
  OpenAiChatCompletionsResponse,
} from './openai.dto';
import {
  RunZyrethPromptUseCase,
  RunZyrethPromptParams,
} from '../../use-cases/run-zyreth-prompt.use-case';

@Controller('/v1')
export class OpenAiController {
  constructor(private readonly runZyrethPromptUseCase: RunZyrethPromptUseCase) { }

  @Post('/chat/completions')
  async createChatCompletion(
    @Body() body: OpenAiChatCompletionsRequestDto,
  ): Promise<OpenAiChatCompletionsResponse> {
    const params: RunZyrethPromptParams = {
      model: body.model,
      messages: body.messages,
    };

    const result = await this.runZyrethPromptUseCase.execute(params);
    const now = Math.floor(Date.now() / 1000);

    return {
      id: `chatcmpl_${now}`,
      object: 'chat.completion',
      created: now,
      model: body.model,
      choices: [
        {
          index: 0,
          message: { role: 'assistant', content: result.content },
          finish_reason: 'stop',
        },
      ],
    };
  }
}

