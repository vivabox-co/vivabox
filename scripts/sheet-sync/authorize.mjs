// One-time OAuth authorization for scripts that read/write the "Experiencias"
// Google Sheet directly (as opposed to the read-only published CSV that
// src/services/sheet.ts fetches). Uses the logged-in user's own Google
// account (vivabox.com.co) rather than a service account, since this Google
// Cloud org has iam.disableServiceAccountKeyCreation enforced.
//
// Setup (once): download an OAuth "Desktop app" client from
// https://console.cloud.google.com/auth/clients and save it as
// scripts/sheet-sync/.credentials/credentials.json (gitignored).
//
// Usage:
//   node scripts/sheet-sync/authorize.mjs
//
// Prints a Google login/consent URL -- open it (it also tries to auto-open
// your browser, but don't rely on that) and grant Sheets access. Saves a
// reusable token to scripts/sheet-sync/.credentials/token.json (gitignored).
// Re-run this if the token expires or is revoked.

import { google } from "googleapis"
import http from "http"
import { promises as fs } from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CREDENTIALS_PATH = path.join(__dirname, ".credentials", "credentials.json")
const TOKEN_PATH = path.join(__dirname, ".credentials", "token.json")

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

async function main() {
  let keyFile
  try {
    keyFile = JSON.parse(await fs.readFile(CREDENTIALS_PATH, "utf-8"))
  } catch {
    throw new Error(
      `No encontré ${CREDENTIALS_PATH}\n` +
      "Descarga el cliente OAuth 'Aplicación de escritorio' desde Google Cloud Console " +
      "y guárdalo en esa ruta."
    )
  }

  const keys = keyFile.installed || keyFile.web
  const redirectUri = new URL(keys.redirect_uris?.[0] || "http://localhost")
  const oAuth2Client = new google.auth.OAuth2(keys.client_id, keys.client_secret)

  const client = await new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url, `http://localhost:${server.address().port}`)
        const code = url.searchParams.get("code")
        if (!code) {
          res.end("No se recibió código de autorización. Puedes cerrar esta pestaña.")
          return
        }
        res.end("Autorización completada. Puedes cerrar esta pestaña y volver a la terminal.")
        server.close()
        const finalRedirect = `http://localhost:${server.address().port}${redirectUri.pathname}`
        const { tokens } = await oAuth2Client.getToken({ code, redirect_uri: finalRedirect })
        oAuth2Client.setCredentials(tokens)
        resolve(oAuth2Client)
      } catch (err) {
        reject(err)
      }
    })

    server.listen(0, () => {
      const port = server.address().port
      const finalRedirect = `http://localhost:${port}${redirectUri.pathname}`
      const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
        redirect_uri: finalRedirect,
      })

      console.log("\nAbre este link para iniciar sesión y autorizar acceso a Sheets:\n")
      console.log(authorizeUrl)
      console.log("\nEsperando a que completes la autorización en el navegador...\n")

      // Best-effort auto-open -- if it silently fails, the printed URL above still works.
      import("open").then((m) => m.default(authorizeUrl)).catch(() => {})
    })
  })

  await fs.writeFile(TOKEN_PATH, JSON.stringify(client.credentials))
  console.log(`Token guardado en ${TOKEN_PATH}`)

  const sheets = google.sheets({ version: "v4", auth: client })
  const spreadsheetId = process.env.SHEET_ID
  if (spreadsheetId) {
    const { data } = await sheets.spreadsheets.get({ spreadsheetId })
    console.log("Acceso confirmado. Pestañas:", data.sheets.map((s) => s.properties.title).join(", "))
  } else {
    console.log("(Define SHEET_ID como variable de entorno para verificar acceso a un sheet específico.)")
  }
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
