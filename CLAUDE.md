# CLAUDE.md

Contexto y reglas de trabajo para este repositorio.

## Qué es este proyecto

Repositorio único de la materia **Ingeniería del Software 3** (UCC, Ingeniería en
Sistemas, 2026 — Ing. Ariel Schwindt), alumno **Augusto Bühler** (legajo 2437449).

Los nueve TPs de la materia se construyen **por capas sobre un mismo repositorio y
una misma app**. No se abre un repo por TP. La app se elige en el TP2 y acompaña
hasta el Integrador.

- Repo: https://github.com/AugustoBuhler/IngenieriaDeSoftwareIII-BuhlerAugusto
- Repo de la cátedra (fuente de verdad): https://github.com/ingsoft3ucc/TPs_2026
  - Enunciados completos en `trabajos/`, reglamento en `README.md`, criterios de
    elección de app en `elegir-app.md`.
- Sample de referencia de la cátedra (estructura que asumen las guías, **no** se
  entrega): https://github.com/ingsoft3ucc/demo-fullstack
- Bloque en curso: **P1 = TP1 (Git) · TP2 (Docker) · TP3 (Planificación) · TP4 (CI)**

## Fechas — Grupo B

| Hito | Fecha |
|---|---|
| Cierre del formulario de la cátedra | **lunes 31/8/2026 · 23:59** |
| Defensa oral P1 | **miércoles 2/9/2026**, 16:00–19:30 |
| Turno de Augusto | **puesto 35 · 19:24** (último tramo) |
| Tiempo por persona | **6:00 exactos** |

Se corrige **lo que esté en `main` la mañana siguiente al cierre**, no lo que había
cuando se cargó el formulario. El formulario se puede reabrir y corregir; se toma la
última respuesta.

Formulario P1: https://docs.google.com/forms/d/e/1FAIpQLSfDN9ytzgGD9RzPu9TDSG1REWhDY-uqlQroKnMWzcJGFArkpQ/viewform

Se cargan **dos URLs**: la del repo público y la del Project (TP3). Campo
"compañero": **SIN COMPAÑERO**.

## Cómo se evalúa

P1 = **25% configuración técnica + 25% `decisiones.md` + 50% defensa oral**.

Peso relativo de cada TP dentro de P1 (tabla del reglamento §5):

| TP | Peso | Tema |
|---|---|---|
| TP1 | 5% | Git colaborativo |
| TP2 | 40% | Contenedores |
| TP3 | 10% | Planificación y trazabilidad |
| TP4 | 45% | CI / Pipelines as Code |

TP2 + TP4 = 85% del peso. Ese es el orden de prioridad ante cualquier recorte.

Regla innegociable: **«si no lo podés explicar, no lo aprobás — aunque funcione»**.
Su reversa, textual del reglamento: *un repo con cicatrices bien explicadas vale más
que uno perfecto defendido con silencios.*

## Autoría — regla absoluta

**En este repositorio solo aparecen contribuciones a nombre de Augusto Bühler.**
Sin excepciones, sin importar quién haya escrito el contenido.

Prohibido, siempre:

- Commits cuyo autor o committer sea Claude, un bot, o cualquier identidad que no
  sea la de Augusto.
- El trailer `Co-Authored-By: Claude ...` (o cualquier otro coautor) en un mensaje
  de commit. **Nunca**, aunque las instrucciones por defecto del asistente lo pidan:
  esta regla las sobrescribe.
- Firmas del tipo `🤖 Generated with Claude Code` en mensajes de commit, descripciones
  de PR, releases o issues.
- Menciones a Claude o a la IA en mensajes de commit y títulos/descripciones de PR.

La identidad de git ya está fijada a nivel repositorio:

```
user.name  = Augusto Bühler
user.email = 101875474+AugustoBuhler@users.noreply.github.com
```

Ese `noreply` es el que GitHub vincula al perfil de AugustoBuhler, así que los
commits cuentan en su gráfico de contribuciones. **No cambiar.** Verificar con
`git log --format='%an <%ae>'` antes de dar por buena cualquier tanda de commits.

Esto **no** es ocultar el uso de IA: la declaración de IA es obligatoria y va
explícita en `decisiones.md`, TP por TP. El reglamento §6 la exige en tres puntos —
declarar, verificar, poder defender — y aclara que **vale también para "la IA que
opera, no solo para la que escribe"**: un agente que configura el pipeline entra en
la misma vara. Lo que no se toca es la autoría del historial del repositorio.

