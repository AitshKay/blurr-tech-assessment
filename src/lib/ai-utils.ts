// Common types and utilities for AI functionality

export type AIMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  model?: string;
  provider?: string;
};

export type AIProvider = {
  id: string;
  name: string;
  baseUrl: string;
  requiresKey: boolean;
  models: AIModel[];
  defaultModel: string;
};

export type AIModel = {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  maxTokens: number;
  isDefault?: boolean;
};

// Format bytes to human-readable format (e.g., 1024 -> '1 KB')
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Format token count with thousands separators
export function formatTokens(count: number): string {
  return count.toLocaleString();
}

// Format date to relative time (e.g., '2 hours ago')
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };
  
  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      return interval === 1 
        ? `1 ${unit} ago` 
        : `${interval} ${unit}s ago`;
    }
  }
  
  return 'just now';
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Generate a unique ID
export function generateId(prefix = ''): string {
  return `${prefix}${Math.random().toString(36).substring(2, 11)}`;
}

// Debounce function
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Parse JSON safely
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (e) {
    console.error('Failed to parse JSON:', e);
    return defaultValue;
  }
}

// Stringify JSON safely
export function safeJsonStringify<T>(data: T, defaultValue = ''): string {
  try {
    return JSON.stringify(data);
  } catch (e) {
    console.error('Failed to stringify data:', e);
    return defaultValue;
  }
}

// Format model name for display
export function formatModelName(modelId: string): string {
  // Convert model IDs to more readable names
  const modelMap: Record<string, string> = {
    'gemini-1.5-flash': 'Gemini 1.5 Flash',
    'gemini-1.5-pro': 'Gemini 1.5 Pro',
    'gpt-4o': 'GPT-4o',
    'gpt-4-turbo': 'GPT-4 Turbo',
    'claude-3-opus-20240229': 'Claude 3 Opus',
    'claude-3-sonnet-20240229': 'Claude 3 Sonnet',
  };
  
  return modelMap[modelId] || modelId;
}

// Get provider name from ID
export function getProviderName(providerId: string): string {
  const providerMap: Record<string, string> = {
    'google': 'Google',
    'openai': 'OpenAI',
    'anthropic': 'Anthropic',
    'alibaba': 'Alibaba',
    'ollama': 'Ollama',
  };
  
  return providerMap[providerId] || providerId;
}
