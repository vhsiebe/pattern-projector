#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${PROJECTOR_HOST:-}" ]]; then
  echo "Stel PROJECTOR_HOST in (bijv. http://192.168.0.12:3000)" >&2
  exit 1
fi

if [[ -z "${PROJECTOR_KEY:-}" ]]; then
  echo "Stel PROJECTOR_KEY in zodat de Pi verbinding kan maken" >&2
  exit 1
fi

ARGS=(
  --kiosk
  --incognito
  --disable-pinch
  --overscroll-history-navigation=0
  --noerrdialogs
  --disable-infobars
  --start-fullscreen
)

exec chromium-browser "${ARGS[@]}" "${PROJECTOR_HOST}/projector?key=${PROJECTOR_KEY}"