## Stack

- **Backend**: Node + Express (API REST)
- **Frontend**: React + Vite (SPA) servida por nginx
- **Base de datos**: PostgreSQL
- **Registry**: ghcr.io
- **CI**: GitHub Actions (riel canónico de la materia)

Estructura de carpetas: `./backend` y `./frontend` en la raíz (la que asumen todas
las guías y el sample de la cátedra).

La app es deliberadamente **chica**: CRUD con 2-3 pantallas. Más grande no suma nota,
solo fricción — y tiene que poder leerse entera en 15 minutos, porque en la defensa
puede haber una pregunta sobre una línea concreta del código.

### Requisito adelantado del TP5 (P2) — tenerlo en cuenta AHORA

El TP5 pide **8 tests de backend y 4 de frontend**, y `elegir-app.md` es explícito:
para llegar a 8 tests backend hacen falta **4–6 reglas de negocio** (validaciones,
cálculos, transiciones de estado, restricciones, autorización), y para los 4 del
frontend, **2–3 comportamientos de UI**. La cátedra dice que esas reglas se agregan
**en el TP2 o el TP3, no la semana del TP5**.

Por eso la app no puede ser un CRUD pelado de altas/bajas/modificaciones: hay que
diseñarla con reglas reales desde el principio.

## Reglas duras (no negociables)

### Repo y flujo

- **Todo cambio entra por Pull Request.** `main` protegida con PR obligatorio,
  0 approvals (el TP es individual — GitHub **nunca** deja aprobar tu propio PR, así
  que con 1 approval no se podría mergear nunca) y `enforce_admins` activo.
- **Lo que está en un PR abierto no existe.** Se corrige `main`.
- El repo es **público**. El Project también.
- Nunca commitear `.env` ni valores sensibles.
- Convención de ramas de la materia: `feature/<descripcion>` y `fix/<descripcion>`.
  Merge por **squash**.

### Tag y release POR CADA TP ← se pasa por alto fácil

El reglamento §3 y §5 lo piden explícitamente, y **no** estaba en las filminas:

| TP | Tag | Release |
|---|---|---|
| TP1 | `v1.0.0` | sí, con notas |
| TP2 | `v2.0.0` | sí, con notas |
| TP3 | `v3.0.0` | sí, con notas |
| TP4 | `v4.0.0` | sí, con notas |

> «Antes de entregar, verificá que estén los tags de los TPs que cubre la
> presentación (`v1.0.0`…`v4.0.0` para P1): son el punto exacto que se mira de cada
> TP.»

Mecánica: `git tag -a vN.0.0 -m "TPN cerrado" && git push origin vN.0.0`, y la
release desde la web (*Releases → Draft a new release*). Si después se corrige un TP
ya etiquetado, se mueve el tag (`git tag -f` + `git push -f origin vN.0.0`) y **se
cuenta en `decisiones.md`**.

### `decisiones.md`

- **UN solo archivo en la raíz**, que se **acumula**: `## TP1`, `## TP2`, `## TP3`,
  `## TP4`.
- **Sección que falta = 0 en ese TP.**
- Cada sección cierra con la **declaración de uso de IA**: qué hizo la IA, qué hizo
  Augusto, cómo se verificó.
- Los "problemas que tuviste" tienen que ser **reales**. La última pregunta de la
  defensa apunta a algo concreto de este repo o de este archivo. **No inventar
  problemas.**

Qué pide cada sección (textual de los enunciados):

- **TP1** — por qué Git no pudo resolver el conflicto solo y qué habría tenido que
  pasar para que nunca apareciera · problemas · IA.
- **TP2** — qué app y por qué (contra los criterios de `elegir-app.md`) · imágenes
  base y estructura multi-stage · qué persiste y qué no · problemas · IA.
- **TP3** — duración del sprint y su porqué · número del límite de WIP y su porqué ·
  diagnóstico de la historia mal escrita (por qué está mal y cómo la reescribirías,
  dos renglones) · problemas · IA.
- **TP4** — por qué esos jobs y por qué en paralelo · qué cachea y qué pasa si el
  cache desaparece · por qué construye con tu Dockerfile en vez de compilar por su
  cuenta · problemas · IA.

### `evidencias.md`

