import { RunPromptParams, RunPromptUseCase } from '@/use-cases/run-prompt.use-case';
import { Body, Controller, Post } from '@nestjs/common';
import { OpenAiChatCompletionsRequestDto, OpenAiChatCompletionsResponse } from './openai.dto';

@Controller('/v1')
export class OpenAiController {
  constructor(private readonly runZyrethPromptUseCase: RunPromptUseCase) {}

  @Post('/chat/completions')
  async createChatCompletion(
    @Body() body: OpenAiChatCompletionsRequestDto,
  ): Promise<OpenAiChatCompletionsResponse> {
    const params: RunPromptParams = {
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
