import { getPedidosCounts } from "./pedidos/data"
import { getReservasCounts } from "./reservas/data"

// Comptes légers pour les badges des 2 cartes de l'accueil — seuls les
// éléments qui exigent une action de l'équipe comptent (pas les "confirmed"
// déjà traités côté reservas, ni le total complet des ventas).
export async function getHubCounts() {
  const [pedidos, reservas] = await Promise.all([getPedidosCounts(), getReservasCounts()])

  return {
    pedidos: pedidos.toPrepare + pedidos.toShip,
    reservas: reservas.requested,
  }
}