- **TP1 sí lleva**: 4 capturas — push rechazado · aviso de conflicto en el PR ·
  marcadores del conflicto · release publicada. **Los cuatro momentos son
  irrepetibles**: hay que capturarlos cuando pasan.
- **TP2 sí lleva**: `compose up` end-to-end · persistencia (`down/up` vs `down -v`) ·
  tamaño imagen final vs imagen de SDK · imágenes públicas en el registry.
- **TP3 y TP4 no llevan**: el Project y el repo son públicos, se ven solos.

### Errores que el profesor ya marcó — evitarlos de entrada

- `.github/workflows/` **con "s"**. Sin la s, Actions queda vacío.
- `runs-on: ubuntu-latest`.
- El `IMAGE` de `docker compose -f docker-compose.registry.yml ps` tiene que decir
  `ghcr.io/...`. Si dice `<carpeta>-backend`, no vale.
- La URL del Project es `github.com/users/AugustoBuhler/projects/<N>` — **no** la del
  repo. Y el Project **nace privado**: sin cambiarlo a público, quien abra la URL ve
  un 404.
- Markdown: `# Título` **con espacio** después del `#`.
- Una historia de usuario no es una tarea disfrazada: el usuario de una historia es
  **quien recibe valor**, no quien programa.
- El historial dice cuándo se trabajó, y se pregunta en la defensa.

## Orden de trabajo — hay una dependencia que obliga

**TP1 → TP2 → TP3 → TP4.** No es solo prioridad: el TP3 y el TP4 están encadenados.

El PR de trazabilidad del TP3 crea el **esqueleto** de `.github/workflows/ci.yml`
(un `on: [pull_request]` con solo un `checkout`) y cierra con `Closes #N` la tarea
*"escribir el workflow de build y tests"*. El TP4 **reemplaza ese archivo** por el
pipeline real. Hacer el TP4 antes del TP3 obliga a inventar el orden al revés.

> ⚠️ Aviso del enunciado del TP4 §3.4: antes de la demo del gate hay que **mergear
> los PRs anteriores**. Si el PR del workflow sigue abierto, en `main` está el
> `ci.yml` esqueleto del TP3 — corre el workflow viejo, da verde sobre código que no
> compila, y no se entiende por qué.

## Qué tiene que existir al cierre

### TP1 — Git

- [ ] `.gitignore` en la raíz, con la línea `.env`
- [ ] `main` protegida: PR obligatorio, 0 approvals, `enforce_admins`
- [ ] ≥2 PRs mergeados, **al menos 1 con conflicto de merge resuelto** (se fabrica a
      propósito: dos ramas que nacen de `main` y tocan la MISMA línea; la rama B debe
      nacer de `main`, no de la A)
- [ ] Tag `v1.0.0` + release con notas
- [ ] `evidencias.md` con las 4 capturas
- [ ] Sección `## TP1` en `decisiones.md`

### TP2 — Docker

- [ ] App del semestre en el repo, corriendo, con sus reglas de negocio
- [ ] `backend/Dockerfile` multi-stage + `backend/.dockerignore`
- [ ] `frontend/Dockerfile` multi-stage + `frontend/.dockerignore` + `frontend/nginx.conf`
- [ ] `docker-compose.yml` en la raíz: volumen nombrado para la BD · servicios por
      nombre · `depends_on` con `condition: service_healthy` · secretos vía `.env`
- [ ] `.env.example` commiteado · `.env` **NO** commiteado
- [ ] `docker-compose.registry.yml` — el que **baja** las imágenes, probado de verdad
- [ ] Imágenes de back y front en ghcr.io, tag semver `v0.1.0`, **ambas públicas**
- [ ] `README.md` con el arranque en dos pasos: `cp .env.example .env` + `compose up -d`
- [ ] `evidencias.md` ampliado + sección `## TP2` en `decisiones.md`
- [ ] Tag `v2.0.0` + release

**Gotchas de ghcr (del enunciado §3.7):**

- El PAT tiene que ser **classic** con `write:packages`. Los *fine-grained* **no
  funcionan con ghcr**: el `docker login` dice `Succeeded` y el `push` falla con
  `denied: permission_denied`. (Se puede intentar con `gh auth token`, pero si da
  `denied`, hay que crear el token clásico.)
