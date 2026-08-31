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

Project público: https://github.com/users/AugustoBuhler/projects/1

### La duración del sprint, y por qué

**Una semana.**

La materia entrega un trabajo práctico por semana, y esa cadencia ya existe: no la
inventé yo, la impone el calendario de la cátedra. Alinear el sprint con ella hace
que el *sprint goal* sea concreto y verificable — "entregar el práctico de esta
semana" — en vez de una lista de deseos sin fecha.

Un sprint más largo tendría el problema opuesto al que resuelve: el objetivo dejaría
de coincidir con ninguna entrega real, y la revisión al final del sprint llegaría
cuando el trabajo ya se defendió. Un sprint de dos semanas, acá, agruparía dos TPs
que se defienden por separado.

Lo que **no** es un argumento válido —y el enunciado lo marca como anti-ejemplo— es
elegir una duración larga "para no complicarme". La duración se justifica por el
ritmo de entrega de valor, no por comodidad.

### El límite de trabajo en progreso, y por qué ese número

**Dos.**

Es la regla de arranque: cantidad de personas + 1. Trabajando solo, 1 + 1 = 2.

El "+1" no es un redondeo: es la **válvula**. Cuando una tarjeta queda esperando algo
que no depende de mí —una corrida de CI, una respuesta, una revisión— necesito poder
avanzar en otra cosa sin romper el acuerdo. Con límite 1 me quedaría bloqueado cada
vez que algo espera; con límite 2 tengo exactamente una holgura.

**Qué me haría subirlo:** que el trabajo se trabe seguido por dependencias externas
reales, no por haber empezado demasiadas cosas.

**Qué señal me diría que quedó demasiado alto:** que nunca lo alcance. Un límite que
nunca se toca no está limitando nada — es decoración.

**Y si lo subiera a diez:** dejaría de limitar por completo. Diez tarjetas en
progreso significan diez cosas al 60% y **cero terminadas**. El trabajo empezado y no
terminado no es productividad: es *inventario*, y el inventario tiene costo —más
cambio de contexto, más ramas viejas, más conflictos al integrar. Es la traducción
operativa de "empezar menos, terminar más".

Ojo con un matiz que conviene tener claro: **la herramienta no bloquea**. GitHub pone
el contador de la columna en rojo y te deja pasar igual. El límite es un acuerdo del
equipo, no un candado.

### El diagnóstico de la historia mal escrita

La historia del ejercicio:

> *"Como desarrollador quiero crear la tabla usuarios para guardar los datos."*

**Por qué está mal:** es una **tarea disfrazada de historia**. Falla en las tres
partes del formato:

- **El rol está mal elegido.** El usuario de una historia es *quien recibe el valor*,
  no quien programa. El desarrollador es quien la implementa, nunca su beneficiario.
- **La capacidad fija el CÓMO, no el QUÉ.** "Crear la tabla usuarios" es una decisión
  técnica —podría ser una tabla, un documento, un archivo—. El cómo es del equipo; la
  historia debería decir qué capacidad gana alguien.
- **El beneficio no es un beneficio.** "Para guardar los datos" repite el qué con
  otras palabras. No explica qué mejora para nadie, así que no permite priorizarla.

Además viola dos letras de INVEST: no es **V**aliosa (nadie "quiere" una tabla: es un
medio) ni **T**esteable (no hay forma de demostrarle a alguien que "la tabla existe"
le sirvió para algo).

**Cómo la reescribiría**, sobre el dominio de mi app:

> *Como recepcionista del consultorio quiero que los turnos que cargo queden
> guardados entre sesiones para no tener que volver a cargarlos cada mañana.*
>
> **Criterios de aceptación**
> - Un turno cargado sigue apareciendo después de cerrar y reabrir la aplicación
> - Los turnos sobreviven al reinicio del sistema
> - Al reiniciar borrando el almacenamiento, la lista vuelve vacía

Ahora el rol es quien recibe valor, la capacidad no fija implementación (podría
resolverse con cualquier motor de base de datos), el beneficio explica por qué
importa, y los tres criterios se pueden verificar parándose frente a la pantalla.

### Estructura entregada

```
#12  EPIC: Pipeline DevOps completo para mi app          [epic]    OPEN
  └─ #13  CI: build y tests automáticos en cada PR       [story]   OPEN
       ├─ #14  Escribir el workflow de build y tests     [task]    CLOSED ← por el PR #17
       └─ #15  Publicar el reporte de tests como artefacto [task]  OPEN

#16  El front muestra "Error 502" cuando el backend
     todavía no responde                                 [bug]     OPEN
```

La jerarquía se armó con **sub-issues**, no con task-lists: las task-lists no crean la
relación padre-hijo navegable, que es justamente lo que permite subir de la tarea a su
historia y de ahí a la épica.

