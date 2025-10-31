import { createClient } from '@/lib/supabase/server'
import { GenerateForm } from '@/components/generate/GenerateForm'
import { redirect } from 'next/navigation'

export default async function GeneratePage({
  searchParams,
}: {
  searchParams: Promise<{ functionId?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 获取用户的所有风格
  const { data: functions } = await supabase
    .from('insight_functions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

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
      return (
        <div className="max-w-2xl mx-auto text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            需要订阅
          </h1>
          <p className="text-gray-600 mb-6">
            生成功能需要有效的订阅,请先订阅套餐
          </p>
          <a
            href="/pricing"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            查看套餐
          </a>
        </div>
      )
    }
  }

  if (!functions || functions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          还没有风格
        </h1>
        <p className="text-gray-600 mb-6">
          请先提取至少一个写作风格
        </p>
        <a
          href="/extract"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          提取风格
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">文案生成</h1>
        <p className="text-gray-600 mt-2">
          使用提取的写作风格生成符合特定风格的文案
        </p>
      </div>

      <div className="h-[calc(100vh-12rem)]">
        <GenerateForm
          functions={functions}
          defaultFunctionId={params.functionId}
        />
      </div>
    </div>
  )
}