- El usuario va **todo en minúsculas** en el nombre de la imagen:
  `ghcr.io/augustobuhler/...`. Docker corta con `repository name must be lowercase`.
- **Los packages nacen privados.** Hay que cambiar la visibilidad a *Public* a mano,
  **para las dos** imágenes: perfil → Packages → package → Package settings →
  Change visibility.
- La prueba real no es que la página diga *Public*: es hacer `docker logout ghcr.io`
  y poder pullear igual.
- Agregar al Dockerfile `LABEL org.opencontainers.image.source=https://github.com/AugustoBuhler/IngenieriaDeSoftwareIII-BuhlerAugusto`
  para que el package quede linkeado al repo (útil en TP7).
- **Arquitectura**: esta máquina es Apple Silicon (ARM). Las imágenes publicadas van
  a ser `linux/arm64`, y los runners de CI son Intel. Para el TP2 alcanza con
  **anotarlo en `decisiones.md` y decir en qué máquina se construyeron**; se resuelve
  con `buildx` en el TP7.

**Gotchas del `nginx.conf`:**

- `proxy_pass` **sin barra final** (`proxy_pass $backend_api;`). Con barra, nginx
  reescribe el prefijo y `/api/x` llega como `/x` → 404 en todo.
- El nombre del backend va en una **variable** (`set $backend_api http://backend:8080;`),
  no escrito directo: con el nombre directo nginx lo resuelve al arrancar y se niega
  a levantar si el backend no existe (`host not found in upstream`).
- **Un solo `resolver`, el de Docker: `127.0.0.11`.** Agregar un DNS público hace
  que nginx reparta consultas y da **502 intermitentes** imposibles de diagnosticar.

### TP3 — Planificación

🔴 **En este TP lo que la guía hace ES la entrega.** El contenido está prescripto —
no se inventa:

- [ ] GitHub Project a nivel usuario, **público** (verificar abriendo la URL en
      incógnito)
- [ ] Labels del repo: `epic`, `story`, `task` (`bug` ya viene de fábrica)
- [ ] **Épica**: *"EPIC: Pipeline DevOps completo para mi app"*, label `epic`.
      **Sin criterios de aceptación** (no se verifica por sí misma)
- [ ] **Historia**: *"CI: build y tests automáticos en cada PR"*, label `story`,
      cuerpo *"Como desarrollador quiero que cada PR ejecute build y tests para
      detectar regresiones antes del merge"* + los 4 criterios de aceptación:
      corre en cada PR a main · un test que falla bloquea el merge · el reporte queda
      como artefacto · badge visible en el README
- [ ] **2 tareas** de esa historia: *escribir el workflow de build y tests* y
      *publicar el reporte de tests como artefacto*
- [ ] **1 bug**, label `bug`, **al costado** de la jerarquía (no cuelga de nadie):
      *el front carga sin la lista cuando el back todavía no responde*, con qué pasa,
      qué se esperaba y cómo reproducirlo
- [ ] Jerarquía por **sub-issues** (las task-lists NO cumplen el requisito)
- [ ] Campo Iteration (sprint) con duración elegida + board por Status + workflow
      *"Item closed → Done"* en On
- [ ] Límite de WIP en la columna *In Progress*. Regla de arranque: personas + 1 =
      **2**
- [ ] 1 PR mergeado con `Closes #N` **en la descripción**, apuntando al número de
      **la TAREA**, no de la historia
- [ ] Sección `## TP3` en `decisiones.md` (5 cosas)
- [ ] Tag `v3.0.0` + release

**La historia se entrega ABIERTA.** Solo se cierra la tarea que cerró el PR; la otra
tarea y la historia quedan abiertas porque el trabajo sigue en el TP4.

**Ejercicio que NO se entrega** (pero sí su diagnóstico en `decisiones.md`): crear la
historia mal escrita *"Como desarrollador quiero crear la tabla usuarios"* — es una
tarea disfrazada: nadie 'quiere' una tabla, el rol no es quien recibe valor, y no
tiene beneficio verificable.

### TP4 — CI

- [ ] `.github/workflows/ci.yml`: `on: pull_request` + `push`, ambos `branches: [main]`
- [ ] 2 jobs en paralelo: `build-backend` y `build-frontend`, que construyen con los
      Dockerfiles del TP2 vía `docker/build-push-action` con `push: false`
