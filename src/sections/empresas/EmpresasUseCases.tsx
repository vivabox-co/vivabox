import OccasionCarousel, { type OccasionCard } from "@/components/OccasionCarousel";

// B2B only, real Pexels photos (free licence) of Latin American professionals.
const CASES: readonly OccasionCard[] = [
  {
    name: "Fin de año",
    subtitle: "Novenas, cierre de año y regalo para todo el equipo.",
    image: "/images/empresas/ideal-para/fin-de-ano.webp",
    alt: "Colegas intercambiando regalos en una fiesta de fin de año en la oficina",
    ariaLabel: "Vivabox de fin de año para empresas",
  },
  {
    name: "Equipos",
    subtitle: "Reconocimientos, metas cumplidas e incentivos.",
    image: "/images/occasions/regalo-corporativo-vivabox-equipo.webp",
    alt: "Equipo de trabajo mostrando una caja Vivabox en la oficina",
    ariaLabel: "Vivabox para equipos",
  },
  {
    name: "Clientes",
    subtitle: "Agradecimientos, fidelización y cierre de proyectos.",
    image: "/images/empresas/ideal-para/clientes.webp",
    alt: "Ejecutiva sonriendo en su oficina",
    ariaLabel: "Vivabox para clientes",
  },
  {
    name: "Eventos",
    subtitle: "Conferencias, lanzamientos y activaciones.",
    image: "/images/empresas/ideal-para/eventos.webp",
    alt: "Asistentes brindando en un evento corporativo",
    ariaLabel: "Vivabox para eventos",
  },
  {
    name: "Bienvenida",
    subtitle: "Nuevos ingresos, primer día y onboarding.",
    image: "/images/empresas/ideal-para/bienvenida.webp",
    alt: "Dos compañeras con un cartel de bienvenida «Estás en casa»",
    ariaLabel: "Vivabox de bienvenida",
  },
  {
    name: "Aliados",
    subtitle: "Alianzas, cierre de negociación y agradecimiento.",
    image: "/images/empresas/ideal-para/aliados-apreton.webp",
    alt: "Dos empresarios cerrando un acuerdo con un apretón de manos",
    ariaLabel: "Vivabox para proveedores y aliados",
  },
  {
    name: "Aniversario",
    subtitle: "Hitos de la empresa y celebración de equipo.",
    image: "/images/empresas/ideal-para/aniversario.webp",
    alt: "Equipo brindando por el aniversario de la empresa",
    ariaLabel: "Vivabox de aniversario de empresa",
  },
];

export default function EmpresasUseCases() {
  return (
    <OccasionCarousel
      title="Ideal para"
      items={CASES}
      theme="light"
      prevLabel="Ver casos anteriores"
      nextLabel="Ver más casos"
      compact
    />
  );
}
