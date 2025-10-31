// app/api/functions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 验证用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    // 获取用户的所有函数
    const { data: functions, error } = await supabase
      .from('insight_functions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ 
        error: '获取函数列表失败', 
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ functions })

  } catch (error: any) {
    console.error('获取函数列表失败:', error)
    return NextResponse.json({ 
      error: '获取失败', 
      details: error.message 
    }, { status: 500 })
  }
}


