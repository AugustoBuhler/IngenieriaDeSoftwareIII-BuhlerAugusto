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
- Bloque en curso: **P2 = TP5 (Testing) · TP6 (CD) · TP7 (Contenedores + e2e) · TP8 (IaC) · TP9 (DevSecOps + observabilidad)**
- P1 (TP1–TP4) cerrado: tags `v1.0.0`…`v4.0.0` en `main`, defendido el 2/9/2026.

## Fechas

### P2 — comisión 2 (cursa los miércoles) — en curso

| Hito | Fecha |
|---|---|
| Corte de la entrega de la comisión 2 | **lunes 26/10/2026 · 23:59** |
| Defensa sorteada | **viernes 30/10/2026 · puesto 7 · 14:30** (10:00 por persona) |
| Recuperatorio y ausentes | **viernes 13/11/2026 · desde las 13:30** (el orden se arma ese día) |

- Se corrige el repo **tal como estaba en GitHub a la hora del corte** (cuenta la hora
  en que GitHub recibió el push, no la fecha del commit): `main`, y cada TP en el
  commit de su release. Lo que se sube después no cuenta.
- **Si el formulario no está cargado al cierre, no se pre-corrige: nota técnica 0.**
- El 13/11 es a la vez recuperatorio y fecha de los ausentes: esa defensa es la
  única oportunidad. El recuperatorio alcanza para **un solo bloque**.

Formulario P2: https://docs.google.com/forms/d/e/1FAIpQLSe0KrP6Ccw9EntLmzChzh8B7Py8GgmiYXDa-VbuyOoxkJeDWg/viewform

Se carga: legajo, apellido y nombre, riel (GitHub), URL del repo, nombre de la app,
**URLs de QA y PROD**, y "algo que deba saber" (si se usó el fallback local del
TP6/TP7: escribir **FALLBACK LOCAL** y avisar antes).

### P1 — grupo B — cerrado

Corte 31/8/2026 · defensa miércoles 2/9/2026, puesto 35, 19:24, 6:00 por persona.
Formulario P1: https://docs.google.com/forms/d/e/1FAIpQLSfDN9ytzgGD9RzPu9TDSG1REWhDY-uqlQroKnMWzcJGFArkpQ/viewform
(se cargaron el repo y el Project; "compañero": SIN COMPAÑERO).

## Cómo se evalúa

Cada presentación da **una nota**; las dos van por separado (no se promedian ni se
compensan). Se aprueba con **60% (un 4)**. Para regularizar hacen falta las dos.

**P2** = **50% los cinco TPs, corregidos antes sobre el repo** + **50% defensa oral**
(2 o 3 preguntas sobre cualquiera de los TPs 5–9 y sobre `decisiones.md`, con
repreguntas; 10 minutos; el día de la defensa se pone sólo esa mitad). Cada pregunta
mira tres cosas: el concepto, el porqué y el cómo.

| TP | Peso en P2 | Tema |
|---|---|---|
| TP5 | 25% | Testing: unit tests, coverage y el umbral que frena un merge |
| TP6 | 25% | CD: environments, aprobaciones y deployment patterns |
| TP7 | 20% | Contenedores en el pipeline + integración y e2e |
| TP8 | 15% | Infraestructura como código |
| TP9 | 15% | DevSecOps + observabilidad |

P1 (cerrado) era 25% configuración técnica + 25% `decisiones.md` + 50% defensa, con
pesos TP1 5% · TP2 40% · TP3 10% · TP4 45%.

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
| TP5 | `v5.0.0` | sí, con notas |
| TP6 | `v6.0.0` | sí — sobre el commit que está **en PROD** según *Deployments* |
| TP7 | `v7.0.0` | sí — sobre el commit que está **en PROD** (`--verify-tag`) |
| TP8 | `v8.0.0` | sí — sobre el commit que deja `infra/` terminado |
| TP9 | `v9.0.0` | sí, con notas |

