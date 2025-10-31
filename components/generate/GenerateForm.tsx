'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { MarkdownViewer } from '@/components/ui/markdown-viewer'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Sparkles, Copy } from 'lucide-react'
import { InsightFunction } from '@/types'

interface GenerateFormProps {
  functions: InsightFunction[]
  defaultFunctionId?: string
}

export function GenerateForm({ functions, defaultFunctionId }: GenerateFormProps) {
  const [selectedFunctionId, setSelectedFunctionId] = useState(defaultFunctionId || '')
  const [topic, setTopic] = useState('')
  const [output, setOutput] = useState('')
  const [generating, setGenerating] = useState(false)
  const { toast } = useToast()
  const outputContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (defaultFunctionId) {
      setSelectedFunctionId(defaultFunctionId)
    }
  }, [defaultFunctionId])

  // 自动滚动到底部
  useEffect(() => {
    if (generating && outputContainerRef.current) {
      // 使用 setTimeout 确保 DOM 已更新
      setTimeout(() => {
        if (outputContainerRef.current) {
          outputContainerRef.current.scrollTo({
            top: outputContainerRef.current.scrollHeight,
            behavior: 'smooth'
          })
        }
      }, 0)
    }
  }, [output, generating])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFunctionId || !topic.trim()) {
      toast({
        title: '请填写必填项',
        description: '请选择风格并输入话题',
        variant: 'destructive',
      })
      return
    }

    setGenerating(true)
    setOutput('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          functionId: selectedFunctionId,
          topic: topic.trim(),
          parameters: {},
        }),
      })

      if (!response.ok) {
        throw new Error('生成失败')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('无法读取响应')
      }

      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            
            if (data.error) {
              throw new Error(data.error)
            }
            
            if (data.text) {
              setOutput(prev => prev + data.text)
            }
            
            if (data.done) {
              toast({
                title: '生成完成',
                description: '文案已生成',
              })
            }
          }
        }
      }
    } catch (error: any) {
      toast({
        title: '生成失败',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setGenerating(false)
    }
  }

  const selectedFunction = functions.find(f => f.id === selectedFunctionId)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output)
      toast({
        title: '复制成功',
        description: '内容已复制到剪贴板',
      })
    } catch (error) {
      toast({
        title: '复制失败',
        description: '无法访问剪贴板',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 h-full">
      {/* Input Form */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>生成设置</CardTitle>
          <CardDescription>选择风格并输入话题</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="function">
                选择风格 <span className="text-red-500">*</span>
              </Label>
              <select
                id="function"
                value={selectedFunctionId}
                onChange={(e) => setSelectedFunctionId(e.target.value)}
                disabled={generating}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="">请选择...</option>
                {functions.map((func) => (
                  <option key={func.id} value={func.id}>
                    {func.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedFunction && (
              <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                <div className="text-xs font-medium text-blue-900 mb-1">
                  风格描述:
                </div>
                <div className="text-sm text-blue-800">
                  {selectedFunction.description || '无'}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="topic">
                话题 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="topic"
                placeholder="例如: 如何提升学习效率"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={generating}
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={generating}
              className="w-full"
            >
              {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {generating ? '生成中...' : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  开始生成
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Output */}
      <Card className="flex flex-col h-full overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 shrink-0">
          <div>
            <CardTitle>生成结果</CardTitle>
            <CardDescription>实时流式输出 · Markdown 渲染</CardDescription>
          </div>
          {output && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="shrink-0"
            >
              <Copy className="h-4 w-4 mr-2" />
              复制
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          {!output && !generating && (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg">生成的内容将在这里显示</p>
              </div>
            </div>
          )}
          
          {(output || generating) && (
            <div className="flex flex-col h-full">
              <div 
                ref={outputContainerRef}
                className="flex-1 border rounded-lg p-6 pb-8 bg-gray-50 overflow-y-auto scroll-smooth"
              >
                <MarkdownViewer content={output} showCopyButton={false} />
                {/* 底部占位，确保内容完全可见 */}
                <div className="h-4"></div>
              </div>
              {generating && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 py-3 shrink-0">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  正在生成中...
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


