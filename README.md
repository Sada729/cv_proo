# CV Pro

Application de création de CV en ligne, avec authentification (email/mot de passe + Google OAuth) et interface d'administration.

## Présentation du projet

CV Pro est une application web permettant à un utilisateur de créer, personnaliser et gérer son CV en ligne. Le projet est découpé en deux parties indépendantes qui communiquent via une API REST :

- **Le frontend public** (React) : c'est l'application que les visiteurs utilisent pour créer un compte, se connecter (email/mot de passe ou Google), et construire leur CV.
- **L'interface d'administration** (React, SPA séparée) : réservée aux comptes ayant le rôle `admin`, elle permet de piloter l'ensemble de la plateforme — gestion des utilisateurs, supervision des CV créés, statistiques via un dashboard, etc.
- **Le backend** (Laravel) : expose une API REST unique consommée à la fois par le frontend public et par l'interface admin. Il gère l'authentification (Sanctum + Google OAuth), les autorisations par rôle, et l'accès à la base de données.
- **La base de données** (MySQL) : stocke les utilisateurs, leurs rôles, et à terme les CV créés (contenu, modèles, exports).

L'objectif est d'avoir une architecture claire et découplée : n'importe quel client (le site public, l'admin, une future app mobile) peut consommer la même API Laravel sans dépendre de l'implémentation du frontend.

### Comment les briques s'articulent

```
Utilisateur ──► Frontend React (localhost:5173) ──► API Laravel (127.0.0.1:8000) ──► MySQL (cvpro)
                                                            │
Admin ──► Interface admin React ────────────────────────────┘
                                                            │
                                                    Google OAuth (Socialite)
```

Toute la logique métier et les données vivent côté Laravel ; les deux fronts React ne sont que des interfaces qui consomment cette API via des appels HTTP authentifiés par token (Sanctum).

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React + Vite (TypeScript), React Router, Axios |
| Backend | Laravel (API REST) |
| Auth API | Laravel Sanctum (tokens) |
| Auth sociale | Laravel Socialite (Google OAuth) |
| Base de données | MySQL |
| Interface admin | React (SPA séparée, consomme la même API) |

## Structure du projet

```
cvpro/  (racine du dépôt)
├── backend/          → API Laravel 13 (SQLite en dev · MySQL en cible)
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Auth/            (AuthController, GoogleAuthController)
│   │   │   │   ├── Admin/           (AdminController, UserController)
│   │   │   │   ├── CvController.php
│   │   │   │   └── ProfileController.php
│   │   │   └── Middleware/EnsureRole.php    (middleware role:admin)
│   │   └── Models/                  (User, Cv)
│   ├── config/                      (cors.php, services.php → Google)
│   ├── database/migrations/ · seeders/   (admin + user de test)
│   └── routes/
│       ├── api.php                  (login, register, cvs, admin/*)
│       └── web.php                  (redirections Google OAuth)
└── frontend/         → SPA React 19 + Vite (TypeScript)
    ├── src/
    │   ├── api/axios.ts             (client HTTP + token Bearer)
    │   ├── context/AuthContext.tsx
    │   ├── components/              (ui/ shadcn, AppShell, ProtectedRoute…)
    │   ├── pages/                   (Landing, Auth, Dashboard, Editor…)
    │   └── admin/                   (AdminLayout, AdminDashboard, AdminUsers)
    └── vite.config.ts
```

## Prérequis

- PHP 8.2+ et Composer
- Node.js et npm
- MySQL (via XAMPP ou installation locale)

## Installation

### 1. Base de données

**Développement rapide (SQLite, par défaut)** — aucune installation : le `.env.example`
est déjà configuré sur `DB_CONNECTION=sqlite`. Le fichier `database/database.sqlite`
est créé automatiquement au premier `php artisan migrate`.

**Cible (MySQL / XAMPP)** — créer une base `cvpro` (encodage `utf8mb4`, collation
`utf8mb4_unicode_ci`) via phpMyAdmin, puis basculer `DB_CONNECTION=mysql` dans `.env`
(voir le bloc mysql commenté).

### 2. Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env   # si pas déjà fait
php artisan key:generate
```

Configurer `backend/.env` :

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cvpro
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost
FRONTEND_URL=http://localhost:5173

GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/auth/google/callback
```

Lancer les migrations **et le seed** (crée un admin + un utilisateur de test) :

