import { createClient } from '@/lib/supabase/server'
import { FunctionCard } from '@/components/dashboard/FunctionCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, List } from 'lucide-react'

export default async function FunctionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: functions, error } = await supabase
    .from('insight_functions')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">风格库</h1>
          <p className="text-gray-600 mt-2">
            管理你的写作风格
          </p>
        </div>
        <Link href="/extract">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            提取新风格
          </Button>
        </Link>
      </div>

      {/* Functions List */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          加载失败: {error.message}
        </div>
      )}

      {functions && functions.length === 0 && (
        <div className="text-center py-12">
          <List className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            还没有风格
          </h3>
          <p className="text-gray-600 mb-6">
            开始提取你的第一个写作风格吧
          </p>
          <Link href="/extract">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              提取风格
            </Button>
          </Link>
        </div>
      )}

      {functions && functions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {functions.map((func) => (
            <FunctionCard key={func.id} func={func} />
          ))}
        </div>
      )}
    </div>
  )
}


