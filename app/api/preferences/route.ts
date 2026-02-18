import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Preferences fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Return default preferences if none exist
  if (!data) {
    return NextResponse.json({
      primary_color: '#0ea5e9',
      secondary_color: '#06b6d4',
      accent_color: '#0891b2',
      font_family: 'geist',
      border_radius: 8,
      dark_mode: false,
    }, { status: 200 })
  }

  return NextResponse.json(data, { status: 200 })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    primary_color,
    secondary_color,
    accent_color,
    font_family,
    border_radius,
    dark_mode,
  } = body

  // Validate inputs
  if (!primary_color || !font_family === undefined) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  // Check if preference exists
  const { data: existing } = await supabase
    .from('user_preferences')
    .select('id')
    .eq('user_id', user.id)
    .single()

  let result
  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('user_preferences')
      .update({
        primary_color,
        secondary_color,
        accent_color,
        font_family,
        border_radius,
        dark_mode,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()

    if (error) {
      console.error('Preferences update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    result = data[0]
  } else {
    // Create new
    const { data, error } = await supabase
      .from('user_preferences')
      .insert({
        user_id: user.id,
        primary_color,
        secondary_color,
        accent_color,
        font_family,
        border_radius,
        dark_mode,
      })
      .select()

    if (error) {
      console.error('Preferences creation error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    result = data[0]
  }

  return NextResponse.json(result, { status: 200 })
}
