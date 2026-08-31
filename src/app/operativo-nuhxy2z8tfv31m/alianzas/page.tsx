import { getLeads } from "./data"
import { LeadCard } from "./components"
import { HISTORY_LIMIT } from "../types"

export default async function AlianzasPage() {
  const leads = await getLeads()

  return (
    <section>
      <h1 className="text-[22px] font-semibold mb-1">Alianzas</h1>
      <p className="text-muted mb-5">
        {leads.length === 0
          ? "Todavía no hay propuestas 🌱"
          : `${leads.length} propuesta${leads.length === 1 ? "" : "s"} recibida${leads.length === 1 ? "" : "s"}${
              leads.length === HISTORY_LIMIT ? ` (últimas ${HISTORY_LIMIT})` : ""
            }`}
      </p>
      <div className="flex flex-col gap-4">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </section>
  )
}
