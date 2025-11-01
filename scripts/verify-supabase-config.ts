/**
 * Supabase 配置验证脚本
 * 用于验证环境变量是否正确配置
 * 
 * 运行方式:
 * node -r dotenv/config scripts/verify-supabase-config.js dotenv_config_path=.env.local
 * 
 * 或者安装 ts-node:
 * npx ts-node -r dotenv/config scripts/verify-supabase-config.ts dotenv_config_path=.env.local
 */

import { createClient } from '@supabase/supabase-js'

async function verifySupabaseConfig() {
  console.log('🔍 开始验证 Supabase 配置...\n')

  // 检查环境变量是否存在
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('📋 环境变量检查:')
  console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ 已设置' : '❌ 未设置'}`)
  console.log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ 已设置' : '❌ 未设置'}`)
  console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ 已设置' : '❌ 未设置'}`)
  console.log()

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ 缺少必要的环境变量！')
    console.log('\n💡 请按照以下步骤获取:')
    console.log('1. 访问 https://supabase.com/dashboard')
    console.log('2. 选择您的项目')
    console.log('3. 进入 Settings > API')
    console.log('4. 复制 service_role key')
    process.exit(1)
  }

  try {
    // 测试 Service Role 客户端
    console.log('🔐 测试 Service Role 连接...')
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 尝试查询 subscriptions 表
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ Service Role Key 测试失败:', error.message)
      if (error.message.includes('Invalid API key')) {
        console.log('\n💡 可能的原因:')
        console.log('- Service Role Key 不正确')
        console.log('- 请从 Supabase 控制台重新复制密钥')
      }
      process.exit(1)
    }

    console.log('✅ Service Role Key 配置正确！')
    console.log()

    // 测试 Anon 客户端
    if (supabaseAnonKey) {
      console.log('🔑 测试 Anon Key 连接...')
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
      
      const { error: anonError } = await supabaseClient
        .from('subscriptions')
        .select('count')
        .limit(1)

      if (anonError && !anonError.message.includes('JWT')) {
        console.warn('⚠️  Anon Key 可能存在问题:', anonError.message)
      } else {
        console.log('✅ Anon Key 配置正确！')
      }
    }

    console.log('\n✨ 所有配置验证通过！')
    process.exit(0)

  } catch (error: any) {
    console.error('❌ 验证过程中发生错误:', error.message)
    process.exit(1)
  }
}

verifySupabaseConfig()

