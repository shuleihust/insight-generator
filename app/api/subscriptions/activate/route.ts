import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 临时手动激活订阅的 API（仅用于开发/测试）
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await request.json()
    const { planType = 'monthly' } = body

    // 计算订阅结束时间
    let periodEnd: Date
    if (planType === 'lifetime') {
      periodEnd = new Date()
      periodEnd.setFullYear(periodEnd.getFullYear() + 100)
    } else if (planType === 'yearly') {
      periodEnd = new Date()
      periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    } else {
      periodEnd = new Date()
      periodEnd.setMonth(periodEnd.getMonth() + 1)
    }

    // 检查是否已有订阅记录
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .single()

    let error

    if (existingSubscription) {
      // 更新现有订阅
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          plan_type: planType,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: periodEnd.toISOString(),
        })
        .eq('user_id', user.id)

      error = updateError
    } else {
      // 创建新订阅
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          stripe_customer_id: `manual_${user.id}`,
          stripe_subscription_id: `manual_sub_${user.id}_${Date.now()}`,
          plan_type: planType,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: periodEnd.toISOString(),
        })

      error = insertError
    }

    if (error) {
      console.error('激活订阅失败:', error)
      return NextResponse.json({ 
        error: '激活失败', 
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: '订阅已激活',
      planType,
      periodEnd: periodEnd.toISOString()
    })

  } catch (error: any) {
    console.error('激活订阅失败:', error)
    return NextResponse.json({ 
      error: '激活失败', 
      details: error.message 
    }, { status: 500 })
  }
}

