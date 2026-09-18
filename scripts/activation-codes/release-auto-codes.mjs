// Nettoie les codes d'activation auto-générés à la vente en ligne, à l'époque
// où finalizeVentaPayment créait un code pour chaque paiement. Désormais une
// vente en ligne "physical" n'a AUCUN code à la vente : l'équipe rattache
// celui du sticker de la box à l'emballage (App_Operativo → Pedidos → Por
// preparar). Ces anciens codes n'ont jamais été imprimés sur une box — on les
// SUPPRIME (jamais remis en stock, sinon un code fantôme entrerait dans le
// pool), ce qui remet la vente en "Sin código asignado".
//
// Ce qui est visé (tout doit être vrai) :
//   - vente en ligne physique, payée (status paid/completed), non annulée ;
//   - code encore "unused", jamais activé ;
//   - code créé au moment du paiement (pas un code de lot pré-imprimé, créé
//     bien avant la vente) ;
//   - vente issue du checkout web (paid_at nettement après created_at ; une
//     vente manuelle du back-office a les deux à la même seconde).
// Les ventes déjà "preparada" sont listées mais jamais touchées : un code est
// peut-être déjà écrit dans la box, à traiter à la main.
//
// Dry-run par défaut (ne modifie rien). Pour appliquer, cibler explicitement :
//   node --env-file=.env.local scripts/activation-codes/release-auto-codes.mjs
//   node --env-file=.env.local scripts/activation-codes/release-auto-codes.mjs --apply --venta=<uuid> [--venta=<uuid> ...]
//   node --env-file=.env.local scripts/activation-codes/release-auto-codes.mjs --apply --all

import { createClient } from "@supabase/supabase-js"

const ONLINE_MIN_GAP_MS = 20_000 // paid_at - created_at minimum pour un checkout web
const CREATED_AT_TOLERANCE_MS = 5_000 // code créé "au paiement" = pas avant paid_at - 5 s

function parseArgs(argv) {
  const opts = { apply: false, all: false, ventas: [] }
  for (const arg of argv) {
    if (arg === "--apply") opts.apply = true
    else if (arg === "--all") opts.all = true
    else if (arg.startsWith("--venta=")) opts.ventas.push(arg.slice("--venta=".length))
  }
  return opts
}

function getSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants — lance avec: node --env-file=.env.local scripts/activation-codes/release-auto-codes.mjs"
    )
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

// Le code complet reste secret dans les logs : seuls les 4 derniers caractères.
function mask(code) {
  return `VIVA-****${code.slice(-4)}`
}

async function findCandidates(supabase) {
  const { data: codes, error } = await supabase
    .from("activation_codes")
    .select("id, code, created_at, venta_id, ventas!inner(id, created_at, paid_at, status, delivery_type, cancelled_at, prepared_at, shipped_at, box_slug, buyer_name)")
    .eq("status", "unused")
    .is("activated_at", null)
    .not("venta_id", "is", null)

  if (error) throw error

  return codes
    .map((c) => ({ ...c, venta: Array.isArray(c.ventas) ? c.ventas[0] : c.ventas }))
    .filter(({ venta, created_at }) => {
      if (!venta || venta.delivery_type !== "physical" || venta.cancelled_at) return false
      if (venta.status !== "paid" && venta.status !== "completed") return false
      if (!venta.paid_at) return false

      const paidAt = new Date(venta.paid_at).getTime()
      const ventaCreatedAt = new Date(venta.created_at).getTime()
      const codeCreatedAt = new Date(created_at).getTime()

      const isWebCheckout = paidAt - ventaCreatedAt > ONLINE_MIN_GAP_MS
      const createdAtPayment = codeCreatedAt >= paidAt - CREATED_AT_TOLERANCE_MS
      return isWebCheckout && createdAtPayment
    })
}

async function main() {
  const opts = parseArgs(process.argv.slice(2))
  const supabase = getSupabase()

  const candidates = await findCandidates(supabase)

  if (!candidates.length) {
    console.log("Ningún código auto-generado por limpiar.")
    return
  }

  const touchable = candidates.filter((c) => !c.venta.prepared_at)

  console.log(`\n${candidates.length} venta(s) en línea con código auto-generado:\n`)
  for (const c of candidates) {
    const v = c.venta
    const state = v.shipped_at ? "ENVIADA" : v.prepared_at ? "PREPARADA" : "por preparar"
    console.log(`${v.id}`)
    console.log(`  caja: ${v.box_slug} · comprador: ${v.buyer_name} · pagada: ${new Date(v.paid_at).toLocaleString("es-CO")}`)
    console.log(`  código: ${mask(c.code)} · estado: ${state}${v.prepared_at ? "  (no se toca)" : ""}`)
  }

  console.log(`\n${touchable.length} se pueden limpiar (${candidates.length - touchable.length} ya preparadas, se dejan tal cual).`)

  if (!opts.apply) {
    console.log("\nDry-run: no se modificó nada. Para aplicar, agrega --apply con --venta=<uuid> (repetible) o --all.")
    return
  }

  if (!opts.all && !opts.ventas.length) {
    throw new Error("--apply requiere --venta=<uuid> (repetible) o --all.")
  }

  const targets = opts.all ? touchable : touchable.filter((c) => opts.ventas.includes(c.venta.id))
  const unknown = opts.ventas.filter((id) => !candidates.some((c) => c.venta.id === id))
  if (unknown.length) {
    console.warn(`\nIgnoradas (no son candidatas): ${unknown.join(", ")}`)
  }

  for (const c of targets) {
    // Conditions rejouées dans le WHERE : si le code a été activé entre la
    // liste et le DELETE, 0 ligne matche et on n'efface rien.
    const { data, error } = await supabase
      .from("activation_codes")
      .delete()
      .eq("id", c.id)
      .eq("status", "unused")
      .is("activated_at", null)
      .select("id")

    if (error) throw error
    console.log(data?.length ? `✓ Eliminado ${mask(c.code)} (venta ${c.venta.id})` : `– Sin cambios ${mask(c.code)}: ya no cumple las condiciones`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
