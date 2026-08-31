# ---- Etapa 1: build ----------------------------------------------------
# Instala TODAS las dependencias (incluidas las de desarrollo, como vitest) y
# despues poda las que no hacen falta para ejecutar.
FROM node:22-alpine AS build
WORKDIR /app

# Primero SOLO los archivos de dependencias: esta capa se cachea y solo se
# rehace si cambia package.json o package-lock.json. Si copiaramos el codigo
# antes, cualquier cambio de una linea obligaria a reinstalar todo de nuevo.
COPY package*.json ./
RUN npm ci

# Recien ahora el codigo.
COPY src ./src

# Saca las dependencias de desarrollo: no tienen nada que hacer en produccion.
RUN npm prune --omit=dev

# ---- Etapa 2: runtime --------------------------------------------------
# Imagen limpia: solo lo necesario para EJECUTAR. Sin cache de npm, sin
# dependencias de desarrollo, sin herramientas de build.
FROM node:22-alpine AS final
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/package.json ./

# EXPOSE documenta el puerto, no lo publica: eso lo hace -p o ports: en compose.
EXPOSE 8080

CMD ["node", "src/index.js"]

LABEL org.opencontainers.image.source=https://github.com/AugustoBuhler/IngenieriaDeSoftwareIII-BuhlerAugusto
