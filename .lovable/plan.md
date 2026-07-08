# Plan de mise en œuvre ResumAI

## 1. Backend & Authentification (Lovable Cloud)
- Activer **Lovable Cloud** (base de données + auth).
- Auth **Email/Mot de passe + Google** (défaut Cloud).
- Table `profiles` (id, email, full_name, avatar_url, plan, credits) auto-créée par trigger sur `auth.users`.
- Table `cvs` (id, user_id, template_id, data JSONB, updated_at) + RLS "user owns row".
- Table `payments` (id, user_id, cv_id, amount, provider, transaction_id, status, plan) + RLS.
- Bucket Storage **avatars** (public) pour les photos de profil.

## 2. Paiement CinetPay (Wave + Orange Money + Cartes)
- Intégration **CinetPay** (agrégateur qui gère Wave, Orange Money, MTN, Moov, cartes bancaires) via leur API HTTP.
- Secrets requis (je les demanderai après validation du plan) : `CINETPAY_API_KEY`, `CINETPAY_SITE_ID`, `CINETPAY_SECRET_KEY`.
- Server function `initiate-payment` : crée une transaction, renvoie l'URL de checkout CinetPay.
- Server route publique `/api/public/cinetpay-webhook` : reçoit la notification IPN, vérifie la signature HMAC, met à jour `payments.status` et crédite l'utilisateur.
- Server function `verify-payment` : appelée au retour du checkout pour confirmer côté client.
- **Tarifs en FCFA** : Starter **1 000 F** (1 CV) · Pro **2 000 F** (5 CV + tous templates) · Premium **5 000 F** (illimité + IA + lettre de motivation).
- Le téléchargement PDF est débloqué uniquement après paiement confirmé.

## 3. Routes de l'application
```text
/                       landing (existante, à embellir)
/auth                   login + signup (email + Google)
/_authenticated/
  dashboard             liste des CV de l'utilisateur + bouton "Nouveau CV"
  editor/$cvId          éditeur multi-étapes
  templates             galerie complète des templates
  pricing               plans en FCFA + bouton payer
  checkout/$paymentId   retour CinetPay (success/pending/failed)
```
- Boutons **Connexion**, **Commencer**, **Créer mon CV** de la landing → routent vers `/auth` puis `/dashboard`.
- Les liens actuels `<a href="#">` du header et des CTA deviennent des `<Link>` TanStack.

## 4. Éditeur de CV multi-étapes
Wizard 6 étapes (barre latérale de navigation, **pas** de progress bar horizontale — respecte la contrainte "pas de barre d'évolution") :
1. **Infos perso** (nom, titre, email, tel, ville, photo upload → bucket avatars, recadrage carré).
2. **Résumé pro** (textarea + bouton "Améliorer avec IA" via Lovable AI Gateway `google/gemini-2.5-flash`).
3. **Expériences** (répétable : poste, entreprise, dates, description ; bouton IA "Reformuler").
4. **Formations** (répétable).
5. **Compétences & langues** (tags + niveau).
6. **Adapter à une offre** (paste fiche de poste → IA réécrit résumé + reformule les bullets avec mots-clés).
- **Aperçu live** à droite (mise à jour instantanée, template choisi rendu en HTML/CSS print-ready).
- Sauvegarde auto dans `cvs.data` (debounce 800 ms).
- **Import ancien CV** : upload PDF → `document--parse_document` côté serveur → IA structure en JSON → pré-remplit le wizard.
- Export **PDF** via `react-to-print` + fenêtre d'impression navigateur (compatible ATS car HTML sémantique).

## 5. Templates
- 6 templates React (composants) : Executive, Noir & Or, Créatif, Minimal, Classic, Modern Sidebar.
- Tous ATS-friendly (HTML sémantique, pas d'images de fond derrière texte, hiérarchie h1/h2/h3, une seule colonne pour Executive/Minimal/Classic).
- Sélection via `/templates` ou depuis l'éditeur.

## 6. Refonte visuelle & animations premium
- **Palette enrichie** : ajout d'un accent chaleureux (or `#C9A961`) qui se marie au violet actuel + arrière-plans dégradés en mesh.
- **Nouvelles animations** :
  - Curseur "spotlight" qui suit la souris sur le hero (radial gradient).
  - Effet **parallax** sur les images templates au scroll.
  - **Marquee** infini de logos "utilisé par les recrutés chez…".
  - **Text reveal** mot par mot sur les titres (motion `staggerChildren`).
  - **Magnetic buttons** (les CTA principaux attirent le curseur).
  - **Blob morphing** SVG en fond du hero (au lieu des ronds flous statiques).
  - **Number counters** animés dans les stats.
  - **Card tilt 3D** sur les templates (perspective + rotateX/rotateY suivant la souris).
  - **Section transitions** avec masque diagonal au scroll.
- Section **testimonials** (nouvelle) avec carousel auto-scroll.
- Section **comparatif ATS** (avant/après) avec slider drag.
- Icônes animées Lucide + micro-interactions sur chaque hover.

## Détails techniques
- Stack : TanStack Start (existant), Motion, `react-to-print`, Zod, TanStack Query pour les mutations.
- IA : Lovable AI Gateway (`google/gemini-2.5-flash`) via server functions authentifiées.
- Paiement : appels HTTP directs à `api-checkout.cinetpay.com` depuis server functions (pas de SDK Node lourd).
- Sécurité : RLS strict, webhook CinetPay vérifié par HMAC, secrets côté serveur uniquement.
- Photo : redimensionnement client (canvas 400×400) avant upload pour limiter la taille.

## Ordre de livraison
1. Activation Cloud + schéma DB + auth pages + routes protégées.
2. Refonte landing (nouvelles animations, tarifs FCFA, boutons fonctionnels).
3. Dashboard + galerie templates + composants de templates.
4. Éditeur wizard + aperçu live + sauvegarde.
5. Import PDF + IA (résumé, reformulation, adaptation offre).
6. Intégration CinetPay + webhook + gating export PDF.

Après validation, je demanderai les clés CinetPay au moment d'implémenter l'étape 6.