```bash
php artisan migrate --seed
```

Comptes de test créés par le seeder :

| Rôle | Email | Mot de passe |
|---|---|---|
| admin | `admin@cvpro.test` | `password123` |
| user | `user@cvpro.test` | `password123` |

Créer le lien de stockage public (upload d'avatars) :

```bash
php artisan storage:link
```

Démarrer le serveur :

```bash
php artisan serve
# API disponible sur http://127.0.0.1:8000
```

### 3. Frontend (React Vite)

```bash
cd frontend
npm install
npm run dev
# App disponible sur http://localhost:5173
```

## Authentification

### Email / mot de passe

- `POST /api/register` — création de compte (`name`, `email`, `password`, `password_confirmation`)
- `POST /api/login` — connexion (`email`, `password`) → retourne un `token` Sanctum
- `POST /api/logout` — déconnexion (nécessite le token)
- `GET /api/user` — utilisateur courant (nécessite le token)

Le token est à stocker côté frontend (ex: `localStorage`) et envoyé dans le header `Authorization: Bearer {token}` sur chaque requête protégée.

### Google OAuth

- Bouton "Continuer avec Google" → redirige vers `GET /auth/google/redirect`
- Google redirige ensuite vers `GET /auth/google/callback`, qui crée ou relie le compte utilisateur et renvoie vers le frontend (`FRONTEND_URL/auth/callback?token=...`)
- Le frontend récupère le token dans l'URL et le stocke comme pour la connexion classique

**Configuration Google Cloud requise :**
1. Créer un projet sur [Google Cloud Console](https://console.cloud.google.com/)
2. Configurer l'écran de consentement OAuth (type Externe)
3. Créer un identifiant OAuth 2.0 (type Application Web)
4. Ajouter `http://127.0.0.1:8000/auth/google/callback` comme URI de redirection autorisée
5. Renseigner `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` dans `backend/.env`

## Rôles et permissions

Chaque utilisateur possède un champ `role` (`user` par défaut, `admin` pour les administrateurs). Les routes sous `/api/admin/*` sont protégées par le middleware `role:admin`.

## Routes API principales

| Méthode | Route | Description | Auth requise |
|---|---|---|---|
| POST | `/api/register` | Inscription | Non |
| POST | `/api/login` | Connexion | Non |
| GET | `/auth/google/redirect` | Démarre le flow Google | Non |
| GET | `/auth/google/callback` | Callback Google | Non |
| POST | `/api/logout` | Déconnexion | Oui |
| GET | `/api/user` | Utilisateur courant | Oui |
| PUT | `/api/profile` | Mettre à jour le profil | Oui |
| POST | `/api/profile/avatar` | Upload photo de profil | Oui |
| GET·POST | `/api/cvs` | Lister / créer ses CV | Oui |
| GET·PUT·DELETE | `/api/cvs/{id}` | Lire / modifier / supprimer un CV | Oui |
| GET | `/api/admin/dashboard` | Statistiques admin | Oui (role admin) |
| GET·POST | `/api/admin/users` | Lister / créer des utilisateurs | Oui (role admin) |
| GET·PUT·DELETE | `/api/admin/users/{id}` | Gérer un utilisateur | Oui (role admin) |

## État d'avancement

- [x] Formulaires React d'inscription et de connexion
- [x] Page de callback Google côté frontend (`/auth/callback`)
- [x] CRUD utilisateurs dans l'interface admin (liste, création, rôle, suppression)
- [x] Gestion des CV (9 modèles ATS, éditeur temps réel, export PDF via `react-to-print`)
- [x] Upload de photo de profil (recadrage 400×400 côté client)
- [x] Ancien prototype Lovable/Supabase retiré du dépôt (clés Supabase à révoquer côté Supabase)

### Pistes futures

- [ ] Paiement en ligne (Wave / Orange Money / carte) pour débloquer les téléchargements
- [ ] Assistant IA (import d'un ancien CV, adaptation à une offre d'emploi)
- [ ] Envoi d'email de vérification / réinitialisation de mot de passe

## Environnement de développement (Windows)

- MySQL géré via XAMPP
- Composer installé manuellement dans `C:\Users\hp\composer` (ajouté au PATH utilisateur)
- Si des erreurs de permissions ou de fichiers verrouillés apparaissent pendant `composer install`, vérifier les exclusions de l'antivirus (Avast/Windows Defender) sur le dossier du projet
