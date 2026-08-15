import type { LucideIcon } from "lucide-react"
import {
  Sparkles,
  Waves,
  VolumeX,
  MonitorOff,
  Droplets,
  Droplet,
  Flame,
  FlameKindling,
  CloudFog,
  UserCheck,
  Feather,
  HeartHandshake,
  Flower2,
  Wind,
  Mountain,
  MountainSnow,
  TrendingUp,
  Smile,
  ThumbsUp,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  UserRoundCheck,
  ShieldCheck,
  HardHat,
  Car,
  PawPrint,
  PencilRuler,
  Palette,
  GraduationCap,
  ChefHat,
  MapPinned,
  Brush,
  Gift,
  BookOpen,
  Landmark,
  Users,
  Music,
  PersonStanding,
  Drama,
  CookingPot,
  Lock,
  TentTree,
  Home,
  Bath,
  Trees,
  Moon,
  Coffee,
  UtensilsCrossed,
  Dog,
  Refrigerator,
  Sun,
  ClipboardList,
  Soup,
  Wine,
  Candy,
  Leaf,
  Martini,
  Sandwich,
  Cookie,
  Sprout,
} from "lucide-react"

export type Badge = { key: string; label: string; icon: LucideIcon }

// Visible badges are a curated, per-experience editorial selection — up to 3,
// chosen in the sheet's "badges_visibles" column (pipe-separated keys, e.g.
// "nivel_basico|guia_incluido|equipo_incluido"). They are NOT derived from the
// internal filter fields (ambiance/environment/engagement/idealFor/effortLevel),
// which keep existing unchanged for catalogue filtering in the activation app.
//
// Single source of truth for key → label/icon so both can be edited here
// without touching any experience row. Keys are grouped by category below for
// readability only — the registry itself is flat and a key can be reused by
// any category.
export const BADGE_REGISTRY: Record<string, { label: string; icon: LucideIcon }> = {

  // Bienestar
  tratamiento: { label: "Tratamiento", icon: Sparkles },
  circuito_spa: { label: "Spa", icon: Waves },
  en_silencio: { label: "En silencio", icon: VolumeX },
  sin_pantallas: { label: "Sin pantallas", icon: MonitorOff },
  traje_bano: { label: "Traje baño", icon: Droplets },
  hidroterapia: { label: "Hidroterapia", icon: Droplet },
  sauna: { label: "Sauna", icon: Flame },
  vapor: { label: "Vapor", icon: CloudFog },
  atencion_personalizada: { label: "Atención personal", icon: UserCheck },
  movimiento_suave: { label: "Movimiento suave", icon: Feather },
  con_terapeuta: { label: "Con terapeuta", icon: HeartHandshake },
  experiencia_sensorial: { label: "Sensorial", icon: Flower2 },
  al_aire_libre: { label: "Aire libre", icon: Wind },

  // Aventura
  nivel_basico: { label: "Nivel básico", icon: Mountain },
  nivel_intermedio: { label: "Nivel intermedio", icon: MountainSnow },
  nivel_avanzado: { label: "Nivel avanzado", icon: TrendingUp },
  ideal_principiantes: { label: "Principiantes", icon: Smile },
  sin_experiencia: { label: "Sin experiencia", icon: ThumbsUp },
  esfuerzo_bajo: { label: "Esfuerzo bajo", icon: BatteryLow },
  esfuerzo_medio: { label: "Esfuerzo medio", icon: BatteryMedium },
  esfuerzo_alto: { label: "Esfuerzo alto", icon: BatteryFull },
  guia_incluido: { label: "Guía incluido", icon: UserRoundCheck },
  equipo_incluido: { label: "Equipo incluido", icon: ShieldCheck },
  equipo_seguridad: { label: "Equipo seguridad", icon: HardHat },
  transporte_incluido: { label: "Transporte incluido", icon: Car },
  en_el_agua: { label: "En agua", icon: Waves },
  en_montana: { label: "En montaña", icon: Mountain },
  con_animales: { label: "Con animales", icon: PawPrint },

  // Cultura
  taller_practico: { label: "Taller práctico", icon: PencilRuler },
  con_artista: { label: "Con artista", icon: Palette },
  con_experto: { label: "Con experto", icon: GraduationCap },
  con_chef: { label: "Con chef", icon: ChefHat },
  con_instructor: { label: "Con instructor", icon: UserRoundCheck },
  visita_guiada: { label: "Visita guiada", icon: MapPinned },
  creacion_propia: { label: "Creación propia", icon: Brush },
  te_llevas_creacion: { label: "Para llevar", icon: Gift },
  historia_local: { label: "Historia local", icon: BookOpen },
  patrimonio: { label: "Patrimonio", icon: Landmark },
  cultura_colombiana: { label: "Colombiana", icon: Users },
  musica_vivo: { label: "En vivo", icon: Music },
  clase_baile: { label: "Clase baile", icon: PersonStanding },
  teatro: { label: "Teatro", icon: Drama },
  cocina_colombiana: { label: "Cocina criolla", icon: CookingPot },
  experiencia_privada: { label: "Privada", icon: Lock },

  // Estancias
  glamping: { label: "Glamping", icon: TentTree },
  cabana: { label: "Cabaña", icon: Home },
  jacuzzi_privado: { label: "Jacuzzi privado", icon: Bath },
  chimenea: { label: "Chimenea", icon: Flame },
  fogata: { label: "Fogata", icon: FlameKindling },
  vista_montana: { label: "Vista montaña", icon: Mountain },
  vista_agua: { label: "Vista agua", icon: Waves },
  piscina: { label: "Piscina", icon: Droplets },
  desayuno_incluido: { label: "Desayuno incluido", icon: Coffee },
  cena_incluida: { label: "Cena incluida", icon: UtensilsCrossed },
  pet_friendly: { label: "Pet friendly", icon: Dog },
  privado: { label: "Privado", icon: Lock },
  en_naturaleza: { label: "Naturaleza", icon: Trees },
  desconexion: { label: "Desconexión", icon: Moon },
  cocina_equipada: { label: "Cocina equipada", icon: Refrigerator },
  terraza_privada: { label: "Terraza privada", icon: Sun },

  // Gastronomía
  preparas_tu_plato: { label: "Tu plato", icon: CookingPot },
  menu_degustacion: { label: "Menú degustación", icon: ClipboardList },
  degustacion: { label: "Degustación", icon: Soup },
  maridaje: { label: "Maridaje", icon: Wine },
  cata_cafe: { label: "Cata café", icon: Coffee },
  cata_vinos: { label: "Cata vinos", icon: Wine },
  cata_chocolate: { label: "Cata chocolate", icon: Candy },
  ingredientes_locales: { label: "Local", icon: Leaf },
  cocina_vivo: { label: "Cocina vivo", icon: Flame },
  cocteles: { label: "Cócteles", icon: Martini },
  brunch: { label: "Brunch", icon: Sandwich },
  reposteria: { label: "Repostería", icon: Cookie },
  parrilla: { label: "Parrilla", icon: Flame },
  finca_mesa: { label: "Finca", icon: Sprout },

}

const MAX_VISIBLE_BADGES = 3

// Sheet's "badges_visibles" column: pipe-separated keys, explicit order,
// e.g. "nivel_basico|guia_incluido|equipo_incluido".
export function parseVisibleBadgeKeys(raw?: string): string[] {
  return (raw || "")
    .split("|")
    .map((key) => key.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, MAX_VISIBLE_BADGES)
}

// Resolves stored keys to {label, icon} for rendering. Unknown keys (typos,
// a key removed from the registry) are dropped rather than shown broken —
// never pads back up to 3.
export function resolveVisibleBadges(keys?: string[]): Badge[] {
  if (!keys?.length) return []

  return keys
    .map((key) => {
      const entry = BADGE_REGISTRY[key]
      return entry ? { key, label: entry.label, icon: entry.icon } : null
    })
    .filter((badge): badge is Badge => badge !== null)
    .slice(0, MAX_VISIBLE_BADGES)
}
