import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Clock, Sparkles } from 'lucide-react'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          请先登录
        </h1>
        <Link href="/login">
          <Button>前往登录</Button>
        </Link>
      </div>
    )
  }

  // 获取所有生成记录
  const { data: contents } = await supabase
    .from('generated_contents')
    .select(`
      *,
      insight_functions (
        name
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // 格式化时间到秒
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">生成记录</h1>
        <p className="text-gray-600 mt-2">
          查看所有历史生成记录
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{contents?.length || 0}</div>
            <p className="text-sm text-gray-600">总记录数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {new Set(contents?.map(c => c.function_id)).size || 0}
            </div>
            <p className="text-sm text-gray-600">使用的风格数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {contents && contents.length > 0 
                ? formatDateTime(contents[0].created_at).split(' ')[0]
                : '-'
              }
            </div>
            <p className="text-sm text-gray-600">最近生成日期</p>
          </CardContent>
        </Card>
      </div>

      {/* Contents List */}
      {!contents || contents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              还没有生成记录
            </h3>
            <p className="text-gray-600 mb-6">
              开始使用风格生成你的第一篇文案吧
            </p>
            <Link href="/generate">
              <Button>
                <Sparkles className="mr-2 h-4 w-4" />
                开始生成
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {contents.map((content: any) => (
                <div 
                  key={content.id} 
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                          {content.insight_functions?.name || '未知风格'}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(content.created_at)}
                        </span>
                      </div>
                      <p className="font-medium text-sm mb-2">
                        话题: {content.topic}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {content.content}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Link href={`/generate?functionId=${content.function_id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          再次使用
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

