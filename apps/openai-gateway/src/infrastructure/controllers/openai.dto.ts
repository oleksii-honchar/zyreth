import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

export class OpenAiChatMessageDto {
  @IsString()
  role!: 'system' | 'user' | 'assistant';

  @IsString()
  content!: string;
}

export class OpenAiChatCompletionsRequestDto {
  @IsString()
  model!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OpenAiChatMessageDto)
  messages!: OpenAiChatMessageDto[];

  @IsOptional()
  @IsString()
  temperature?: string;
}

export interface OpenAiChatCompletionsResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: {
    index: number;
    message: { role: 'assistant'; content: string };
    finish_reason: 'stop';
  }[];
}
