import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const groupId = params.id

  // Verify group belongs to user
  const { data: group } = await supabase
    .from('groups')
    .select('user_id')
    .eq('id', groupId)
    .single()

  if (!group || group.user_id !== user.id) {
    return NextResponse.json(
      { error: 'Group not found or unauthorized' },
      { status: 404 }
    )
  }

  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId)

  if (error) {
    console.error('Group deletion error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
