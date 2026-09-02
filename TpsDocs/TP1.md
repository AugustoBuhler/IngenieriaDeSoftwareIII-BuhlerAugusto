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
| 4 | Evidencia del rechazo del push directo | ✅ `img/01-push-rechazado.png` |
| 5 | ≥ 2 PRs mergeados | ✅ 19 mergeados de 20 abiertos |
| 6 | ≥ 1 de ellos con **conflicto de merge resuelto** | ✅ tres pares fabricados (§6) |
| 7 | Tag `v1.0.0` + release con notas | ✅ `v1.0.0` sobre `9e5f103` |
| 8 | `decisiones.md` en la raíz | ✅ sección `## TP1`, con la declaración de IA |
| 9 | `evidencias.md` con las 4 capturas | ✅ las cuatro |

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
capturar. **Las cuatro están tomadas** y publicadas en `evidencias.md`, en la raíz.
Los archivos viven en `img/`, también en la raíz, para que `evidencias.md` y este
documento apunten al mismo archivo.

### 📸 1 — Push directo a `main` rechazado

**Tomada** · `img/01-push-rechazado.png`

Comandos ejecutados en la terminal:

```bash
echo "test" >> README.md
git commit -am "test: intento de push directo"
git push          # ← TIENE que fallar

git reset --hard HEAD~1   # deshacer el commit de prueba
```

Salida obtenida:

```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: — Changes must be made through a pull request.
 ! [remote rejected] main -> main (protected branch hook declined)
```

El commit local se creó sin problema (`[main 394fa07]`); lo que falló fue
**publicarlo**. El prefijo `remote:` indica que el rechazo viene del servidor, no de
Git local.

> Este es también el **movimiento #1 de la defensa oral**: el guion arranca con un
> commit sin subir y un push rechazado. Acordarse del `git reset --hard HEAD~1`
> después, o el repositorio queda sucio en la mesa.

### 📸 2 — Aviso de conflicto en el PR

**Tomada** · `img/02-aviso-conflicto.png`

Mergeado el PR #3 (rama A), el PR #4 (rama B) quedó bloqueado. Estado consultado por
API en ese momento:

```
mergeable:        CONFLICTING
mergeStateStatus: DIRTY
```

### 📸 3 — Marcadores del conflicto

**Tomada** · `img/03-marcadores-conflicto.png`

El editor web de *Resolve conflicts*, con las tres fronteras que pone Git:

```
<<<<<<< feature/titulo-b
# Ingenieria del Software 3 · Turnos
=======
# IngSoft3 — Sistema de Turnos de Consultorio
>>>>>>> main
```

⚠️ En el paso siguiente esos marcadores se borran y ya no se pueden volver a
capturar. Por eso la captura se tomó **antes** de resolver.

### 📸 4 — Release publicada

**Tomada** · `img/04-release.png`

La release `v1.0.0 — TP1: Git colaborativo`, visible en la página del repositorio.

---

## 6 · Pull Requests

**Estado: completo.** El repositorio tiene **20 Pull Requests**: 19 mergeados y 1
cerrado sin mergear. El enunciado pide dos y uno con conflicto; los del TP1 son los
primeros diez.

### El ciclo completo, y su corrección

**PR #1** — la bitácora de `TpsDocs/`. Sin conflicto: sirve para dejar el ciclo entero
en el historial (rama → commit → PR → diff → squash merge → borrar rama). Es también
el PR donde se coló un commit que no correspondía (§9, problema 2).

**PR #2** — la corrección de ese commit. Se arregló **hacia adelante**, con otro PR, en
vez de reescribir `main` con un `push --force`.

### Los tres pares de conflicto

El conflicto se fabricó a propósito: dos ramas que nacen del **mismo** commit de `main`
y tocan **la misma línea** del `README.md`.

> ⚠️ El error que arruina el ejercicio: si la rama B nace de la A, **no hay conflicto**.
> B tiene que salir de `main`, sin enterarse de lo que hizo A.

Orden en los tres casos: crear A → crear B (desde `main`) → mergear A → el PR de B queda
en conflicto → resolverlo → cerrar el ciclo.

| Par | Ramas | Línea en disputa | Cómo se resolvió | Resultado |
|---|---|---|---|---|
| 1.º | `titulo-a` #3 / `titulo-b` #4 | El `# Título` del README | Editor web *Resolve conflicts*, quedándose con la versión de `main` | #4 **mergeado**, con **0 archivos cambiados** |
| 2.º | `descripcion-a` #7 / `descripcion-b` #8 | El párrafo de descripción | `Merge branch 'main'` dentro de la rama B, quedándose con la versión de la rama | #8 **mergeado** (+2/−1) |
| 3.º | `stack-a` #9 / `stack-b` #10 | La fila *Backend* de la tabla de stack | Descartando la rama B | #10 **cerrado**, sin mergear |

**Lo que muestra la tabla** es que la misma situación mecánica admite tres salidas
distintas, porque resolver un conflicto **no es ejecutar un comando: es decidir qué
contenido queda**. En el primer par ganó lo que ya estaba en `main`; en el segundo, lo
que traía la rama; en el tercero, ninguno de los dos — y "ninguno" también es una
resolución válida. Cerrar un Pull Request no es un fracaso: es decidir que ese cambio no
va.

