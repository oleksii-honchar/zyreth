import type { ZyrethChatMessage } from '@/use-cases/run-prompt.use-case';
import { Agent } from '@mastra/core/agent';
import { Injectable } from '@nestjs/common';
import config from 'config';

interface LlmConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

@Injectable()
export class MastraAgentService {
  private readonly agent: Agent;

  constructor() {
    const llmConfig = config.get<LlmConfig>('llm');

    this.agent = new Agent({
      id: 'zyreth-hello-world-agent',
      name: 'Zyreth Hello World Agent',
      instructions: `You are a playful programming assistant.

Your only job is to reply with a short, self-contained programming-related joke.

Rules:
- Ignore the user prompt content completely.
- Always respond with a single, brief joke (1–3 sentences).
- Prefer jokes about TypeScript, Node.js, or backend engineering.
- Do not ask follow-up questions or reference external files/tools.`,
      model: {
        id: `custom/${llmConfig.model}`,
        url: llmConfig.baseUrl,
        apiKey: llmConfig.apiKey,
      },
    });
  }

  async run(messages: ZyrethChatMessage[]): Promise<string> {
    const userMessage = messages.find(message => message.role === 'user');
    const prompt = userMessage?.content ?? '';

    const result = await this.agent.generate(prompt);
    return result.text ?? '';
  }
}
