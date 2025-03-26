export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: Message[];
  temperature: number;
  max_tokens: number;
  stream: boolean;
}

export interface ChatCompletionResponse {
  choices: {
    message: Message;
  }[];
}