**La épica no lleva criterios de aceptación** a propósito: no se verifica por sí misma,
se da por cerrada cuando sus historias están cerradas. Los criterios van donde algo se
puede comprobar.

**El bug va al costado, no colgando de nadie.** La jerarquía cuenta lo que se planificó
construir; un bug es un defecto de algo *ya construido*, así que no formaba parte del
plan. Y colgarlo de la historia que lo originó haría que la barra de progreso de esa
historia mienta.

Sobre el bug: elegí uno **real de mi aplicación** en vez del genérico del video. Lo
reproduje antes de reportarlo — `docker compose stop backend` y después pedirle
`/api/turnos` al frontend devuelve una página HTML de nginx con código 502, que
`frontend/src/api.js` no puede parsear como JSON y termina mostrando el texto crudo
"Error 502" al usuario.

### La trazabilidad

El PR #17 implementa **una** de las dos tareas de la historia (la #14) y la cierra
sola con `Closes #14` en la descripción. La cadena completa queda navegable:

```
tarea #14 (cerrada) → PR #17 → commit → historia #13 → épica #12
```

Dos detalles que importan y son fáciles de errar:

- El número que va en `Closes` es el de **la tarea**, no el de la historia. Un PR
  implementa una tarea concreta. Si cerrara la historia, la estaría dando por
  terminada con la mitad del trabajo sin hacer, y la trazabilidad quedaría mintiendo.
- La palabra clave va en la **descripción del PR**. Por mensaje de commit el issue
  igual se cierra, pero **no queda enlazado al PR** — y ese enlace es justamente lo
  que se navega al corregir.

**La historia se entrega abierta.** Solo está cerrada la tarea que cerró el PR; la
otra tarea y la historia siguen abiertas porque el trabajo continúa en el TP4.

### Problemas encontrados y cómo los resolví

**1. El CLI de `gh` no puede crear campos de tipo Iteration — pero la API sí.**
`gh project field-create --data-type` solo acepta `TEXT`, `SINGLE_SELECT`, `DATE` y
`NUMBER`. Di por sentado que la limitación venía de la plataforma y me equivoqué: al
introspeccionar el esquema GraphQL, el enum `ProjectV2CustomFieldType` **sí** incluye
`ITERATION`, y `createProjectV2Field` acepta un `iterationConfiguration`. El campo se
creó por API.

Lo que **sí** es genuinamente web-only es el **límite de la columna**: lo verifiqué
introspeccionando el tipo `ProjectV2View`, que no expone ninguna configuración de
límites por columna. Ese paso se hizo a mano.

La lección práctica: cuando el CLI no puede algo, conviene revisar la API antes de
resignarse — el CLI es un envoltorio parcial, no el límite de la plataforma.

Es un buen ejemplo de algo que el enunciado insinúa sin decirlo: *"para uno, la web;
para varios, el comando"*. Lo repetitivo (crear cinco issues, colgar la jerarquía,
asignar estados) se automatiza; lo que se configura una sola vez, no vale la pena.

**2. Quedó un Project vacío de un intento anterior.** Al explorar la interfaz se creó
un segundo proyecto sin título. El entregable es el Project #1; el otro se elimina para
que no haya ambigüedad sobre cuál mirar.

> ⚠️ **AUGUSTO: agregá acá lo que te haya pasado a vos** configurando el board, el
> campo Iteration o el límite de WIP.

### Declaración de uso de IA

> ⚠️ **AUGUSTO: completar.**

---

## TP4 — CI: Pipelines as Code

### Estructura del pipeline: por qué esos jobs y por qué en paralelo

Dos jobs, `build-backend` y `build-frontend`, uno por cada Dockerfile que tiene la
aplicación. No es una división arbitraria: es la que ya existía en el TP2, y el
pipeline la refleja en vez de inventar otra.

**Corren en paralelo porque no dependen uno del otro.** El frontend no necesita nada
que produzca el backend, así que serializarlos solo agregaría espera. Con dos jobs
paralelos el pipeline tarda lo que tarda el más lento, no la suma.

La contracara, y es lo que hay que tener presente: **dos jobs no comparten nada**.
Cada uno corre en su propia máquina limpia y efímera, sin filesystem común. Si mañana
uno necesitara algo que produce el otro, tendría que viajar como artefacto o
declararse con `needs:` para forzar el orden — y eso costaría el paralelismo.

Hay un beneficio secundario que se nota al fallar: cuando el build del frontend se
rompió, `build-backend` siguió en verde. El check en rojo señala **exactamente** dónde
está el problema, sin tener que leer un log gigante.

### Qué cachea, y qué pasa si el cache desaparece

**Qué se cachea: las capas de las imágenes**, no dependencias ni artefactos. Docker
construye en capas —cada `RUN`, `COPY` y `ADD` deja una— y si una capa no cambió se
puede reutilizar en lugar de rehacerla.

