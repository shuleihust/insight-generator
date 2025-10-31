// 统一的 AI 客户端接口

import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { AIConfig } from './config'

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIResponse {
  content: string
  usage?: {
    input_tokens: number
    output_tokens: number
  }
}

export interface AIStreamChunk {
  text: string
  done: boolean
}

// 创建 AI 客户端
export function createAIClient(config: AIConfig) {
  console.log('[createAIClient] 创建客户端...')
  console.log('  Provider:', config.provider)
  console.log('  API Key 长度:', config.apiKey?.length || 0)
  console.log('  API Key 存在:', !!config.apiKey)
  console.log('  API Key 前缀:', config.apiKey?.substring(0, 15) || '空')
  
  if (config.provider === 'claude') {
    console.log('  使用 Anthropic 客户端')
    return new Anthropic({
      apiKey: config.apiKey,
    })
  } else if (config.provider === 'deepseek' || config.provider === 'openai') {
    console.log('  使用 OpenAI 客户端')
    console.log('  Base URL:', config.baseURL)
    return new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    })
  }
  throw new Error(`Unsupported AI provider: ${config.provider}`)
}

// 统一的文本生成接口
export async function generateText(
  config: AIConfig,
  systemPrompt: string,
  userPrompt: string
): Promise<AIResponse> {
  const client = createAIClient(config)

  if (config.provider === 'claude') {
    const anthropic = client as Anthropic
    const message = await anthropic.messages.create({
      model: config.model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response format')
    }

    return {
      content: content.text,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
      },
    }
  } else if (config.provider === 'deepseek' || config.provider === 'openai') {
    const openai = client as OpenAI
    const completion = await openai.chat.completions.create({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 4096,
    })

    const content = completion.choices[0]?.message?.content || ''
    return {
      content,
      usage: completion.usage
        ? {
            input_tokens: completion.usage.prompt_tokens,
            output_tokens: completion.usage.completion_tokens,
          }
        : undefined,
    }
  }

  throw new Error(`Unsupported AI provider: ${config.provider}`)
}

// 统一的流式生成接口
export async function* generateTextStream(
  config: AIConfig,
  systemPrompt: string,
  userPrompt: string
): AsyncGenerator<AIStreamChunk> {
  const client = createAIClient(config)

  if (config.provider === 'claude') {
    const anthropic = client as Anthropic
    const stream = await anthropic.messages.create({
      model: config.model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      stream: true,
    })

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield { text: event.delta.text, done: false }
      }
    }
    yield { text: '', done: true }
  } else if (config.provider === 'deepseek' || config.provider === 'openai') {
    const openai = client as OpenAI
    const stream = await openai.chat.completions.create({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 4096,
      stream: true,
    })

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || ''
      if (text) {
        yield { text, done: false }
      }
    }
    yield { text: '', done: true }
  } else {
    throw new Error(`Unsupported AI provider: ${config.provider}`)
  }
}

