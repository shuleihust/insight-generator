import { PricingCard } from '@/components/pricing/PricingCard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const plans = [
  {
    planType: 'monthly' as const,
    name: '月卡',
    price: 19900,
    period: '月',
    features: [
      '无限次风格提取',
      '无限次文案生成',
      '保存所有洞察函数',
      '流式实时输出',
      '邮件支持',
    ],
  },
  {
    planType: 'yearly' as const,
    name: '年卡',
    price: 199900,
    period: '年',
    features: [
      '包含月卡所有功能',
      '节省 $388 (相当于打 8.3 折)',
      '优先邮件支持',
      '新功能抢先体验',
    ],
    popular: true,
  },
  {
    planType: 'lifetime' as const,
    name: '终身会员',
    price: 399900,
    features: [
      '包含年卡所有功能',
      '终身使用,无需续费',
      '一次支付,永久享受',
      '所有未来新功能',
      'VIP 专属支持',
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/">
            <Button variant="ghost" className="mb-6">
              ← 返回首页
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            选择适合你的套餐
          </h1>
          <p className="text-xl text-gray-600">
            解锁 AI 驱动的文案风格提取和生成功能
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <PricingCard key={plan.planType} {...plan} />
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            常见问题
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Q: 支付安全吗?
              </h3>
              <p className="text-gray-600">
                A: 我们使用 Stripe 作为支付处理器,这是全球最安全、最值得信赖的支付平台之一。我们不会存储你的信用卡信息。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Q: 可以随时取消吗?
              </h3>
              <p className="text-gray-600">
                A: 可以。月卡和年卡用户可以随时取消订阅。取消后,你可以继续使用到当前订阅周期结束。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Q: 终身会员真的是终身吗?
              </h3>
              <p className="text-gray-600">
                A: 是的。一次性支付后,你可以永久使用本服务,包括所有未来的新功能,无需任何额外费用。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Q: 有使用限制吗?
              </h3>
              <p className="text-gray-600">
                A: 没有。所有付费套餐都支持无限次风格提取和文案生成。
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-600">
          <p>还有其他问题? 请联系我们的支持团队</p>
        </div>
      </div>
    </div>
  )
}