Se guardan en el **cache de GitHub Actions** (`type=gha`), que no es el Docker de mi
máquina ni el del runner: el runner nace vacío en cada corrida.

Verificado en la segunda corrida del PR #20, sobre el backend:

```
#12 [build 4/6] RUN npm ci
#12 CACHED
#13 [build 6/6] RUN npm prune --omit=dev
#13 CACHED
#14 [final 3/5] COPY --from=build /app/node_modules ./node_modules
#14 CACHED
```

Diecisiete capas reutilizadas entre los dos jobs. Que la capa del `npm ci` se
reutilice es consecuencia directa de cómo está escrito el Dockerfile del TP2: copia
`package*.json` e instala **antes** de copiar el código, así que cambiar una línea de
código no invalida la instalación de dependencias.

**Qué pasa si el cache desaparece: nada, salvo que tarda más.** La plataforma lo
desaloja cuando quiere y tiene límite de tamaño, así que no es una garantía sino una
optimización. Mi pipeline funciona idéntico sin él: reconstruye todas las capas desde
cero y da el mismo resultado.

Y la reversa, que es la propiedad importante: **si el pipeline *fallara* sin cache, no
tendría un cache — tendría una dependencia escondida, y eso es un bug.** Un cache no
puede ser un requisito para que algo funcione; solo puede acelerarlo.

Un detalle contraintuitivo que conviene aclarar antes de que lo pregunten: **la
segunda corrida no necesariamente tarda menos.** Guardar el cache también cuesta —al
terminar, la corrida sube las capas al almacén— y cada corrida cae en una máquina
distinta. En un proyecto de este tamaño la ganancia es chica. La evidencia de que el
cache funciona es la palabra `CACHED` en el log, no el cronómetro.

### Por qué el pipeline construye con mi Dockerfile

Porque mi aplicación **ya se construye de una manera**: el Dockerfile multi-stage del
TP2. El pipeline no inventa otra, usa ésa.

Si el workflow compilara por su cuenta —con `npm ci` y `npm run build` escritos en el
YAML— tendría **dos definiciones de build** que tarde o temprano divergen: alguien
cambia una y se olvida de la otra. A partir de ahí estaría verificando una compilación
distinta de la que después se despliega, que es exactamente el "pero en QA andaba" con
otro disfraz. La imagen que se verifica tiene que ser la misma que corre.

El efecto lateral es elegante: **en mi workflow no hay una sola línea de Node.** El
pipeline no sabe qué hay adentro del contenedor — solo le pide a Docker que construya
un contexto. Por eso el mismo archivo le serviría a un compañero con .NET, Java o
Python: lo que cambia es el Dockerfile, no el pipeline.

### La estrategia de branching, ahora elegida y justificada

En el TP1 la cátedra dio las reglas porque todavía no había experiencia para elegirlas.
Con el flujo funcionando y un pipeline encima, la decisión es mía.

**Sigo con GitHub Flow**, y ahora con argumentos propios:

- **GitFlow resuelve un problema que no tengo.** Sus ramas permanentes (`develop`,
  `release/`, `hotfix/`) existen para mantener varias versiones en soporte simultáneo.
  Yo tengo una sola versión desplegable: esa estructura sería burocracia sin beneficio.
- **Trunk-based necesita algo que todavía no tengo.** Para integrar trabajo a medio
  hacer sin romper nada hacen falta *feature flags* y una red de tests que ataje.
  Los tests llegan en el TP5. Adoptarlo hoy sería quedarme con el riesgo sin la red.
- **GitHub Flow es lo que mi repositorio ya hace cumplir.** La protección de `main`
  exige que todo entre por Pull Request; GitHub Flow es trunk-based más esa
  formalidad. Elegir otra cosa sería contradecir mi propia configuración.

**Y sigo con squash**, por tres razones:

- `main` queda lineal y legible: un commit = un Pull Request.
- Revertir es trivial: un PR entero es un solo commit.
- El paso a paso interno de un PR vale poco cuando los PRs son chicos, y no se pierde:
  sigue vivo **en el PR**. En el #4, el commit que resolvió el conflicto está ahí
  aunque `main` haya recibido uno solo.

Con una advertencia que aprendí en carne propia: **el squash aplasta todo lo que la
rama tenga**, incluido lo que no debería estar. En el PR #1 se llevó un commit de
prueba que se había colado. No es un argumento contra squash — es la razón por la que
hay que leer el diff antes de mergear.

*(Ojo con el conteo: el fast-forward no es una opción del botón de merge. Es lo que
pasa automáticamente cuando `main` no avanzó desde que salió la rama. Las opciones
reales son tres.)*

### El gate

`main` ahora exige **dos condiciones** para aceptar un merge, y hacen falta las dos:

