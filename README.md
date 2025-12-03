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
PROJECTOR_KEY=<gedeelde-pi-sleutel>
PROJECTOR_POLL_MS=1500
```

- `AUTH_SESSION_PASSWORD` is de demo-credential. Tijdens het inloggen moet het ingevoerde wachtwoord exact overeenkomen.
- `MONGODB_URI` verwijst bij voorkeur naar een Atlas cluster; lokale `mongodb://localhost:27017/pattern-projector` werkt ook.
- `PROJECTOR_KEY` is een gedeeld geheim tussen dashboard en Raspberry Pi. Plak hetzelfde waarde in de Pi-omgeving zodat `/projector?key=...` geopend mag worden.
- `PROJECTOR_POLL_MS` bepaalt hoe vaak het projectorscherm een nieuw commando ophaalt (standaard 1500ms).

## Raspberry Pi HDMI projector

Met de projectorbesturing in het dashboard bedien je het beeld, terwijl een Raspberry Pi het HDMI-signaal uitstuurt. Zo zet je de Pi naast de beamer en blijf je zelf achter je laptop/tablet.

1. **Voorbereiding server**
   - Stel `.env` in met `PROJECTOR_KEY`.
   - Start de Nuxt-app met netwerktoegang, bv. `yarn dev --host 0.0.0.0` of deploy de productiebuild (`node .output/server/index.mjs`).
   - Open het dashboard (`/dashboard`), kies een patroon en gebruik de projector-sliders/knoppen.
2. **Raspberry Pi configuratie**
   - Gebruik Raspberry Pi OS (Bookworm of Bullseye) en installeer Chromium:  
     `sudo apt update && sudo apt install chromium-browser unclutter`
   - Zet omgevingsvariabelen (bijv. in `~/.profile`):
     ```bash
     export PROJECTOR_HOST=http://<NUXT_SERVER_IP>:3000
     export PROJECTOR_KEY=<zelfde-als-in-.env>
     ```
   - Maak het helper-script uitvoerbaar en start kiosk-modus:
     ```bash
     chmod +x scripts/pi-kiosk.sh
     PROJECTOR_HOST=http://192.168.0.50:3000 PROJECTOR_KEY=<key> ./scripts/pi-kiosk.sh
     ```
     Het script opent Chromium fullscreen op `PROJECTOR_HOST/projector?key=<key>`.
3. **Autostart (optioneel)**
   - Maak `/etc/systemd/system/pattern-projector.service` met:
     ```ini
     [Unit]
     Description=Pattern Projector HDMI kiosk
     After=network-online.target

     [Service]
     Environment=PROJECTOR_HOST=http://192.168.0.50:3000
     Environment=PROJECTOR_KEY=<key>
     ExecStart=/usr/bin/env bash /home/pi/pattern-projector/scripts/pi-kiosk.sh
     Restart=always
     User=pi
     WorkingDirectory=/home/pi/pattern-projector

     [Install]
     WantedBy=multi-user.target
     ```
   - Activeer met `sudo systemctl enable --now pattern-projector`.

Zodra de Pi verbonden is, blijft `/projector` verversen op basis van de ingestelde `PROJECTOR_POLL_MS`. Alle wijzigingen (zoom, offset, spiegeling, invert) die je in het dashboard uitvoert, worden vrijwel realtime overgenomen.

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
