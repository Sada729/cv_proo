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
| Site utilisateur | React 19 + Vite (TypeScript), React Router, Axios — port **5173** |
| Site admin | React 19 + Vite (TypeScript) — **application séparée**, port **5174** |
| Backend | Laravel 13 (API REST) — port **8000** |
| Auth API | Laravel Sanctum (tokens) — **deux systèmes indépendants** |
| Auth sociale | Laravel Socialite (Google OAuth, côté utilisateur) |
| Base de données | MySQL (cible) / SQLite (dev) — **tables `users` et `admins` séparées** |

> **Séparation user / admin** : les utilisateurs et les administrateurs vivent dans
> **deux tables distinctes** (`users` / `admins`), avec **deux authentifications
> indépendantes** et **deux sites** distincts. Un token utilisateur est refusé sur
> l'API admin et inversement (middlewares `user` / `admin`).

## Structure du projet

```
cvpro/  (racine du dépôt)
├── backend/          → API Laravel 13 (SQLite en dev · MySQL en cible)   :8000
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Auth/            (AuthController, GoogleAuthController — users)
│   │   │   │   ├── Admin/           (AuthController, AdminController,
│   │   │   │   │                     UserController, AccountController)
│   │   │   │   ├── CvController.php
│   │   │   │   └── ProfileController.php
│   │   │   └── Middleware/          (EnsureAdmin, EnsureUser)
│   │   └── Models/                  (User, Admin, Cv)
│   ├── config/                      (cors.php, auth.php, services.php → Google)
│   ├── database/migrations/ · seeders/   (users, admins, cvs)
│   └── routes/
│       ├── api.php                  (user: login/register/cvs · admin: admin/login, admin/*)
│       └── web.php                  (redirections Google OAuth)
├── frontend/         → SITE UTILISATEUR — React 19 + Vite (TS)            :5173
│   └── src/
│       ├── api/axios.ts             (token users : cvpro_token)
│       ├── context/AuthContext.tsx
│       ├── components/              (ui/ shadcn, AppShell, ProtectedRoute…)
│       └── pages/                   (Landing, Auth, Dashboard, Editor…)
└── admin/            → SITE ADMIN (séparé) — React 19 + Vite (TS)         :5174
    └── src/
        ├── api/axios.ts             (token admins : cvpro_admin_token)
        ├── context/AdminAuthContext.tsx
        ├── components/              (AdminLayout, ProtectedRoute)
        └── pages/                   (Login, Dashboard, Users, Admins)
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

### 3. Site utilisateur (React Vite)

```bash
cd frontend
npm install
npm run dev
# Site utilisateur sur http://localhost:5173
```

### 4. Site admin (React Vite, séparé)

```bash
cd admin
npm install
npm run dev
# Site admin sur http://localhost:5174
```

> Les deux origines (`5173` et `5174`) doivent figurer dans le CORS backend
> (`FRONTEND_URL` et `ADMIN_URL` dans `backend/.env`).

## Authentification

Deux systèmes **totalement indépendants** (tables et endpoints séparés).

### Site utilisateur — email / mot de passe (table `users`)

- `POST /api/register` — création de compte (`name`, `email`, `password`, `password_confirmation`)
- `POST /api/login` — connexion → retourne un `token` Sanctum (stocké sous `cvpro_token`)
- `POST /api/logout` · `GET /api/user`

### Site admin — email / mot de passe (table `admins`)

- `POST /api/admin/login` — connexion admin → `token` Sanctum (stocké sous `cvpro_admin_token`)
- `POST /api/admin/logout` · `GET /api/admin/me`

Le token est envoyé dans le header `Authorization: Bearer {token}`. Un token utilisateur
est **rejeté (403)** sur les routes admin et inversement.

Comptes de test (seed) : `admin@cvpro.test` (site admin) et `user@cvpro.test` (site user), mot de passe `password123`.

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

## Séparation user / admin

Il n'y a **pas** de champ `role` : utilisateurs et administrateurs sont dans **deux
tables séparées** (`users` / `admins`), chacune avec son endpoint de connexion et ses
tokens. Côté API, deux middlewares garantissent l'étanchéité :

- `user` — n'accepte que les tokens issus de la table `users` (routes du site utilisateur) ;
- `admin` — n'accepte que les tokens issus de la table `admins` (routes `/api/admin/*`).

## Routes API principales

| Méthode | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/register` | Inscription utilisateur | — |
| POST | `/api/login` | Connexion utilisateur | — |
| GET | `/auth/google/redirect` · `/auth/google/callback` | Google OAuth (user) | — |
| POST | `/api/logout` · GET `/api/user` | Session utilisateur | user |
| PUT | `/api/profile` · POST `/api/profile/avatar` | Profil / avatar | user |
| GET·POST | `/api/cvs` · GET·PUT·DELETE `/api/cvs/{id}` | Gérer ses CV | user |
| POST | `/api/admin/login` | Connexion **admin** | — |
| POST | `/api/admin/logout` · GET `/api/admin/me` | Session admin | admin |
| GET | `/api/admin/dashboard` | Statistiques | admin |
| GET·POST·PUT·DELETE | `/api/admin/users` · `/api/admin/users/{id}` | Gérer les utilisateurs | admin |
| GET·POST·PUT·DELETE | `/api/admin/admins` · `/api/admin/admins/{id}` | Gérer les administrateurs | admin |

## État d'avancement

- [x] Formulaires React d'inscription et de connexion
- [x] Page de callback Google côté frontend (`/auth/callback`)
- [x] Site admin **séparé** avec authentification indépendante (table `admins`)
- [x] CRUD utilisateurs + CRUD administrateurs dans l'interface admin
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
