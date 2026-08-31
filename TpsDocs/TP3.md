# TP3 — Planificación y trazabilidad

> **Peso en P1: 10%** · Evaluación: 25% configuración técnica · 25% `decisiones.md` ·
> 50% defensa oral. **Sin `evidencias.md`**: el Project es público y se ve solo.
> Enunciado: [`ingsoft3ucc/TPs_2026/trabajos/03-planificacion-devops.md`](https://github.com/ingsoft3ucc/TPs_2026/blob/main/trabajos/03-planificacion-devops.md)

## La diferencia con el TP2

En el TP2 la guía era un **ejemplo** sobre la app de la cátedra y la entrega era otra
cosa. Acá **lo que la guía hace ES la entrega**: la épica, la historia con sus
criterios, las dos tareas, el bug, la jerarquía, el tablero y el PR se reproducen tal
cual sobre el repositorio propio.

Lo único que se decide —y lo único que se defiende de verdad— son **tres cosas**:

1. La duración del sprint, con su porqué
2. El límite de trabajo en progreso, con su porqué
3. El diagnóstico de la historia mal escrita

> Copiar el procedimiento está bien. No poder explicarlo, no.

## Checklist del enunciado

| # | Requisito | Estado |
|---|---|---|
| 1 | Project **público** | ✅ |
| 2 | Labels `epic` / `story` / `task` (`bug` viene de fábrica) | ✅ |
| 3 | 1 épica, sin criterios de aceptación | ✅ #12 |
| 4 | 1 historia formato *Como… quiero… para…* + criterios | ✅ #13 |
| 5 | 2 tareas de esa historia | ✅ #14 #15 |
| 6 | 1 bug, **al costado** de la jerarquía | ✅ #16 |
| 7 | Jerarquía navegable por **sub-issues** | ✅ |
| 8 | Sprint con duración justificada | ✅ campo `Sprint`, iteraciones de 7 días |
| 9 | Board con automatización mínima | ✅ vista *Tablero* · automatización verificada |
| 10 | Límite de WIP configurado | ⬜ (web) |
| 11 | 1 PR mergeado que cierra su issue solo | ✅ PR #17 → cierra #14 |
| 12 | `decisiones.md` con las 5 cosas | ✅ falta declaración de IA |
| 13 | Tag `v3.0.0` + release | ✅ |

---

## 1 · La estructura

```
#12  EPIC: Pipeline DevOps completo para mi app          [epic]    OPEN
  └─ #13  CI: build y tests automáticos en cada PR       [story]   OPEN
       ├─ #14  Escribir el workflow de build y tests     [task]    CLOSED
       └─ #15  Publicar el reporte de tests como artefacto [task]  OPEN

#16  El front muestra "Error 502" cuando el backend
     todavía no responde                                 [bug]     OPEN
```

### Los tres niveles y qué pregunta responde cada uno

La jerarquía **no es burocracia: es zoom**. Cada nivel contesta algo distinto.

| Nivel | Pregunta | Tamaño | El de este repo |
|---|---|---|---|
| **Épica** | ¿Qué valor grande perseguimos? | Semanas / meses | Pipeline DevOps completo |
| **Historia** | ¿Qué incremento observa alguien? | Días | Build y tests en cada PR |
| **Tarea** | ¿Qué hago hoy? | Horas | Escribir el workflow |
| **Bug** | — (no es un nivel) | — | El 502 del front |

El cliente razona a nivel épica-historia; el equipo ejecuta a nivel tarea.

### Por qué la épica no lleva criterios de aceptación

Porque **no se verifica por sí misma**: se da por cerrada cuando sus historias están
cerradas. Los criterios de aceptación van donde algo se puede comprobar, y eso es la
historia.

### Por qué el bug va al costado

La jerarquía cuenta **lo que se planificó construir**. Un bug es un defecto de algo
**ya construido** — no era parte del plan, así que no cuelga de nadie. Y hay un efecto
práctico: colgarlo de la historia que lo originó haría que la barra de progreso de esa
historia, ya cerrada, pase a mentir.

Ahora bien, **no todo defecto es un bug**, y la diferencia es *cuándo* aparece:

| Cuándo aparece | Qué es en realidad | Dónde va |
|---|---|---|
| Con la historia **en curso** | No es un bug: la historia todavía no cumple sus criterios | Se arregla dentro de la historia |
| Sobre algo **ya entregado** | Un bug de verdad | Issue propio, al costado |

El principio que ordena las dos filas es uno: **una historia con defectos no está
terminada**. Si lo encontraste antes de cerrarla, no descubriste un bug — descubriste
que te faltaba trabajo.

### Sub-issues, no task-lists

La jerarquía se armó con **sub-issues** (`gh issue edit 12 --add-sub-issue 13`). Las
task-lists en el cuerpo del issue (`- [ ] #13`) son una alternativa **degradada**: no
crean la relación padre-hijo navegable, que es exactamente lo que el enunciado pide.

Requiere `gh` ≥ 2.94 para el flag. Verificado: 2.98.0.

### El bug es real, no el del video

El enunciado permite usar el bug genérico del video o uno propio (*"si preferís uno de
tu app, mejor todavía"*). Se eligió uno real y **se reprodujo antes de reportarlo**:

```bash
$ docker compose -f docker-compose.registry.yml stop backend
$ curl -s -w "\nHTTP %{http_code}\n" localhost:3000/api/turnos

<html>
<head><title>502 Bad Gateway</title></head>
...
HTTP 502
```

`frontend/src/api.js` asume que toda respuesta de error trae JSON con la clave
`error`. Cuando quien responde es **nginx** y no la API, el cuerpo es HTML: el
`.catch(() => ({}))` lo convierte en objeto vacío y el mensaje cae al fallback
genérico, mostrándole al usuario el texto crudo **"Error 502"**.

---

## 2 · El tablero

Dos vistas sobre los mismos items: **Backlog** (tabla) y **Tablero** (board por Status).

| Columna | Sprint | Items |
|---|---|---|
| **Todo** | Sprint 1 | #15 Publicar el reporte de tests como artefacto |
| **Todo** | — | #16 [bug] El front muestra "Error 502"… |
| **In Progress** | — | #12 EPIC: Pipeline DevOps completo |
| **In Progress** | Sprint 1 | #13 CI: build y tests automáticos en cada PR |
| **Done** | Sprint 1 | #14 Escribir el workflow (cerrada sola por el PR #17) |

*In Progress* tiene exactamente **2** items: justo en el límite de WIP.

### El campo Sprint

Iteraciones de **7 días**, la primera arrancando el 31/8. Asignado a la historia #13 y
a sus dos tareas #14 y #15 — el enunciado pide exactamente eso. La épica y el bug
quedan sin sprint a propósito: una épica dura meses y un bug todavía no se priorizó.

El campo se creó por la API GraphQL (`createProjectV2Field` con `dataType: ITERATION`).
**El CLI de `gh` no puede**: `gh project field-create` solo acepta `TEXT`,
`SINGLE_SELECT`, `DATE` y `NUMBER`. La API sí, con `iterationConfiguration`.

### El README del Project

El tablero lleva su propio README explicando cómo leerlo, con enlaces a `decisiones.md`
y a este documento. Así quien entre por el tablero llega a las decisiones, y quien entre
por el repositorio llega al tablero (está vinculado, pestaña *Projects*).

### La automatización, verificada

El workflow *"Item closed → Done"* del Project viene activado de fábrica y **funcionó
solo**: al mergear el PR #17, el issue #14 se cerró por el `Closes #14`, y su tarjeta
pasó a `Done` sin intervención.

Un matiz que conviene saber: ese workflow actúa sobre el **estado propio de cada
item**. **No** cierra una historia porque se hayan cerrado sus sub-issues — la barra
de progreso llega a `2/2` y la historia sigue abierta hasta que la cierres vos.

---

## 3 · La trazabilidad

```
tarea #14 (cerrada) → PR #17 → commit → historia #13 → épica #12
```

Verificado por API:

```
$ gh issue view 14 --json state
estado: CLOSED

$ (timeline del issue)
cerrado por PR #17: Esqueleto del workflow de build y tests
```

### Los dos detalles que se erran fácil

**El número va el de la TAREA, no el de la historia.** Un PR implementa una tarea
concreta, así que cierra esa tarea. Si cerrara la historia, la estaría dando por
terminada con la mitad del trabajo sin hacer.

**La palabra clave va en la DESCRIPCIÓN del PR.** Por mensaje de commit el issue igual
se cierra, pero **no queda enlazado al PR** — y ese enlace es justamente lo que se
navega al corregir. En un comentario posterior no funciona en absoluto.

Y una condición más: `Closes #N` solo cierra el issue si el PR apunta a la **rama por
defecto**. Un PR contra otra rama no cierra nada, y no avisa.

---

## 4 · El puente con el TP4

El PR #17 crea `.github/workflows/ci.yml` con el **esqueleto**: el disparador
`pull_request` y el checkout. Nada más.

```yaml
name: CI
on:
  pull_request:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Bajar el codigo al runner
        uses: actions/checkout@v4
```

**El TP4 reemplaza este archivo** por el pipeline real: dos jobs en paralelo que
construyen con los Dockerfiles del TP2, cache de capas, y el gate como requisito de
merge.

> ⚠️ **Trampa que el enunciado del TP4 marca:** antes de la demo del gate hay que tener
> **todos los PRs anteriores mergeados**. Si el PR del workflow sigue abierto, en `main`
> queda este esqueleto — que solo hace checkout y **da verde sobre código que no
> compila**. Se ve un tilde verde inexplicable y cuesta un rato entender por qué.

Efecto lateral útil: este workflow ya corrió una vez (5 segundos, en verde). El
buscador de *required status checks* del TP4 solo ofrece checks que corrieron en los
**últimos 7 días**, así que esa corrida destraba el paso siguiente.

---

## 5 · Preguntas de defensa — con su respuesta

### ¿Qué diferencia hay entre épica, historia y tarea? Mostrame las tres

Épica: objetivo grande que agrupa valor relacionado, dura semanas o meses — la mía es
el pipeline DevOps completo. Historia: un incremento de valor **observable por
alguien**, en días — que cada PR corra build y tests. Tarea: trabajo técnico concreto
dentro de una historia, en horas — escribir el workflow.

Las navego en el Project: abro la #14, subo a la #13 por *Parent issue*, y de ahí a la
#12.

### Tomá uno de tus criterios de aceptación: ¿cómo lo verificás? ¿Y por qué "que el CI funcione bien" no sirve?

*"Un test que falla bloquea el merge"* se verifica rompiendo el build a propósito y
mirando el botón de merge quedar deshabilitado. Es una observación, no una opinión.

*"Que el CI funcione bien"* no se puede verificar porque no dice **qué** tendría que
pasar. Dos personas mirando la misma pantalla podrían no ponerse de acuerdo sobre si
se cumple. Un criterio que no se puede comprobar no es un criterio.

### ¿Es una historia o una tarea disfrazada?

*(El diagnóstico completo está en `decisiones.md`.)* El usuario de una historia es
**quien recibe valor**, no quien programa. Nadie "quiere" una tabla: la tabla es un
medio. Y "para guardar los datos" no es un beneficio, es el mismo qué repetido.

### Mostrame el camino desde tu tarea cerrada hasta el commit, y de ahí hasta la épica

Project → tarjeta de #14 en Done → el issue muestra "closed by PR #17" → abro el PR →
pestaña Commits → el commit. Y hacia arriba: en #14, *Parent issue* es #13; en #13,
*Parent issue* es #12.

### ¿Por qué esa duración de sprint y ese límite de WIP? ¿Qué pasa si lo subo a diez?

*(En `decisiones.md`.)* Con diez deja de limitar: diez cosas al 60% y cero terminadas.
El trabajo empezado y no terminado es **inventario**, no productividad.

### ¿Por qué el bug no cuelga de la historia? ¿Y cómo sabés que es un bug y no trabajo que te faltó?

Porque la jerarquía cuenta lo planificado, y un bug es un defecto de algo ya entregado.
Y la diferencia es *cuándo* aparece: si lo encuentro con la historia en curso, no es un
bug — es que la historia todavía no cumple sus criterios. Este apareció sobre el TP2,
ya entregado.

### ¿Qué te da GitHub Projects que un Trello no?

**Datos enlazados**, no dos mundos sincronizados a mano. Acá el PR cierra el issue
solo, el issue guarda el enlace permanente al PR, y desde una línea de código puedo
navegar hasta el requerimiento que la originó — y al revés. En un Trello esa conexión
vive en la memoria de la gente: el plan dice una cosa y el código otra, y "¿esto ya
está hecho?" se contesta preguntando en el pasillo.

---

## 6 · Uso de IA

*(Va en `decisiones.md`. Completar.)*
