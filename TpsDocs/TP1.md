# TP1 — Git colaborativo

> **Peso en P1: 5%** · Evaluación: 25% configuración técnica · 25% `decisiones.md` +
> `evidencias.md` · 50% defensa oral.
> Enunciado: [`ingsoft3ucc/TPs_2026/trabajos/01-git-colaborativo.md`](https://github.com/ingsoft3ucc/TPs_2026/blob/main/trabajos/01-git-colaborativo.md)

## Objetivo

Dejar funcionando —y poder defender— el flujo con el que un equipo integra código:
ramas cortas, Pull Requests, protecciones sobre `main` y versionado de la entrega.
Los tres roles de un equipo (autor, reviewer, administrador) los ocupa una sola
persona.

## Checklist del enunciado

| # | Requisito | Estado |
|---|---|---|
| 1 | Repositorio **público** | ✅ |
| 2 | `.gitignore` en la raíz | ✅ |
| 3 | `main` protegida — imposible pushear directo, ni para el dueño | ✅ |
| 4 | Evidencia del rechazo del push directo | ⬜ captura pendiente |
| 5 | ≥ 2 PRs mergeados | ⬜ |
| 6 | ≥ 1 de ellos con **conflicto de merge resuelto** | ⬜ |
| 7 | Tag `v1.0.0` + release con notas | ⬜ |
| 8 | `decisiones.md` en la raíz | ⬜ |
| 9 | `evidencias.md` con las 4 capturas | ⬜ |

---

## 1 · Repositorio

- URL: https://github.com/AugustoBuhler/IngenieriaDeSoftwareIII-BuhlerAugusto
- Visibilidad: **pública**

El repositorio nació privado. Se pasó a público porque la materia lo exige
(reglamento §4) y, sobre todo, porque **GitHub no permite configurar protecciones de
rama en un repositorio privado con cuenta gratuita**. El intento de aplicar la
protección devolvió:

```
403 · Upgrade to GitHub Pro or make this repository public to enable this feature.
```

Ese error no menciona la visibilidad como causa, y es fácil confundirlo con un
problema de permisos del token.

```bash
gh repo edit --visibility public --accept-visibility-change-consequences
```

## 2 · Identidad de Git

Antes de commitear se fijó la identidad **a nivel repositorio** (no global):

```bash
git config --local user.name  "Augusto Bühler"
git config --local user.email "101875474+AugustoBuhler@users.noreply.github.com"
```

**Por qué el `noreply` y no el mail personal:** GitHub vincula un commit a un perfil
**por el email del autor**. Si el email del commit no está verificado en la cuenta,
el commit aparece con el nombre suelto, sin avatar, y **no cuenta en el gráfico de
contribuciones**. La dirección `<id>+<usuario>@users.noreply.github.com` siempre
resuelve al perfil correcto, y además evita publicar el mail personal en un
repositorio público.

Verificación:

```bash
git log --format='%an <%ae>'
```

## 3 · `.gitignore`

Archivo en la raíz, cubriendo el stack del semestre (Node + React + Vite):

```gitignore
# ---- Secretos: NUNCA se versionan ----
.env
.env.local
*.local

# ---- Dependencias ----
node_modules/

# ---- Artefactos de build ----
dist/
build/
coverage/
...
```

La línea que importa para el TP2 es **`.env`**: la disciplina del secreto arranca en
el primer commit, no cuando aparece la primera contraseña. Un valor sensible
commiteado en un repo público queda en el historial **para siempre** — borrarlo del
archivo no lo borra de la historia, se revoca.

Este commit entró **directo a `main`**, antes de configurar la protección — es el
orden que sigue la guía (§4.3 antes de §4.4). Todo lo que vino después entró por PR.

```
commit fc7a126 — chore: agrega .gitignore base y el contexto del proyecto
```

## 4 · Protección de `main`

Aplicada por API en vez de por la web, para que quede reproducible:

```bash
gh api --method PUT "repos/{owner}/{repo}/branches/main/protection" --input - <<'EOF'
{
  "required_pull_request_reviews": { "required_approving_review_count": 0 },
  "required_status_checks": null,
  "enforce_admins": true,
  "restrictions": null
}
EOF
```

Estado verificado:

```json
{ "pr_obligatorio": true, "approvals": 0, "enforce_admins": true }
```

### Por qué cada opción

| Opción | Por qué |
|---|---|
| `required_pull_request_reviews` | Es la regla del juego: nada entra a `main` sin pasar por un PR. |
| `required_approving_review_count: 0` | El TP es **individual**, y GitHub **nunca** deja aprobar tu propio PR — no es configurable: la UI aparece deshabilitada y la API devuelve `422 — Can not approve your own pull request`. Con 1 approval no se podría mergear nunca. En un equipo real acá iría 1 o más. |
| `enforce_admins: true` | Equivale a *Do not allow bypassing the above settings*: la regla alcanza **también al dueño del repo**. Una protección que el admin puede saltear es de adorno. |
| `required_status_checks: null` | Todavía no existe ningún pipeline. Esto se llena en el **TP4**, y ahí hay que tener cuidado: el `PUT` **reescribe la protección entera**, así que hay que re-declarar estas mismas claves o se pierden. |

---

## 5 · Las cuatro capturas 📸

Los cuatro momentos son **irrepetibles**: una vez que pasan, no se pueden volver a
capturar. Van en `evidencias.md`, en la raíz.

### 📸 1 — Push directo a `main` rechazado

**Estado: pendiente.** Comandos a correr en la terminal (y capturar la salida):

```bash
echo "test" >> README.md
git commit -am "test: intento de push directo"
git push          # ← TIENE que fallar

git reset --hard HEAD~1   # deshacer el commit de prueba
```

Salida esperada: `remote: error: GH006: Protected branch update failed` /
`protected branch hook declined`.

> Este es también el **movimiento #1 de la defensa oral**: el guion arranca con un
> commit sin subir y un push rechazado.

Archivo destino: `img/01-push-rechazado.png`

### 📸 2 — Aviso de conflicto en el PR

**Estado: pendiente.** GitHub avisa que el PR de la rama B no se puede mergear
automáticamente.

Archivo destino: `img/02-aviso-conflicto.png`

### 📸 3 — Marcadores del conflicto

**Estado: pendiente.** El editor web de *Resolve conflicts*, mostrando
`<<<<<<<`, `=======`, `>>>>>>>`.

⚠️ En el paso siguiente esos marcadores se borran y ya no se pueden volver a
capturar.

Archivo destino: `img/03-marcadores-conflicto.png`

### 📸 4 — Release publicada

**Estado: pendiente.** La release `v1.0.0` visible en la página del repositorio.

Archivo destino: `img/04-release.png`

---

## 6 · Pull Requests

**Estado: pendiente.** Se necesitan al menos 2 mergeados, uno con conflicto resuelto.

Plan:

1. **PR #1** — normal, sin conflicto. Sirve para dejar el ciclo completo en el
   historial (rama → commit → PR → diff → squash merge → borrar rama).
2. **PR #2 y #3** — el conflicto fabricado a propósito: dos ramas que nacen de `main`
   y tocan **la misma línea** del README.

> ⚠️ El error que arruina el ejercicio: si la rama B nace de la A, **no hay
> conflicto**. B tiene que salir de `main`, sin enterarse de lo que hizo A.

Orden: crear A → crear B (desde `main`) → mergear A → el PR de B queda en conflicto
→ resolver en la web → mergear B.

## 7 · Tag y release

**Estado: pendiente.**

```bash
git switch main && git pull
git tag -a v1.0.0 -m "TP1 cerrado"
git push origin v1.0.0
```

Y la release desde la web: *Releases → Draft a new release* → elegir `v1.0.0` →
título `v1.0.0` → describir qué incluye → *Publish release*.

> 📌 El reglamento (§3 y §5) pide **un tag y una release por cada TP**:
> `v1.0.0` TP1 · `v2.0.0` TP2 · `v3.0.0` TP3 · `v4.0.0` TP4. Esto **no** aparece en
> las filminas, solo en el README de la cátedra.

---

## 8 · Preguntas de defensa — con su respuesta

Las cinco del enunciado, más lo que el profesor anticipó para la mesa.

### ¿Para qué proteger `main` si en el equipo "se tienen confianza"?

Porque la protección no es una declaración de desconfianza: es **política hecha
configuración**. Los procesos que importan no pueden depender de la memoria ni de la
buena voluntad — la persona más disciplinada del equipo también tiene un martes malo.
Convertir el acuerdo ("todo entra por PR") en una regla que la plataforma hace cumplir
lo vuelve auditable y parejo para todos. Es el mismo patrón que se repite toda la
materia: *policy as code*.

Y lo concreto: al intentar pushear directo, GitHub lo rechazó **a mí, que soy el
dueño del repositorio**, porque `enforce_admins` está activo.

### ¿Qué es una rama *realmente* para Git?

Un **puntero móvil a un commit**. No es una copia de nada: es un archivo de 41 bytes
con un hash adentro. Por eso crear una rama es instantáneo y gratis, y por eso el
flujo de trabajo moderno crea ramas sin pensarlo. `HEAD` indica en qué rama se está
parado; al commitear, el puntero de esa rama avanza.

### ¿Por qué el merge que hice en GitHub no aparecía en mi máquina hasta el `pull`?

Porque el clon local y `origin` son **dos repositorios completos e independientes**
que pueden divergir. El merge ocurrió en el repositorio de GitHub; mi `.git` local no
se entera hasta que le pido las novedades. `fetch` las trae sin tocar el trabajo,
`pull` es `fetch` + `merge`. Es el modelo distribuido de Git: no hay un servidor
central que sea "la verdad", hay repos que se sincronizan explícitamente.

### ¿Qué pasa cuando dos personas modifican la misma línea?

Git fusiona solo cuando los cambios tocan partes distintas del archivo: compara
ambas puntas contra el **ancestro común** y aplica los dos conjuntos de cambios. Pero
cuando las dos ramas tocan **la misma línea**, no hay criterio técnico para decidir
cuál vale — es una decisión de **contenido**, no de mecánica. Git no adivina: marca
el archivo con `<<<<<<<`, `=======`, `>>>>>>>` y delega.

Resolverlo es elegir qué queda, borrar los marcadores y commitear.

**Y qué habría evitado el conflicto:** que las dos ramas no hubieran tocado la misma
línea, o —más realista— que la segunda rama hubiera integrado `main` antes de
divergir tanto. El conflicto no es un error: es trabajo en paralelo funcionando. Lo
que sí es evitable es el conflicto **gigante**, y eso se logra con ramas cortas e
integración frecuente. Ramas de semanas producen *merge hell*, y eso es culpa del
proceso, no de Git.

### ¿Qué buscarías en el PR de un compañero, y qué NO discutirías nunca?

**Buscaría:** ¿hace lo que dice el título? ¿se entiende para el próximo que lo toque?
¿tiene tests? ¿introduce riesgos de seguridad o performance? ¿es coherente con el
diseño que ya existe?

**No discutiría nunca:** estilo y formato. Eso se automatiza con un linter. Discutir
indentación entre humanos es gastar el capital de la revisión en lo que una máquina
resuelve gratis, y desgasta el proceso para cuando haya algo importante que decir.

### ¿Qué significa el número de versión del tag?

`v1.0.0` es **SemVer**: `MAJOR.MINOR.PATCH`. MAJOR sube con cambios incompatibles
("si actualizás, algo tuyo puede romperse"), MINOR con funcionalidad nueva
compatible, PATCH con corrección de bugs sin cambio de comportamiento. No es
decoración: es **información para quien consume** el software.

Un **tag** marca un commit con un nombre inmutable; una **release** le agrega
comunicación (notas de qué cambió). En el TP2 la misma disciplina se aplica a las
imágenes de contenedor, y en el TP6 los deploys nacen de tags.

### ¿Por qué squash y no merge commit o rebase?

En este TP la estrategia **la da la cátedra** (GitHub Flow + squash); elegirla y
justificarla es tarea del TP4. El criterio detrás del squash: `main` queda lineal y
legible, un commit por feature, y revertir es trivial. Se pierde el paso a paso
interno del PR — que en un PR chico no vale mucho.

Las tres opciones reales del botón de merge son **merge commit**, **squash** y
**rebase**. El *fast-forward* no es una opción que se elija: es el caso automático
cuando `main` no avanzó desde que salió la rama.

---

## 9 · Problemas encontrados

*(Se completa a medida que aparecen — van también a `decisiones.md`.)*

1. **La protección de rama falló con un `403` que no menciona la visibilidad.** El
   mensaje dice *"Upgrade to GitHub Pro or make this repository public"*, lo que
   parece un problema de plan o de permisos del token. La causa real era que el
   repositorio estaba en privado. Se resolvió pasándolo a público, que además es
   requisito de la materia.

## 10 · Uso de IA

*(Va en `decisiones.md`. Redactar con honestidad: qué hizo la IA, qué hice yo, cómo
lo verifiqué.)*
