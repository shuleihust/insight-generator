// app/page.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="text-2xl font-bold">洞察生成器</div>
          <div className="flex gap-4">
            {user ? (
              <Link href="/dashboard">
                <Button>进入控制台</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">登录</Button>
                </Link>
                <Link href="/register">
                  <Button>注册</Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            从文案中提取风格
            <br />
            <span className="text-blue-600">生成可复用的写作模板</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI 驱动的文案风格提取工具，帮你将任何文案的写作风格
            <br />
            转化为可复用的洞察生成系统
          </p>
          <div className="flex gap-4 justify-center">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-8">
                  立即开始
                </Button>
              </Link>
            ) : (
              <Link href="/register">
                <Button size="lg" className="text-lg px-8">
                  免费开始
                </Button>
              </Link>
            )}
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="text-lg px-8">
                查看定价
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">风格提取</h3>
            <p className="text-gray-600">
              从任何文案中深度分析并提取思维模型、语言特征、创作流程
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="text-3xl mb-4">✨</div>
            <h3 className="text-xl font-semibold mb-2">智能生成</h3>
            <p className="text-gray-600">
              使用提取的写作风格，快速生成符合特定风格的新文案
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="text-3xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-2">流式输出</h3>
            <p className="text-gray-600">
              实时流式生成，即写即看，提升创作效率和体验
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">如何使用</h2>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">提取风格</h3>
                <p className="text-gray-600">
                  粘贴你喜欢的文案，AI 自动分析提取其写作风格、思维模式和语言特征
                </p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">保存风格</h3>
                <p className="text-gray-600">
                  系统将提取的风格转化为结构化的写作模板，保存到你的风格库
                </p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">生成文案</h3>
                <p className="text-gray-600">
                  选择任意风格，输入话题，AI 按照提取的风格流式生成新文案
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t">
        <div className="text-center text-gray-600">
          © 2025 洞察生成器. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
