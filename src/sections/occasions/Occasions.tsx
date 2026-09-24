import OccasionCarousel, { type OccasionCard } from "@/components/OccasionCarousel";

const OCCASIONS: readonly OccasionCard[] = [
  {
    name: "Cumpleaños",
    subtitle: "Sorpréndelo con algo que recordará.",
    image: "/images/occasions/regalo-cumpleanos-vivabox.webp",
    alt: "Mujer soplando las velas de una torta de cumpleaños",
    ariaLabel: "Regalo de cumpleaños",
  },
  {
    name: "Aniversario",
    subtitle: "Un momento para compartir juntos.",
    image: "/images/occasions/regalo-aniversario-pareja-vivabox.webp",
    alt: "Pareja abrazada celebrando su aniversario",
    ariaLabel: "Regalo de aniversario",
  },
  {
    name: "Agradecimiento",
    subtitle: "La mejor forma de decir gracias.",
    image: "/images/occasions/regalo-agradecimiento-vivabox.webp",
    alt: "Dos amigas conversando y agradeciendo un momento juntas",
    ariaLabel: "Regalo de agradecimiento",
  },
  {
    name: "Matrimonio",
    subtitle: "Un regalo para disfrutar en pareja.",
    image: "/images/occasions/regalo-matrimonio-vivabox.webp",
    alt: "Invitados brindando en una celebración de matrimonio",
    ariaLabel: "Regalo de matrimonio",
  },
  {
    name: "Para dos",
    subtitle: "Tiempo de calidad para compartir.",
    image: "/images/occasions/regalo-experiencia-pareja-vivabox.webp",
    alt: "Pareja celebrando un momento especial juntos",
    ariaLabel: "Regalo para parejas",
  },
  {
    name: "Empresas",
    subtitle: "Cada persona elige su experiencia.",
    image: "/images/occasions/regalo-corporativo-vivabox-equipo.webp",
    alt: "Equipo de trabajo mostrando una caja Vivabox en la oficina",
    ariaLabel: "Regalos empresariales",
  },
];

export default function Occasions() {
  return (
    <OccasionCarousel
      title="¿Para qué ocasión regalar una Vivabox?"
      items={OCCASIONS}
    />
  );
}
