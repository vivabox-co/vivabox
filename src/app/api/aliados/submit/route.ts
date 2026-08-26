import { NextResponse } from "next/server"
import { getSupabase } from "@/services/supabase"
import { sendPartnerLeadEmail } from "@/services/email"
import { checkRateLimit, getClientIp } from "@/utils/rateLimit"
import { EXPERIENCE_CATEGORIES, isValidEmail, isValidWhatsapp } from "@/features/aliados/validation"

const RATE_LIMIT_MAX_ATTEMPTS = 5
const RATE_LIMIT_WINDOW_MINUTES = 15

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      name, company, whatsapp, email, category,
      experienceName, experienceDescription, websiteOrInstagram,
      website, // honeypot — un humano ne le remplit jamais
    } = body

    // Honeypot rempli : on répond "ok" comme pour un vrai envoi (ne pas
    // révéler au bot qu'il a été détecté) mais sans toucher à Supabase/Resend.
    if (typeof website === "string" && website.trim()) {
      return NextResponse.json({ ok: true })
    }

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ ok: false, error: "MISSING_NAME" })
    }

    if (typeof company !== "string" || !company.trim()) {
      return NextResponse.json({ ok: false, error: "MISSING_COMPANY" })
    }

    if (typeof whatsapp !== "string" || !isValidWhatsapp(whatsapp)) {
      return NextResponse.json({ ok: false, error: "INVALID_WHATSAPP" })
    }

    if (typeof email !== "string" || !isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: "INVALID_EMAIL" })
    }

    if (typeof category !== "string" || !(EXPERIENCE_CATEGORIES as readonly string[]).includes(category)) {
      return NextResponse.json({ ok: false, error: "INVALID_CATEGORY" })
    }

    if (typeof experienceName !== "string" || !experienceName.trim()) {
      return NextResponse.json({ ok: false, error: "MISSING_EXPERIENCE_NAME" })
    }

    if (typeof experienceDescription !== "string" || !experienceDescription.trim()) {
      return NextResponse.json({ ok: false, error: "MISSING_EXPERIENCE_DESCRIPTION" })
    }

    const supabase = getSupabase()

    const ip = getClientIp(req)
    const ipAllowed = await checkRateLimit(supabase, `ip:${ip}`, "aliados_submit", RATE_LIMIT_MAX_ATTEMPTS, RATE_LIMIT_WINDOW_MINUTES)

    if (!ipAllowed) {
      return NextResponse.json({ ok: false, error: "TOO_MANY_ATTEMPTS" })
    }

    const { data, error } = await supabase
      .from("partner_leads")
      .insert({
        name: name.trim(),
        company: company.trim(),
        whatsapp: whatsapp.trim(),
        email: email.trim(),
        category,
        experience_name: experienceName.trim(),
        experience_description: experienceDescription.trim(),
        website_or_instagram:
          typeof websiteOrInstagram === "string" && websiteOrInstagram.trim() ? websiteOrInstagram.trim() : null,
      })
      .select("id")
      .single()

    if (error || !data) {
      console.error("SUPABASE INSERT ERROR (partner_leads):", error)
      return NextResponse.json({ ok: false, error: "SERVER_ERROR" })
    }

    await sendPartnerLeadEmail({
      leadId: data.id,
      name: name.trim(),
      company: company.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      category,
      experienceName: experienceName.trim(),
      experienceDescription: experienceDescription.trim(),
      websiteOrInstagram: typeof websiteOrInstagram === "string" ? websiteOrInstagram.trim() : null,
    })

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error("ALIADOS SUBMIT ERROR:", error)
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" })
  }
}
