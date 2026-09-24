"use client"; // icons are components, which can't cross the server → client boundary as props

import { Snowflake, Award, Handshake } from "lucide-react";
import OccasionCarousel, { type OccasionCard } from "@/components/OccasionCarousel";

const CASES: readonly OccasionCard[] = [
  {
    name: "Empleados",
    subtitle: "Cumpleaños, reconocimientos e incentivos.",
    image: "/images/occasions/regalo-cumpleanos-vivabox.webp",
    alt: "Mujer soplando las velas de una torta de cumpleaños",
    ariaLabel: "Vivabox para empleados",
  },
  {
    name: "Clientes",
    subtitle: "Agradecimientos, fidelización y cierre de proyectos.",
    image: "/images/occasions/regalo-corporativo-vivabox-equipo.webp",
    alt: "Equipo de trabajo mostrando una caja Vivabox en la oficina",
    ariaLabel: "Vivabox para clientes",
  },
  {
    name: "Eventos",
    subtitle: "Conferencias, lanzamientos y activaciones.",
    image: "/images/occasions/regalo-celebracion-vivabox.webp",
    alt: "Hombre soplando un espantasuegras sobre fondo rojo",
    ariaLabel: "Vivabox para eventos",
  },
  {
    name: "Bienvenida",
    subtitle: "Nuevos ingresos, primer día y onboarding.",
    image: "/images/occasions/regalo-sorpresa-vivabox.webp",
    alt: "Mujer sonriendo con sus gafas en la mano",
    ariaLabel: "Vivabox de bienvenida",
  },
  {
    name: "Proveedores",
    subtitle: "Alianzas, cierre de negociación y agradecimiento.",
    color: "#0294D2",
    icon: Handshake,
    ariaLabel: "Vivabox para proveedores y aliados",
  },
  {
    name: "Fin de año",
    subtitle: "Novenas, cierre de año y regalo navideño.",
    color: "#CB2033",
    icon: Snowflake,
    ariaLabel: "Vivabox de fin de año",
  },
  {
    name: "Aniversario",
    subtitle: "Hitos de la empresa y celebración de equipo.",
    color: "#8DB92F",
    icon: Award,
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
    />
  );
}
