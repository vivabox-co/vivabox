// Pushes apps-script-codigo-interno.gs.js into the Apps Script project bound
// to the "Experiencias" spreadsheet, so codigo_interno auto-generates on edit
// without anyone opening the Apps Script editor by hand.
//
// Requires:
//   1. "Google Apps Script API" enabled for the account at
//      https://script.google.com/home/usersettings
//   2. scripts/sheet-sync/authorize.mjs re-run after that, so the saved token
//      includes the script.projects scope (see authorize.mjs SCOPES).
//
// Usage (dry run, default -- just shows what would happen):
//   SHEET_ID=<spreadsheet id from the edit URL> node scripts/sheet-sync/push-apps-script.mjs
//
// Usage (applies the change):
//   SHEET_ID=<spreadsheet id> node scripts/sheet-sync/push-apps-script.mjs --confirm
//
// If the spreadsheet already has a bound script project (e.g. someone opened
// Extensions > Apps Script on it before), pass its id explicitly:
//   SHEET_ID=<...> SCRIPT_ID=<...> node scripts/sheet-sync/push-apps-script.mjs --confirm
// (Find it via Extensions > Apps Script > Project Settings > "Script ID".)

import { promises as fs } from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { getScriptClient } from "./client.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SOURCE_PATH = path.join(__dirname, "apps-script-codigo-interno.gs.js")

const MANIFEST = {
  timeZone: "America/Bogota",
  exceptionLogging: "STACKDRIVER",
  runtimeVersion: "V8",
}

async function main() {
  const spreadsheetId = process.env.SHEET_ID
  if (!spreadsheetId) {
    throw new Error(
      "Falta SHEET_ID (el ID en la URL de edición del sheet, no el link publicado como CSV)."
    )
  }
  const confirm = process.argv.includes("--confirm")
  const source = await fs.readFile(SOURCE_PATH, "utf-8")

  const script = await getScriptClient()

  let scriptId = process.env.SCRIPT_ID
  let createdNew = false

  if (!scriptId) {
    try {
      const { data } = await script.projects.create({
        requestBody: { title: "codigo_interno auto (Vivabox)", parentId: spreadsheetId },
      })
      scriptId = data.scriptId
      createdNew = true
    } catch (err) {
      const message = err?.errors?.[0]?.message || err.message
      throw new Error(
        `No pude crear un proyecto Apps Script para este sheet: ${message}\n` +
        "Si el sheet ya tiene un proyecto vinculado (alguien abrió Extensions > Apps Script antes), " +
        "consigue su Script ID ahí (Project Settings > Script ID) y vuelve a correr con SCRIPT_ID=<id>."
      )
    }
  }

  console.log(
    createdNew
      ? `Proyecto Apps Script nuevo creado: ${scriptId}`
      : `Usando proyecto Apps Script existente: ${scriptId}`
  )
  console.log(`Se escribirá Code.gs (${source.split("\n").length} líneas) + appsscript.json manifest.`)

  if (!confirm) {
    console.log("Dry run -- no se escribió nada. Vuelve a correr con --confirm para aplicar.")
    return
  }

  await script.projects.updateContent({
    scriptId,
    requestBody: {
      files: [
        { name: "Code", type: "SERVER_JS", source },
        { name: "appsscript", type: "JSON", source: JSON.stringify(MANIFEST, null, 2) },
      ],
    },
  })

  console.log("Listo. El trigger onEdit queda activo de inmediato (simple trigger, sin autorización manual pendiente).")
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