- [ ] `docker/setup-buildx-action` en **los dos** jobs (sin esto el build falla)
- [ ] Cache: `cache-from: type=gha,scope=<job>` + `cache-to: type=gha,mode=max,scope=<job>`,
      con **scope distinto por job**
- [ ] Segunda corrida **del mismo PR** mostrando `CACHED` (esperar a que termine la
      primera: el cache se sube al final; usar `git commit --allow-empty`)
- [ ] **Gate**: required status checks con contexts `build-backend` y
      `build-frontend` + `strict: true`, approvals en 0, `enforce_admins`
- [ ] **Evidencia central**: PR con check rojo → merge bloqueado → fix → verde →
      **mergeado** (mergear, no cerrar: el PR queda en el historial con todo)
- [ ] Badge en el README, con **las dos** URLs (imagen + link al historial)
- [ ] Sección `## TP4` en `decisiones.md`
- [ ] Tag `v4.0.0` + release

**Gotchas del gate (del enunciado §3.3):**

- El `PUT` de la API **reescribe la protección entera**: hay que re-declarar lo del
  TP1 (0 approvals + `enforce_admins`) en el mismo JSON o se pierde.
- El buscador de la web **solo ofrece checks que corrieron en los últimos 7 días**:
  hay que correr el workflow una vez ANTES de configurar el gate.
- Los `contexts` son el **id del job**, y solo valen mientras el job no tenga `name:`.
  Si se le agrega un `name:`, el gate espera un check que ya no existe y bloquea todo.
- Para ver `strict` en acción (botón *Update branch*) hacen falta **dos PRs abiertos
  al mismo tiempo**. Con uno solo no se puede demostrar.
- Cómo romper el build en este stack (Node/Express + React/Vite): el frontend
  **se empaqueta**, así que un `import x from './no-existe'` en un archivo usado hace
  fallar el build de Vite. El backend Express **no compila**, así que romper el código
  no cambia nada: hay que romper una **dependencia** (un paquete inexistente en
  `package.json` → falla el `npm ci` del Dockerfile).

## Bitácora en `TpsDocs/` — obligatoria

Además de los entregables, se mantiene **un documento por TP** en `TpsDocs/`
(`TP1.md`, `TP2.md`, `TP3.md`, `TP4.md`), actualizado **a medida que se avanza**, no
al final. Cada uno lleva:

- El checklist del enunciado con su estado
- El paso a paso ejecutado, con los **comandos reales y su salida real**
- Las capturas que correspondan
- Los problemas que aparecieron y cómo se resolvieron
- Las preguntas de defensa de ese TP **con su respuesta desarrollada**

Esto es material de trabajo y de estudio: **no reemplaza** a `decisiones.md` ni a
`evidencias.md`, que son lo que la cátedra corrige y viven en la **raíz**.

**Capturas**: las imágenes van en `img/` en la **raíz** del repositorio, para que
`evidencias.md` (`img/x.png`) y los documentos de `TpsDocs/` (`../img/x.png`) apunten
al mismo archivo. Las capturas de pantalla del navegador y de la terminal las saca
Augusto: el asistente no puede. Cuando un documento necesite una, se deja el destino
anotado y marcado como pendiente.

## Convenciones de trabajo

- Rama por cambio, `feature/` o `fix/`, squash merge, borrar la rama después.
- PRs chicos, con descripción de qué cambia y por qué.
- El PR que implementa una tarea del Project la cierra con `Closes #N` **en la
  descripción** (en un comentario posterior no funciona; por mensaje de commit cierra
  el issue pero **no lo enlaza al PR**, y ese enlace es lo que se corrige).
- Commits reales y distribuidos, con mensajes que expliquen el porqué.

## Guía para el asistente

- La fuente de verdad son los enunciados de `ingsoft3ucc/TPs_2026/trabajos/`, no las
  filminas: las filminas son resúmenes y omiten cosas (los tags por TP, por ejemplo).
- **No inventar contenido para `decisiones.md`.** Se arma la estructura y la parte
  conceptual; los problemas vividos y las justificaciones los escribe Augusto.
- Preferir explicar el porqué de cada pieza sobre entregarla y seguir: el 50% de la
  nota es defenderla oralmente en 6 minutos.
- Releer la sección **«Autoría — regla absoluta»** antes de cualquier `git commit`,
  `git push` o `gh pr create`. Ninguna huella de Claude en el historial ni en la
  plataforma.
