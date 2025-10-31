// AI 模型配置

export type AIProvider = 'claude' | 'deepseek' | 'openai'

export interface AIConfig {
  provider: AIProvider
  model: string
  apiKey: string
  baseURL?: string
}

// 风格提取模型配置
const extractProvider = (process.env.EXTRACT_AI_PROVIDER as AIProvider) || 'claude'

console.log('[AI Config] 加载环境变量...')
console.log('  EXTRACT_AI_PROVIDER:', extractProvider)
console.log('  EXTRACT_AI_MODEL:', process.env.EXTRACT_AI_MODEL || '未设置')

if (extractProvider === 'claude') {
  console.log('  ANTHROPIC_API_KEY 存在:', !!process.env.ANTHROPIC_API_KEY)
  console.log('  ANTHROPIC_API_KEY 长度:', process.env.ANTHROPIC_API_KEY?.length || 0)
  console.log('  ANTHROPIC_API_KEY 前15字符:', process.env.ANTHROPIC_API_KEY?.substring(0, 15) || '空')
} else if (extractProvider === 'deepseek') {
  console.log('  DEEPSEEK_API_KEY 存在:', !!process.env.DEEPSEEK_API_KEY)
  console.log('  DEEPSEEK_API_KEY 长度:', process.env.DEEPSEEK_API_KEY?.length || 0)
  console.log('  DEEPSEEK_API_KEY 前15字符:', process.env.DEEPSEEK_API_KEY?.substring(0, 15) || '空')
  console.log('  DEEPSEEK_BASE_URL:', process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com')
}

export const EXTRACT_AI_CONFIG: AIConfig = {
  provider: extractProvider,
  model: process.env.EXTRACT_AI_MODEL || (extractProvider === 'deepseek' ? 'deepseek-chat' : 'claude-sonnet-4-20250514'),
  apiKey: extractProvider === 'deepseek' 
    ? (process.env.DEEPSEEK_API_KEY || '')
    : (process.env.ANTHROPIC_API_KEY || ''),
  baseURL: extractProvider === 'deepseek' 
    ? (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com')
    : undefined,
}

// 文案生成模型配置
export const GENERATE_AI_CONFIG: AIConfig = {
  provider: (process.env.GENERATE_AI_PROVIDER as AIProvider) || 'deepseek',
  model: process.env.GENERATE_AI_MODEL || 'deepseek-chat',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
}

// 获取模型显示名称
export function getModelDisplayName(provider: AIProvider, model: string): string {
  const names: Record<string, string> = {
    'claude-sonnet-4-20250514': 'Claude Sonnet 4',
    'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
    'deepseek-chat': 'DeepSeek Chat',
    'deepseek-reasoner': 'DeepSeek Reasoner',
    'gpt-4': 'GPT-4',
    'gpt-3.5-turbo': 'GPT-3.5 Turbo',
  }
  return names[model] || model
}

