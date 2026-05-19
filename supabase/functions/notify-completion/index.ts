import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL = 'nic@thryvetogether.com'

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { user_id, total_xp } = await req.json()

    if (!RESEND_API_KEY) {
      console.log('No RESEND_API_KEY set — skipping email notification')
      return new Response(JSON.stringify({ sent: false, reason: 'No API key' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const emailBody = {
      from: 'Thryve Rise <noreply@thryvetogether.com>',
      to: [ADMIN_EMAIL],
      subject: "Rhiannon finished. Time to buy the Hulk. 🟢",
      html: `
        <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0f2420; color: #F5F1EB; padding: 40px; border-radius: 16px;">
          <h1 style="font-size: 32px; margin-bottom: 8px; color: #F5F1EB;">She did it.</h1>
          <p style="color: #6B7C73; font-size: 14px; margin-bottom: 32px;">Thryve Rise — Final Completion Notice</p>

          <div style="background: #1a3330; border: 1px solid #2d5a4e; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <p style="font-size: 18px; color: #F5F1EB; margin: 0 0 16px 0; font-weight: 600;">
              Rhiannon just completed all 20 tasks in Thryve Rise.
            </p>
            <div style="display: flex; gap: 24px;">
              <div>
                <p style="font-size: 28px; font-weight: 700; color: #E8601C; margin: 0;">${total_xp}</p>
                <p style="font-size: 11px; color: #6B7C73; margin: 4px 0 0 0;">Final XP</p>
              </div>
              <div>
                <p style="font-size: 28px; font-weight: 700; color: #E8601C; margin: 0;">Level 7</p>
                <p style="font-size: 11px; color: #6B7C73; margin: 4px 0 0 0;">Architect</p>
              </div>
              <div>
                <p style="font-size: 28px; font-weight: 700; color: #00875A; margin: 0;">20/20</p>
                <p style="font-size: 11px; color: #6B7C73; margin: 4px 0 0 0;">Tasks Done</p>
              </div>
            </div>
          </div>

          <div style="background: #00875A20; border: 1px solid #00875A40; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
            <p style="font-size: 22px; font-weight: 700; color: #F5F1EB; margin: 0 0 8px 0;">
              🟢 Rolex Submariner 116610LV — The Hulk
            </p>
            <p style="color: #6B7C73; font-size: 14px; margin: 0;">
              She earned it. Go get the watch.
            </p>
          </div>

          <p style="color: #6B7C73; font-size: 12px; text-align: center; margin: 0;">
            Thryve Rise · thryvetogether.com
          </p>
        </div>
      `,
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailBody),
    })

    if (!res.ok) {
      const error = await res.text()
      console.error('Email send failed:', error)
      return new Response(JSON.stringify({ sent: false, error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ sent: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
