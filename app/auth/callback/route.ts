import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && user) {
      // Upsert user record
      await supabase.from('users').upsert(
        { id: user.id, email: user.email!, role: 'player' },
        { onConflict: 'id', ignoreDuplicates: true }
      )

      // Upsert user_stats
      await supabase.from('user_stats').upsert(
        {
          user_id: user.id,
          total_xp: 0,
          level: 1,
          last_active: new Date().toISOString(),
          current_phase: 1,
          current_streak: 0,
          best_streak: 0,
          last_completion_date: null,
        },
        { onConflict: 'user_id', ignoreDuplicates: true }
      )

      // Update last_active
      await supabase
        .from('user_stats')
        .update({ last_active: new Date().toISOString() })
        .eq('user_id', user.id)

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${url.origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${url.origin}${next}`)
      }
    }
  }

  return NextResponse.redirect(`${new URL(request.url).origin}/login?error=auth`)
}
