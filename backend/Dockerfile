# ---- Etapa 1: build ----------------------------------------------------
# Instala TODAS las dependencias (incluidas las de desarrollo, como vitest): la
# etapa de tests nace de aca y las necesita. La poda pasa a su propia etapa (3).
FROM node:22-alpine AS build
WORKDIR /app

# Primero SOLO los archivos de dependencias: esta capa se cachea y solo se
# rehace si cambia package.json o package-lock.json. Si copiaramos el codigo
# antes, cualquier cambio de una linea obligaria a reinstalar todo de nuevo.
COPY package*.json ./
RUN npm ci

# Recien ahora el codigo, con los tests y su configuracion (el .dockerignore deja
# afuera node_modules, coverage y el .env). La imagen final se lleva solo src/.
COPY . .

# ---- Etapa 2: tests (parte del build: ya tiene Node y vitest) ----------
# Hereda el WORKDIR y todo lo de build. Los tests NO corren al construir: corren
# cuando el pipeline arranca un contenedor de esta etapa (docker run), y el reporte
# sale por un volumen montado (COVERAGE_DIR).
FROM build AS test
ENTRYPOINT ["npm", "run", "test:ci"]

# ---- Etapa 3: dependencias de produccion -------------------------------
# Saca las dependencias de desarrollo: no tienen nada que hacer en produccion.
# Antes esta poda estaba al final de build, y por eso no podia quedarse ahi: la
# etapa de tests, que nace de build, se habria quedado sin vitest.
FROM build AS deps-prod
RUN npm prune --omit=dev

# ---- Etapa 4: runtime --------------------------------------------------
# Imagen limpia: solo lo necesario para EJECUTAR. Sin cache de npm, sin
# dependencias de desarrollo, sin tests, sin herramientas de build.
# Tiene que quedar ULTIMA: es la que se construye cuando no se pide un target.
FROM node:22-alpine AS final
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps-prod /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/package.json ./

# EXPOSE documenta el puerto, no lo publica: eso lo hace -p o ports: en compose.
EXPOSE 8080

CMD ["node", "src/index.js"]

LABEL org.opencontainers.image.source=https://github.com/AugustoBuhler/IngenieriaDeSoftwareIII-BuhlerAugusto
