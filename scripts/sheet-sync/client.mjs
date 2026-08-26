// Shared authenticated Sheets client for scripts/sheet-sync/*.mjs.
// Requires scripts/sheet-sync/authorize.mjs to have been run once already.

import { google } from "googleapis"
import { promises as fs } from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CREDENTIALS_PATH = path.join(__dirname, ".credentials", "credentials.json")
const TOKEN_PATH = path.join(__dirname, ".credentials", "token.json")

export async function getSheetsClient() {
  let credentials, token
  try {
    credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH, "utf-8"))
    token = JSON.parse(await fs.readFile(TOKEN_PATH, "utf-8"))
  } catch {
    throw new Error(
      "Faltan credenciales/token. Corre primero: node scripts/sheet-sync/authorize.mjs"
    )
  }

  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris?.[0])
  oAuth2Client.setCredentials(token)

  return google.sheets({ version: "v4", auth: oAuth2Client })
}
