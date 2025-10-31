'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { Button } from '@/components/ui/button'
import { Check, Copy } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface MarkdownViewerProps {
  content: string
  className?: string
  showCopyButton?: boolean
}

export function MarkdownViewer({ content, className = '', showCopyButton = true }: MarkdownViewerProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      toast({
        title: '复制成功',
        description: '内容已复制到剪贴板',
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: '复制失败',
        description: '无法访问剪贴板',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className={`relative ${className}`}>
      {showCopyButton && (
        <div className="absolute top-2 right-2 z-10">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="bg-white/90 backdrop-blur-sm hover:bg-white"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                已复制
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                复制
              </>
            )}
          </Button>
        </div>
      )}
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({ node, ...props }) => (
              <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-xl font-bold mt-5 mb-3 text-gray-900" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-900" {...props} />
            ),
            p: ({ node, ...props }) => (
              <p className="mb-4 last:mb-0 text-gray-700 leading-relaxed" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc list-outside ml-6 mb-4 space-y-2" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal list-outside ml-6 mb-4 space-y-3" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="text-gray-700 pl-2" {...props} />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote
                className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 text-gray-700 italic"
                {...props}
              />
            ),
            code: ({ node, inline, ...props }: any) => {
              return inline ? (
                <code
                  className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono"
                  {...props}
                />
              ) : (
                <code
                  className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono my-4"
                  {...props}
                />
              )
            },
            pre: ({ node, ...props }) => (
              <pre className="my-4 overflow-x-auto" {...props} />
            ),
            strong: ({ node, ...props }) => (
              <strong className="font-bold text-gray-900" {...props} />
            ),
            em: ({ node, ...props }) => (
              <em className="italic text-gray-700" {...props} />
            ),
            a: ({ node, ...props }) => (
              <a
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              />
            ),
            hr: ({ node, ...props }) => (
              <hr className="my-6 border-t border-gray-300" {...props} />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}

