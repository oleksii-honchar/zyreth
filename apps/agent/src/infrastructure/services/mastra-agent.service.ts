import type { ZyrethChatMessage } from '@/use-cases/run-prompt.use-case';
import { Agent } from '@mastra/core/agent';
import { Injectable } from '@nestjs/common';
import config from 'config';
import { z } from 'zod';

/** Mirrors `config/llm` — sampling for Mastra; HF/ctx/cache align with local llama.cpp runs. */
const llmConfigSchema = z.object({
  baseUrl: z.string().min(1),
  apiKey: z.string(),
  model: z.string().min(1),
  provider: z.string().optional(),
  temperature: z.coerce.number().optional(),
  maxTokens: z.coerce.number().optional(),
  maxOutputTokens: z.coerce.number().optional(),
  topP: z.coerce.number().optional(),
  topK: z.coerce.number().optional(),
  minP: z.coerce.number().optional(),
  /** Context length (llama-cli `--ctx-size`); informational for ops — set on the inference server. */
  ctxSize: z.coerce.number().int().positive().optional(),
  /** Hugging Face `-hf` ref, e.g. `unsloth/Qwen3.5-27B-GGUF:UD-Q4_K_XL`. */
  huggingfaceModel: z.string().optional(),
  /** Cache / HF home hint (env `LLAMA_CACHE`); used when running llama-cli locally, not by Nest. */
  llamaCache: z.string().optional(),
});

type LlmConfig = z.infer<typeof llmConfigSchema>;

function buildModelSettings(c: LlmConfig): {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
} {
  const maxOutputTokens = c.maxOutputTokens ?? c.maxTokens;
  return {
    ...(typeof c.temperature === 'number' ? { temperature: c.temperature } : {}),
    ...(typeof c.topP === 'number' ? { topP: c.topP } : {}),
    ...(typeof c.topK === 'number' ? { topK: c.topK } : {}),
    ...(typeof maxOutputTokens === 'number' ? { maxOutputTokens } : {}),
  };
}

@Injectable()
export class MastraAgentService {
  private readonly agent: Agent;

  constructor() {
    const parsed = llmConfigSchema.safeParse(config.get('llm'));
    if (!parsed.success) {
      const detail = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
      throw new Error(`Invalid config "llm": ${detail}`);
    }
    const llmConfig: LlmConfig = parsed.data;
    const modelSettings = buildModelSettings(llmConfig);
    const hasModelSettings = Object.keys(modelSettings).length > 0;
    const hasMinP = typeof llmConfig.minP === 'number';

    this.agent = new Agent({
      id: 'zyreth-hello-world-agent',
      name: 'Zyreth Hello World Agent',
      instructions: `You are a playful programming assistant.

Your only job is to reply with a short, self-contained programming-related joke.

Rules:
- Ignore the user prompt content completely.
- Always respond with a single, brief joke (1–3 sentences).
- Do not ask follow-up questions or reference external files/tools.`,
      model: {
        id: `custom/${llmConfig.model}`,
        url: llmConfig.baseUrl,
        apiKey: llmConfig.apiKey,
      },
      ...(hasModelSettings || hasMinP
        ? {
            defaultOptions: {
              ...(hasModelSettings ? { modelSettings } : {}),
              ...(hasMinP
                ? {
                    providerOptions: {
                      openai: { min_p: llmConfig.minP },
                    },
                  }
                : {}),
            },
          }
        : {}),
    });
  }

  async run(messages: ZyrethChatMessage[]): Promise<string> {
    const userMessage = messages.find(message => message.role === 'user');
    const prompt = userMessage?.content ?? '';

    const result = await this.agent.generate(prompt);
    return result.text ?? '';
  }
}
