// app/api/generate/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGenerateSystemPrompt } from '@/lib/anthropic/client'
import { GENERATE_AI_CONFIG } from '@/lib/ai/config'
import { generateTextStream } from '@/lib/ai/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 验证用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response('未授权', { status: 401 })
    }

    // 检查订阅状态 (可通过环境变量跳过)
    const skipSubscriptionCheck = process.env.SKIP_SUBSCRIPTION_CHECK === 'true'
    
    if (!skipSubscriptionCheck) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (!subscription) {
        return new Response('需要有效订阅', { status: 403 })
      }
    }

    const body = await request.json()
    const { functionId, topic, parameters = {} } = body

    if (!functionId || !topic) {
      return new Response('缺少必要参数', { status: 400 })
    }

    // 获取函数数据
    const { data: insightFunction, error: functionError } = await supabase
      .from('insight_functions')
      .select('*')
      .eq('id', functionId)
      .eq('user_id', user.id)
      .single()

    if (functionError || !insightFunction) {
      return new Response('函数不存在', { status: 404 })
    }

    const systemPrompt = getGenerateSystemPrompt(insightFunction.function_data)

    // 创建流式响应
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = ''

          const userPrompt = `请根据以上风格规范,为以下话题生成文案:\n\n话题:${topic}\n\n${Object.keys(parameters).length > 0 ? `参数:${JSON.stringify(parameters, null, 2)}` : ''}`

          // 使用统一的流式生成接口
          for await (const chunk of generateTextStream(
            GENERATE_AI_CONFIG,
            systemPrompt,
            userPrompt
          )) {
            if (chunk.text) {
              fullContent += chunk.text
              
              // 发送文本块
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: chunk.text })}\n\n`)
              )
            }

            if (chunk.done) {
              break
            }
          }

          // 保存生成记录
          await supabase
            .from('generated_contents')
            .insert({
              user_id: user.id,
              function_id: functionId,
              topic,
              parameters,
              content: fullContent,
            })

          // 发送完成信号
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
          )
          controller.close()

        } catch (error: any) {
          console.error('生成失败:', error)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`)
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error: any) {
    console.error('生成文案失败:', error)
    return new Response(error.message, { status: 500 })
  }
}

