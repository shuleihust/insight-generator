import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe/server'
import Stripe from 'stripe'

// 使用 Service Role Key 来绕过 RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }

  console.log('Received Stripe webhook:', event.type)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Checkout session completed:', session.id)

        // 获取用户 ID
        const userId = session.metadata?.user_id
        const planType = session.metadata?.plan_type

        if (!userId || !planType) {
          console.error('Missing metadata:', { userId, planType })
          return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
        }

        // 计算订阅结束时间
        let periodEnd: Date
        if (planType === 'lifetime') {
          // 终身订阅：设置为 100 年后
          periodEnd = new Date()
          periodEnd.setFullYear(periodEnd.getFullYear() + 100)
        } else if (planType === 'yearly') {
          // 年卡：1 年后
          periodEnd = new Date()
          periodEnd.setFullYear(periodEnd.getFullYear() + 1)
        } else {
          // 月卡：1 个月后
          periodEnd = new Date()
          periodEnd.setMonth(periodEnd.getMonth() + 1)
        }

        // 检查是否已有订阅记录
        const { data: existingSubscription } = await supabaseAdmin
          .from('subscriptions')
          .select('id')
          .eq('user_id', userId)
          .single()

        let dbError

        if (existingSubscription) {
          // 更新现有订阅
          const { error: updateError } = await supabaseAdmin
            .from('subscriptions')
            .update({
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string || session.id,
              plan_type: planType,
              status: 'active',
              current_period_start: new Date().toISOString(),
              current_period_end: periodEnd.toISOString(),
            })
            .eq('user_id', userId)

          dbError = updateError
        } else {
          // 创建新订阅
          const { error: insertError } = await supabaseAdmin
            .from('subscriptions')
            .insert({
              user_id: userId,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string || session.id,
              plan_type: planType,
              status: 'active',
              current_period_start: new Date().toISOString(),
              current_period_end: periodEnd.toISOString(),
            })

          dbError = insertError
        }

        if (dbError) {
          console.error('Failed to save subscription:', dbError)
          return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        console.log('Subscription created/updated for user:', userId)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('Subscription updated:', subscription.id)

        // 更新订阅状态
        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (updateError) {
          console.error('Failed to update subscription:', updateError)
          return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        console.log('Subscription updated successfully')
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('Subscription deleted:', subscription.id)

        // 将订阅状态标记为已取消
        const { error: deleteError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'canceled',
          })
          .eq('stripe_subscription_id', subscription.id)

        if (deleteError) {
          console.error('Failed to cancel subscription:', deleteError)
          return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        console.log('Subscription canceled successfully')
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ 
      error: 'Webhook handler failed',
      details: error.message 
    }, { status: 500 })
  }
}
