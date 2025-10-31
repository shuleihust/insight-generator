import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ExtractForm } from '@/components/extract/ExtractForm'
import Link from 'next/link'

export default async function ExtractPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 检查订阅状态
  const skipSubscriptionCheck = process.env.SKIP_SUBSCRIPTION_CHECK === 'true'
  let hasSubscription = skipSubscriptionCheck

  if (!skipSubscriptionCheck) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    hasSubscription = !!subscription
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">风格提取</h1>
        <p className="text-gray-600 mt-2">
          从优秀文案中提取风格特征,生成可复用的写作风格
        </p>
      </div>

      {!hasSubscription && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-1">需要订阅才能使用</h3>
              <p className="text-sm text-amber-800 mb-3">
                风格提取功能需要有效的订阅。订阅后即可解锁无限制的风格提取和文案生成功能。
              </p>
              <Link href="/pricing">
                <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium">
                  查看订阅套餐
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <ExtractForm hasSubscription={hasSubscription} />

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 使用提示</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 选择具有鲜明风格特点的文案进行分析</li>
          <li>• 文案长度建议在 500-3000 字之间</li>
          <li>• AI 会分析思维模型、语言特征、创作流程等维度</li>
          <li>• 提取完成后可在风格库中查看和使用</li>
        </ul>
      </div>
    </div>
  )
}


