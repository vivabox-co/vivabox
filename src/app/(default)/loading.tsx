import VivaboxLoader from "@/components/ui/VivaboxLoader"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center vb-surface-base">
      <VivaboxLoader size={72} />
    </div>
  )
}
