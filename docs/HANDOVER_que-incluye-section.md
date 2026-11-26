# Handover — Section "¿Qué incluye una Vivabox?"

Fichier concerné : `src/sections/whats-included/WhatsIncluded.tsx`

## Contexte

On est en train de refaire la mise en scène visuelle de la section "¿Qué incluye una Vivabox?" (juste après le bandeau sombre "Regalas una Vivabox. La otra persona elige su experiencia."). L'ancien design utilisait un diagramme positionné en pourcentages (boîte + post-it + catalogue + QR + mockup de téléphone, avec flèches SVG et labels). Il a été retiré.

## Ce que je veux pour cette section

Une composition simple : la boîte cadeau en haut, puis 3 flèches dessinées à la main qui partent du bas de la boîte vers 3 "cartes" alignées côte à côte en dessous, chaque carte ayant un texte descriptif sous elle.

Référence visuelle envoyée en conversation précédente : boîte au centre-haut, une flèche courbée vers la gauche, une flèche droite vers le bas, une flèche courbée vers la droite, puis 3 cartes carrées :
1. **Catálogo de experiencias** — photo (paddle/coucher de soleil) avec logo Vivabox et texte "CATÁLOGO DE EXPERIENCIAS" incrustés dans l'image.
2. **Post-it "Para ti, con todo mi cariño"** — mot personnel, fond crème, cœur dessiné à la main.
3. **QR d'activation** — "Aquí empieza la mejor parte / Activa tu Vivabox / Tu código:" avec QR code, fond sombre/photo floutée.

[Note pour la nouvelle conversation : partage ton brouillon/brief ici pour préciser ou corriger cette description si besoin.]

## Assets disponibles

Tous déjà présents dans `public/images/box-includes/` :

| Fichier | Dimensions | Usage |
|---|---|---|
| `box.png` | 1254×1254 | Boîte cadeau (haut de la composition) |
| `catalog.png` | 505×499 | Carte 1 — Catálogo de experiencias |
| `post-it.png` | 505×505 | Carte 2 — Mensaje personal |
| `QR.png` | 505×505 | Carte 3 — Código de activación |
| `arrow curv left.png` | 184×177 | Flèche courbée vers la gauche |
| `arrow curv rigth.png` | 184×177 | Flèche courbée vers la droite (note : nom de fichier avec faute — "rigth" pas "right") |
| `arrow down.png` | 24×113 | Flèche droite vers le bas |
| `App phone.png` | 435×971 | Mockup téléphone — **plus utilisé** dans la nouvelle version (drop volontaire, il n'apparaît pas dans la référence à 3 cartes) |

## Ce qui a déjà été implémenté

Dans `WhatsIncluded.tsx`, la section a été réécrite comme suit (voir le fichier directement pour le code exact) :

- Un composant `IncludedCard` (image carrée + titre + texte en dessous), réutilisé pour les 3 cartes.
- Structure : `<div className="flex flex-col items-center">` contenant :
  1. La boîte (`box.png`, `aspect-square`, `max-w-[260px] md:max-w-[320px]`)
  2. Une rangée de 3 flèches (`flex items-start justify-between`)
  3. Une grille `grid-cols-3` avec les 3 `IncludedCard`
- Textes des cartes déjà rédigés (ton "brand voice" du projet, espagnol colombien) :
  - Catálogo de experiencias → "Más de 120 experiencias para elegir."
  - Mensaje personal → "Unas palabras tuyas, si quieres hacerlo aún más especial."
  - Código de activación → "Actívalo y descubre el catálogo completo en línea."
- L'ancien code mort (`Arrow`, `Label`, `pct()`, `CANVAS_W/H`) a été supprimé.

## Bug bloquant à résoudre en premier

**Les 3 images de flèches ne s'affichent pas** dans le navigateur (`naturalWidth: 0`, `complete: false` sur les balises `<img>` générées par `next/image`, même avec `priority` ajouté).

Diagnostic déjà fait :
- Le fichier PNG brut est valide : accès direct à `/images/box-includes/arrow%20down.png` fonctionne et le navigateur reconnaît bien l'image (24×113).
- L'URL de l'optimiseur Next.js (`/_next/image?url=...`) répond `200 OK` avec `content-type: image/png` correct quand on la `fetch()` en JS.
- Mais la balise `<img>` de `next/image` pointant vers cette même URL optimisée ne charge jamais (pas d'erreur console visible).
- Les 3 fichiers concernés ont des **espaces dans leur nom** (`arrow curv left.png`, `arrow curv rigth.png`, `arrow down.png`) — hypothèse principale non testée : lien entre l'espace dans le nom de fichier et un souci dans le pipeline `next/image`.
- La session s'est terminée avant de pouvoir tester une correction (le navigateur de prévisualisation a aussi eu des soucis de stabilité — navigations qui échouaient/bloquaient en fin de session, donc à revérifier proprement dans un environnement frais).

### Pistes à tester dans l'ordre

1. **Renommer les 3 fichiers sans espaces** (ex. `arrow-curv-left.png`, `arrow-curv-rigth.png`, `arrow-down.png`) et mettre à jour les `src` dans `WhatsIncluded.tsx`. Piste la plus rapide et probable.
2. Si ça persiste, tester `unoptimized` sur les composants `<Image>` concernés pour confirmer/infirmer que le problème vient de l'optimiseur Next.js plutôt que du fichier lui-même.
3. Vérifier aussi si corriger la faute de frappe `rigth` → `right` est souhaité (cosmétique, pas lié au bug).

## Une fois les flèches affichées

- Ajuster leur taille/position pour bien relier visuellement le bas de la boîte au sommet de chaque carte. Actuellement le positionnement est approximatif (flex justify-between dans un conteneur `max-w-[420px] md:max-w-[560px]`), pas de calcul géométrique précis comme l'ancien système SVG en pourcentages.
- Revérifier le rendu sur mobile (375px) et desktop (1280px).
- Relire les textes des 3 cartes avec l'utilisateur si besoin d'ajustement de ton (respecter `docs/02_brand-voice.md` : espagnol colombien naturel, jamais "exclusivo/lujo/condiciones").

## Autres changements de cette session (déjà validés, pour contexte)

- Bandeau "Regalas una Vivabox..." : fond `bg-ink`, "Vivabox" en blanc, "elige su experiencia" en rouge Vivabox (`text-accent-red`), espacements ajustés (`pt-4 md:pt-6 pb-5 md:pb-7`).
- Suppression de "esto es lo que regalas" et de la police manuscrite Caveat Brush pour cette phrase (retour à Plus Jakarta Sans, la police du hero).
- Section "¿Y después?" passée en fond `bg-ink` (comme "Por qué confiar en Vivabox" et "Un regalo, un solo precio"), textes repassés en blanc/`text-white/70`.
- Navbar : bouton "Activar" agrandi sur mobile, icône burger recentrée, bouton "Cómo funciona" du hero avec bordure `border-2` plus visible.
