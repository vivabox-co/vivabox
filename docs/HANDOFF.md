# Session handoff — Homepage MVP rebuild (single box)

> Fichier temporaire de passation entre deux conversations Claude Code. À supprimer une fois relu / plus utile.

## Contexte

MVP Vivabox : un seul produit (plus de 3 box Esencia/Selecta/Excepción). Objectif de la session : reconstruire la homepage (`src/app/page.tsx`) selon l'architecture validée dans `docs/07_homepage-sections.md`, adaptée au produit unique.

## Ce qui est fait

- **`src/data/boxes.ts`** : réduit à une seule entrée (`slug: "vivabox"`, nom "Vivabox" sans sous-marque, prix 200 000 COP).
- **Nouvelle homepage** (`src/app/page.tsx`) : Hero → `WhatsIncluded` (¿Qué incluye?+¿Y después?) → `ExperiencesPreview` → `WhyVivabox` (Trust) → `Testimonials` → `Occasions` → `Price` → `BenefitsBar` → `FAQ` → `FinalCTA`.
- **Nouveaux composants** : `src/sections/whats-included/WhatsIncluded.tsx`, `src/sections/price/Price.tsx`.
- Copie alignée sur `docs/07` (Hero, Ejemplos de experiencias), `ExperienceModal.tsx` allégé (retrait métadonnées façon réservation), liens Navbar/Hero/FinalCTA repointés vers `/checkout/vivabox`.
- **Hors scope (accepté)** : `/cajas/[slug]`, `/checkout/[slug]`, `BoxesComparison` fonctionnent avec la box unique mais pas redessinés (le comparatif à 3 colonnes affiche 1 colonne, visuellement bancal mais pas cassé).

## ⚠️ En attente — bloquant pour finir `WhatsIncluded.tsx`

L'utilisateur a fourni 4 images pour la section "¿Qué incluye una Vivabox?" (boîte fermée avec collage photo, composite catalogue+QR, post-it "Para ti, con todo mi cariño.", mockup téléphone avec carte Bogotá). Je les avais traitées et placées dans `public/images/box-includes/` sous les noms `box-closed.png`, `catalog-qr.png`, `sticky-note.png`, et `experiences-map.png` (écrasé).

**Incident** : le dossier `public/images/box-includes/` s'est vidé en cours de session (cause exacte non identifiée — mes seules actions dessus étaient des `rm -rf` ciblant uniquement le sous-dossier `incoming/`). Les 5 fichiers originaux (suivis par git) ont été restaurés via `git checkout`. Les 3 nouveaux fichiers traités + la nouvelle version de `experiences-map.png` sont définitivement perdus (jamais commités).

**État actuel du code** : `WhatsIncluded.tsx` utilise temporairement les anciens visuels de secours (`box-opening.png`, `experience-selection.png`, `experiences-map.png` d'origine, post-it en CSS) pour que la page ne soit pas cassée.

**Prochaine étape** : demander à l'utilisateur de renvoyer les 3 images (boîte fermée, catalogue+QR, post-it) + le nouveau mockup téléphone (fond blanc, sans vignette sombre) dans `public/images/box-includes/incoming/`, puis les retraiter et les réintégrer dans `WhatsIncluded.tsx`.

## Feedback design à garder en tête (retour utilisateur avant l'incident)

Le rendu du diagramme "¿Qué incluye?" a été jugé trop "bricolé" — mélange de styles photo, pas assez harmonisé. Décisions actées avant l'incident :
- Post-it : garder l'inclinaison naturelle de la photo, **pas** de rotation CSS supplémentaire.
- Catalogue physique + téléphone : les afficher **côte à côte, avec un traitement identique** (même taille, même forme de cadre, même ombre) — pas de "Código único + QR" séparé (retiré).
- Problème jugé être l'exécution technique (tailles/cadrages/alignement), pas le concept du diagramme avec flèches en lui-même.

## Vérification

Serveur de dev tourne sur `localhost:3000` (config dans `.claude/launch.json`). Après réintégration des images, revérifier `/` (section `#incluye`) en desktop et mobile, contrôler l'absence de chevauchement de texte et d'erreurs réseau sur `box-includes`.
