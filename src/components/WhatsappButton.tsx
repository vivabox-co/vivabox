"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

export default function WhatsappButton() {

  const [visible, setVisible] = useState(false);

  const phone = "573142590291"; 
  const message = "Hola! Estoy pensando regalar una Vivabox y tengo una pregunta.";

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  useEffect(() => {

    function handleScroll() {
      if (window.scrollY > 200) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    }

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);

  }, []);

  return (
    <div
      className={`fixed bottom-[calc(2rem+var(--sticky-cta-offset,0px)+var(--cookie-banner-offset,0px))] lg:bottom-[calc(2rem+var(--cookie-banner-offset,0px))] right-6 z-50 flex items-center gap-3 transition-all duration-500 ease-out
      ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"}`}
    >

      {/* label desktop */}

      <div className="hidden lg:block bg-[var(--color-card)] text-sm text-foreground px-4 py-2 rounded-full shadow-[3px_3px_8px_var(--nm-dark),-3px_-3px_8px_var(--nm-light)]">
        ¿Te ayudamos?
      </div>

      {/* bouton whatsapp */}

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition"
      >
        <MessageCircle size={26} strokeWidth={1.5} />
      </a>

    </div>
  );
}
