# Webapp Handoff

Contexte sur la web app bénéficiaire (projet séparé : `C:\Users\plume\Documents\LatiBox\Web_App_Ben\vivabox-appben`, Next.js/TS/React, repo git distinct). Ouvrir ce doc quand on touche au CTA "Activar" ou à tout ce qui prépare la transition acheteur → bénéficiaire.

Ne pas dupliquer la doc produit de la web app ici — elle vit dans son propre repo (`Product System/Tech_Context.md`, `Ai_Product_Workflow.md`, `Product System/Site_Vitrine_Context.md`).

---

## 1. RÔLE DE LA WEB APP

Une fois le bénéficiaire activé, la web app gère tout : découverte des expériences (carte + liste), recommandation guidée (3 questions, jamais de prix), et réservation simulée (alpha, pas de backend réel).

Le site vitrine ne doit jamais essayer de reproduire cette expérience — il vend juste la promesse.

---

## 2. ÉTAT ACTUEL DU LIEN "ACTIVAR" (IMPORTANT)

⚠️ **Pas encore câblé.** Les CTA "Activar mi box" / "Activar mi Vivabox" (`src/components/Navbar.tsx`, `src/components/Footer.tsx`) pointent vers `/proximamente`, pas vers la web app.

Côté web app, `/activar` ne lit aucun code d'activation — c'est un écran statique.

**À trancher avant de connecter les deux pour de vrai :**
- Comment le code d'activation unique (mentionné dans `01_product.md`) est transmis à la web app — query param dans l'URL, saisie manuelle sur l'écran `/activar`, ou deep link avec token signé ?
- L'URL cible de la web app en prod (domaine séparé ? sous-domaine `app.vivabox.com.co` ?).

---

## 3. CE QUE LA WEB APP DOIT RESPECTER DE LA MARQUE

Déjà aligné côté web app d'après sa propre doc (`Ai_Product_Workflow.md`) : espagnol colombien, aucun prix visible, ton calme jamais "outil/dashboard". Rien à imposer de plus depuis le site — juste vérifier que ça reste cohérent si le ton du site évolue.

---

## 4. RÉFÉRENCE

Repo web app : `C:\Users\plume\Documents\LatiBox\Web_App_Ben\vivabox-appben`
Doc miroir côté web app : `Product System/Site_Vitrine_Context.md`
