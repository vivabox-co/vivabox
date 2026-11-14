// Bulk editorial rewrite of 20 rows flagged as not following
// docs/editorial/experiencias.md and the sheet guide (see chat 2026-09-03):
// generic/repeated nota_vivabox, commercial figures leaking into
// beneficiary-facing fields, "No influye" written literally, ALL CAPS
// titles, etc. Also deletes CUL-BOG-003 (empty duplicate of CUL-BOG-002).
//
// Usage: SHEET_ID=... node scripts/sheet-sync/update-20-editorial-rows.mjs [--confirm]

import { getSheetsClient } from "./client.mjs"

const DEFAULT_GID = "1700161859"
const DELETE_CODE = "CUL-BOG-003"

const UPDATES = {
  "BIE-BOG-003": {
    nombre_experiencia: "Masaje relajante sin salir de casa",
    descripcion_corta:
      "Un masaje relajante de 60 minutos en la comodidad de tu casa, con aromaterapia, piedras calientes y trabajo en cuello, espalda, piernas y brazos. Termina con masaje capilar y facial para bajar la tensión del cuerpo por completo.",
    nota_vivabox:
      "La incluimos porque no hay que salir de casa: el masajista lleva la camilla profesional y todo el equipo, para un masaje completo de 60 minutos sin moverte de tu propio espacio.",
    incluye:
      "Masaje corporal completo a domicilio (60 min): aromaterapia, piedras calientes, musicoterapia y camilla profesional — el masajista lleva todo el equipo.",
    requisitos: "Contar con un espacio tranquilo en casa para instalar la camilla.",
    ideal_para: "Prefieres cuidarte en tu propio espacio, sin desplazarte.",
    nota_clima: "",
    nota_vestimenta: "Ropa cómoda y ligera, fácil de quitar para el masaje.",
  },
  "AVE-COC-006": {
    nombre_experiencia: "14 kilómetros en karts todoterreno",
    descripcion_corta:
      "Un recorrido de aventura en karts todoterreno por 14 kilómetros de camino de tierra y roca, con tramos que cruzan arroyos y, según la época, zonas de pantano. La actividad completa dura cerca de dos horas.",
    nota_vivabox:
      "La incluimos porque no es una pista cerrada: son 14 kilómetros de trocha real con arroyos y barro según la época, un recorrido de aventura genuino.",
    incluye: "Guías durante todo el recorrido, casco, gafas y póliza de accidentes.",
    requisitos: "Peso máximo 90 kg. Solo para adultos. No se permite alcohol ni sustancias antes de la actividad.",
    ideal_para: "Buscas una subida de adrenalina y no te importa llegar con la ropa sucia.",
    nota_clima: "El recorrido pasa por trocha y arroyos; en época de lluvias el camino tiene más barro y agua.",
    nota_vestimenta: "Ropa deportiva que no te importe ensuciar.",
  },
  "AVE-COC-007": {
    nombre_experiencia: "Rafting y rapel de cascada",
    descripcion_corta:
      "Un día de doble aventura: descenso en balsa por el río Negro en rápidos clase 3 durante 7 kilómetros, y torrentismo con un descenso en rapel de 50 metros seguido de un ascenso por vía ferrata a la misma altura.",
    nota_vivabox:
      "La incluimos porque combina dos ritmos de aventura en un mismo día: los rápidos del río Negro y, después, un descenso en rapel de 50 metros seguido de un ascenso por vía ferrata.",
    incluye: "Guías certificados y transporte interno entre actividades, equipo completo y póliza de accidentes.",
    requisitos: "Buena condición física — incluye rapel de 50 metros y ascenso por vía ferrata.",
    ideal_para: "Quieres una dosis doble de adrenalina en un solo día: agua y altura.",
    nota_clima:
      "Actividad en río y montaña al aire libre; la lluvia puede afectar el nivel del río y la visibilidad en el descenso.",
    nota_vestimenta: "Ropa deportiva que se pueda mojar, y calzado cerrado con buen agarre.",
  },
  "AVE-COC-008": {
    nombre_experiencia: "Rafting y cabalgata por el pueblo",
    descripcion_corta:
      "Combina el descenso en balsa por el río Negro, con rápidos clase 3 en un recorrido de 7 kilómetros, con una cabalgata de una hora por las veredas del pueblo para cerrar el día con un ritmo más tranquilo.",
    nota_vivabox:
      "La incluimos porque cierra el día con un contraste que nos gustó: después de los rápidos del río Negro, una cabalgata tranquila por las veredas del pueblo para bajar el ritmo.",
    incluye: "Guías y transporte para las dos actividades, equipo completo y póliza de accidentes.",
    requisitos: "Buena condición física para el descenso en balsa.",
    ideal_para: "Quieres una experiencia activa en el agua y después bajar el ritmo con un paisaje distinto a caballo.",
    nota_clima:
      "Actividad combinada de río y trocha al aire libre; la lluvia puede afectar el nivel del río y el estado del camino para la cabalgata.",
    nota_vestimenta: "Ropa deportiva que se pueda mojar para el rafting, y ropa de cambio para la cabalgata.",
  },
  "AVE-COC-009": {
    nombre_experiencia: "Rafting y salto al vacío entre árboles",
    descripcion_corta:
      "Combina el descenso en balsa por el río Negro, con rápidos clase 3 en 7 kilómetros, con un circuito aéreo entre los árboles: puente colgante de cuerdas, dos tirolesas y un salto al vacío desde 20 metros de altura.",
    nota_vivabox:
      "La incluimos por la combinación: después de los rápidos del río Negro, un circuito aéreo con puentes colgantes y un salto al vacío de 20 metros entre los árboles.",
    incluye: "Guías y transporte para las dos actividades, equipo completo y póliza de accidentes.",
    requisitos: "Buena condición física; el salto al vacío es desde 20 metros de altura.",
    ideal_para: "Quieres una experiencia activa en el agua y además probar un salto al vacío entre los árboles.",
    nota_clima:
      "Actividad de río y circuito en altura al aire libre; la lluvia puede afectar el nivel del río y hacer resbaloso el circuito aéreo.",
    nota_vestimenta: "Ropa deportiva que se pueda mojar, y ropa de cambio para el circuito aéreo.",
  },
  "CUL-BOG-002": {
    nombre_experiencia: "Una copa antes del teatro (sede Centro)",
    descripcion_corta:
      "Antes de la función, comparte una copa de vino y disfruta de una noche de teatro en el Teatro Libre, con boletería para una obra seleccionada. Una experiencia pensada para convertir una función en un plan para compartir.",
    nota_vivabox:
      "Nos gustó la idea de convertir una noche de teatro en un plan de pareja o amigos: la copa de vino antes de la función le da un aire distinto a solo comprar la boleta.",
    incluye: "Boletería para la función seleccionada (por persona) y una copa de vino.",
    requisitos: "",
    ideal_para: "Vas a ver una obra y quieres convertirlo en un plan para compartir con una copa de vino.",
    nota_clima: "",
    nota_vestimenta: "Ropa elegante o semi-formal, acorde con una noche de teatro.",
    nota_extra: "Viable para la sede del centro (nota operativa).",
  },
  "CUL-BOG-004": {
    nombre_experiencia: "Una copa antes del teatro (sede Chapinero)",
    descripcion_corta:
      "Antes de la función, comparte una copa de vino y disfruta de una noche de teatro en el Teatro Libre, con boletería para una obra seleccionada. Una experiencia pensada para convertir una función en un plan para compartir.",
    nota_vivabox:
      "Nos llamó la atención lo simple del formato: una copa de vino antes de la función y listo, sin nada más que organizar.",
    incluye: "Boletería para la función seleccionada (por persona) y una copa de vino.",
    requisitos: "",
    ideal_para: "Vas a ver una obra y quieres convertirlo en un plan para compartir con una copa de vino.",
    nota_clima: "",
    nota_vestimenta: "Ropa elegante o semi-formal, acorde con una noche de teatro.",
    nota_extra: "Viable para la sede de Chapinero (nota operativa).",
  },
  "CUL-BOG-005": {
    nombre_experiencia: "Tras bambalinas",
    descripcion_corta:
      "Antes de que el público entre a la historia, hay un mundo de camerinos, luces, vestuario y preparación que normalmente permanece oculto. Esta experiencia te deja conocer ese universo detrás del escenario.",
    nota_vivabox:
      "Nos llamó la atención que casi nadie ve lo que hay detrás de una función: camerinos, vestuario, la parte técnica. Nos pareció una forma distinta de vivir el teatro antes de sentarte a verlo.",
    incluye:
      "Boletería para la función seleccionada, una copa de vino y recorrido por espacios del teatro antes de la función, con visita a camerinos sujeta a disponibilidad.",
    requisitos: "",
    ideal_para: "Quieres ver el teatro desde el otro lado del telón, no solo desde la butaca.",
    nota_clima: "",
    nota_vestimenta: "Ropa elegante, acorde con una noche de teatro.",
    nota_extra: "Viable para la sede de Chapinero (nota operativa).",
  },
  "CUL-BOG-006": {
    nombre_experiencia: "Tras bambalinas con cena y vino",
    descripcion_corta:
      "Antes de la función, conoce los espacios que normalmente quedan ocultos del teatro, comparte un plato fuerte y una copa de vino, y termina viendo la obra. Un plan que junta gastronomía, teatro y lo que pasa detrás del escenario.",
    nota_vivabox:
      "La incluimos porque junta tres cosas que normalmente van por separado: comer bien, conocer el teatro por dentro y ver la obra, todo en una sola noche.",
    incluye:
      "Boletería para la función seleccionada, una copa de vino, un plato fuerte, recorrido por el teatro y camerinos (sujeto a disponibilidad), e introducción al funcionamiento del teatro y la obra.",
    requisitos: "",
    ideal_para: "Quieres una noche completa: cenar, conocer el teatro por dentro y terminar viendo la función.",
    nota_clima: "",
    nota_vestimenta: "Ropa elegante para la cena y la función.",
    nota_extra: "Viable para la sede del centro (nota operativa).",
  },
  "CUL-BOG-007": {
    nombre_experiencia: "Cena, bambalinas y taller de teatro",
    descripcion_corta:
      "Antes de la función, recorre los espacios ocultos del teatro, comparte una copa de vino y un plato fuerte, y participa en un breve taller de juegos teatrales de 15 minutos para romper el hielo antes de ver la obra.",
    nota_vivabox:
      "La incluimos porque es la versión más completa: además de cenar y conocer el teatro por dentro, cierra con un taller corto de juegos teatrales antes de la función.",
    incluye:
      "Boletería para la función seleccionada, una copa de vino y un plato fuerte, recorrido por el teatro y camerinos (sujeto a disponibilidad), taller de juegos teatrales de 15 minutos y contextualización sobre el funcionamiento del teatro y la obra.",
    requisitos: "",
    ideal_para: "Vas en pareja, con amigos o en grupo y quieres una noche completa de teatro, no solo la función.",
    nota_clima: "",
    nota_vestimenta: "Ropa elegante para la función y la cena.",
    nota_extra: "Viable para la sede del centro (nota operativa).",
  },
  "CUL-BOG-008": {
    nombre_experiencia: "Sesión de fotos profesionales en estudio",
    descripcion_corta:
      "Una sesión fotográfica profesional en estudio, con varias tomas y poses según lo que busques, y asesoría durante toda la sesión para que el resultado se vea natural.",
    nota_vivabox:
      "La incluimos porque el paquete es simple y completo: en una sesión corta salen con las fotos ya editadas e impresas, sin pasos adicionales.",
    incluye:
      "2 fotografías editadas, en versión impresa (15x20 cm) y digital. Sesión de 20 minutos en estudio con un outfit (se permite un cambio de vestuario). No aplica para sesión en exteriores.",
    requisitos: "Sesión corta (20 minutos), solo en estudio interior — no aplica para exteriores.",
    ideal_para: "Quieres fotos profesionales rápidas, sin necesidad de cambiar de locación.",
    nota_clima: "",
    nota_vestimenta: "Lleva el outfit que quieras usar en las fotos; se permite un cambio de vestuario durante la sesión.",
    nota_extra: "Paquete base 'Bronce': $160.000 por 2 fotos (info comercial, confirmar vigencia con el proveedor).",
  },
  "AVE-COR-006": {
    nombre_experiencia: "Primera clase de golf con profesor",
    descripcion_corta:
      "Una clase de golf de hora y media pensada para quien nunca ha jugado, con un profesor que explica lo básico del swing, la postura y el manejo del palo.",
    nota_vivabox:
      "La incluimos porque es una forma sencilla de probar el golf por primera vez, con profesor incluido, sin tener que comprometerte con equipo propio.",
    incluye: "Clase de una hora y media con profesor, y material de golf incluido (palos y bolas).",
    requisitos: "Condición física media — la clase incluye caminar y practicar el swing durante hora y media.",
    ideal_para: "Nunca has jugado golf y quieres aprender lo básico con un profesor.",
    nota_clima: "El campo es al aire libre; si llueve fuerte la clase se puede posponer.",
    nota_vestimenta: "Ropa deportiva; lleva algo impermeable por si llueve.",
    nota_extra: "Precio especial para Vivabox (info comercial, no visible al beneficiario).",
  },
  "AVE-COR-007": {
    nombre_experiencia: "Ronda de golf con caddie incluido",
    descripcion_corta:
      "Para quien ya sabe jugar golf y tiene su propio equipo: acceso a la cancha para jugar una ronda, con el caddie incluido.",
    nota_vivabox:
      "La incluimos porque es una opción directa para quien ya juega golf y solo necesita acceso a cancha, sin clases ni paquetes adicionales.",
    incluye: "Acceso a cancha para una ronda de golf, con caddie incluido.",
    requisitos: "Debes tener experiencia jugando golf y traer tu propio equipo. Válido de lunes a viernes, no aplica en festivos.",
    ideal_para: "Ya sabes jugar golf, tienes tu propio equipo y quieres una ronda entre semana.",
    nota_clima: "El campo es al aire libre; si llueve fuerte el juego se puede suspender.",
    nota_vestimenta: "Ropa deportiva de golf; lleva algo impermeable por si acaso.",
    nota_extra: "El valor de $150.000 cubre derecho a juego + caddie (info comercial, no visible al beneficiario).",
  },
  "AVE-COR-008": {
    nombre_experiencia: "Caminata al cerro Montecillo, frente a Guatavita",
    descripcion_corta:
      "Camina por el Cerro Montecillo, el guardián de Guatavita, y conoce la historia del antiguo pueblo que quedó bajo el embalse de Tominé. Desde los senderos verás las cuchillas de Siecha y la cordillera de Chingaza, entre nieblas y frailejones.",
    nota_vivabox:
      "La incluimos por la combinación de paisaje e historia real: el recorrido pasa por el embalse de Tominé y cuenta la historia del pueblo que quedó bajo el agua, con vista a la laguna de Guatavita.",
    incluye: "Guía local durante todo el recorrido, tarjeta de asistencia médica y fotografías profesionales de la caminata.",
    requisitos:
      "Distancia: 6 km. Duración: 4 horas. Desnivel positivo: 700 m. Dificultad moderada — requiere buena condición física para terreno de montaña.",
    ideal_para: "Te gusta caminar en montaña y quieres conocer una historia real detrás del paisaje.",
    nota_clima:
      "Zona de páramo y bosque alto andino, con temperaturas entre 6°C y 12°C; puede haber niebla y lluvia repentina.",
    nota_vestimenta: "Ropa de trekking e impermeable, y calzado cerrado con buen agarre.",
    info_importante:
      "Estar acostumbrado a caminar. Llevar morral pequeño (máx. 20L), ropa de cambio, sombrero o cachucha, bloqueador solar, medicamentos personales, bastón de marcha (opcional), documentos de identidad y del seguro médico, mínimo 1L de agua y un refrigerio. No llevar joyas. Proteger los aparatos electrónicos de la lluvia. Seguir siempre las instrucciones del guía y no separarse del grupo.",
  },
  "BIE-BOG-002": {
    nombre_experiencia: "Método Bajo Cero",
    descripcion_corta:
      "Una sesión de inmersión en agua fría (Ice Bath) guiada, pensada para la recuperación muscular después del ejercicio y para experimentar los efectos de la exposición al frío controlado.",
    nota_vivabox:
      "La incluimos porque el 'Método Bajo Cero' sigue una secuencia guiada de inmersión en frío, pensada específicamente para la recuperación después del ejercicio.",
    requisitos: "",
    ideal_para: "Ya haces ejercicio y buscas ayudar a tu cuerpo a recuperarse, o quieres probar la exposición al frío controlado.",
  },
  "AVE-BOG-001": {
    nombre_experiencia: "Karts indoor en el subsuelo",
    descripcion_corta:
      "Media hora de karting indoor para dos personas, en una pista bajo techo ubicada en el subsuelo. Incluye inducción antes de arrancar y todo el material necesario para correr con seguridad.",
    nota_vivabox:
      "La incluimos porque es karting indoor de verdad: la pista está en el subsuelo, así que el clima de Bogotá no es un problema.",
    incluye: "Inducción antes de la carrera, karts y material de seguridad para dos personas.",
    requisitos: "Buenos reflejos y capacidad física para manejar el kart con seguridad.",
    ideal_para: "Vas con un acompañante y buscan una actividad rápida y competitiva.",
    nota_clima: "",
    nota_vestimenta: "Ropa cómoda y calzado cerrado.",
  },
  "AVE-COR-005": {
    nombre_experiencia: "Kayak y paddle en la laguna de Neusa",
    descripcion_corta:
      "Medio día en la laguna de Neusa para dos personas, combinando kayak y paddle board sobre el agua, con instructor y todo el equipo de seguridad incluido.",
    nota_vivabox:
      "La incluimos porque no es común encontrar paddle y kayak juntos en la misma salida — combina dos actividades de agua en un solo medio día en la laguna de Neusa.",
    incluye: "Instructor, material completo de paddle y kayak, y chalecos de seguridad.",
    requisitos: "Buena condición física.",
    ideal_para: "Van los dos con ganas de estar en el agua medio día, sin necesidad de experiencia previa en kayak o paddle.",
    nota_clima: "Actividad al aire libre en la laguna; el viento y la lluvia pueden afectar las condiciones del agua.",
    nota_vestimenta: "Ropa de baño o ropa deportiva que se pueda mojar.",
  },
  "BIE-COR-001": {
    nombre_experiencia: "Termales, masaje y cóctel",
    descripcion_corta:
      "Dos horas de acceso a la piscina termal, seguidas de un masaje relajante de cuello y espalda de 25 minutos, y para cerrar, un cóctel con o sin alcohol. Disponible de jueves a lunes, para una persona.",
    nota_vivabox:
      "La incluimos porque combina tres cosas en una sola visita: piscina termal, un masaje corto y un cóctel para cerrar, un plan completo sin tener que armar nada por tu cuenta.",
    incluye: "2 horas de piscina termal de uso compartido, masaje de cuello y espalda de 25 minutos, y un cóctel (con o sin alcohol).",
    ideal_para: "Quieres un momento de relajación completo, entre semana o el fin de semana (jueves a lunes).",
    nota_vestimenta: "Ropa de baño, toalla y gorro de baño.",
  },
  "BIE-COR-002": {
    nombre_experiencia: "Termales y snack",
    descripcion_corta:
      "Dos horas de acceso a la piscina termal de uso compartido, más un snack para cerrar la visita. Disponible jueves, viernes y lunes (no festivos), para una persona.",
    nota_vivabox:
      "La incluimos porque es la opción corta del plan termal: solo la piscina y un snack, para quien no quiere el masaje ni el cóctel.",
    incluye: "2 horas de piscina termal de uso compartido y un snack.",
    ideal_para: "Quieres un descanso corto en la piscina termal entre semana, sin planear todo un día.",
    nota_vestimenta: "Ropa de baño, toalla y gorro de baño.",
  },
}

