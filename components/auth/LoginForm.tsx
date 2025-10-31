'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [showResendButton, setShowResendButton] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        let errorMessage = error.message
        let errorTitle = '登录失败'
        
        // 处理邮箱未验证错误
        if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
          errorTitle = '邮箱未验证'
          errorMessage = '请先验证你的邮箱。我们已向你的邮箱发送了验证链接,请检查收件箱(包括垃圾邮件文件夹)并点击验证链接。'
          setShowResendButton(true) // 显示重发按钮
        }
        // 处理密码错误
        else if (error.message.includes('Invalid login credentials')) {
          errorMessage = '邮箱或密码错误,请检查后重试'
          setShowResendButton(false)
        }
        else {
          setShowResendButton(false)
        }
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: 'destructive',
        })
        return
      }

      if (data.user) {
        toast({
          title: '登录成功',
          description: '正在跳转...',
        })
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error: any) {
      toast({
        title: '登录失败',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      toast({
        title: '请输入邮箱',
        description: '需要邮箱地址才能重新发送验证邮件',
        variant: 'destructive',
      })
      return
    }

    setResendingEmail(true)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        }
      })

      if (error) {
        toast({
          title: '发送失败',
          description: error.message,
          variant: 'destructive',
        })
        return
      }

      toast({
        title: '验证邮件已发送',
        description: `我们已向 ${email} 重新发送验证邮件,请查收`,
      })
      setShowResendButton(false)
    } catch (error: any) {
      toast({
        title: '发送失败',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setResendingEmail(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>登录</CardTitle>
        <CardDescription>使用邮箱和密码登录你的账户</CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="text-sm">
            <Link 
              href="/reset-password" 
              className="text-blue-600 hover:underline"
            >
              忘记密码?
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </Button>
          
          {showResendButton && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResendVerification}
              disabled={resendingEmail}
            >
              {resendingEmail ? '发送中...' : '重新发送验证邮件'}
            </Button>
          )}
          
          <div className="text-sm text-center text-gray-600">
            还没有账户?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              立即注册
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}

