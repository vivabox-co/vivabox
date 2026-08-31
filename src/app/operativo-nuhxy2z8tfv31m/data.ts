import { getPedidosCounts } from "./pedidos/data"
import { getReservasCounts } from "./reservas/data"
import { getAlianzasCounts } from "./alianzas/data"

// Comptes légers pour les badges des 3 cartes de l'accueil — seuls les
// éléments qui exigent une action de l'équipe comptent (pas les "confirmed"
// déjà traités côté reservas, ni le total complet des ventas). Alianzas
// n'a pas de statut, donc son badge est simplement le total de propuestas.
export async function getHubCounts() {
  const [pedidos, reservas, alianzas] = await Promise.all([
    getPedidosCounts(),
    getReservasCounts(),
    getAlianzasCounts(),
  ])

  return {
    pedidos: pedidos.toPrepare + pedidos.toShip,
    reservas: reservas.requested,
    alianzas: alianzas.total,
  }
}
