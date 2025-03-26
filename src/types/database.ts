export interface User {
  id: number;
  username: string;
  name: string | null;
  email: string;
  credits: number;
  created_at: Date;
}

export interface LLMModel {
  id: number;
  name: string;
  description: string | null;
  token_cost: number;
  model_path: string;
  parameters: string | null;
  added_at: Date;
}

export interface Chat {
  id: number;
  user_id: number;
  created_at: Date;
  updated_at: Date;
  title: string | null;
  chat_data: {
    messages: {
      role: "system" | "user" | "assistant";
      content: string;
    }[];
  };
}

export interface ChatModel {
  id: number;
  chat_id: number;
  model_id: number;
  used_at: Date;
}

export interface Bookmark {
  id: number;
  chat_id: number;
  name: string;
  description: string | null;
  position_data: {
    message_index: number;
    context: string;
  };
  created_at: Date;
}
