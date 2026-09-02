# TP4 — CI: Pipelines as Code

> **Peso en P1: 45%** — el más pesado. Evaluación: 25% configuración técnica ·
> 25% `decisiones.md` · 50% defensa oral. **Sin `evidencias.md`**: el repo es público
> y las corridas, los checks y el badge se ven solos.
> Enunciado: [`ingsoft3ucc/TPs_2026/trabajos/04-ci-pipelines.md`](https://github.com/ingsoft3ucc/TPs_2026/blob/main/trabajos/04-ci-pipelines.md)

## Checklist del enunciado

| # | Requisito | Estado |
|---|---|---|
| 1 | Workflow en el repo, entrado por PR, corriendo en cada PR y cada push a `main` | ✅ |
| 2 | Build de backend y frontend **en paralelo**, con los Dockerfiles del TP2 | ✅ |
| 3 | **Cache de capas** funcionando: segunda corrida con `CACHED` | ✅ 17 capas |
| 4 | **Required status checks** activos sobre `main` | ✅ + `strict` |
| 5 | **Demostración del gate**: rojo → bloqueado → fix → verde → merge | ✅ PR #22 |
| 6 | **Status badge** en el README | ✅ `passing` |
| 7 | `decisiones.md` con las cinco cosas | ✅ con la declaración de IA |
| 8 | Tag `v4.0.0` + release | ✅ `v4.0.0` sobre `54d0277` |

---

## 1 · El workflow

```yaml
name: CI

on:
  pull_request:
    branches: [main]      # verifica ANTES del merge: alimenta al gate
  push:
    branches: [main]      # constancia de main: la corrida que lee el badge
                          # y la que deja el cache para todos

jobs:
  build-backend:
    runs-on: ubuntu-latest
    steps:
      - name: Que estamos verificando
        env:
          RAMA: ${{ github.head_ref || github.ref_name }}
        run: echo "Rama $RAMA · commit $GITHUB_SHA"
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/build-push-action@v6
        with:
          context: ./backend
          push: false
          tags: backend:ci
          cache-from: type=gha,scope=backend
          cache-to: type=gha,mode=max,scope=backend

  build-frontend:
    # ... idéntico, con context: ./frontend y scope=frontend
```

### Los dos triggers, y por qué los dos

| Trigger | Para qué |
|---|---|
| `pull_request` | **El que hace el trabajo.** Verifica lo que *quiere* integrarse, antes del merge. Es lo que alimenta al gate |
| `push` a `main` | Deja constancia de cómo quedó `main`. Es la corrida que **lee el badge**, y la que deja el **cache** que después aprovecha cualquier PR nuevo |

### El detalle de `RAMA` que casi nadie nota

```yaml
RAMA: ${{ github.head_ref || github.ref_name }}
```

En un Pull Request, `GITHUB_REF_NAME` **no** vale el nombre de tu rama: vale
`<numero>/merge`, porque GitHub construye una mezcla de tu rama con `main` y corre el
pipeline sobre eso. Si se usara a secas, el log diría `22/merge` y nadie entendería qué
rama se está verificando. `github.head_ref` sí es la rama real.

Ese detalle, además, explica algo conceptual: **el pipeline de un PR no verifica tu
rama — verifica el merge que todavía no existe.**

### Qué NO hay en este archivo

**Ni una línea de Node.** El workflow no sabe cómo se construye la app: eso lo sabe el
Dockerfile. Por eso este mismo archivo le serviría a alguien con .NET o Python.

---

## 2 · El cache

### La distinción que se pregunta

| | Qué es |
|---|---|
| **Artefacto** | Lo que el build **produce** y querés conservar |
| **Cache** | Lo que el build **ya hizo una vez** y no hace falta rehacer |

**Este pipeline no guarda ningún artefacto, a propósito.** Las dos imágenes nacen y
mueren en el runner. Está bien: el lugar de una imagen es un **registry**, no el
almacén de artefactos. La salida del pipeline hoy es el **check en verde que habilita
el merge**.

### Las tres piezas, y qué pasa sin cada una

| Pieza | Qué hace | Si falta |
|---|---|---|
| `setup-buildx-action` | Pone un constructor que sabe exportar capas a un almacén externo | **El build FALLA**: `Cache export is not supported for the docker driver` |
| `cache-from` / `cache-to` | Traer y guardar las capas | Construye todo de cero siempre |
| `type=gha` | El almacén: el cache de GitHub Actions | — |
| `mode=max` | Guarda también las capas intermedias | Con el default guarda muchas menos |
| `scope=backend` / `scope=frontend` | El estante de cada job | **Se pisan.** Sin error: un job muestra `CACHED` y el otro no, y cuál cambia en cada corrida |

El `setup-buildx` hace falta porque **el constructor de fábrica guarda las capas en el
disco de la máquina** — y esa máquina se destruye al terminar el job. Guardarlas ahí
no sirve de nada.

### La evidencia

Segunda corrida del PR #20, backend:

```
#12 [build 4/6] RUN npm ci
#12 CACHED
#13 [build 6/6] RUN npm prune --omit=dev
#13 CACHED
#14 [final 3/5] COPY --from=build /app/node_modules ./node_modules
#14 CACHED
```

**17 capas reutilizadas** entre los dos jobs.

Que la capa del `npm ci` se reutilice es consecuencia directa del orden del Dockerfile
del TP2: copia `package*.json` e instala **antes** de copiar el código.

### Las dos corridas tienen que ser secuenciales

El cache se sube **al final** de la corrida. Si se pushean dos commits seguidos, las
corridas se solapan y la segunda no reutiliza nada. Por eso: push → **esperar a que
termine** → `git commit --allow-empty` → segunda corrida.

Y tienen que ser del **mismo PR**: una corrida puede traer capas guardadas por su
propia rama y por la rama base, no por otras ramas ni otros PRs.

> ⏱️ **No mires el cronómetro, mirá el log.** La segunda corrida puede tardar **más**:
> guardar el cache también cuesta y cada corrida cae en una máquina distinta. **La
> evidencia es la palabra `CACHED`.**

---

## 3 · El gate

### Lo que se aplicó

```json
{
  "required_pull_request_reviews": { "required_approving_review_count": 0 },
  "required_status_checks": {
    "strict": true,
    "contexts": ["build-backend", "build-frontend"]
  },
  "enforce_admins": true,
  "restrictions": null
}
```

`main` ahora exige **dos condiciones**, y hacen falta las dos:

1. Que el cambio entre por PR — la puerta del **TP1**
2. Que los dos checks estén en verde — la verificación de **hoy**

### Tres precauciones que se tomaron

**El `PUT` reescribe la protección entera.** Todo campo omitido vuelve a su default.
Antes de aplicarlo se respaldó la protección existente, y se re-declararon
`approvals: 0` y `enforce_admins: true` en el mismo JSON. Verificado después, no solo
antes.

**Los `contexts` son el id del job.** Solo valen mientras el job no declare un `name:`.
Agregarle uno dejaría al gate esperando un check inexistente, bloqueando todos los
merges.

**El orden.** El gate solo puede exigir checks que ya corrieron (el buscador de la web
solo ofrece los de los últimos 7 días), así que va después de la primera corrida.

### `strict: true`, demostrado

El PR #21 quedó abierto mientras se mergeaba el #22. Su verde quedó viejo —se había
sacado contra un `main` que ya no existía— y tuvo que **incorporar `main`** y volver a
correr el pipeline sobre la mezcla:

```
8d14bbc  docs: enlaza el TP4 en la tabla de la bitacora
3174ce5  Merge branch 'main' into docs/tabla-de-practicos   ← el update-branch
```

**Con un solo PR abierto este mecanismo no se puede ver.** Por eso hubo que dejar uno
de relleno.

---

## 4 · La demostración del gate — PR #22

| Paso | Qué pasó |
|---|---|
| Rotura | `import { formatearFecha } from './utilidades-que-no-existen.js'` en `App.jsx` |
| Verificación local | `docker build ./frontend` → exit 1 · `Could not resolve …` |
| Corrida 1 | `build-frontend` **failure** · `build-backend` success |
| Merge | **Bloqueado** · `the base branch policy prohibits the merge` |
| Fix | Commit que saca el import |
| Corrida 2 | Los dos **success**, re-corrió solo al pushear |
| Merge | Destrabado y **mergeado** |

Un matiz que se ve en la API y vale la pena entender:

```
mergeable: MERGEABLE     ← no hay conflictos de Git
estado:    BLOCKED       ← pero la política lo frena
```

Son dos cosas distintas: que el merge sea *posible* no significa que esté *permitido*.

**El PR se mergeó, no se cerró.** Así queda en el historial con sus dos commits y sus
dos corridas, que es exactamente la evidencia que se pide.

### Por qué se rompió el frontend y no el backend

Es una diferencia de stack que conviene poder explicar:

| Servicio | Tipo | Romper el código |
|---|---|---|
| **frontend** (React/Vite) | **Se empaqueta** | ✅ Falla: Vite resuelve los imports durante el build |
| **backend** (Express) | **Ni compila ni se empaqueta** | ❌ **No falla**: el Dockerfile copia el código, nunca lo ejecuta |

Si se hubiera roto el código del backend, **el pipeline habría dado verde igual**, y el
error habría aparecido recién al arrancar el contenedor — cosa que el pipeline no hace.
Para romperlo habría que romper una **dependencia** (un paquete inexistente en su
`package.json`, que hace fallar el `npm ci`).

Es una limitación real de lo que un pipeline de *build* puede verificar en un stack
interpretado. Se resuelve en el **TP5**: con tests, el pipeline sí ejecuta el código.

---

## 5 · Preguntas de defensa — con su respuesta

### ¿Qué es integración continua? ¿Puede haber CI sin pipeline? ¿Y pipeline sin CI?

CI es **integrar el trabajo con frecuencia, verificando cada integración
automáticamente**. Es una práctica, no una herramienta.

**Sí, las dos.** CI sin pipeline: disciplina de integrar a diario más un script que
corre los tests. Pipeline sin CI: ramas eternas y un pipeline decorativo que nadie
mira. La práctica es lo que cuenta.

### ¿Qué dispara tu workflow? ¿Diferencia entre `push` y `pull_request`?

`pull_request` contra `main` y `push` a `main`.

`pull_request` es el importante: verifica **antes** del merge, sobre el resultado
propuesto, y es lo que alimenta al gate — **evita** que algo roto entre.
`push` corre **después**, sobre lo que ya entró: **avisa**. Sirve para el badge y para
dejar el cache en la rama base.

### ¿Por qué tus jobs corren en paralelo? ¿Qué NO comparten dos jobs?

Porque no dependen uno del otro. Serializarlos solo agregaría espera.

**No comparten nada**: cada uno corre en su propia máquina limpia y efímera, sin
filesystem común. Si uno necesitara algo del otro, tendría que viajar como artefacto o
declararse con `needs:` — y eso costaría el paralelismo.

### ¿Qué produce tu pipeline y dónde queda? ¿Qué es el cache y qué pasa si desaparece?

Produce dos imágenes que **nacen y mueren en el runner**, a propósito: el lugar de una
imagen es un registry. Lo que el pipeline entrega es el **check en verde que habilita
el merge**.

El cache son las **capas de las imágenes**, guardadas en el almacén de GitHub Actions.
Si desaparece, el pipeline funciona igual, **solo más lento**. Y la reversa importa: si
*fallara* sin cache, no tendría un cache — tendría una dependencia escondida, y eso
sería un bug.

### ¿Por qué construye con el Dockerfile en vez de compilar por su cuenta?

Porque si el workflow compilara solo, tendría **dos definiciones de build** que tarde o
temprano divergen, y estaría verificando una compilación distinta de la que después se
despliega. La imagen que se verifica tiene que ser la misma que corre.

Efecto lateral: en mi workflow no hay una línea de Node. El mismo archivo le serviría a
cualquier stack.

### Mostrame el PR donde el gate bloqueó un merge. ¿Qué dos condiciones exige tu `main`?

El PR #22: check rojo, `the base branch policy prohibits the merge`, después el fix,
verde, y mergeado.

Dos condiciones, y hacen falta las dos: **que entre por Pull Request** (TP1) y **que
los dos checks estén en verde** (TP4). La puerta sin verificación no alcanza; la
verificación sin puerta tampoco.

### ¿Qué significa `strict: true`?

Que la rama tenga incorporado el `main` actual antes de mergear. Sin eso, el verde
puede ser viejo: se sacó contra un `main` que ya cambió. Lo demostré con el PR #21,
que quedó desactualizado al mergear el #22 y tuvo que incorporar `main` y volver a
correr el pipeline sobre la mezcla.

### Si mañana migrás a Azure Pipelines, ¿qué sobrevive y qué cambia?

**Sobrevive todo lo conceptual**: los triggers, la idea de jobs paralelos en máquinas
efímeras, el cache de capas, construir con el Dockerfile en vez de compilar aparte, y
el pipeline como requisito de merge.

**Cambian los nombres y la sintaxis**: el archivo pasa a `azure-pipelines.yml`, los
jobs se agrupan en *stages*, las actions se llaman *tasks*, el runner se llama *agent*,
y el gate deja de ser *required status checks* para ser una *build validation* en las
branch policies.

---

## 6 · Uso de IA

La declaración formal vive en `decisiones.md`, al cierre de la sección `## TP4` —
**está completa**.

En resumen: la IA escribió el workflow, configuró el gate contra la API de GitHub y
redactó el borrador de la sección. Lo decidido de forma propia fue **qué romper para
demostrar el gate, y por qué**: se eligió el frontend sabiendo que el backend no habría
servido — Express ni compila ni se empaqueta, así que su Dockerfile copia el código sin
ejecutarlo nunca y un import roto habría dado verde igual. También fue propia la
elección y justificación de la estrategia de branching, que el TP1 dejaba pendiente para
este práctico.

Cómo se verificó:

- La rotura se comprobó **primero en la máquina local**, con `docker build ./frontend`,
  antes de subirla. El error fue el mismo que después dio el runner:
  `Could not resolve "./utilidades-que-no-existen.js"`.
- El cache se verificó **leyendo el log y buscando `CACHED`**, no mirando el cronómetro:
  17 capas reutilizadas. El tiempo no es evidencia válida — guardar el cache también
  cuesta, y una segunda corrida puede tardar más.
- El bloqueo se provocó a propósito, intentando mergear con el check en rojo, para leer
  el rechazo de primera mano: `the base branch policy prohibits the merge`.
- Antes de tocar la protección de rama se respaldó la existente, porque el `PUT` la
  reescribe entera, y se verificó **después** de aplicarla que `approvals: 0` y
  `enforce_admins: true` siguieran en pie.

> 📌 **Nota sobre el tag.** `v4.0.0` quedó sobre `54d0277` (PR #24). El PR #25, que
> completó las declaraciones de uso de IA de los cuatro prácticos, se mergeó después —
> dentro del plazo, pero posterior al tag. La versión completa de `decisiones.md` está en
> `main`, que es lo que se corrige; el tag apunta al commit anterior. Si hiciera falta
> alinearlo, se mueve con `git tag -f v4.0.0 && git push -f origin v4.0.0`.
