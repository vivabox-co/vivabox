export const metadata = {
  robots: { index: false, follow: false },
}

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <h1 className="text-[19px] font-bold">Sin conexión</h1>
      <p className="text-muted text-sm max-w-[280px]">
        No se pudo cargar esta página. Revisá tu conexión a internet e intentá de nuevo.
      </p>
    </div>
  )
}
