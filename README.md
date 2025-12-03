# Pattern Projector · Nuxt Edition

Deze repository bevat een volledige herstart van Pattern Projector op basis van **Nuxt 3**, **Nuxt UI**, **Tailwind CSS**, **MongoDB** en **nuxt-auth-utils**. De oude Next.js/React-implementatie leeft nog in `legacy-react-app/` als referentie.

## Stack

- **UI** – [Nuxt UI](https://ui.nuxt.com/) + Tailwind 3, donkere layout by default
- **Auth** – [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils) voor sessies & middleware
- **Backend** – Nuxt Nitro server routes met MongoDB driver
- **State & composables** – Nuxt `useAsyncData`, `useFetch`, `useUserSession`

## Getting started

```bash
pnpm install   # of yarn/npm, zolang `nuxt prepare` draait
cp .env.example .env
pnpm dev
```

Beschikbare scripts:

| Script     | Beschrijving                                  |
| ---------- | ---------------------------------------------- |
| `dev`      | Start Nuxt dev-server met HMR                  |
| `build`    | Bouw productieversie (`.output/`)              |
| `preview`  | Start productie-build lokaal                   |
| `lint`     | Voert ESLint (flat config) uit                 |

## Omgevingsvariabelen

```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/pattern-projector
AUTH_SESSION_PASSWORD=<sterk-wachtwoord>
```

- `AUTH_SESSION_PASSWORD` is de demo-credential. Tijdens het inloggen moet het ingevoerde wachtwoord exact overeenkomen.
- `MONGODB_URI` verwijst bij voorkeur naar een Atlas cluster; lokale `mongodb://localhost:27017/pattern-projector` werkt ook.

## Architectuur

- `pages/` bevat een publieke landingspagina, een auth-scherm en een beveiligd dashboard.
- `server/api/auth/*` implementeert login, logout en sessie-endpoints via `setUserSession` & `requireUserSession`.
- `server/plugins/mongodb.ts` beheert één gedeelde Mongo-client (lazy singleton met Nitro hook).
- `server/utils/patterns.ts` verzorgt validatie (Zod) en CRUD-helpers voor de collectie `patterns`.
- `components/` hanteert Nuxt UI patronen voor kaarten, formulieren en interactieve flow.

## Legacy-app

De vorige React-versie staat onder `legacy-react-app/`. Je kunt daar nog code uit refereren tijdens de verdere migratie.

## Bijdragen

Issues en PR’s zijn welkom! Richtlijnen vind je in `CONTRIBUTING.md`. Gebruik graag feature branches en beschrijvende commits.
