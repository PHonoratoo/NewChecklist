import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import {
  validateGroupName,
  validateColor,
  sanitizeInput,
  checkRateLimit,
} from '@/lib/validation'
import { handleError, logAudit } from '@/lib/error-handler'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Groups fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    const { message, statusCode } = handleError(err)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rateCheck = checkRateLimit(user.id, 50, 60000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { name, color } = body

    // Validate input
    const nameValidation = validateGroupName(name)
    if (!nameValidation.isValid) {
      return NextResponse.json(
        { error: nameValidation.error },
        { status: 400 }
      )
    }

    const colorValidation = validateColor(color)
    if (!colorValidation.isValid) {
      return NextResponse.json(
        { error: colorValidation.error },
        { status: 400 }
      )
    }

    const sanitizedName = sanitizeInput(name)

    const { data, error } = await supabase
      .from('groups')
      .insert({
        user_id: user.id,
        name: sanitizedName,
        color,
      })
      .select()

    if (error) {
      console.error('Group creation error:', error)
      return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
    }

    logAudit(user.id, 'GROUP_CREATED', { groupId: data[0].id, name: sanitizedName })

    return NextResponse.json(data[0], { status: 201 })
  } catch (err) {
    const { message, statusCode } = handleError(err)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
