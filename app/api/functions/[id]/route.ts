import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { data: func, error } = await supabase
      .from('insight_functions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !func) {
      return NextResponse.json({ error: '函数不存在' }, { status: 404 })
    }

    return NextResponse.json({ function: func })
  } catch (error: any) {
    console.error('获取函数失败:', error)
    return NextResponse.json({ 
      error: '获取失败', 
      details: error.message 
    }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: '名称不能为空' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('insight_functions')
      .update({
        name: name.trim(),
        description: description?.trim() || null,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ 
        error: '更新失败', 
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, function: data })
  } catch (error: any) {
    console.error('更新风格失败:', error)
    return NextResponse.json({ 
      error: '更新失败', 
      details: error.message 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { error } = await supabase
      .from('insight_functions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ 
        error: '删除失败', 
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('删除风格失败:', error)
    return NextResponse.json({ 
      error: '删除失败', 
      details: error.message 
    }, { status: 500 })
  }
}

