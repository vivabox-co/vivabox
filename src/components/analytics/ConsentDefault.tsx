import Script from "next/script";

// Debe cargar ANTES que GoogleTagManagerScript (por eso "beforeInteractive":
// Next.js lo inyecta en el HTML inicial, garantizando el orden sin importar
// dónde se coloquen los componentes en el JSX). Define dataLayer/gtag y
// declara el consentimiento por defecto — denegado, salvo que el visitante
// ya haya elegido antes (mismo `localStorage` que src/lib/consent.ts y
// src/features/consent/consentStore.ts, clave "vivabox-consent" — si cambia
// una, hay que cambiar las tres).
export function ConsentDefaultScript() {
  return (
    // La regla de ESLint solo conoce el Pages Router (pages/_document.js);
    // "beforeInteractive" en el layout raíz del App Router es el uso
    // documentado por Next.js — no aplica aquí.
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script id="consent-default" strategy="beforeInteractive">
      {`(function(){
        window.dataLayer = window.dataLayer || [];
        function gtag(){ window.dataLayer.push(arguments); }
        window.gtag = gtag;

        var analytics = false;
        var marketing = false;

        try {
          var raw = localStorage.getItem('vivabox-consent');
          if (raw) {
            var parsed = JSON.parse(raw);
            if (typeof parsed.analytics === 'boolean') analytics = parsed.analytics;
            if (typeof parsed.marketing === 'boolean') marketing = parsed.marketing;
          }
        } catch (e) {}

        gtag('consent', 'default', {
          analytics_storage: analytics ? 'granted' : 'denied',
          ad_storage: marketing ? 'granted' : 'denied',
          ad_user_data: marketing ? 'granted' : 'denied',
          ad_personalization: marketing ? 'granted' : 'denied',
          wait_for_update: 500
        });
      })();`}
    </Script>
  );
}
