// app/api/stripe/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, PRICING_PLANS } from '@/lib/stripe/server'
import { PlanType } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 验证用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await request.json()
    const { planType } = body as { planType: PlanType }

    if (!planType || !['monthly', 'yearly', 'lifetime'].includes(planType)) {
      return NextResponse.json({ error: '无效的套餐类型' }, { status: 400 })
    }

    const plan = PRICING_PLANS[planType]

    // 验证 Price ID 是否配置
    if (!plan.priceId || !plan.priceId.startsWith('price_')) {
      console.error(`无效的 Stripe Price ID: ${plan.priceId} (planType: ${planType})`)
      return NextResponse.json({ 
        error: 'Stripe Price ID 未正确配置',
        details: `请在环境变量中设置正确的 STRIPE_PRICE_${planType.toUpperCase()} (应该是 price_xxx 格式)`
      }, { status: 500 })
    }

    // 检查是否已有 Stripe 客户 ID
    let stripeCustomerId: string | undefined
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (existingSubscription?.stripe_customer_id) {
      stripeCustomerId = existingSubscription.stripe_customer_id
    }

    // 如果没有客户 ID,创建新客户
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      stripeCustomerId = customer.id
    }

    // 创建 Checkout Session
    console.log('创建 Checkout Session:', {
      planType,
      priceId: plan.priceId,
      mode: planType === 'lifetime' ? 'payment' : 'subscription',
      customer: stripeCustomerId,
    })

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: planType === 'lifetime' ? 'payment' : 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_type: planType,
      },
    })

    console.log('Checkout Session 创建成功:', session.id)

    return NextResponse.json({ sessionId: session.id, url: session.url })

  } catch (error: any) {
    console.error('创建 Checkout Session 失败:', error)
    return NextResponse.json({ 
      error: '创建支付会话失败', 
      details: error.message 
    }, { status: 500 })
  }
}


