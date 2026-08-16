import type { Metadata } from "next";
import Link from "next/link";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Cambios y devoluciones | Vivabox",
  description:
    "Cuándo puedes retractarte de la compra de una Vivabox, cómo hacerlo, y qué pasa cuando una experiencia ya fue reservada o utilizada.",
  alternates: {
    canonical: "/cambios-y-devoluciones",
  },
  robots: {
    index: true,
    follow: true,
  },
};

function Sec({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={`s${n}`}>
      <h2>
        <span className="legal-num">{n}.</span> {title}
      </h2>
      {children}
    </section>
  );
}

export default function CambiosYDevolucionesPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Cambios y devoluciones"
      updated="15 de agosto de 2026"
      intro="Aquí explicamos, sin letra pequeña, cuándo puedes arrepentirte de una compra, cómo pedir un cambio si algo llegó mal, y qué pasa una vez la Vivabox ya fue activada y la experiencia reservada. Esta página complementa nuestros Términos y condiciones."
    >
      <Sec n={1} title="Tu derecho de retracto">
        <p>
          Como toda compra hecha por internet, tienes derecho a retractarte de tu compra
          de Vivabox dentro de los <strong>cinco (5) días hábiles</strong> siguientes a
          la entrega de la caja, sin tener que dar ninguna razón, conforme al artículo
          47 de la Ley 1480 de 2011 (Estatuto del Consumidor).
        </p>
        <p>
          Este derecho aplica mientras el código de activación de tu Vivabox{" "}
          <strong>no haya sido activado</strong>. Una vez el código se activa y se
          empieza a usar el servicio de elección y reserva de experiencia, el retracto
          sobre esa Vivabox ya no aplica, porque el servicio se prestó a solicitud
          expresa de quien la activó.
        </p>
      </Sec>

      <Sec n={2} title="Cómo ejercer el retracto">
        <p>
          Escríbenos a <a href="mailto:contact@vivabox.com.co">contact@vivabox.com.co</a>{" "}
          dentro del plazo indicado, contándonos que quieres retractarte de tu compra e
          indicando el número de tu pedido. No necesitas devolvernos la caja física para
          iniciar el proceso, pero si el código aún no ha sido activado, te podemos
          pedir confirmarlo para validar la devolución.
        </p>
        <p>
          Una vez confirmado el retracto, reintegramos el valor pagado utilizando el
          mismo medio de pago con el que compraste, dentro de los treinta (30) días
          calendario siguientes, conforme a la normativa de comercio electrónico
          aplicable en Colombia.
        </p>
      </Sec>

      <Sec n={3} title="Cuándo no aplica el retracto">
        <p>La ley excluye expresamente del derecho de retracto:</p>
        <ul>
          <li>
            Las reservas ya confirmadas de experiencias de entretenimiento, alojamiento
            o alimentación para una fecha determinada (artículo 47, literal f, Ley 1480
            de 2011) — es decir, una vez tu experiencia quedó agendada con el aliado.
          </li>
          <li>
            Servicios ya prestados en su totalidad con tu acuerdo previo, como el
            acompañamiento en la coordinación de una reserva ya realizada.
          </li>
        </ul>
        <p>
          En esos casos, lo que aplica son las reglas de cancelación, reprogramación y
          no-show explicadas en la sección 4 y en nuestros{" "}
          <Link href="/terminos-y-condiciones">Términos y condiciones</Link>, no el
          retracto.
        </p>
      </Sec>

      <Sec n={4} title="Si el código ya fue activado o la experiencia ya se disfrutó">
        <p>
          Si ya elegiste y reservaste una experiencia, un cambio de opinión se maneja
          como una cancelación o reprogramación de esa reserva (no como una devolución
          de dinero), conforme a la anticipación mínima informada para esa experiencia.
        </p>
        <p>
          Si la experiencia ya fue disfrutada, no procede ni retracto ni devolución: el
          servicio por el que pagaste ya se cumplió.
        </p>
      </Sec>

      <Sec n={5} title="Cambios por caja dañada o código inutilizable">
        <p>
          Si tu Vivabox llega dañada, incompleta, o el código de activación no funciona
          por una causa que nos sea atribuible, tienes derecho a la garantía legal de
          calidad reconocida por la Ley 1480 de 2011: puedes pedir la reposición de la
          caja y el código, o la devolución de tu dinero, a tu elección.
        </p>
        <p>
          Escríbenos con fotos del estado en que llegó la caja (si aplica) y el número
          de tu pedido, y resolvemos el caso lo antes posible.
        </p>
      </Sec>

      <Sec n={6} title="Cómo pedir ayuda">
        <p>
          Para cualquier solicitud de retracto, cambio o devolución, escríbenos a{" "}
          <a href="mailto:contact@vivabox.com.co">contact@vivabox.com.co</a> o por{" "}
          <a href="https://wa.me/573142590291" target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
          . Te responderemos dentro de los quince (15) días hábiles siguientes, conforme
          al Estatuto del Consumidor.
        </p>
      </Sec>
    </LegalLayout>
  );
}
