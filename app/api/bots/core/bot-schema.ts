// 봇 관련 스키마 정의
export interface BotConfig {
  id: string;
  name: string;
  description: string;
  initial_message?: string;
  model?: string;
  profiles?: BotProfile[];
  shortcuts?: BotShortcut[];
}

export interface BotProfile {
  id: string;
  name: string;
  description: string;
  active?: boolean;
}

export interface BotShortcut {
  text: string;
  description?: string;
}

export interface BotTools {
  web_search?: boolean;
  file_search?: boolean;
  function?: boolean;
  code_interpreter?: boolean;
  image_vision?: boolean;
  plugins?: string[];
  vector_store?: {
    id: string;
    name: string;
  };
}

export interface BotDefinition {
  id: string;
  config: BotConfig;
  prompt: string;
  tools: BotTools;
  functions?: any[];
}

export interface BotResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}
