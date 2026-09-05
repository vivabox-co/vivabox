// Editorial rewrite of 12 newly-added rows (BIE-COR-001..006, GAS-COR-001,
// CUL-BOG-009, AVE-BOG-002..004, GAS-BOG-008) per docs/editorial/experiencias.md.
// Raw provider content had: ALL CAPS titles with embedded taglines, duplicate
// titles across sites, commercial pricing leaking into `incluye`, typos, and
// generic filler in descripcion_corta/nota_vivabox. See chat 2026-09-05.
//
// Usage: SHEET_ID=... node scripts/sheet-sync/update-12-new-rows.mjs [--confirm]

import { getSheetsClient } from "./client.mjs"

const DEFAULT_GID = "1700161859"

const UPDATES = {
  "BIE-COR-002": {
    descripcion_corta:
      "Dos horas de acceso a la piscina termal, seguidas de una hidratación facial de 25 minutos y un cóctel con o sin alcohol para cerrar la visita. Disponible jueves, viernes y lunes, para una persona.",
    nota_vivabox:
      "Nos llamó la atención que el cuidado facial reemplace al masaje corporal: una forma distinta de complementar la piscina termal para quien prefiere cuidar el rostro.",
    ideal_para: "Buscas cuidar el rostro además de relajarte en la piscina termal.",
    claves_eleccion: "Jueves, viernes y lunes",
  },
  "BIE-COR-003": {
    descripcion_corta:
      "Autoexfoliación con sal marina, piscina termal, turco, sauna y jacuzzi a 40°C, veinticinco minutos en cada espacio. Un recorrido completo de spa disponible los sábados y domingos, para una persona.",
    nota_vivabox:
      "La incluimos porque encadena cinco espacios distintos —exfoliación, piscina, turco, sauna y jacuzzi— en una sola visita, algo que no suele encontrarse junto en un solo plan.",
    ideal_para: "Quieres un recorrido de spa completo, no solo la piscina termal.",
    claves_eleccion: "5 espacios en un recorrido | Solo sábados y domingos",
  },
  "BIE-COR-004": {
    descripcion_corta:
      "Un masaje corporal relajante con piedras calientes de 50 minutos, seguido de un almuerzo gourmet en el restaurante, con bata en alquiler y kit desechable incluido. Disponible de jueves a domingo y festivos, para una persona.",
    nota_vivabox:
      "Nos convenció la combinación de piedras calientes y almuerzo gourmet: un plan que no se queda solo en la relajación, sino que suma un buen momento en la mesa.",
    ideal_para: "Quieres combinar un masaje con una buena comida, no solo uno de los dos.",
    claves_eleccion: "Jueves a domingo y festivos | No incluye bebidas",
  },
  "BIE-COR-005": {
    descripcion_corta:
      "Una noche de hospedaje con cena de llegada, tres horas de termales nocturnas y desayuno de la casa, seguida de una última sesión de termales en la mañana antes del check-out.",
    nota_vivabox:
      "Nos llamó la atención el cierre del plan: después de la cena y las termales nocturnas, todavía queda una sesión de termales en la mañana antes de salir.",
    claves_eleccion: "Baño compartido",
  },
  "BIE-COR-006": {
    nombre_experiencia: "Parrillada campestre en carpa privada junto al río",
    descripcion_corta:
      "Una parrillada campestre junto al río, en una carpa privada de cuatro horas con decoración temática y música propia, y una selección de carnes y acompañamientos para compartir en pareja.",
    nota_vivabox:
      "Nos gustó la privacidad de la carpa junto al río, con tiempo suficiente —cuatro horas— para que la parrillada se sienta como un plan propio y no compartido con más gente.",
    incluye:
      "Espacio en carpa privada durante 4 horas junto al río, con decoración temática a elegir (aniversario, cumpleaños o romántica) y bafle con puerto USB para música propia.\nPicada campestre para 2: carne de res, pollo a la parrilla, papa criolla, costilla de cerdo, chorizo, morcilla y arepa de choclo, con ají y guacamole de cortesía.\nDisponible de jueves a domingo y festivos.",
    claves_eleccion: "Carpa privada 4 horas | Decoración a elegir (aniversario, cumpleaños o romántica)",
    nota_clima: "Influye",
  },
  "GAS-COR-001": {
    nombre_experiencia: "Cena romántica con decoración y vino",
    descripcion_corta:
      "Una cena romántica para dos, con decoración de pétalos y velas, copas de vino de la casa y una entrada para compartir. Elige entre un menú de carnes, pescado o una tabla de sushi.",
    nota_vivabox:
      "Nos convenció que la decoración con pétalos y velas venga acompañada de la posibilidad de elegir entre carnes, pescado o sushi, para adaptar la cena al gusto de la pareja.",
    incluye:
      "Decoración con pétalos y velas, copas de vino de la casa y una entrada para compartir (tostadas con queso crema y jamón serrano).\nMenú a elegir: Filet Mignon, cacerola de salmón kareoka, piña marinera, o tabla de sushi de 15 bocados (tropical, philadelphia y tempura acevichado).\nDisponible de jueves a domingo.",
    claves_eleccion: "Elige entre varias opciones de menú | Vino de la casa incluido",
  },
  "CUL-BOG-009": {
    descripcion_corta:
      "Un recorrido por el barrio Egipto para conocer su historia, su cultura y sus realidades de la mano de antiguos pandilleros que hoy trabajan por la transformación de su comunidad.",
    nota_vivabox:
      "Nos llamó la atención que el recorrido lo guíen quienes vivieron esa historia de primera mano: da un punto de vista sobre Bogotá que no se consigue en un recorrido turístico convencional.",
    incluye:
      "Recorrido guiado para 2 personas por el barrio Egipto, a cargo de habitantes locales, con snack incluido y una explicación de la dimensión social del proceso de transformación de la comunidad.",
    claves_eleccion: "Guías con experiencia vivida en el barrio | Incluye snack",
  },
  "AVE-BOG-002": {
    nombre_experiencia: "Iniciación al tiro en polígono (sede Bogotá)",
    descripcion_corta:
      "Una iniciación al tiro deportivo para probar pistola, revólver y escopeta en una sola sesión, con instructor certificado y explicación de seguridad antes de cada arma.",
    nota_vivabox:
      "Nos convenció que una sola sesión cubra tres tipos de arma —pistola, revólver y escopeta— con un instructor certificado en las tres, para conocer bien el espectro antes de decidir por una.",
    claves_eleccion: "3 armas en una sesión | Instructor certificado COSECAD | Polígono cubierto",
  },
  "AVE-BOG-003": {
    nombre_experiencia: "Iniciación al tiro en polígono (sede Suesca)",
    descripcion_corta:
      "Una iniciación al tiro deportivo al aire libre en Suesca, para probar pistola, revólver y escopeta en una sola sesión, con instructor certificado y explicación de seguridad antes de cada arma.",
    nota_vivabox:
      "La incluimos porque es la misma experiencia de tiro con tres armas y un instructor certificado, pero al aire libre y solo los fines de semana, una alternativa a la sede cubierta de Bogotá.",
    nota_clima: "Influye",
    claves_eleccion: "Al aire libre | Solo fines de semana | Instructor certificado COSECAD",
  },
  "AVE-BOG-004": {
    nombre_experiencia: "Vuelo en túnel de gravedad",
    nota_vivabox:
      "Nos convenció que sea una forma real de sentir la caída libre sin lanzarse de un avión, en un entorno controlado y con instructor en todo momento durante los tres vuelos.",
    requisitos: "Ser mayor de edad y tener buena condición física.",
    info_importante: "No necesitas ser atleta ni tener experiencia previa: basta con tener ganas de probarlo.",
    claves_eleccion: "3 vuelos incluidos | Instructor en todo momento | No requiere experiencia previa",
  },
  "GAS-BOG-008": {
    descripcion_corta:
      "Un menú completo para dos: pan artesanal de entrada, trucha al ajillo o pollo en salsa de mandarina al romero de plato fuerte, con puré de papa y ensalada de la casa, brownie con esponjado de maracuyá de postre, y limonada, agua o gaseosa para acompañar.",
    nota_vivabox:
      "Nos convenció que el menú para dos venga ya armado —entrada, plato fuerte a elegir, postre y bebida— sin necesidad de decidir plato por plato en la carta.",
    incluye:
      "Entrada: pan artesanal con reducción de vinagre balsámico y aceite de oliva.\nPlato fuerte a elegir: trucha al ajillo o pollo en salsa de mandarina al romero, con puré de papa y ensalada de la casa.\nPostre: torta de brownie con esponjado de maracuyá.\nBebida: limonada natural, agua o gaseosa.",
    info_importante: "Solo se puede llegar a pie; está en una calle peatonal.",
    nota_extra: "Menú $150.000 (info comercial, confirmar vigencia con el proveedor).",
    claves_eleccion: "2 opciones de plato fuerte | Solo acceso a pie (calle peatonal)",
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
      console.log(`    antes:    ${JSON.stringify(current).slice(0, 150)}`)
      console.log(`    después:  ${JSON.stringify(newValue).slice(0, 150)}`)
      valueRanges.push({ range: `'${title}'!${col}${sheetRow}`, values: [[newValue]] })
      cellCount++
    }
  }

  console.log(`\n${cellCount} celdas para actualizar.`)

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

  console.log("\nListo.")
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
