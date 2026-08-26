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
      name, company, location, whatsapp, email, category,
      experienceName, experienceDescription, websiteOrInstagram,
      website, // honeypot — a human never fills this in
    } = body

    // Honeypot filled: respond "ok" like a real submission (don't tip off
    // the bot that it was caught) but skip Supabase/Resend entirely.
    if (typeof website === "string" && website.trim()) {
      return NextResponse.json({ ok: true })
    }

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ ok: false, error: "MISSING_NAME" })
    }

    if (typeof company !== "string" || !company.trim()) {
      return NextResponse.json({ ok: false, error: "MISSING_COMPANY" })
    }

    if (typeof location !== "string" || !location.trim()) {
      return NextResponse.json({ ok: false, error: "MISSING_LOCATION" })
    }

    const whatsappTrim = typeof whatsapp === "string" ? whatsapp.trim() : ""
    const emailTrim = typeof email === "string" ? email.trim() : ""

    if (!whatsappTrim && !emailTrim) {
      return NextResponse.json({ ok: false, error: "MISSING_CONTACT" })
    }

    if (whatsappTrim && !isValidWhatsapp(whatsappTrim)) {
      return NextResponse.json({ ok: false, error: "INVALID_WHATSAPP" })
    }

    if (emailTrim && !isValidEmail(emailTrim)) {
      return NextResponse.json({ ok: false, error: "INVALID_EMAIL" })
    }

    if (typeof category !== "string" || !(EXPERIENCE_CATEGORIES as readonly string[]).includes(category)) {
      return NextResponse.json({ ok: false, error: "INVALID_CATEGORY" })
    }

    if (typeof experienceName !== "string" || !experienceName.trim()) {
      return NextResponse.json({ ok: false, error: "MISSING_EXPERIENCE_NAME" })
    }

    const supabase = getSupabase()

    const ip = getClientIp(req)
    const ipAllowed = await checkRateLimit(supabase, `ip:${ip}`, "aliados_submit", RATE_LIMIT_MAX_ATTEMPTS, RATE_LIMIT_WINDOW_MINUTES)

    if (!ipAllowed) {
      return NextResponse.json({ ok: false, error: "TOO_MANY_ATTEMPTS" })
    }

    const descriptionTrim = typeof experienceDescription === "string" ? experienceDescription.trim() : ""
    const websiteTrim = typeof websiteOrInstagram === "string" ? websiteOrInstagram.trim() : ""

    const { data, error } = await supabase
      .from("partner_leads")
      .insert({
        name: name.trim(),
        company: company.trim(),
        location: location.trim(),
        whatsapp: whatsappTrim || null,
        email: emailTrim || null,
        category,
        experience_name: experienceName.trim(),
        experience_description: descriptionTrim || null,
        website_or_instagram: websiteTrim || null,
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
      location: location.trim(),
      whatsapp: whatsappTrim || null,
      email: emailTrim || null,
      category,
      experienceName: experienceName.trim(),
      experienceDescription: descriptionTrim || null,
      websiteOrInstagram: websiteTrim || null,
    })

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error("ALIADOS SUBMIT ERROR:", error)
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" })
  }
}
