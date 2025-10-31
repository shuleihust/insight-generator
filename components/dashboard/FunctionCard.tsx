'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { InsightFunction } from '@/types'
import { Trash2, Sparkles, Calendar, Copy, Edit2, Check, X, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'

interface FunctionCardProps {
  func: InsightFunction
  onDelete?: () => void
}

export function FunctionCard({ func, onDelete }: FunctionCardProps) {
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(func.name)
  const [description, setDescription] = useState(func.description || '')
  const router = useRouter()
  const { toast } = useToast()

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

  const handleDelete = async () => {
    if (!confirm(`确定要删除风格 "${func.name}" 吗?`)) {
      return
    }

    setDeleting(true)

    try {
      const response = await fetch(`/api/functions/${func.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '删除失败')
      }

      toast({
        title: '删除成功',
        description: '风格已从库中删除',
      })

      if (onDelete) {
        onDelete()
      }

      router.refresh()
    } catch (error: any) {
      toast({
        title: '删除失败',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const response = await fetch(`/api/functions/${func.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '保存失败')
      }

      toast({
        title: '保存成功',
        description: '风格信息已更新',
      })

      setEditing(false)
      router.refresh()
    } catch (error: any) {
      toast({
        title: '保存失败',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setName(func.name)
    setDescription(func.description || '')
    setEditing(false)
  }

  const handleCopyMarkdown = async () => {
    try {
      // Markdown 格式
      const content = `# ${func.name}

${func.description || ''}

## 核心目标
${func.function_data?.goal || '无'}

## 详细风格信息

\`\`\`json
${JSON.stringify(func.function_data, null, 2)}
\`\`\`

---
创建时间: ${formatDateTime(func.created_at)}
`

      await navigator.clipboard.writeText(content)
      toast({
        title: '复制成功 (Markdown)',
        description: '风格内容已复制为 Markdown 格式',
      })
    } catch (error) {
      toast({
        title: '复制失败',
        description: '无法访问剪贴板',
        variant: 'destructive',
      })
    }
  }

  const handleCopyLisp = async () => {
    try {
      const data = func.function_data
      
      // 辅助函数：格式化列表
      const formatList = (items: any[], indent = '   ') => {
        if (!Array.isArray(items) || items.length === 0) return ''
        return items.map(item => {
          if (typeof item === 'string') {
            return `${indent}(${item})`
          } else if (typeof item === 'object' && item !== null) {
            if (item.name && item.action) {
              return `${indent}(${item.name}\n${indent} ${item.action})`
            }
            return `${indent}(${JSON.stringify(item)})`
          }
          return `${indent}(${item})`
        }).join('\n')
      }

      // 辅助函数：格式化思维模型
      const formatThinkingModels = (models: any[]) => {
        if (!Array.isArray(models) || models.length === 0) return ''
        return models.map(model => {
          const elements = model.elements || {}
          const elementEntries = Object.entries(elements)
            .map(([key, value]) => `    (${key} . ${value})`)
            .join('\n')
          
          return `   (${model.name || '未命名模型'}
${elementEntries}${model.description ? `\n    (描述 . ${model.description})` : ''})`
        }).join('\n\n')
      }

      // 辅助函数：格式化语言武器库
      const formatLanguageArsenal = (arsenal: any) => {
        if (!arsenal) return ''
        
        let result = []
        
        // 句式模板
        if (arsenal.sentence_patterns) {
          const patterns = Object.entries(arsenal.sentence_patterns)
            .map(([key, value]) => `    (${key} . ${value})`)
            .join('\n')
          result.push(`   (句式模板\n${patterns})`)
        }
        
        // 措辞风格
        if (arsenal.style_features) {
          const styles = Object.entries(arsenal.style_features)
            .map(([key, value]) => `    (${key} . ${value})`)
            .join('\n')
          result.push(`   (措辞风格\n${styles})`)
        }
        
        return result.join('\n\n')
      }

      // 构建 Lisp 格式内容
      const lispContent = `(defun ${func.name.replace(/\s+/g, '-')} ()
  "${func.description || func.name}"
  
  (目标 . ${data?.goal || '生成符合特定风格的内容'})
  
  (人格特质 . (${Array.isArray(data?.traits) ? data.traits.join(' ') : ''}))
  
  (核心信念 . (${Array.isArray(data?.beliefs) ? data.beliefs.join(' ') : ''}))
  
  (思维模型
${data?.thinking_models ? formatThinkingModels(data.thinking_models) : '   ;; 待补充'}
  )
  
  (语言武器库
${data?.language_arsenal ? formatLanguageArsenal(data.language_arsenal) : '   ;; 待补充'}
  )
  
  (创作流程
${Array.isArray(data?.process) ? formatList(data.process) : '   ;; 待补充'}
  )
  
  (质量检验标准
${Array.isArray(data?.quality_standards) ? formatList(data.quality_standards) : '   ;; 待补充'}
  )
  
  (禁忌清单
${Array.isArray(data?.taboos) ? formatList(data.taboos) : '   ;; 待补充'}
  ))


;; 使用指南
;; 创建时间: ${formatDateTime(func.created_at)}
;; 
;; 调用方式:
;; (${func.name.replace(/\s+/g, '-')})
`

      await navigator.clipboard.writeText(lispContent)
      toast({
        title: '复制成功 (Lisp)',
        description: '风格内容已复制为 Lisp 格式',
      })
    } catch (error) {
      toast({
        title: '复制失败',
        description: '无法访问剪贴板',
        variant: 'destructive',
      })
    }
  }

  const handleUse = () => {
    router.push(`/generate?functionId=${func.id}`)
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            {editing ? (
              <div className="space-y-2">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="风格名称"
                  className="font-semibold"
                />
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="风格描述（可选）"
                  rows={2}
                  className="text-sm"
                />
              </div>
            ) : (
              <>
                <CardTitle>{func.name}</CardTitle>
                {func.description && (
                  <CardDescription className="mt-1">
                    {func.description}
                  </CardDescription>
                )}
              </>
            )}
          </div>
          {!editing && (
            <Button
              onClick={() => setEditing(true)}
              variant="ghost"
              size="sm"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>创建于 {formatDateTime(func.created_at)}</span>
          </div>
          {func.function_data && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <div className="text-xs font-medium text-gray-700 mb-1">核心目标:</div>
              <div className="text-sm text-gray-900">
                {func.function_data.goal || '无'}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {editing ? (
          <>
            <Button
              onClick={handleSave}
              className="flex-1"
              size="sm"
              disabled={saving || !name.trim()}
            >
              <Check className="mr-2 h-4 w-4" />
              保存
            </Button>
            <Button
              onClick={handleCancelEdit}
              variant="outline"
              size="sm"
              disabled={saving}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleUse}
              className="flex-1"
              size="sm"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              使用生成
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  title="复制风格内容"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyMarkdown}>
                  <Copy className="h-4 w-4 mr-2" />
                  复制为 Markdown
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyLisp}>
                  <Copy className="h-4 w-4 mr-2" />
                  复制为 Lisp
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={handleDelete}
              variant="outline"
              size="sm"
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}