function columnLetter(index) {
  let letter = ""
  let n = index + 1
  while (n > 0) {
    const rem = (n - 1) % 26
    letter = String.fromCharCode(65 + rem) + letter
    n = Math.floor((n - 1) / 26)
  }
  return letter
}

async function main() {
  const spreadsheetId = process.env.SHEET_ID
  if (!spreadsheetId) throw new Error("Falta SHEET_ID")
  const gid = process.env.SHEET_GID || DEFAULT_GID
  const confirm = process.argv.includes("--confirm")

  const sheets = await getSheetsClient()
  const { data: meta } = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = meta.sheets.find((s) => String(s.properties.sheetId) === String(gid))
  const title = sheet.properties.title
  const sheetId = sheet.properties.sheetId

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${title}'!A1:BD10000`,
  })
  const [header, ...rows] = data.values
  const codeCol = header.indexOf("codigo_interno")

  const valueRanges = []
  let cellCount = 0

  for (const [code, fields] of Object.entries(UPDATES)) {
    const rowIndex = rows.findIndex((r) => (r[codeCol] || "").trim() === code)
    if (rowIndex === -1) {
      console.log(`AVISO: no encontré ${code}, la salto`)
      continue
    }
    const sheetRow = rowIndex + 2
    console.log(`\n${code} (fila ${sheetRow})`)
    for (const [field, newValue] of Object.entries(fields)) {
      const colIndex = header.indexOf(field)
      if (colIndex === -1) {
        console.log(`  AVISO: columna "${field}" no existe, la salto`)
        continue
      }
      const current = rows[rowIndex][colIndex] || ""
      if (current.trim() === newValue.trim()) continue
      const col = columnLetter(colIndex)
      console.log(`  ${field}:`)
      console.log(`    antes:    ${JSON.stringify(current).slice(0, 120)}`)
      console.log(`    después:  ${JSON.stringify(newValue).slice(0, 120)}`)
      valueRanges.push({ range: `'${title}'!${col}${sheetRow}`, values: [[newValue]] })
      cellCount++
    }
  }

  const deleteRowIndex = rows.findIndex((r) => (r[codeCol] || "").trim() === DELETE_CODE)
  if (deleteRowIndex === -1) {
    console.log(`\nAVISO: no encontré ${DELETE_CODE} para eliminar`)
  } else {
    const sheetRow = deleteRowIndex + 2
    console.log(`\n${DELETE_CODE}: se eliminará la fila ${sheetRow} completa`)
  }

  console.log(`\n${cellCount} celdas para actualizar, 1 fila para eliminar (${DELETE_CODE}).`)

  if (!confirm) {
    console.log("\nDry run -- no se escribió nada. Vuelve a correr con --confirm para aplicar.")
    return
  }

  if (valueRanges.length) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: { valueInputOption: "RAW", data: valueRanges },
    })
  }

  if (deleteRowIndex !== -1) {
    const sheetRow = deleteRowIndex + 2
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: "ROWS",
                startIndex: sheetRow - 1,
                endIndex: sheetRow,
              },
            },
          },
        ],
      },
    })
  }

  console.log("\nListo.")
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
