import { redirect } from "next/navigation"
import { PAGE_PATH } from "../types"

export default function ReservasPage() {
  redirect(`${PAGE_PATH}/reservas/solicitadas`)
}
