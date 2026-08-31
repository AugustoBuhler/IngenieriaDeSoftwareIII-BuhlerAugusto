# Decisiones

Bitácora de decisiones de los trabajos prácticos de Ingeniería del Software 3.
Un apartado por práctico, en orden.

---

## TP1 — Git colaborativo

### Por qué Git no pudo resolver el conflicto solo

Git fusiona automáticamente cuando dos ramas tocan **partes distintas** de un
archivo: compara ambas puntas contra el ancestro común y aplica los dos conjuntos
de cambios. En mi caso, `feature/titulo-a` y `feature/titulo-b` salieron las dos
del mismo commit (`b4d8992`) y modificaron **la misma línea** — la primera del
`README.md` — con contenidos distintos.

Ahí Git se queda sin criterio. No es que le falte información: es que la decisión
no es técnica sino **de contenido**. Ninguna de las dos versiones es "más correcta"
desde el punto de vista del sistema de control de versiones, así que en lugar de
elegir por mí marcó el archivo con `<<<<<<<`, `=======` y `>>>>>>>` y me delegó la
decisión.

Resolví quedándome con el título que ya estaba en `main` (el que había entrado por
el PR #3). Por eso el PR #4 figura con *Files changed: 0*: la resolución fue
válida, pero su resultado neto sobre `main` fue nulo.

### Qué habría tenido que pasar para que el conflicto nunca apareciera

Dos caminos, uno trivial y uno real:

- **El trivial**: que las dos ramas hubieran tocado líneas distintas. Es una
  casualidad, no una estrategia.
- **El que importa**: que la segunda rama hubiera integrado `main` antes de
  divergir. El conflicto no aparece por trabajar en paralelo — aparece por
  integrar **tarde**. Cuanto más vive una rama sin traerse `main`, más superficie
  de choque acumula.

Por eso la respuesta de fondo no es de herramienta sino de proceso: ramas cortas e
integración frecuente producen conflictos chicos y triviales; ramas de semanas
producen *merge hell*. El conflicto en sí no es un error — es trabajo en paralelo
funcionando. Lo evitable es el conflicto **grande**.

### Problemas encontrados y cómo los resolví

**1. La protección de rama falló con un error que no decía la causa real.**

Al aplicar la protección sobre `main` por API, GitHub respondió:

```
403 · Upgrade to GitHub Pro or make this repository public to enable this feature.
```

El mensaje sugiere un problema de plan o de permisos del token, y perdí un rato
buscando por ahí. La causa era otra: **el repositorio estaba en privado**, y las
protecciones de rama son gratuitas solo en repos públicos. Lo pasé a público —que
además es requisito de la materia— y la misma llamada funcionó sin cambiar nada
más.

**2. Un commit se coló en un Pull Request que no le correspondía.**

Haciendo la prueba de push directo (§4.4 de la guía) ejecuté
`git commit -am "test: intento de push directo"` creyendo estar parado en `main`.
Estaba en `feature/bitacora-de-tps`, que en ese momento tenía el PR #1 abierto. El
push funcionó —a una rama de feature no hay protección que lo frene— y el commit
entró al PR sin que nada lo avisara.

Cuando mergeé el PR #1 con *squash*, ese commit se aplastó junto con el resto y la
línea `test` terminó en `main`.

Aprendí dos cosas concretas:

- **Un Pull Request sigue a la rama, no al commit.** Cuando abrís un PR no estás
  proponiendo un commit puntual: estás proponiendo *todo lo que tenga esa rama
  cuando se apriete el botón*. Cualquier cosa que se pushee mientras está abierto
  entra sola. Es la misma propiedad que permite responder a un review con otro
  commit, pero funciona igual cuando el commit no debería estar ahí.
- **La carpeta tiene una sola rama activa.** `git switch` no mueve "a una persona":
  mueve el directorio de trabajo entero.

Lo resolví con un PR de corrección (PR #2) en vez de reescribir el historial. La
alternativa era `push --force` sobre `main`, que es exactamente lo que la regla de
oro prohíbe: nunca reescribir lo que ya se compartió. En Git, lo que ya salió se
corrige **hacia adelante**.

Y hubo un tercer punto de falla, el más importante: **antes de mergear el PR #1 no
leí el diff**. La pestaña *Files changed* mostraba un cambio en `README.md` que la
descripción del PR no mencionaba. Cinco segundos de revisión lo habrían agarrado.
Es literalmente para lo que existe el code review, y la primera pregunta que hay
que hacerle a un PR: *¿hace lo que dice que hace?*

> ⚠️ **AUGUSTO: revisá esta sección y agregá cualquier otro problema que hayas
> tenido vos** (con el editor web, con las capturas, con `gh auth login`, lo que
> sea). Los tropiezos propios valen más que los prolijos.

### Declaración de uso de IA

> ⚠️ **AUGUSTO: esto lo tenés que escribir vos y tiene que ser verdad.** Te dejo el
> esqueleto de lo que efectivamente pasó, verificalo y ponelo con tus palabras.
>
> - **Qué hizo la IA**: asistencia con Claude Code para la configuración del
>   repositorio (protección de rama por API, creación de ramas y PRs), la redacción
>   de esta documentación, y la construcción de la app del TP2.
> - **Qué hice yo**: la resolución del conflicto en el editor web (decidir qué
>   contenido quedaba), las capturas, la publicación de las releases, y las
>   decisiones de qué entregar.
> - **Cómo lo verifiqué**: ← *esto es lo que más pesa. ¿Corriste los comandos y
>   viste la salida? ¿Abriste el repo en el navegador y comprobaste el estado?
>   ¿Levantaste el sistema y lo usaste? Sé concreto.*

---

## TP2 — Contenedores

### Qué app elegí y por qué

**Sistema de turnos de consultorio**: pacientes, profesionales y turnos.
Desarrollo propio, hecho para esta materia.

Contra los criterios de `elegir-app.md`:

| Criterio | Cómo lo cumple |
|---|---|
| **Corre hoy, sin magia** | Node + Vite + PostgreSQL, todo local. La única dependencia externa es la base, que corre como contenedor. Sin APIs pagas ni servicios de terceros que puedan caerse a mitad de semestre. |
| **Conozco los comandos de build** | `npm ci` / `npm run build` en el front, `npm ci` en el back. Es exactamente lo que los Dockerfiles ejecutan. |
| **La conexión sale del entorno** | `DATABASE_URL` en `backend/src/db.js`, con un default para desarrollo local. No hay ninguna cadena de conexión escrita en el código. Eso es lo que permite que la misma imagen apunte a la base de compose, y mañana a una de QA. |
| **Tiene lógica para testear** | Siete reglas de negocio en `backend/src/reglas.js`, escritas como funciones puras. |
| **La entiendo y la puedo modificar** | La escribí. Son ~450 líneas en total. |
| **Tamaño reducido** | Tres pantallas, cinco endpoints. |

Sobre el criterio de tests: `elegir-app.md` avisa que el TP5 pide 8 tests de
backend y 4 de frontend, y que para eso hacen falta entre 4 y 6 reglas de negocio —
y que conviene agregarlas en el TP2, no en la semana del TP5. Por eso la app **no**
es un CRUD de altas y bajas: las siete reglas (DNI único y con formato, fecha
futura, no solapamiento por profesional, cupo diario, transiciones de estado
válidas, borrado protegido) están puestas desde el principio, y aisladas de Express
y de la base para poder verificarlas sin levantar nada.

### Imágenes base y estructura multi-stage

**Backend**: `node:22-alpine` en las dos etapas. La primera instala todas las
dependencias (incluidas las de desarrollo) y después ejecuta `npm prune --omit=dev`;
la segunda copia solo `node_modules` ya podado, el código y el `package.json`.

**Frontend**: `node:22-alpine` para construir, `nginx:alpine` para servir. Acá el
multi-stage es más drástico porque **la imagen final no necesita Node en absoluto**:
una vez que Vite emitió los archivos estáticos, quien los sirve es nginx.

Medido, comparando la etapa de build contra la imagen final:

| | Etapa de build | Imagen final | Reducción |
|---|---|---|---|
| frontend | 370 MB | **93 MB** | 4x |
| backend | 300 MB | **235 MB** | 22 % |

La diferencia entre ambos es la explicación del multi-stage: el frontend puede
tirar todo el toolchain porque su producto es un puñado de archivos estáticos; el
backend sigue necesitando el runtime de Node para ejecutar, así que lo único que se
ahorra son las dependencias de desarrollo y el caché de npm.

Además del tamaño, el multi-stage reduce la **superficie de ataque**: en la imagen
final no hay compilador, ni `npm`, ni herramientas de build que un atacante pueda
aprovechar.

En los dos Dockerfiles las dependencias se copian **antes** que el código
(`COPY package*.json ./` y `RUN npm ci`, y recién después `COPY src ./src`). Es
deliberado: Docker invalida una capa y todas las posteriores, así que con ese orden
cambiar una línea de código no dispara una reinstalación completa de dependencias.

### Cómo se encuentran los servicios, y por qué el front no nombra al backend

El backend llega a la base por **nombre de servicio**: `postgres://...@db:5432/app`.
Compose crea una red interna con DNS embebido, así que `db` resuelve sin importar
en qué IP haya caído el contenedor.

El frontend es el caso trampa. Su JavaScript **corre en el navegador**, que vive
fuera de la red de compose: ahí el nombre `backend` no existe. Elegí el camino de
la **ruta relativa + proxy**: la SPA pide a `/api/...` sin nombrar host ni puerto.
En desarrollo esa ruta la traduce el proxy de Vite; en el contenedor, nginx —que sí
está adentro de la red—. Ventajas: la misma imagen sirve en cualquier entorno, y
como para el navegador todo viene del mismo origen, no hace falta CORS.

La alternativa (URL absoluta al puerto publicado) funciona, pero ata la imagen al
entorno y obliga a configurar CORS.

### `healthcheck` vs `depends_on`

`depends_on` solo ordena el **arranque**: le dice a compose en qué secuencia iniciar
los contenedores. No dice nada sobre si el servicio está operativo. El contenedor de
PostgreSQL arranca en un segundo, pero el motor tarda varios más en aceptar
conexiones — y en esa ventana el backend intenta conectarse y se muere.

Por eso el servicio `db` tiene un `healthcheck` con `pg_isready` y el backend
declara `condition: service_healthy`: no espera a que el contenedor exista, espera a
que la base **conteste**. La distinción "arrancó" vs "está listo" reaparece en todo
sistema distribuido.

Como cinturón de seguridad adicional, `backend/src/db.js` reintenta la conexión
antes de rendirse: el healthcheck resuelve el caso normal, el reintento cubre el
resto.

### Qué persiste y qué no

Los contenedores son **efímeros por diseño**: su capa de escritura muere con ellos.
Para la app eso es una ventaja (contenedores descartables = deploys y rollbacks
triviales); para la base sería una catástrofe.

Por eso los datos viven en un **volumen nombrado**, `db_data:/var/lib/postgresql/data`,
que administra Docker y sobrevive a la destrucción del contenedor. Verificado:

- `docker compose down` + `up` → los turnos siguen ahí
- `docker compose down -v` → la lista vuelve vacía

`down` apaga; `down -v` **olvida**. El resto del sistema (código, dependencias,
estáticos del front) no persiste nada: está todo dentro de las imágenes, y se
reconstruye idéntico.

### Dónde viven los secretos

La contraseña de la base está en un `.env` que **no se commitea** (`.gitignore`,
línea 2). Lo que sí viaja en el repo es `.env.example`, con la clave esperada y un
valor de ejemplo: documentación ejecutable de qué hace falta para levantar el
sistema.

El compose referencia `${DB_PASSWORD}`: el YAML se versiona, el valor no.

Esto es lo que hace que el arranque sean **dos** comandos y no uno
(`cp .env.example .env` y después `docker compose up -d`). No es un defecto de la
entrega: es la consecuencia de que el secreto no puede viajar en el repositorio.
Un password commiteado en un repo público queda en el historial para siempre —
borrarlo del archivo no lo borra de la historia, hay que **revocarlo**.

En el TP4 estos secretos migran a la plataforma de CI.

### Registry y arquitectura

Las imágenes están publicadas en **ghcr.io** con tag semver `v0.1.0` y visibilidad
pública:

- `ghcr.io/augustobuhler/turnos-backend:v0.1.0`
- `ghcr.io/augustobuhler/turnos-frontend:v0.1.0`

Elegí ghcr sobre Docker Hub porque la cuenta ya existía (es la de GitHub del TP1),
las imágenes quedan junto al código, y en el TP7 el pipeline va a poder autenticarse
contra ghcr sin secretos, usando el `GITHUB_TOKEN` del propio workflow.

**Sobre la arquitectura**: las construí en una MacBook Air con Apple Silicon, así
que las imágenes publicadas son `linux/arm64`. Alguien con una máquina Intel al
hacer `pull` recibiría `no matching manifest for linux/amd64`. Para este práctico
alcanza con saberlo y declararlo; en el TP7 se resuelve con `docker buildx`, que
construye para las dos arquitecturas a la vez.

### Problemas encontrados y cómo los resolví

**1. Los packages de ghcr nacen privados.**

Después del `docker push` las dos imágenes quedaron con visibilidad `private`, y
mientras lo estén nadie puede hacer `pull`: ni la cátedra, ni otro entorno, ni el
`docker-compose.registry.yml`. No hay endpoint de la API REST para cambiarlo: hay
que hacerlo desde la web, package por package (*Package settings → Change
visibility → Public*).

**2. El `docker login` de ghcr puede dar OK sin tener permiso.**

La guía advierte que un token *fine-grained* hace que el login diga `Succeeded` y
recién falle el `push` con `denied: permission_denied`. Lo evité usando el token de
`gh` con el scope `write:packages` agregado (`gh auth refresh -s write:packages`),
y verifiqué que funcionaba haciendo el push de verdad en vez de confiar en el login.

> ⚠️ **AUGUSTO: agregá acá los problemas que hayas tenido vos** — algo que no
> arrancó, un puerto ocupado, un comando que falló. Si no tuviste ninguno, decilo,
> pero pensalo dos veces: casi siempre hubo alguno.

### Declaración de uso de IA

> ⚠️ **AUGUSTO: completar, igual que en el TP1.** Lo importante acá es que la app la
> escribió la IA, y eso hay que decirlo con todas las letras — está permitido y
> alentado. Lo que se evalúa es que la entiendas: la pregunta sobre tu caso puede
> apuntar a una línea concreta de `backend/src/reglas.js`. Leelo entero antes del
> miércoles.

---

## TP3 — Planificación y trazabilidad

*(pendiente)*

---

## TP4 — CI: Pipelines as Code

*(pendiente)*
