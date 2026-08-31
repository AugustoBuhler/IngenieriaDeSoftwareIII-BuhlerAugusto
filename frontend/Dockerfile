# ---- Etapa 1: build ----------------------------------------------------
# Node compila la SPA. Este Node NO viaja a la imagen final: una vez que Vite
# produjo los archivos estaticos, nadie necesita un runtime de JavaScript en el
# servidor — los estaticos los sirve nginx.
FROM node:22-alpine AS build
WORKDIR /app

# Dependencias primero: capa cacheable (ver el Dockerfile del backend).
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Etapa 2: nginx sirve los estaticos --------------------------------
FROM nginx:alpine AS final

COPY nginx.conf /etc/nginx/conf.d/default.conf
# Vite emite en dist/. (Create React App emite en build/, Angular en dist/<proy>/browser/.)
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

LABEL org.opencontainers.image.source=https://github.com/AugustoBuhler/IngenieriaDeSoftwareIII-BuhlerAugusto
