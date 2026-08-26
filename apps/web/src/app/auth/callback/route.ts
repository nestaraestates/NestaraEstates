;
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      let redirectPath = next
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('phone_number')
          .eq('id', user.id)
          .single()
          
        if (!profile?.phone_number) {
          redirectPath = '/onboarding'
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      // Append success message if we are not going to onboarding
      if (redirectPath === '/' || redirectPath.startsWith('/dashboard')) {
        const separator = redirectPath.includes('?') ? '&' : '?'
        redirectPath = `${redirectPath}${separator}success=Login+successful`
      }

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`)
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}
