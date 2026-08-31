"use client"

import { useEffect } from "react"
import { PAGE_PATH } from "./types"

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return
    navigator.serviceWorker.register(`${PAGE_PATH}/sw.js`).catch(() => {})
  }, [])

  return null
}