> «Antes de entregar, verificá que estén los tags de los TPs que cubre la
> presentación (`v1.0.0`…`v4.0.0` para P1, `v5.0.0`…`v9.0.0` para P2): son el punto
> exacto que se mira de cada TP.»

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
- **TP5** — qué lógica se testeó y por qué esa · el umbral: número, **métrica** (línea,
  rama o las dos) y por qué, más el número de **rama** de hoy · **qué quedó afuera de la
  cuenta**, back y front, y por qué cada cosa · por qué coverage alto no es calidad (con
  un ejemplo propio) · el PR bloqueado: qué check, en qué métrica, qué se escribió para
  arreglarlo · el refactor para poder mockear · qué herramienta cubrió cada fila de «Tu
  stack, de un vistazo» (el stack no es el de la cátedra) · **el ejercicio del camino
  sin cubrir**: qué línea, qué entrada la recorre, qué se decidió (obligatorio) ·
  problemas · IA. Cada decisión con la **URL** que la prueba (la corrida, el PR).
- **TP6** — arriba de todo, **«Enlaces de este TP»**: los dos paquetes, las dos corridas
  de la cadena (PR con «Entrar al registry» salteado + lista de pasos de una corrida de
  `main`) y las URLs de QA y PROD · por qué se publica sólo en verde · Delivery vs
  Deployment · la cadena `needs`/`if`/environments y el alcance de cada secret · qué
  mira el aprobador · la letra chica del free tier · qué se pierde porque Render
  reconstruye · qué prueba el smoke y qué no · patrón de deploy + rollback
  **cronometrado** · qué quedó por variable y qué adentro de la imagen del front ·
  problemas · IA.
- **TP7** — arriba, **«Enlaces del TP7»**: paquetes con sus `sha-…`, la corrida con
  integración verde y e2e roja (commit que rompió, corrida, los dos reportes), la corrida
  verde hasta PROD, URLs de QA y PROD · build once, deploy many · etiquetas (`sha-` vs
  `v7.0.0`, por qué no `latest`) · del tag a la imagen en un paso · cómo se comprueba
  que el entorno ejecuta la imagen · qué va en integración y qué en e2e, y el par
  verde/rojo · integración amplia vs estrecha · cold start y flaky · la misma imagen del
  front en QA y PROD · problemas · IA.
- **TP8** — tres renglones: qué riel y qué versión de cada provider · problemas · IA.
- **TP9** — tres renglones: qué actualizaba el PR de Dependabot y por qué se mergeó ·
  cuánto tardó el monitor en avisar, la operación más usada y la más lenta · problemas
  · IA.

### `evidencias.md`

- **TP1 sí lleva**: 4 capturas — push rechazado · aviso de conflicto en el PR ·
  marcadores del conflicto · release publicada. **Los cuatro momentos son
  irrepetibles**: hay que capturarlos cuando pasan.
- **TP2 sí lleva**: `compose up` end-to-end · persistencia (`down/up` vs `down -v`) ·
  tamaño imagen final vs imagen de SDK · imágenes públicas en el registry.
- **TP3 a TP9 no llevan**: el Project y el repo son públicos, se ven solos. Desde P2,
  todo lo que tiene dirección propia (una corrida, un PR, un paquete, una URL de
  entorno) se entrega como **URL** adentro de `decisiones.md`, pegada a la decisión que
  prueba.

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

## Orden de trabajo de P1 — hay una dependencia que obliga

**TP1 → TP2 → TP3 → TP4.** No es solo prioridad: el TP3 y el TP4 están encadenados.

El PR de trazabilidad del TP3 crea el **esqueleto** de `.github/workflows/ci.yml`
(un `on: [pull_request]` con solo un `checkout`) y cierra con `Closes #N` la tarea
*"escribir el workflow de build y tests"*. El TP4 **reemplaza ese archivo** por el
pipeline real. Hacer el TP4 antes del TP3 obliga a inventar el orden al revés.

> ⚠️ Aviso del enunciado del TP4 §3.4: antes de la demo del gate hay que **mergear
> los PRs anteriores**. Si el PR del workflow sigue abierto, en `main` está el
> `ci.yml` esqueleto del TP3 — corre el workflow viejo, da verde sobre código que no
> compila, y no se entiende por qué.

## P1 — qué tenía que existir al cierre (cerrado, se conserva como referencia)

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

## P2 — orden de trabajo y qué tiene que existir al cierre

**TP5 → TP6 → TP7 → TP8 → TP9**, y no es sólo la numeración:

- El TP6 publica las imágenes **sólo si pasaron los tests del TP5**, y sólo desde `main`.
- El TP7 hace que los entornos del TP6 **ejecuten esas imágenes** en vez de reconstruir,
  y corre integración + e2e contra el QA del TP6 antes de promover a PROD.
