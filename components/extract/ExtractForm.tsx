'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Lock } from 'lucide-react'

interface ExtractFormProps {
  hasSubscription: boolean
}

export function ExtractForm({ hasSubscription }: ExtractFormProps) {
  const [sourceText, setSourceText] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!sourceText.trim()) {
      toast({
        title: '请填写必填项',
        description: '源文案不能为空',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceText: sourceText.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '提取失败')
      }

      toast({
        title: '提取成功',
        description: '洞察函数已保存到函数库',
      })

      // 跳转到函数库
      router.push('/functions')
      router.refresh()
    } catch (error: any) {
      toast({
        title: '提取失败',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sourceText">
              源文案 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="sourceText"
              placeholder="粘贴你要分析的文案内容..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              disabled={loading}
              rows={15}
              className="font-mono text-sm"
              required
            />
            <p className="text-sm text-gray-500">
              建议至少 500 字以上,文案越长,提取的风格特征越准确
            </p>
          </div>

          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={loading || !hasSubscription}
              className="flex-1"
            >
              {!hasSubscription && <Lock className="mr-2 h-4 w-4" />}
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {!hasSubscription ? '需要订阅' : loading ? '正在提取中...' : '开始提取'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSourceText('')
              }}
              disabled={loading}
            >
              清空
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

