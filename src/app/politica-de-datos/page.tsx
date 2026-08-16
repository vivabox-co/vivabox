import type { Metadata } from "next";
import Link from "next/link";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Política de tratamiento de datos | Vivabox",
  description:
    "Cómo Vivabox Colombia SAS recolecta, usa y protege tus datos personales durante la compra, activación y reserva de una Vivabox.",
  alternates: {
    canonical: "/politica-de-datos",
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

export default function PoliticaDeDatosPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Política de tratamiento de datos personales"
      updated="15 de agosto de 2026"
      intro="Esta política explica qué datos personales recolectamos cuando compras, envías o activas una Vivabox, para qué los usamos y qué derechos tienes sobre ellos, de acuerdo con la Ley 1581 de 2012 y sus normas reglamentarias."
    >
      <Sec n={1} title="Responsable del tratamiento">
        <p>
          El responsable del tratamiento de tus datos personales es{" "}
          <strong>Vivabox Colombia SAS</strong>, identificada con{" "}
          <strong>NIT 902.043.916-8</strong>, domiciliada en Bogotá, Colombia. Puedes
          contactarnos en{" "}
          <a href="mailto:contact@vivabox.com.co">contact@vivabox.com.co</a> o por{" "}
          <a href="https://wa.me/573142590291" target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
          .
        </p>
      </Sec>

      <Sec n={2} title="Qué datos podemos recolectar">
        <p>Dependiendo del paso del proceso (compra, envío, activación o reserva), podemos recolectar:</p>
        <ul>
          <li>Datos de identificación y contacto: nombre, correo electrónico, número de WhatsApp o teléfono.</li>
          <li>Datos de entrega: dirección, ciudad e indicaciones adicionales para el envío de la caja física.</li>
          <li>Datos de quien recibe el regalo, cuando el comprador elige enviarla directamente a esa persona.</li>
          <li>El mensaje personal opcional que el comprador escribe para acompañar el regalo.</li>
          <li>Datos que la persona que recibe la Vivabox registra al activar su código (nombre y correo, para poder gestionar la reserva).</li>
          <li>Datos técnicos básicos de navegación (por ejemplo, dirección IP) usados con fines de seguridad, como prevenir intentos abusivos de activación de códigos.</li>
        </ul>
        <p>
          No recolectamos ni almacenamos datos de tarjetas u otros medios de pago: esa
          información la procesa directamente nuestra pasarela de pagos.
        </p>
      </Sec>

      <Sec n={3} title="Para qué los utilizamos">
        <ul>
          <li>Procesar la compra de la Vivabox y confirmar el pago.</li>
          <li>Coordinar el envío de la caja física a la dirección indicada.</li>
          <li>Generar y administrar el código de activación asociado a tu compra.</li>
          <li>Permitir la activación de la Vivabox y la elección de una experiencia.</li>
          <li>Coordinar la reserva de la experiencia elegida con el aliado correspondiente.</li>
          <li>Enviar comunicaciones necesarias sobre tu compra, envío o reserva (correo de confirmación, avisos de estado, entre otros).</li>
          <li>Atender peticiones, quejas y reclamos.</li>
          <li>
            Enviarte comunicaciones comerciales de Vivabox, únicamente si diste tu
            consentimiento expreso para ello (por ejemplo, al aceptar recibir
            comunicaciones en el proceso de compra).
          </li>
        </ul>
      </Sec>

      <Sec n={4} title="Cómo se usan durante compra, activación y reserva">
        <p>
          En la <strong>compra</strong>, usamos tus datos de contacto y entrega para
          procesar el pago y despachar la caja física.
        </p>
        <p>
          En la <strong>activación</strong>, la persona que recibe la Vivabox registra su
          propio nombre y correo en la plataforma de activación (un proyecto distinto al
          sitio de compra, operado también por Vivabox), para poder identificar su
          Vivabox y gestionar la reserva de la experiencia que elija.
        </p>
        <p>
          En la <strong>reserva</strong>, compartimos con el aliado que presta la
          experiencia únicamente los datos necesarios para coordinarla (por ejemplo,
          nombre y datos de contacto de quien la va a vivir), nunca datos de pago ni
          más información de la estrictamente necesaria.
        </p>
      </Sec>

      <Sec n={5} title="Con quién compartimos tus datos">
        <p>
          No vendemos tus datos personales. Los compartimos únicamente cuando es
          necesario para prestar el servicio, con:
        </p>
        <ul>
          <li>La pasarela de pagos, para procesar tu transacción de forma segura.</li>
          <li>Las transportadoras encargadas de la entrega de la caja física.</li>
          <li>El proveedor de correo transaccional que usamos para enviarte confirmaciones y avisos relacionados con tu compra.</li>
          <li>Los aliados que prestan la experiencia elegida, únicamente los datos necesarios para coordinar la reserva.</li>
          <li>Nuestro proveedor de infraestructura y base de datos, que almacena la información de forma segura en nuestro nombre.</li>
        </ul>
        <p>
          Todos estos terceros están obligados, contractual o legalmente, a usar tus
          datos solo para el fin específico por el que los recibieron.
        </p>
      </Sec>

      <Sec n={6} title="Derechos del titular">
        <p>Como titular de tus datos personales, tienes derecho a:</p>
        <ul>
          <li>Conocer, actualizar y rectificar tus datos personales.</li>
          <li>Solicitar prueba de la autorización otorgada para el tratamiento de tus datos.</li>
          <li>Ser informado sobre el uso que se le ha dado a tus datos.</li>
          <li>Presentar quejas ante la Superintendencia de Industria y Comercio por infracciones a la ley de protección de datos.</li>
          <li>Revocar la autorización o solicitar la supresión de tus datos, cuando no exista un deber legal o contractual que nos obligue a conservarlos.</li>
          <li>Acceder de forma gratuita a tus datos personales tratados por Vivabox.</li>
        </ul>
      </Sec>

      <Sec n={7} title="Cómo consultar, actualizar o reclamar">
        <p>
          Puedes ejercer cualquiera de estos derechos escribiéndonos a{" "}
          <a href="mailto:contact@vivabox.com.co">contact@vivabox.com.co</a> o por{" "}
          <a href="https://wa.me/573142590291" target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
          , indicando tu nombre completo, el dato sobre el que quieres consultar o
          reclamar, y una descripción clara de tu solicitud.
        </p>
        <p>
          Las consultas se responden en un término máximo de diez (10) días hábiles,
          prorrogable por cinco (5) días hábiles adicionales cuando sea necesario,
          informándote el motivo de la prórroga. Los reclamos se resuelven en un término
          máximo de quince (15) días hábiles desde su recepción, conforme a la Ley 1581
          de 2012.
        </p>
      </Sec>

      <Sec n={8} title="Seguridad de la información">
        <p>
          Aplicamos medidas técnicas y organizativas razonables para proteger tus datos
          frente a pérdida, acceso no autorizado, uso indebido o alteración: cifrado en
          el tránsito de la información, acceso restringido a las bases de datos y
          controles internos sobre quién puede consultar tu información y con qué
          propósito.
        </p>
      </Sec>

      <Sec n={9} title="Conservación de los datos">
        <p>
          Conservamos tus datos personales mientras sea necesario para cumplir la
          finalidad para la que fueron recolectados (por ejemplo, mientras tu Vivabox
          esté vigente o pendiente de reserva) y, después, durante el tiempo exigido por
          la ley para efectos contables, fiscales o de atención de reclamos. Una vez
          cumplidos esos plazos, tus datos son eliminados o anonimizados de forma
          segura.
        </p>
      </Sec>

      <Sec n={10} title="Modificaciones a esta política">
        <p>
          Podemos actualizar esta política cuando cambien nuestras prácticas de
          tratamiento de datos o la normativa aplicable. La versión vigente es siempre
          la publicada en esta página, con su fecha de última actualización. Te
          recomendamos revisarla periódicamente, especialmente antes de activar una
          Vivabox.
        </p>
        <p>
          Consulta también nuestros{" "}
          <Link href="/terminos-y-condiciones">Términos y condiciones</Link>, que
          regulan la compra y el uso de la Vivabox.
        </p>
      </Sec>
    </LegalLayout>
  );
}
