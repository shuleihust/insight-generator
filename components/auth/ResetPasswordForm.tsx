'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export function ResetPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/confirm`,
      })

      if (error) {
        toast({
          title: '发送失败',
          description: error.message,
          variant: 'destructive',
        })
        return
      }

      setSent(true)
      toast({
        title: '邮件已发送',
        description: '请检查你的邮箱并点击重置密码链接',
      })
    } catch (error: any) {
      toast({
        title: '发送失败',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>邮件已发送</CardTitle>
          <CardDescription>
            我们已向 {email} 发送了密码重置邮件
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            请检查你的邮箱并点击邮件中的链接来重置密码。如果没有收到,请检查垃圾邮件文件夹。
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">
              返回登录
            </Button>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>重置密码</CardTitle>
        <CardDescription>输入你的邮箱地址,我们将发送重置密码链接</CardDescription>
      </CardHeader>
      <form onSubmit={handleResetPassword}>
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
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? '发送中...' : '发送重置邮件'}
          </Button>
          <div className="text-sm text-center text-gray-600">
            记起密码了?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              返回登录
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}


