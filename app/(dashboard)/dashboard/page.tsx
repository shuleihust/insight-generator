import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileText, Sparkles, List, TrendingUp, Clock } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 获取统计数据
  const { count: functionsCount } = await supabase
    .from('insight_functions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id)

  const { count: generatedCount } = await supabase
    .from('generated_contents')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id)

  // 获取最近的生成记录
  const { data: recentContents } = await supabase
    .from('generated_contents')
    .select(`
      *,
      insight_functions (
        name
      )
    `)
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // 获取订阅状态
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user?.id)
    .eq('status', 'active')
    .single()

  const stats = [
    {
      title: '风格库',
      value: functionsCount || 0,
      icon: List,
      description: '已保存的风格',
    },
    {
      title: '生成记录',
      value: generatedCount || 0,
      icon: TrendingUp,
      description: '历史生成次数',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">欢迎回来</h1>
        <p className="text-gray-600 mt-2">
          {user?.email}
        </p>
      </div>

      {/* Subscription Status */}
      {!subscription && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  升级到付费版
                </h3>
                <p className="text-sm text-blue-700 mb-4">
                  解锁无限制的风格提取和文案生成功能
                </p>
                <Link href="/pricing">
                  <Button>查看套餐</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-600 mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">快速操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/extract">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>风格提取</CardTitle>
                    <CardDescription>
                      从文案中提取写作风格
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/generate">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>文案生成</CardTitle>
                    <CardDescription>
                      使用风格生成新文案
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Contents */}
      {recentContents && recentContents.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">最近生成</h2>
            <Link href="/history">
              <Button variant="ghost" size="sm">
                查看全部
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentContents.map((content: any) => (
                  <div key={content.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                            {content.insight_functions?.name || '未知风格'}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(content.created_at).toLocaleDateString('zh-CN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="font-medium text-sm mb-1">话题: {content.topic}</p>
                        <p className="text-sm text-gray-600 truncate">
                          {content.content?.substring(0, 100)}...
                        </p>
                      </div>
                      <Link href={`/generate?functionId=${content.function_id}`}>
                        <Button variant="ghost" size="sm">
                          查看
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}


