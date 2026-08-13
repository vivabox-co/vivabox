type Props = {
  children: React.ReactNode
}

export default function Card({ children }: Props) {
  return (
    <div className="vb-card overflow-hidden">
      {children}
    </div>
  )
}