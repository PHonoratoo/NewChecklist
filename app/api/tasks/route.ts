import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { taskId, groupId } = body

  if (!taskId) {
    return NextResponse.json(
      { error: 'Missing taskId' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('tasks')
    .update({ group_id: groupId || null })
    .eq('id', taskId)
    .eq('user_id', user.id)
    .select()

  if (error) {
    console.error('Task update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data[0], { status: 200 })
}
