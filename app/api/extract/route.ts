// app/api/extract/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EXTRACT_SYSTEM_PROMPT } from '@/lib/anthropic/client'
import { EXTRACT_AI_CONFIG } from '@/lib/ai/config'
import { generateText } from '@/lib/ai/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 验证用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
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
        return NextResponse.json({ error: '需要有效订阅' }, { status: 403 })
      }
    }

    const body = await request.json()
    const { sourceText } = body

    if (!sourceText) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    // 调用 AI API 提取风格
    console.log('========== AI 配置信息 ==========')
    console.log('Provider:', EXTRACT_AI_CONFIG.provider)
    console.log('Model:', EXTRACT_AI_CONFIG.model)
    console.log('API Key 前缀:', EXTRACT_AI_CONFIG.apiKey?.substring(0, 15) || '未设置')
    console.log('API Key 长度:', EXTRACT_AI_CONFIG.apiKey?.length || 0)
    console.log('Base URL:', EXTRACT_AI_CONFIG.baseURL || '默认 Anthropic URL')
    console.log('================================')
    
    const response = await generateText(
      EXTRACT_AI_CONFIG,
      EXTRACT_SYSTEM_PROMPT,
      `请分析以下文案并提取结构化的洞察函数：\n\n${sourceText}`
    )

    const content = { text: response.content }

    // 解析 JSON
    let functionData
    try {
      // 尝试从响应中提取 JSON
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        functionData = JSON.parse(jsonMatch[0])
      } else {
        functionData = JSON.parse(content.text)
      }
    } catch (e) {
      return NextResponse.json({ 
        error: '解析AI响应失败', 
        details: content.text 
      }, { status: 500 })
    }

        // 从提取的数据中获取名称和描述
        const name = functionData.name || functionData.goal || '未命名风格'
    const description = functionData.description || functionData.goal || null

    // 保存到数据库
    const { data: savedFunction, error: saveError } = await supabase
      .from('insight_functions')
      .insert({
        user_id: user.id,
        name,
        description,
        source_text: sourceText,
        function_data: functionData,
      })
      .select()
      .single()

    if (saveError) {
      return NextResponse.json({ 
        error: '保存失败', 
        details: saveError.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      function: savedFunction 
    })

  } catch (error: any) {
    console.error('提取风格失败:', error)
    return NextResponse.json({ 
      error: '提取失败', 
      details: error.message 
    }, { status: 500 })
  }
}
