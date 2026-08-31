#!/usr/bin/env bash
# Toma la captura de pantalla MAS RECIENTE del Escritorio y la mueve a img/
# con el nombre que le pases.
#
#   ./guardar-captura.sh 02-aviso-conflicto
#
# Uso: sacas la captura con Cmd+Shift+4, e inmediatamente despues corres esto.

set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Uso: ./guardar-captura.sh <nombre-sin-extension>"
  echo "Ej:  ./guardar-captura.sh 02-aviso-conflicto"
  exit 1
fi

REPO="$(cd "$(dirname "$0")" && pwd)"
DESTINO="$REPO/img/$1.png"

# Donde guarda las capturas este Mac. Por defecto es el Escritorio, pero se
# puede cambiar — y aca esta cambiado a ~/Documents/Capturas de pantalla.
CARPETA=$(defaults read com.apple.screencapture location 2>/dev/null || echo "$HOME/Desktop")
CARPETA="${CARPETA/#\~/$HOME}"

ULTIMA=$(ls -t "$CARPETA/"*.png 2>/dev/null | head -1 || true)

if [ -z "$ULTIMA" ]; then
  echo "No encontre ninguna captura .png en:"
  echo "  $CARPETA"
  echo "Sacala con Cmd+Shift+4 y volve a correr esto."
  exit 1
fi

EDAD=$(( $(date +%s) - $(stat -f %m "$ULTIMA") ))
if [ "$EDAD" -gt 300 ]; then
  echo "Ojo: la captura mas reciente tiene $((EDAD / 60)) minutos."
  echo "  $ULTIMA"
  read -r -p "Es esa la que queres guardar? [s/N] " ok
  [ "$ok" = "s" ] || { echo "Cancelado."; exit 1; }
fi

mkdir -p "$REPO/img"
mv "$ULTIMA" "$DESTINO"
echo "Guardada como img/$1.png"
