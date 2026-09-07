// Adds a dropdown (data validation) to the "tipo_actividad" column, restricted
// to the activity_key values that actually have a matching icon committed in
// vivabox-appben/public/icons/*.svg (see lib/map/getActivityIcon.tsx's
// VALID_ACTIVITY_KEYS there -- this list must be copied from that file by
// hand since the two repos aren't wired together).
//
// Without this, anyone typing a free-text description into tipo_actividad
// (e.g. "Iniciacion al tiro" instead of "gun") silently gets the default
// "dining" pin icon on the beneficiary app's map -- no error, no warning
// visible outside the browser console. This closes that hole at the source.
//
// IMPORTANT: whenever a new icon is added to vivabox-appben, re-run this
// script (or add the key manually to the sheet's dropdown) so the sheet
// keeps offering it as a valid choice.
//
// Usage (dry run, default):
//   SHEET_ID=<spreadsheet id> node scripts/sheet-sync/add-tipo-actividad-validation.mjs
// Usage (applies the change):
//   SHEET_ID=<spreadsheet id> node scripts/sheet-sync/add-tipo-actividad-validation.mjs --confirm

import { getSheetsClient } from "./client.mjs"

const HEADER = "tipo_actividad"
const DEFAULT_GID = "1700161859"

// Copied from vivabox-appben/lib/map/getActivityIcon.tsx VALID_ACTIVITY_KEYS
// (43 keys, as of this script's writing -- keep in sync manually).
const VALID_ACTIVITY_KEYS = [
  "archery", "art_workshop", "bbq", "beer_tasting", "brunch", "buggy", "bungee",
  "caravan", "chef_hat", "cinema", "climbing", "coffee_tasting", "crystal_ball",
  "dining", "driving_track", "eco_lodge", "escape_room", "facial", "flight_plane",
  "glass", "glamping", "golf", "gun", "hair", "hiking", "horseback", "hotel_stay",
  "ice_bath", "karting", "massage", "meditation", "motorbike", "paragliding",
  "perfume", "photoshoot", "pizza_class", "sauna", "scuba", "skydiving", "spa",
  "sushi_class", "theater", "wind_tunnel",
]

async function main() {
  const spreadsheetId = process.env.SHEET_ID
  if (!spreadsheetId) {
    throw new Error("Falta SHEET_ID (el ID en la URL de edición del sheet).")
  }
  const gid = process.env.SHEET_GID || DEFAULT_GID
  const confirm = process.argv.includes("--confirm")

  const sheets = await getSheetsClient()

  const { data: meta } = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = meta.sheets.find((s) => String(s.properties.sheetId) === String(gid))
  if (!sheet) {
    throw new Error(`No encontré una pestaña con gid=${gid}.`)
  }
  const title = sheet.properties.title
  const rowCount = sheet.properties.gridProperties.rowCount

  const { data: row1 } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${title}'!1:1`,
  })
  const headers = row1.values?.[0] || []
  const colIndex = headers.indexOf(HEADER)
  if (colIndex === -1) {
    throw new Error(`No encontré la columna "${HEADER}" en la fila 1 de "${title}".`)
  }

  console.log(
    `Pestaña "${title}": se restringe la columna "${HEADER}" (índice ${colIndex}) a un ` +
    `dropdown de ${VALID_ACTIVITY_KEYS.length} valores (filas 2 a ${rowCount}).`
  )

  if (!confirm) {
    console.log("Dry run -- no se escribió nada. Vuelve a correr con --confirm para aplicar.")
    return
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          setDataValidation: {
            range: {
              sheetId: sheet.properties.sheetId,
              startRowIndex: 1,
              endRowIndex: rowCount,
              startColumnIndex: colIndex,
              endColumnIndex: colIndex + 1,
            },
            rule: {
              condition: {
                type: "ONE_OF_LIST",
                values: VALID_ACTIVITY_KEYS.map((v) => ({ userEnteredValue: v })),
              },
              showCustomUi: true,
            },
          },
        },
      ],
    },
  })

  console.log("Listo.")
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