- El TP8 crea `preprod` corriendo **la imagen del TP7**, sin tocar QA ni PROD.
- El TP9 vigila la **PROD del TP6** (monitor externo + Sentry).

Cada guía se lee **entera** en `trabajos/` antes de implementar su TP: las trampas
están en la letra chica, no en las tareas.

### Al cierre, en `main`

- Releases `v5.0.0`…`v9.0.0` (ver la tabla de tags: la `v6` y la `v7` van sobre el
  commit que está en PROD).
- `decisiones.md` con `## TP5`…`## TP9` (TP6 y TP7 con su sección de enlaces arriba).
- **QA y PROD vivos** hasta la defensa: en la mesa se navegan.
- El **segundo PR del TP5, abierto y en rojo** hasta la defensa.
- `infra/` lista para correr un `plan` o un `apply` en vivo (credenciales cargadas en
  la terminal, sin mostrarlas). Preprod no tiene que estar vivo: tiene que poder nacer.
- Lo de Sentry y el monitor **vence a los 30 días**: si es más viejo, se repite antes
  de la fecha (y el monitor se vuelve a pausar).

### TP5 — Testing

- [ ] Backend: **≥8 métodos de test** AAA sobre **≥4 reglas distintas**, con ≥1
      parametrizado (`it.each`), ≥1 caso de error y **≥1 test con mock** (cuenta dentro
      de los 8). Cuentan los MÉTODOS, no los datos de un `it.each`.
- [ ] Frontend: **≥4 unit tests sin DOM**, con las mismas tres técnicas (parametrizado,
      caso de error, mock).
- [ ] Un test vale si, al invertir la regla o correr un borde (`>` → `>=`), algún test
      se pone rojo.
- [ ] Coverage de back y front **en el pipeline**: resumen en el *Summary* de la
      corrida y reporte descargable como artefacto, de los dos lados. Siempre se
      reporta **rama**.
- [ ] Umbral elegido y justificado, en **líneas y ramas**, que **rompe el build** de los
      dos lados. Los tests corren adentro de `build-backend` y `build-frontend`, que ya
      son required checks: no se agrega ningún check nuevo.
- [ ] **Dos PRs**: el primero, código nuevo sin tests → rojo **por cobertura** con todo
      compilando y en verde → los tests que faltaban → verde → **mergeado**. El segundo,
      chico, desde `main` después de ese merge, con el mismo problema, **abierto y en
      rojo hasta la defensa**.
- [ ] Cierra la tarea #15 del Project (*Publicar el reporte de tests como artefacto*)
      con `Closes #15`; con eso la historia #13 cumple sus cuatro criterios.
- [ ] Sección `## TP5` + tag `v5.0.0` + release.

### TP6 — CD

- [ ] Imágenes en ghcr etiquetadas con el commit (`sha-…`), publicadas **sólo en `push`
      a `main` y después de los tests**; paquetes públicos (`docker pull` sin
      credenciales).
- [ ] QA y PROD en Render + Neon (front + back + **base separada por entorno**), con el
      deploy **disparado por el pipeline** (deploy hooks; Auto-Deploy en Off en los
      cuatro servicios).
- [ ] La dirección del backend **no va adentro de la imagen del front**: se lee del
      entorno al arrancar (plantilla de nginx). La misma imagen sirve en QA y en PROD.
- [ ] Environments `qa` y `production` en GitHub, con los secrets de deploy en su
      alcance.
- [ ] Push a `main` → CI verde → deploy a QA → **smoke con reintentos** que falla el job.
- [ ] `production` con **required reviewer** (Augusto, *Prevent self-review* apagado):
      un flujo aprobado completo y **un rechazo con motivo propio y específico**.
- [ ] Rollback hecho **de verdad** y cronometrado (inicio y *live* en *Deploys* de Render).
- [ ] Sección `## TP6` (con «Enlaces de este TP» arriba) + `v6.0.0`.

### TP7 — Contenedores + e2e

- [ ] Los cuatro servicios de Render **ejecutan la imagen del registry**
      (`imgURL=…:sha-<commit>` por deploy hook); en *Events* se lee «Triggered via Deploy
      Hook» con ese `sha`.
