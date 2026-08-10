import Reveal from "@/components/ui/Reveal";

const LINES = [
  "No vendemos reservas.",
  "No vendemos actividades.",
  "No vendemos descuentos.",
];

export default function StoryPromise() {
  return (
    <section className="bg-ink py-20 md:py-[120px]">

      <div className="max-w-[640px] mx-auto px-6">

        <Reveal duration={400}>
          <h2 className="h2 text-white mb-10">
            Lo que significa una Vivabox.
          </h2>
        </Reveal>

        <div className="space-y-4 mb-6">
          {LINES.map((line, index) => (
            <Reveal key={line} duration={400} delay={index * 90}>
              <p className="text-white/70 leading-relaxed text-lg">
                {line}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal duration={400} delay={LINES.length * 90}>
          <p className="text-white text-xl md:text-2xl font-semibold leading-relaxed">
            Vendemos la tranquilidad de saber que el regalo va a emocionar.
          </p>
        </Reveal>

      </div>

    </section>
  );
}