1. Que el cambio entre por Pull Request — la puerta del TP1
2. Que `build-backend` y `build-frontend` estén en verde — la verificación de hoy

La puerta sin verificación no alcanza (entra cualquier cosa revisada a ojo), y la
verificación sin puerta tampoco (el pipeline informa pero nadie está obligado a
mirarlo). El pipeline es **exactamente el mismo** con gate y sin gate: lo único que
cambia es una casilla de configuración del repositorio.

**`strict: true`** agrega que la rama tenga incorporado el `main` actual antes de
mergear. Se demostró con el PR #21: quedó abierto mientras se mergeaba el #22, su
verde quedó viejo —se había sacado contra un `main` que ya no existía— y tuvo que
incorporar `main` y volver a correr el pipeline **sobre la mezcla**. Con un solo PR
abierto ese mecanismo no se puede ver.

**Los `contexts` son el id del job**, no su nombre para humanos. Solo valen mientras
el job no declare un `name:`; si se lo agregara, el gate quedaría esperando un check
que ya no existe y bloquearía todos los merges.

### La demostración del gate

PR #22, con la secuencia completa en su historial:

| Paso | Qué pasó |
|---|---|
| Rotura | `import` a `./utilidades-que-no-existen.js` en `App.jsx` |
| Verificación local | `docker build ./frontend` → exit 1, `Could not resolve …` |
| Corrida 1 | `build-frontend` **failure** · `build-backend` success |
| Merge | **Bloqueado**: `the base branch policy prohibits the merge` |
| Fix | Commit que saca el import |
| Corrida 2 | Los dos en **success**, el pipeline re-corrió solo |
| Merge | Destrabado y mergeado |

El PR se **mergeó**, no se cerró: así queda en el historial con sus dos commits y sus
dos corridas, que es la evidencia.

**Por qué rompí el frontend y no el backend.** Es una diferencia de stack que vale la
pena explicar. El frontend **se empaqueta**: Vite resuelve los imports durante el build
y falla si un archivo no existe. El backend, en cambio, es Express — **ni compila ni
se empaqueta**: su Dockerfile hace `npm ci`, copia el código y nada más. Nunca lo
ejecuta. Si hubiera escrito un import roto en `backend/src/index.js`, **el pipeline
habría dado verde igual**, y el error habría aparecido recién al arrancar el
contenedor, cosa que el pipeline no hace. Para romper el backend habría tenido que
romper una **dependencia** (un paquete inexistente en su `package.json`, que hace
fallar el `npm ci`).

Es una limitación real de lo que un pipeline de build puede verificar en un stack
interpretado, y se resuelve en el TP5: con tests, el pipeline sí ejecuta el código.

### El badge

```markdown
[![CI](.../actions/workflows/ci.yml/badge.svg)](.../actions/workflows/ci.yml)
```

**Son dos URLs, no una.** La de adentro es la imagen; la de afuera es adónde lleva al
hacerle clic. Escribiendo solo la imagen el badge se ve igual, pero al clickearlo se
abre el SVG suelto — una página en blanco. Y usa el nombre del **archivo**
(`ci.yml`), no el `name:` del workflow: renombrar el archivo rompe el badge.

### Problemas encontrados y cómo los resolví

**1. Fijé versiones de actions distintas a las de la guía.** La guía usa
`actions/checkout@v6`, `docker/setup-buildx-action@v4` y `docker/build-push-action@v7`.
Usé `@v4`, `@v3` y `@v6` respectivamente, que verifiqué que funcionan en la corrida
real. La decisión de fondo es la misma que explica la guía: **la versión se fija a
propósito**. Sin fijarla (`@main`), el pipeline cambiaría solo el día que sus autores
publiquen algo — un pipeline que se modifica sin que nadie lo haya tocado es
exactamente lo que Pipeline as Code viene a evitar.

**2. El `PUT` de la protección reescribe todo, no agrega.** Antes de configurar el
gate respaldé la protección existente, porque todo campo omitido en el JSON vuelve a
su default: si no hubiera re-declarado `required_approving_review_count: 0` y
`enforce_admins: true`, habría perdido silenciosamente lo configurado en el TP1.
Verifiqué el estado después de aplicarlo, no solo antes.

**3. El orden importa y el enunciado avisa por qué.** El gate solo puede exigir checks
que ya corrieron, así que la configuración va **después** de la primera corrida. Y la
demostración del gate va **después** de mergear el PR del workflow: si ese PR siguiera
abierto, en `main` quedaría el esqueleto del TP3 —que solo hace checkout— y daría
verde sobre código que no compila.

> ⚠️ **AUGUSTO: agregá acá lo que te haya pasado a vos.**

### Declaración de uso de IA

> ⚠️ **AUGUSTO: completar.**