- [ ] Integración: **≥3 pruebas** en `frontend/e2e/api.spec.js` (Playwright `request`,
      sin navegador) contra la api de QA: alta + verificación + borrado · alta inválida
      → 400 y no se creó nada · una tercera propia. Nombres únicos con la hora; limpian
      lo que crean.
- [ ] e2e: **≥3 flujos** con navegador contra QA (uno de creación, uno de
      error/validación, y el que el usuario hace todos los días). Sin mocks de red, sin
      `skip`; el cold start se resuelve con timeouts.
- [ ] Cadena `deploy-qa → integracion → e2e → deploy-prod`, sin nada que desarme el gate
      (`continue-on-error`, `|| true`, `if: always()`).
- [ ] Una corrida con **integración verde y e2e roja** por un commit que rompe **la
      aplicación** (no el test) → fix → verde → aprobación → PROD con **la misma imagen**.
- [ ] Sección `## TP7` (con «Enlaces del TP7») + `v7.0.0`.

### TP8 — IaC

- [ ] `infra/` con Terraform (Neon + Render) que crea **`preprod`** corriendo la imagen
      del TP7; providers **fijados por versión**; ninguna credencial en el HCL; cadena de
      conexión y dirección del backend **derivadas**, no copiadas.
- [ ] `.gitignore` de estado, `.terraform/` y tfvars **antes del primer apply**;
      `infra/` a `main` por PR, con `.terraform.lock.hcl` y **sin el estado**.
- [ ] `destroy` → `apply` vuelve **idéntico**, con QA y PROD intactos.
- [ ] Sección corta `## TP8` + `v8.0.0`.

### TP9 — DevSecOps + observabilidad

- [ ] Dependabot (npm del back, npm del front, github-actions) + alertas y security
      updates prendidos; **≥1 PR de Dependabot mergeado** con el pipeline en verde.
- [ ] CodeQL (configuración por defecto) con su primer análisis visible.
- [ ] Push protection verificada activa.
- [ ] Monitor externo sobre `/health` de PROD, con **una caída provocada** (aviso de
      DOWN y de UP) y el monitor **pausado** al terminar.
- [ ] Sentry en back y front de PROD (por PR), con ≥1 error y la tabla de uso real.
- [ ] Una **tarjeta en el tablero del TP3** nacida de un dato visto (la operación más
      lenta, un error, lo que nadie usa).
- [ ] Sección corta `## TP9` + `v9.0.0`.

### Trampas de P2 que ya se conocen

- **El stack no es el de la cátedra** (.NET): el backend es Node, así que los dos lados
  usan vitest + `@vitest/coverage-v8` (la **misma versión exacta** que `vitest`). La
  tabla «Tu stack, de un vistazo» del TP5 es el índice, y lo que se usó en cada fila se
  cuenta en `decisiones.md`.
- **La etapa de tests nace de `build` y necesita las devDependencies**: el
  `npm prune --omit=dev` no puede quedar en `build`; pasa a una etapa propia.
- La etapa de tests va **en el medio** del Dockerfile: si queda última, la imagen de
  producción pasa a ser la de tests sin que nada se ponga rojo.
- `load: true` en el build de la etapa de tests (si no, *Unable to find image*), y un
  `scope` de cache distinto por cada build (pasan a ser cuatro).
- Qué entra en la cuenta: el umbral se calcula sólo sobre la lógica. Excluir el
  arranque **sólo después** de sacarle las reglas; si no, el número mide una sola
  clase y da altísimo.
- Los `thresholds` de vitest sólo se evalúan si la corrida pide `--coverage`. Si el
  `include` no matchea nada, mide cero archivos y pasa en verde, en silencio.
- (TP7) El `include` por defecto de vitest **también agarra `*.spec.js`**: cuando
  aparezcan los specs de Playwright en `frontend/e2e/`, hay que sacar `e2e/**` de vitest.
- (TP6) Render free: duerme a los 15 minutos, tarda ~1 minuto en despertar, **750 h
  por mes por workspace**; su Postgres expira a los 30 días (por eso la base va en Neon).

## Bitácora en `TpsDocs/` — obligatoria

Además de los entregables, se mantiene **un documento por TP** en `TpsDocs/`
(`TP1.md` … `TP9.md`), actualizado **a medida que se avanza**, no al final. Cada uno lleva:

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
