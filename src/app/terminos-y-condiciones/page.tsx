import type { Metadata } from "next";
import Link from "next/link";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Términos y condiciones | Vivabox",
  description:
    "Condiciones que regulan la compra y el uso de una Vivabox: cómo funciona la caja, la activación, la elección de experiencia y el proceso de reserva.",
  alternates: {
    canonical: "/terminos-y-condiciones",
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

export default function TerminosYCondicionesPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Términos y condiciones"
      updated="15 de agosto de 2026"
      intro="Estos términos explican, en un lenguaje sencillo, qué compras cuando compras una Vivabox, cómo funciona la caja y el código de activación, y qué puedes esperar de nosotros en cada paso. Al comprar una Vivabox aceptas estas condiciones."
    >
      <Sec n={1} title="Quién es Vivabox">
        <p>
          Vivabox es operada por <strong>Vivabox Colombia SAS</strong>, identificada con{" "}
          <strong>NIT 902.043.916-8</strong>, domiciliada en Bogotá, Colombia. En este
          documento nos referimos a Vivabox Colombia SAS simplemente como{" "}
          <strong>&ldquo;Vivabox&rdquo;</strong>.
        </p>
        <p>
          Puedes contactarnos por correo a{" "}
          <a href="mailto:contact@vivabox.com.co">contact@vivabox.com.co</a> o por{" "}
          <a href="https://wa.me/573142590291" target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
          .
        </p>
      </Sec>

      <Sec n={2} title="Objeto de estos términos">
        <p>
          Estos términos y condiciones regulan la compra de una Vivabox a través de{" "}
          <strong>vivabox.com.co</strong>, su entrega, la activación del código incluido y
          el acompañamiento que hacemos en la reserva de la experiencia elegida. Se
          complementan con nuestra{" "}
          <Link href="/politica-de-datos">Política de tratamiento de datos personales</Link>{" "}
          y con la información de{" "}
          <Link href="/cambios-y-devoluciones">Cambios y devoluciones</Link>, que hacen
          parte integral de este acuerdo.
        </p>
        <p>
          Al finalizar una compra en nuestro sitio, declaras que has leído y aceptas estas
          condiciones.
        </p>
      </Sec>

      <Sec n={3} title="Qué es una Vivabox">
        <p>
          Una Vivabox es un regalo físico: una caja que contiene un código de activación
          único y personal. La caja no incluye ni reserva una experiencia específica —
          es la persona que la recibe quien, al activarla, elige una experiencia dentro
          del catálogo disponible para esa Vivabox.
        </p>
        <p>
          Vivabox no es un catálogo de actividades ni una agencia de viajes: es un
          producto de regalo diseñado para que dar una experiencia sea simple, confiable
          y memorable.
        </p>
      </Sec>

      <Sec n={4} title="Qué adquiere realmente el comprador">
        <p>
          Cuando compras una Vivabox adquieres la caja física, con su código de
          activación, y el derecho de quien la reciba a elegir <strong>una</strong>{" "}
          experiencia del catálogo disponible para esa Vivabox y a que Vivabox acompañe
          la coordinación de su reserva con el aliado correspondiente.
        </p>
        <p>
          No compras una experiencia específica ni un cupo garantizado en una fecha
          determinada: la fecha y disponibilidad se coordinan después de la activación,
          directamente con el aliado que presta la experiencia elegida.
        </p>
      </Sec>

      <Sec n={5} title="Cómo funciona una Vivabox">
        <p>El recorrido completo de una Vivabox es el siguiente:</p>
        <ul>
          <li>Compras la Vivabox en nuestro sitio y la recibes (o la envías directamente a quien la recibe).</li>
          <li>Quien la recibe activa el código incluido en la plataforma de activación de Vivabox.</li>
          <li>Explora el catálogo de experiencias disponible para esa Vivabox.</li>
          <li>Elige una única experiencia.</li>
          <li>Vivabox acompaña la coordinación de la reserva con el aliado que presta esa experiencia.</li>
          <li>La persona vive la experiencia en la fecha acordada con el aliado.</li>
        </ul>
      </Sec>

      <Sec n={6} title="Compra y pago">
        <p>
          La compra se realiza a través de nuestro sitio web. El precio, los medios de
          pago disponibles y el costo de envío (si aplica) se muestran de forma clara
          antes de confirmar el pago, sin costos ocultos.
        </p>
        <p>
          Los pagos se procesan a través de una pasarela de pagos externa. Vivabox no
          almacena los datos de tu tarjeta o medio de pago: esa información es manejada
          directamente por el proveedor de pagos bajo sus propios protocolos de
          seguridad.
        </p>
        <p>
          La compra queda confirmada una vez el pago es aprobado. En ese momento
          generamos el código de activación único de tu Vivabox.
        </p>
      </Sec>

      <Sec n={7} title="Entrega de la caja">
        <p>
          Puedes recibir la Vivabox en tu propia dirección o pedir que se envíe
          directamente a quien la recibirá. La dirección, la ciudad y el costo de envío
          (cuando aplique) se confirman antes de pagar.
        </p>
        <p>
          Vivabox se apoya en transportadoras externas para la entrega. Una vez el
          pedido es despachado, cualquier demora atribuible exclusivamente a la
          transportadora no es responsabilidad de Vivabox, pero te acompañamos en la
          gestión con el transportador si algo no llega como se esperaba.
        </p>
      </Sec>

      <Sec n={8} title="Activación mediante código">
        <p>
          Cada Vivabox incluye un código de activación único, impreso dentro de la caja.
          El código se activa en la plataforma web de Vivabox destinada a quien recibe
          el regalo.
        </p>
        <p>
          El código es de un solo uso y personal a la Vivabox que lo contiene. Es
          responsabilidad de quien tiene la caja física mantener el código en buen
          estado y no compartirlo públicamente: quien active un código válido primero
          será quien acceda al catálogo y pueda elegir la experiencia, sin que Vivabox
          pueda verificar la identidad del destinatario original del regalo más allá de
          los datos que esa persona registre al activar.
        </p>
      </Sec>

      <Sec n={9} title="Selección de una única experiencia">
        <p>
          Una vez activada, la Vivabox da acceso a un catálogo de experiencias
          disponibles. Quien recibe el regalo puede explorar libremente ese catálogo,
          pero solo puede <strong>elegir una experiencia por Vivabox</strong>.
        </p>
        <p>
          Mientras no se haya confirmado una reserva, la elección puede cambiarse por
          otra experiencia disponible dentro del mismo catálogo. Una vez la reserva
          queda confirmada con el aliado, la experiencia elegida queda en firme y se
          rige por las reglas de cambios, cancelaciones y reprogramación descritas más
          adelante.
        </p>
      </Sec>

      <Sec n={10} title="Catálogo y disponibilidad">
        <p>
          Las experiencias mostradas en nuestro sitio web, antes de la activación, son{" "}
          <strong>ejemplos de experiencias</strong> pensados para inspirar el regalo. El
          catálogo real y actualizado, con la disponibilidad vigente, solo es visible
          después de activar la Vivabox.
        </p>
        <p>
          El catálogo puede variar en el tiempo según la disponibilidad de los aliados,
          la ciudad de quien recibe el regalo y la temporada. Vivabox no garantiza que
          una experiencia puntual mostrada como ejemplo esté disponible en el momento de
          la activación.
        </p>
      </Sec>

      <Sec n={11} title="Vigencia">
        <p>
          Cada Vivabox tiene una vigencia de <strong>seis (6) meses</strong> contados
          desde la fecha de compra, dentro de los cuales el código debe activarse y la
          experiencia elegida y reservarse.
        </p>
        <p>
          Si el código no se activa dentro de ese plazo, la Vivabox pierde vigencia. Si
          tienes dudas sobre la vigencia de una Vivabox en particular, escríbenos y te
          ayudamos a verificarla.
        </p>
      </Sec>

      <Sec n={12} title="Proceso de reserva">
        <p>
          Una vez elegida la experiencia, el equipo de Vivabox coordina la reserva con
          el aliado que la presta: confirmamos disponibilidad, fecha y demás detalles
          necesarios para agendarla.
        </p>
        <p>
          Este acompañamiento es parte del servicio: no dejamos que quien recibió el
          regalo tenga que negociar directamente con el aliado el primer contacto — lo
          hacemos nosotros.
        </p>
      </Sec>

      <Sec n={13} title="Confirmación de reservas">
        <p>
          Una reserva se entiende confirmada cuando Vivabox comunica, por el canal de
          contacto registrado, la fecha y demás condiciones acordadas con el aliado. A
          partir de ese momento, la reserva queda sujeta a las condiciones particulares
          de esa experiencia (sección siguiente) y a las reglas de cancelación,
          reprogramación y no-show descritas en este documento.
        </p>
      </Sec>

      <Sec n={14} title="Condiciones particulares de cada experiencia">
        <p>
          Cada experiencia puede tener condiciones propias definidas por el aliado que
          la presta: anticipación mínima para reservar, horarios, número de personas,
          restricciones de edad o clima, entre otras. Estas condiciones se informan a
          quien recibe el regalo al momento de elegir y confirmar la experiencia, antes
          de que la reserva quede en firme.
        </p>
        <p>
          En caso de contradicción entre una condición particular de una experiencia y
          estos términos generales, prevalece la condición particular informada para
          esa experiencia, siempre que no reduzca los derechos mínimos reconocidos al
          consumidor por la ley colombiana.
        </p>
      </Sec>

      <Sec n={15} title="Cambios o sustitución de experiencias">
        <p>
          Si la experiencia elegida deja de estar disponible después de la elección pero{" "}
          <strong>antes</strong> de que la reserva quede confirmada, Vivabox lo informa a
          quien recibió el regalo y ofrece alternativas equivalentes dentro del
          catálogo disponible para elegir de nuevo, sin costo adicional.
        </p>
        <p>
          Nuestro compromiso no es preservar una experiencia puntual, sino que el
          regalo se cumpla: si algo cambia del lado del aliado, te ayudamos a encontrar
          una alternativa razonable.
        </p>
      </Sec>

      <Sec n={16} title="Cancelaciones">
        <p>
          Una reserva ya confirmada puede cancelarse por parte de quien la hizo,
          respetando la anticipación mínima informada para esa experiencia en el
          momento de la reserva. Cancelaciones dentro de ese plazo dan derecho a elegir
          otra experiencia disponible del catálogo, sujeta a la vigencia de la Vivabox.
        </p>
        <p>
          Si el aliado cancela la experiencia por causas que le sean atribuibles,
          Vivabox coordina una alternativa equivalente o, si no es posible encontrar una
          alternativa razonable dentro de la vigencia de la Vivabox, gestiona la
          solución que corresponda conforme a la sección de{" "}
          <Link href="/cambios-y-devoluciones">Cambios y devoluciones</Link>.
        </p>
      </Sec>

      <Sec n={17} title="Reprogramaciones">
        <p>
          Cuando una experiencia no puede realizarse en la fecha acordada por causas de
          fuerza mayor, clima, o disponibilidad del aliado, Vivabox coordina una nueva
          fecha con el aliado y te la comunica. La reprogramación no tiene costo
          adicional cuando la causa no es atribuible a quien reservó.
        </p>
        <p>
          Si quien reservó necesita reprogramar por su propia cuenta, debe solicitarlo
          respetando la anticipación mínima informada para esa experiencia; la
          posibilidad de reprogramar sin costo adicional depende de las condiciones
          propias de cada aliado.
        </p>
      </Sec>

      <Sec n={18} title="No-show (no presentarse a la reserva)">
        <p>
          Si quien reservó no se presenta a una experiencia confirmada, sin haberla
          cancelado ni reprogramado con la anticipación indicada, se entiende que la
          oportunidad de esa reserva se pierde: el aliado ya había apartado el cupo o
          los recursos para esa fecha.
        </p>
        <p>
          Si consideras que un no-show ocurrió por una causa justificada y ajena a tu
          voluntad, escríbenos: revisamos cada caso con el aliado antes de darlo por
          cerrado.
        </p>
      </Sec>

      <Sec n={19} title="Retracto">
        <p>
          Por tratarse de una compra por medios electrónicos, tienes derecho de retracto
          sobre la compra de la Vivabox conforme al artículo 47 de la Ley 1480 de 2011
          (Estatuto del Consumidor). Los detalles de cómo ejercerlo están en{" "}
          <Link href="/cambios-y-devoluciones">Cambios y devoluciones</Link>.
        </p>
        <p>
          Una vez el código de una Vivabox ha sido activado y una experiencia queda
          reservada para una fecha determinada, esa reserva corresponde a un servicio de
          entretenimiento, alojamiento o alimentación prestado en una fecha específica,
          categoría que la ley excluye expresamente del derecho de retracto (artículo
          47, literal f, Ley 1480 de 2011).
        </p>
      </Sec>

      <Sec n={20} title="Cambios y devoluciones">
        <p>
          Si la Vivabox llega en mal estado, dañada o con el código inutilizable, o si
          hay una falla que nos sea atribuible, tienes derecho a la garantía legal de
          calidad e idoneidad reconocida por la ley colombiana. El detalle completo del
          procedimiento está en{" "}
          <Link href="/cambios-y-devoluciones">Cambios y devoluciones</Link>.
        </p>
      </Sec>

      <Sec n={21} title="Responsabilidades de Vivabox">
        <p>Vivabox se compromete a:</p>
        <ul>
          <li>Entregar la Vivabox física en las condiciones y plazos informados en la compra.</li>
          <li>Mantener disponible un catálogo de experiencias verificado con aliados reales.</li>
          <li>Acompañar la coordinación de la reserva entre quien recibe el regalo y el aliado.</li>
          <li>Ofrecer alternativas razonables cuando una experiencia deje de estar disponible.</li>
          <li>Proteger los datos personales conforme a nuestra <Link href="/politica-de-datos">Política de tratamiento de datos</Link>.</li>
          <li>Dar respuesta oportuna a las peticiones, quejas y reclamos que recibamos.</li>
        </ul>
        <p>
          Vivabox no es responsable por la calidad de la ejecución de la experiencia en
          sí misma cuando esta depende directamente del aliado que la presta, sin
          perjuicio de nuestra responsabilidad como intermediario en la selección y
          coordinación del servicio, conforme a la ley aplicable.
        </p>
      </Sec>

      <Sec n={22} title="Responsabilidades de los aliados y prestadores">
        <p>
          Cada experiencia es prestada directamente por un aliado independiente
          (restaurante, spa, operador turístico, hotel, entre otros), quien es
          responsable de la correcta ejecución de esa experiencia, del cumplimiento de
          las normas de seguridad aplicables a su actividad y de las condiciones
          particulares informadas para su experiencia.
        </p>
        <p>
          Vivabox selecciona y verifica a sus aliados, y acompaña la coordinación de
          cada reserva, pero la relación de prestación del servicio se da entre quien
          recibe el regalo y el aliado en el momento de vivir la experiencia.
        </p>
      </Sec>

      <Sec n={23} title="PQR y atención al consumidor">
        <p>
          Puedes presentar cualquier petición, queja o reclamo (PQR) relacionado con tu
          Vivabox escribiéndonos a{" "}
          <a href="mailto:contact@vivabox.com.co">contact@vivabox.com.co</a> o por{" "}
          <a href="https://wa.me/573142590291" target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
          , indicando tu código de Vivabox si ya fue activado.
        </p>
        <p>
          Daremos respuesta dentro de los quince (15) días hábiles siguientes a la
          recepción de tu solicitud, conforme al Estatuto del Consumidor (Ley 1480 de
          2011). Si el caso requiere más tiempo por depender de un aliado externo, te
          mantendremos informado del estado de tu solicitud.
        </p>
      </Sec>

      <Sec n={24} title="Modificación de estos términos">
        <p>
          Vivabox puede actualizar estos términos para reflejar cambios en el producto,
          en la operación o en la normativa aplicable. La versión vigente es siempre la
          publicada en esta página, con su fecha de última actualización. Los cambios no
          afectan de forma desfavorable las compras ya realizadas bajo la versión
          anterior.
        </p>
      </Sec>

      <Sec n={25} title="Legislación aplicable">
        <p>
          Estos términos se rigen por las leyes de la República de Colombia, en
          particular por la Ley 1480 de 2011 (Estatuto del Consumidor) y sus normas
          reglamentarias. Cualquier controversia que no se resuelva directamente con
          Vivabox podrá presentarse ante la Superintendencia de Industria y Comercio o
          ante la autoridad judicial competente.
        </p>
      </Sec>
    </LegalLayout>
  );
}