El par que documentan las capturas 2 y 3 de `evidencias.md` es el **primero**.

**Por qué el PR #4 figura con 0 archivos cambiados.** Porque la resolución fue quedarse
con el título que ya estaba en `main`. La resolución fue válida y su efecto neto sobre
`main` fue nulo — el trabajo del PR está en su historial, no en su diff.

## 7 · Tag y release

**Estado: completo.**

```bash
git switch main && git pull
git tag -a v1.0.0 -m "TP1 cerrado - Git colaborativo"
git push origin v1.0.0
```

Y la release desde la web: *Releases → Draft a new release* → elegir `v1.0.0` →
título → describir qué incluye → *Publish release*.

> 📌 El reglamento (§3 y §5) pide **un tag y una release por cada TP**. Esto **no**
> aparece en las filminas, solo en el README de la cátedra — es de lo que más se pasa
> por alto.

Los cuatro, publicados:

| Tag | Commit | Release | TP |
|---|---|---|---|
| `v1.0.0` | `9e5f103` | *v1.0.0 — TP1: Git colaborativo* | TP1 |
| `v2.0.0` | `8fc01df` | *v2.0.0 — TP2: Contenedores* | TP2 |
| `v3.0.0` | `6544434` | *v3.0.0 — TP3: Planificación y trazabilidad* | TP3 |
| `v4.0.0` | `54d0277` | *v4.0.0 — TP4: CI Pipelines as Code* | TP4 |

Un tag marca un commit con un nombre inmutable; la release le agrega la comunicación de
qué cambió. Son **el punto exacto que se mira de cada TP**, así que si un TP ya
etiquetado se corrige después, el tag se mueve (`git tag -f` + `git push -f`) y el
movimiento se cuenta en `decisiones.md`.

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

Los dos primeros están contados en `decisiones.md`; el tercero es una consecuencia
menor del segundo par de conflicto, y queda registrada acá.

**1 · La protección de rama falló con un `403` que no menciona la visibilidad.** El
mensaje dice *"Upgrade to GitHub Pro or make this repository public to enable this
feature"*, lo que parece un problema de plan o de permisos del token — y se pierde un
rato buscando por ahí. La causa real era que el repositorio estaba **en privado**: las
protecciones de rama son gratuitas solo en repos públicos. Se resolvió pasándolo a
público, que además es requisito de la materia.

**2 · Un commit se coló en un Pull Request que no le correspondía.** Haciendo la prueba
de push directo se ejecutó `git commit -am "test: intento de push directo"` creyendo
estar parado en `main`. La rama activa era `feature/bitacora-de-tps`, que tenía el PR #1
abierto. El push funcionó —a una rama de feature no hay protección que lo frene— y el
commit entró al PR sin que nada lo avisara. Al mergear con *squash*, la línea de prueba
terminó en `main`.

Dos cosas quedaron claras:

- **Un Pull Request sigue a la rama, no al commit.** No se propone un commit puntual: se
  propone *todo lo que la rama tenga cuando se aprieta el botón*. Es la misma propiedad
  que permite responder a un review con otro commit, y funciona igual cuando el commit
  no debería estar ahí.
- **La carpeta tiene una sola rama activa.** `git switch` no mueve "a una persona": mueve
  el directorio de trabajo entero.

Se corrigió con el PR #2, hacia adelante. La alternativa —`push --force` sobre `main`—
es exactamente lo que la regla de oro prohíbe. Y hubo un tercer punto de falla, el más
importante: **antes de mergear el PR #1 no se leyó el diff.** *Files changed* mostraba un
cambio que la descripción no mencionaba. Es literalmente para lo que existe el code
review.

**3 · La resolución del segundo par dejó un residuo en el README.** Al resolver el
conflicto de `feature/descripcion-b` (PR #8) quedó una **línea en blanco de más** en
medio del párrafo de descripción: el diff entró como `+2/−1` en vez de `+1/−1`. El
efecto es solo de presentación —GitHub renderiza el párrafo partido en dos— pero es la
huella típica de una resolución hecha a mano: al elegir qué línea queda, se arrastró un
salto de línea que no correspondía.

Es un recordatorio de que **resolver un conflicto es editar**, y que el resultado hay que
leerlo como se lee cualquier otro cambio. Se deja documentado en vez de corregido en
silencio: la cicatriz explica más que el arreglo.

## 10 · Uso de IA

La declaración formal vive en `decisiones.md`, al cierre de la sección `## TP1` —
**está completa**. En resumen: la IA operó (`git`, `gh`, la protección por API) y
redactó borradores; la resolución del conflicto, la prueba de push directo, las capturas
y la publicación de la release fueron propias. La verificación se hizo leyendo el error
completo del rechazo (`GH006`, con su prefijo `remote:`) y consultando el estado de la
protección por API antes y después de aplicarla, en vez de confiar en que el comando
hubiera funcionado.
