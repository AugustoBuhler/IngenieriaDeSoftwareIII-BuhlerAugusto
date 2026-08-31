# TP2 — Contenedores: la app del semestre

> **Peso en P1: 40%** · Evaluación: 25% configuración técnica · 25% `decisiones.md` +
> `evidencias.md` · 50% defensa oral.
> Enunciado: [`ingsoft3ucc/TPs_2026/trabajos/02-docker-compose.md`](https://github.com/ingsoft3ucc/TPs_2026/blob/main/trabajos/02-docker-compose.md)

## Objetivo

Contenerizar la aplicación que acompaña toda la materia, de modo que **cualquiera
que clone el repo levante el sistema completo con un comando**, y con las imágenes
publicadas para que otros entornos las consuman.

## Checklist del enunciado

| # | Requisito | Estado |
|---|---|---|
| 1 | App con backend + frontend + BD, corriendo | ✅ |
| 2 | Justificación de la elección en `decisiones.md` | ✅ |
| 3 | `Dockerfile` multi-stage del backend + `.dockerignore` | ✅ |
| 4 | `Dockerfile` multi-stage del frontend + `.dockerignore` | ✅ |
| 5 | `nginx.conf` con proxy al backend | ✅ |
| 6 | `docker-compose.yml` con volumen, red, `depends_on` + `healthcheck`, `.env` | ✅ |
| 7 | `.env.example` commiteado, `.env` ignorado | ✅ |
| 8 | Imágenes en registry con tag semver y visibilidad **pública** | ✅ |
| 9 | `docker-compose.registry.yml`, probado de verdad | ✅ |
| 10 | `README.md` con el arranque desde cero | ✅ |
| 11 | `evidencias.md` con las cuatro pruebas | ✅ |
| 12 | Tag `v2.0.0` + release | ✅ |

---

## 1 · La app elegida

**Sistema de turnos de consultorio.** Desarrollo propio: pacientes, profesionales y
la agenda que los cruza. Tres pantallas, cinco endpoints, ~450 líneas.

| Criterio de `elegir-app.md` | Cómo lo cumple |
|---|---|
| Corre hoy, sin magia | Node + Vite + PostgreSQL, todo local. Sin APIs pagas ni servicios de terceros que puedan caerse a mitad de semestre |
| Conozco los comandos de build | `npm ci` / `npm run build` — es literalmente lo que ejecutan los Dockerfiles |
| La conexión sale del entorno | `DATABASE_URL` en `backend/src/db.js`. Ninguna cadena escrita en el código |
| Tiene lógica para testear | Siete reglas de negocio en `backend/src/reglas.js` |
| La entiendo y puedo modificarla | Tres pantallas, cinco endpoints |
| Tamaño reducido | CRUD + agenda. Más grande no suma nota |

### Por qué las reglas de negocio están puestas desde ahora

`elegir-app.md` avisa que el **TP5 pide 8 tests de backend y 4 de frontend**, que
para eso hacen falta 4–6 reglas, y que **conviene agregarlas en el TP2 o el TP3, no
la semana del TP5**. Por eso la app no es un CRUD de altas y bajas.

Las siete reglas viven en `backend/src/reglas.js` como **funciones puras** —reciben
datos, devuelven un veredicto—, separadas de Express y de la base a propósito: se
pueden verificar sin levantar un servidor ni una base.

| # | Regla | Tipo |
|---|---|---|
| 1 | DNI de 7 u 8 dígitos numéricos | Validación de formato |
| 2 | No puede haber dos pacientes con el mismo DNI | Restricción de unicidad |
| 3 | No se puede sacar un turno en fecha pasada | Validación temporal |
| 4 | Un profesional no puede tener turnos superpuestos | Cálculo de solapamiento |
| 5 | Cupo máximo de turnos por profesional por día | Restricción de cantidad |
| 6 | `PENDIENTE` → `ATENDIDO` \| `CANCELADO`, sin vuelta atrás | Transición de estado |
| 7 | No se elimina un profesional con turnos pendientes | Integridad referencial |

Verificadas todas, devolviendo 400 con su mensaje:

```
DNI duplicado                    400  {"error":"Ya existe un paciente con el DNI 30111222"}
DNI invalido (3 digitos)         400  {"error":"El DNI debe tener 7 u 8 digitos numericos"}
Turno en fecha pasada            400  {"error":"No se puede sacar un turno en una fecha pasada"}
Turno solapado                   400  {"error":"El profesional ya tiene un turno que se superpone..."}
Borrar profe con pendiente       400  {"error":"No se puede eliminar un profesional con turnos..."}
PENDIENTE -> ATENDIDO            200  {"id":1,...,"estado":"ATENDIDO"}
ATENDIDO -> CANCELADO            400  {"error":"No se puede pasar de ATENDIDO a CANCELADO"}
```

---

## 2 · Los Dockerfiles

### Backend — `node:22-alpine` en las dos etapas

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./        # ① solo las dependencias
RUN npm ci                   # ② capa cacheable
COPY src ./src               # ③ recién ahora el código
RUN npm prune --omit=dev     # ④ saca las devDependencies

FROM node:22-alpine AS final
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/package.json ./
EXPOSE 8080
CMD ["node", "src/index.js"]
```

### Frontend — Node construye, nginx sirve

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build            # Vite emite en dist/

FROM nginx:alpine AS final
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

### Por qué el orden de las instrucciones

Docker invalida una capa **y todas las posteriores**. Copiando primero
`package*.json` y corriendo `npm ci` antes que `COPY src`, cambiar una línea de
código no dispara una reinstalación completa de dependencias.

Esta decisión no es cosmética: **es la que hace que el cache del TP4 funcione**.

### Los dos `.dockerignore`

Docker busca el archivo en la carpeta que se le pasa como contexto, así que hay uno
por Dockerfile, con contenidos distintos. El que más importa en los dos es
`node_modules/`: sin excluirlo, el `COPY . .` mete los `node_modules` **de la Mac**
encima de los que `npm ci` instaló para Linux. Vite usa binarios compilados por
plataforma, así que el build muere con
`Cannot find module @rollup/rollup-linux-x64-musl` — un error que no menciona el
archivo culpable.

### Medición del multi-stage

Construyendo explícitamente la etapa `build` (`docker build --target build`) y
comparándola contra la imagen final:

| | Etapa de build | Imagen final | Reducción |
|---|---|---|---|
| frontend | 370 MB | **93 MB** | 4× |
| backend | 300 MB | **235 MB** | 22 % |

**La diferencia entre los dos es la explicación del multi-stage.** El frontend baja
4× porque su imagen final no necesita Node en absoluto: nginx sirve archivos
estáticos. El backend sigue necesitando el runtime, así que solo se ahorra las
`devDependencies` y el caché de npm.

Además del tamaño: en la imagen final no hay compilador, ni `npm`, ni herramientas
de build. **Menos superficie de ataque.**

---

## 3 · La red y el caso trampa de la SPA

Compose crea una red interna con DNS embebido: cada contenedor es alcanzable por el
**nombre del servicio**. Por eso el backend usa `postgres://...@db:5432/app` y no
una IP.

Pero el frontend es distinto: **su JavaScript corre en el navegador**, que vive
fuera de la red de compose. Ahí el nombre `backend` no existe. El nombre de servicio
solo aplica a tráfico que nace *dentro* de un contenedor.

**Camino elegido: ruta relativa + proxy.** La SPA pide a `/api/...` sin nombrar host
ni puerto. En desarrollo lo traduce el proxy de Vite; en el contenedor lo traduce
nginx, que sí está adentro de la red.

- La misma imagen sirve en cualquier entorno (lo que el TP7 va a necesitar)
- Para el navegador todo viene del mismo origen → **no hace falta CORS**

La alternativa (URL absoluta al puerto publicado) funciona pero ata la imagen al
entorno y obliga a configurar CORS.

### Los tres detalles del `nginx.conf`

```nginx
resolver 127.0.0.11 valid=10s ipv6=off;   # ② UN SOLO resolver
set $backend_api http://backend:8080;      # ① el nombre en una VARIABLE

location /api/ {
    proxy_pass $backend_api;               # ③ SIN barra final
}
```

1. **El nombre va en una variable.** Escrito directo, nginx lo resuelve al arrancar
   y se niega a levantar si el backend todavía no existe
   (`host not found in upstream`) — o sea que el frontend no podría correr solo.
2. **Un solo `resolver`, el de Docker.** Agregar un DNS público "por las dudas" hace
   que nginx reparta las consultas, y el público no sabe qué es `backend`:
   **502 intermitentes** con todo levantado y sano.
3. **`proxy_pass` sin barra final.** Con barra, nginx reescribe el prefijo y manda
   `/api/turnos` a `/turnos`: 404 en todas las llamadas.

---

## 4 · Compose

### `healthcheck` vs `depends_on`

`depends_on` **solo ordena el arranque**. El contenedor de PostgreSQL levanta en un
segundo, pero el motor tarda varios más en aceptar conexiones — y en esa ventana el
backend se conecta, falla y muere.

Con `healthcheck` + `condition: service_healthy`, el backend espera a que la base
**conteste**, no a que el contenedor exista. Se ve en el log del arranque:

```
db-1        Waiting
db-1        Healthy      ← el healthcheck
backend-1   Starting     ← recién acá
```

Como cinturón adicional, `backend/src/db.js` reintenta la conexión antes de
rendirse: el healthcheck resuelve el caso normal, el reintento cubre el resto.

### Volumen y persistencia

```yaml
volumes:
  - db_data:/var/lib/postgresql/data   # una PALABRA = volumen nombrado
```

La diferencia con un bind mount es un carácter: si empieza con `./` es una ruta
tuya. Para bases de datos va el volumen nombrado — un bind mount en Mac es
notablemente más lento (hay una VM en el medio) y da problemas de permisos.

Prueba verificada: `down` + `up` conserva los turnos; `down -v` los borra.
**`down` apaga; `down -v` olvida.**

### Secretos

| Archivo | ¿Al repo? | Contenido |
|---|---|---|
| `.env` | **NO** (`.gitignore` línea 2) | El valor real de `DB_PASSWORD` |
| `.env.example` | **SÍ** | Las claves esperadas — documentación ejecutable |

El compose referencia `${DB_PASSWORD}`: el YAML se versiona, el valor no.

Esto es lo que hace que el arranque sean **dos comandos y no uno**. No es un defecto
de la entrega: es el punto. El secreto es lo único que no puede viajar en el
repositorio.

---

## 5 · El registry

```
ghcr.io/augustobuhler/turnos-backend:v0.1.0
ghcr.io/augustobuhler/turnos-frontend:v0.1.0
```

Elegí ghcr sobre Docker Hub porque la cuenta ya existía (la de GitHub del TP1), las
imágenes quedan junto al código, y en el TP7 el pipeline va a poder autenticarse sin
secretos usando el `GITHUB_TOKEN` del propio workflow.

Los Dockerfiles llevan
`LABEL org.opencontainers.image.source=...` para que el package quede enlazado al
repositorio.

### La prueba real de que son públicas

Que la página diga "Public" no prueba nada. La prueba es bajarlas **sin
credenciales**, y para eso hubo que vaciar los **tres** lugares donde Docker esconde
las capas:

1. La imagen que construyó el compose → `docker compose down --rmi local`
2. Los nombres que le puse yo → `docker rmi ghcr.io/...`
3. **El caché de construcción** → `docker builder prune -af` ← el que nadie ve venir

Sin los tres, el `up` contesta `Already exists` y no descarga nada.

### Arquitectura

Las imágenes se construyeron en una MacBook Air con Apple Silicon, así que son
`linux/arm64`. Alguien con una máquina Intel recibiría
`no matching manifest for linux/amd64` — y los runners de CI del TP7 son Intel.
Para este práctico alcanza con declararlo; en el TP7 se resuelve con `docker buildx`.

---

## 6 · Problemas encontrados

**1. Los packages de ghcr nacen privados.** Después del `docker push`, las dos
imágenes quedaron con visibilidad `private`, y mientras lo estén **nadie** puede
hacer `pull`. No hay endpoint de la API REST para cambiarlo: se hace desde la web,
package por package (*Package settings → Change visibility → Public*).

**2. El `docker login` de ghcr puede dar OK sin tener permiso.** La guía advierte
que un token *fine-grained* hace que el login diga `Succeeded` y recién falle el
`push` con `denied: permission_denied`. Se evitó usando el token de `gh` con el
scope `write:packages` (`gh auth refresh -s write:packages`), y verificando con un
push real en vez de confiar en el login.

---

## 7 · Preguntas de defensa — con su respuesta

### ¿Qué diferencia hay entre imagen y contenedor? ¿Y entre `CMD` y `ENTRYPOINT`?

**Imagen** = la clase: paquete inmutable en capas de solo lectura.
**Contenedor** = la instancia: una imagen en ejecución más una capa de escritura
efímera que muere con él. Se pueden correr N contenedores de la misma imagen.

`ENTRYPOINT` define **el ejecutable** del contenedor (se pisa con
`docker run --entrypoint`); `CMD` define los **argumentos por defecto**,
reemplazables desde `docker run`. Si solo hay `CMD` —mi caso— todo el comando es
reemplazable.

### ¿Por qué tu Dockerfile es multi-stage? ¿Qué pasaría si no lo fuera?

Porque compilar y ejecutar necesitan cosas distintas. Sin multi-stage la imagen
final llevaría todo el toolchain: el frontend pesaría 370 MB en vez de 93.

La diferencia entre front y back es lo interesante: el front baja 4× porque su
imagen final **no necesita Node**; el back sigue necesitando el runtime, así que
solo se ahorra las `devDependencies`.

Y hay un argumento de seguridad además del tamaño: sin compilador ni herramientas de
build, hay menos superficie de ataque.

### ¿Qué pasa con los datos si borro el contenedor de la BD? ¿Y con `down -v`?

Si borro el contenedor, nada: los datos están en el volumen nombrado `db_data`, que
administra Docker y sobrevive. `down -v` agrega los volúmenes a lo que se borra, y
ahí sí se pierden.

### ¿Cómo se encuentra el backend con la BD? ¿Qué es `db` en tu connection string?

`db` es el **nombre del servicio** en el compose. Compose crea una red interna con
DNS embebido, así que ese nombre resuelve a la IP del contenedor. Desacopla la
topología: no importa en qué dirección cayó.

### ¿Por qué `depends_on` solo no alcanza?

Porque ordena el *arranque*, no la *disponibilidad*. "Arrancó" no es "está listo".

### ¿Por qué el `.env` no está en el repo? ¿Dónde van esos secretos en un pipeline?

Porque el repo es público y un password commiteado queda en el historial para
siempre — se revoca, no se borra. En el pipeline van como **secretos de la
plataforma**: cifrados en la configuración del repo, llegan como variables de
entorno recién al correr. Eso es el TP4.

### En vivo: cloná tu repo en una carpeta limpia y levantalo

```bash
git clone https://github.com/AugustoBuhler/IngenieriaDeSoftwareIII-BuhlerAugusto.git
cd IngenieriaDeSoftwareIII-BuhlerAugusto
cp .env.example .env
docker compose up -d --build
```

**Son dos comandos, no uno, y eso no es un defecto.**

---

## 8 · Uso de IA

*(Va en `decisiones.md`. Completar con honestidad.)*
