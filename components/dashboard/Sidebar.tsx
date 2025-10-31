'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, Sparkles, List, CreditCard, LogOut, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const navigation = [
  { name: '主页', href: '/dashboard', icon: Home },
  { name: '风格提取', href: '/extract', icon: FileText },
  { name: '文案生成', href: '/generate', icon: Sparkles },
  { name: '风格库', href: '/functions', icon: List },
  { name: '生成记录', href: '/history', icon: Clock },
  { name: '订阅管理', href: '/pricing', icon: CreditCard },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      toast({
        title: '登出失败',
        description: error.message,
        variant: 'destructive',
      })
      return
    }

    toast({
      title: '已登出',
      description: '期待你的再次光临',
    })
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex h-full flex-col bg-gray-900 text-white w-64">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="text-2xl font-bold">🎯</div>
          <span className="text-xl font-bold">洞察生成器</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-800 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          登出
        </Button>
      </div>
    </div>
  )
}


