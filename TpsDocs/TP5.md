# TP5 — Testing: unit tests, coverage y el umbral que frena un merge

> **Peso en P2: 25%**. Evaluación: 25% configuración técnica · 25% `decisiones.md` ·
> 50% defensa oral. **Sin `evidencias.md`**: cada decisión se prueba con la URL de la
> corrida o del PR, pegada en `decisiones.md`.
> Enunciado: [`ingsoft3ucc/TPs_2026/trabajos/05-testing-calidad.md`](https://github.com/ingsoft3ucc/TPs_2026/blob/main/trabajos/05-testing-calidad.md)

## Checklist del enunciado

| # | Requisito | Estado |
|---|---|---|
| 1 | Backend: ≥8 métodos AAA sobre ≥4 reglas, con parametrizado, caso de error y mock | ✅ 22 métodos sobre 8 reglas |
| 2 | Frontend: ≥4 unit tests sin DOM, con parametrizado, caso de error y mock | ⏳ |
| 3 | Coverage de back y front en el pipeline: resumen en la corrida + reporte descargable | ⏳ back listo en la rama, falta el front |
| 4 | Umbral definido y justificado (líneas y ramas) que rompe el build de los dos lados | ⏳ back: 90 / 85 propuesto, falta confirmarlo |
| 5 | PR 1: código sin tests → rojo por cobertura → tests → verde → mergeado | ⬜ |
| 6 | PR 2: chico, mismo problema, abierto y en rojo hasta la defensa | ⬜ |
| 7 | Tarea #15 del Project cerrada con `Closes #15` | ⬜ |
| 8 | `decisiones.md` con la sección `## TP5` (incluido el camino sin cubrir) | ⬜ |
| 9 | Tag `v5.0.0` + release | ⬜ |

---

## 1 · El refactor que hizo posible el mock

**El problema.** Cuatro reglas vivían adentro de los handlers de `index.js`, pegadas
al `pool` de PostgreSQL que el archivo importa:

- no puede haber dos pacientes con el mismo DNI;
- no se borra un profesional con turnos pendientes;
- un turno no se puede pisar con otro ni pasar el cupo diario (la consulta de los turnos
  del profesional + las dos reglas puras);
- un turno que no existe da 404 antes de validar la transición.

Para probarlas había que levantar una base: el `pool` se fabricaba adentro y no había
por dónde meter un doble. Además, `index.js` arranca el servidor apenas se importa.

**El arreglo: la base entra desde afuera.** Esas operaciones pasaron a
`backend/src/servicios.js`, y cada una **recibe** la base por parámetro:

```js
export async function crearPaciente(db, { nombre, dni }) { ... }   // db = cualquier cosa con .query()
```

`index.js` les pasa el `pool` real; los tests les pasan un doble. Los handlers quedaron
finitos: piden, delegan y responden.

**Qué cambió y qué NO.** Cambió sólo de dónde viene la base. Las consultas, el orden de
las validaciones y los mensajes son los mismos. La única pieza nueva es `NoEncontrado`
(en `reglas.js`, junto a `ReglaViolada`): el servicio ya no puede contestar un 404
porque no sabe de HTTP, así que lanza ese error y el middleware de `index.js` lo
traduce a 404, con el mismo cuerpo de antes.

**Cómo se comprobó que no se rompió nada** — con la app real levantada (`docker compose
up -d --build`) y un `curl` a cada endpoint que se movió:

```
1 alta profesional valido:      201 {"id":4,"nombre":"Dra Prueba 1793063381","especialidad":"Clinica"}
2 alta profesional sin especialidad: 400 {"error":"El nombre debe tener al menos 2 caracteres"}
3 alta paciente valido:        201 {"id":4,"nombre":"Paciente 1793063381","dni":"32063381"}
4 alta paciente DNI repetido:  400 {"error":"Ya existe un paciente con el DNI 32063381"}
5 alta paciente sin nombre:    400 {"error":"El nombre debe tener al menos 2 caracteres"}
6 turno futuro:                201 {"id":2,"paciente_id":4,"profesional_id":4,"fecha_hora":"2027-03-15T13:00:00.000Z","estado":"PENDIENTE"}
7 turno superpuesto:           400 {"error":"El profesional ya tiene un turno que se superpone con ese horario"}
8 turno en el pasado:          400 {"error":"No se puede sacar un turno en una fecha pasada"}
9 borrar profesional con pendiente: 400 {"error":"No se puede eliminar un profesional con turnos pendientes"}
10 PENDIENTE -> ATENDIDO:      200 {"id":2,...,"estado":"ATENDIDO"}
11 ATENDIDO -> PENDIENTE:      400 {"error":"No se puede pasar de ATENDIDO a PENDIENTE"}
12 turno inexistente:          404 {"error":"Turno no encontrado"}
13 listados:                   turnos 200 · pacientes 200 · profesionales 200
```

Por qué hacía falta esto y no alcanzaba con los tests: los tests le pasan el doble **a
mano**. Si `index.js` hubiera quedado mal cableado, la suite seguiría verde y la app
real estaría rota.

## 2 · La suite del backend

Los tests viven en `backend/test/`, **no** al lado del código: la imagen final copia
`src/` entera, y así los tests no viajan a producción.

| Archivo | Qué prueba | Métodos |
|---|---|---|
| `test/reglas.test.js` | Las 6 reglas puras: DNI, nombre, fecha futura, solapamiento, cupo diario, transiciones de estado | 13 |
| `test/servicios.test.js` | Las operaciones que tocan la base, con un **doble** de la base | 9 |

```
$ npm test
 ✓ test/reglas.test.js (24 tests) 3ms
 ✓ test/servicios.test.js (9 tests) 3ms
      Tests  33 passed (33)
```

**22 métodos, 33 casos**: cada fila de un `it.each` corre como un caso propio, pero para
el mínimo del enunciado cuentan los **métodos**. Las 8 reglas cubiertas: DNI, nombre,
fecha futura, solapamiento, cupo diario, transiciones, DNI único, profesional con turnos
pendientes.

Las tres técnicas que se piden:

- **Parametrizado** — `it.each` en `validarDni` (6 DNIs inválidos y 3 válidos),
  `superaCupoDiario` (el borde: 8 lleno, 7 con lugar) y `validarTransicion`.
- **Caso de error** — casi la mitad: entrada inválida → la regla rechaza **y el mensaje
  dice por qué** (el mensaje también es comportamiento).
- **Mock** — en `servicios.test.js`. El doble es `baseQueResponde(...)`: un objeto con
  `query = vi.fn()` que contesta en orden las filas que se le pasan. Contestar es su
  papel de **stub**; cuando el test verifica **qué consultas se hicieron**, funciona como
  **mock**. El ejemplo más claro:

  ```js
  it('rechaza un DNI que ya esta registrado y no inserta nada', async () => {
    // Arrange: la base contesta que ese DNI ya existe
    const db = baseQueResponde([{ existe: 1 }]);

    // Act: intentar el alta
    const alta = crearPaciente(db, { nombre: 'Ana Perez', dni: '30111222' });

    // Assert: la regla corta, y la unica consulta fue el SELECT (el INSERT nunca llego)
    await expect(alta).rejects.toThrow('Ya existe un paciente con el DNI 30111222');
    expect(db.query).toHaveBeenCalledTimes(1);
  });
  ```

  El segundo `expect` no mira un valor devuelto: mira **cómo se usó la dependencia**.
  Si mañana alguien mueve el `INSERT` antes del chequeo de duplicados, este test se
  pone rojo.

**Determinismo.** Las fechas van siempre en UTC (con la `Z`) y `ahora` entra por
parámetro (`validarFechaFutura(fecha, ahora)`, `crearTurno(db, pedido, ahora)`): el
resultado no depende del reloj ni de la zona horaria de la máquina.

### Los mutantes: ¿los tests verifican o sólo ejecutan?

El criterio del enunciado: si se invierte una regla o se corre un borde, algún test
tiene que ponerse rojo. Se probó a mano con cinco mutantes, uno por vez, restaurando
el archivo después de cada uno:

```
reglas.js: 'if (fecha <= ahora)' -> 'if (fecha < ahora)' => muerto (algun test en rojo)
reglas.js: 'return enEseDia.length >= MAX_TURNOS_POR_DIA' -> '... > MAX_TURNOS_POR_DIA' => muerto (algun test en rojo)
reglas.js: 'return inicio < otroFin && otroInicio < fin' -> 'inicio <= otroFin && ...' => muerto (algun test en rojo)
reglas.js: 'if (limpio.length < 2)' -> 'if (limpio.length <= 2)' => muerto (algun test en rojo)
servicios.js: 'if (existe.length > 0)' -> 'if (existe.length > 1)' => muerto (algun test en rojo)
```

Los cinco murieron. Los mata, en cada caso, el test **del borde**: el turno en el mismo
instante que `ahora`, el cupo con exactamente 8, el turno que empieza justo cuando
termina el otro, el nombre de exactamente 2 letras.

## 3 · La cobertura

Herramienta: **vitest + `@vitest/coverage-v8`**, la misma versión exacta que vitest
(2.1.9; si no coinciden, falla la instalación o la corrida). Configuración en
`backend/vitest.config.js`.

**Qué entra en la cuenta**: `include: ['src/**']` y `exclude: ['src/index.js', 'src/db.js']`.

| Afuera | Por qué |
|---|---|
| `src/index.js` | Rutas y arranque del servidor. Las reglas ya no viven ahí (§1): excluirlo **antes** del refactor habría sido la trampa del §2.4 de la guía, medir una sola clase y dar altísimo |
| `src/db.js` | La conexión y el schema. No tiene reglas, y lo único que tiene se prueba contra una base de verdad: eso es integración (TP7) |

Se **excluye** en vez de nombrar lo que entra: un archivo nuevo en `src/` entra solo a
la medición, y si nace sin tests el número baja y el gate avisa.

```
$ npm run test:ci
 % Coverage report from v8
--------------|---------|----------|---------|---------|-------------------
File          | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------|---------|----------|---------|---------|-------------------
All files     |   97.67 |    90.24 |     100 |   97.67 |
 reglas.js    |     100 |     93.1 |     100 |     100 | 40,98
 servicios.js |   94.93 |    83.33 |     100 |   94.93 | 28-29,77-78
--------------|---------|----------|---------|---------|-------------------
```

Totales exactos: **líneas 168 de 172 · ramas 37 de 41 · funciones 13 de 13**.

Lo que quedó sin cubrir (sirve para el ejercicio del camino sin cubrir, que **hacés
vos** con el reporte HTML abierto y va en `decisiones.md`):

| Dónde | Qué es |
|---|---|
| `reglas.js:40` | `String(nombre ?? '')`: la rama del `??`, cuando el pedido llega **sin** el campo |
| `reglas.js:98` | `TRANSICIONES[estadoActual] ?? []`: la rama del `??`, un estado actual desconocido |
| `servicios.js:28-29` | el alta exitosa de un profesional (sólo está probado el rechazo) |
| `servicios.js:77-78` | el cupo lleno visto desde el servicio (la regla en sí sí está probada) |

### El umbral, probado de verdad

```
$ npx vitest run --coverage --coverage.thresholds.lines=99 --coverage.thresholds.branches=99
      Tests  33 passed (33)
ERROR: Coverage for lines (97.67%) does not meet global threshold (99%)
ERROR: Coverage for branches (90.24%) does not meet global threshold (99%)
exit code: 1
```

Todos los tests en verde y el comando sale con error: ése es el rojo que frena. El
umbral queda en `thresholds: { lines: 90, branches: 85 }` (**propuesto, a confirmar**:
el número y su porqué los escribís vos en `decisiones.md`).

La cuenta que hay que tener a mano para el PR que lo rompe: con 168 de 172 líneas, hacen
falta **15 líneas nuevas sin cubrir** para caer debajo de 90 (168 / 187 = 89,8 %).

## 4 · Los tests en el pipeline

### La etapa de tests en el Dockerfile

```
FROM node:22-alpine AS build      ← npm ci con TODAS las dependencias + COPY . .
FROM build AS test                ← NUEVA: ENTRYPOINT npm run test:ci
FROM build AS deps-prod           ← NUEVA: npm prune --omit=dev
FROM node:22-alpine AS final      ← la de siempre, sigue ÚLTIMA
```

**Por qué el `prune` tuvo que mudarse.** En el TP2, `build` terminaba con
`npm prune --omit=dev`. Una etapa de tests que naciera de ahí se quedaría **sin
vitest**. Es la fila «que las herramientas de test ENTREN a la etapa de tests» de la
tabla «Tu stack, de un vistazo». La poda pasó a `deps-prod`, y la imagen final copia
`node_modules` de ahí.

**Por qué `final` queda última.** Es la que se construye cuando nadie pide un `target`
(el `docker compose build`, el build de la imagen del pipeline). Si la etapa de tests
quedara última, la imagen de producción pasaría a ser la de tests sin que nada se
pusiera rojo.

**Comprobado en local**, igual que lo hace el pipeline:

```
$ docker build --target test -t backend-test:local backend
$ docker run --rm -e COVERAGE_DIR=/salida/reporte -v "$OUT:/salida" backend-test:local
      Tests  33 passed (33)
All files     |   97.67 |    90.24 |     100 |   97.67 |
$ ls $OUT/reporte
coverage-summary.json  index.html  reglas.js.html  servicios.js.html  ...
```

Y la imagen final, por dentro:

```
--- /app de la imagen final:
node_modules
package.json
src
--- src:
db.js  index.js  reglas.js  servicios.js
--- NODE_ENV=production
```

Sin `test/`, sin `vitest.config.js`. Un hallazgo al revisarla: en `node_modules`
aparecen las carpetas `@vitest`, `@babel`, `@istanbuljs` y otras, pero están **vacías**.
`npm prune` saca los paquetes de desarrollo y deja vacía la carpeta del scope. La
imagen del TP2 (`v0.1.0`) ya tenía la `@vitest` vacía: no es nuevo y no hay código de
tests en producción.

### Los pasos nuevos de `build-backend`

| Paso | Qué hace |
|---|---|
| Construir la etapa de tests | `build-push-action` con `target: test`, `load: true` (sin esto el `docker run` no encuentra la imagen) y su propio `scope` de cache: `backend-test` |
| Correr los tests con coverage | `docker run` con `COVERAGE_DIR` y un volumen: el reporte que escribe el contenedor aparece en el runner. Si un test falla o no se llega al umbral, este paso pone el job en rojo |
| Resumen del coverage del backend | Lee el `coverage-summary.json` y escribe la tabla en `$GITHUB_STEP_SUMMARY`. Dos frenos: si no está el archivo, o si midió cero archivos, falla |
| Publicar el reporte | `upload-artifact` con el HTML, descargable desde la corrida |

Los dos últimos llevan `if: ${{ !cancelled() }}`: corren **también cuando los tests
fallaron**, que es justo cuando más se quiere mirar el reporte.

## 5 · Hallazgos (bugs reales, todavía sin decidir)

1. **No se puede borrar un profesional que sólo tiene turnos cerrados.** La regla dice
   que lo que lo impide son los turnos *pendientes*, pero la clave foránea de `turnos`
   impide borrarlo si tiene **cualquier** turno:

   ```
   DELETE profesional 4 (solo turnos cerrados): 500 {"error":"Error interno del servidor"}
   error: update or delete on table "profesionales" violates foreign key constraint
          "turnos_profesional_id_fkey" on table "turnos"
   ```

   Ya estaba en el código del TP2; el refactor no lo trajo. Y es el ejemplo exacto de
   «coverage alto no es calidad»: `eliminarProfesional` está cubierta al 100 % y su test
   con mock pasa, porque el doble no sabe de claves foráneas. Lo detecta un test contra
   la base real: integración, TP7.
2. **Mensaje engañoso**: un profesional sin especialidad responde «El **nombre** debe
   tener al menos 2 caracteres», porque las dos validaciones usan `validarNombre`.

---

## 6 · Preguntas de defensa — con su respuesta

> Las de ejemplo del enunciado. Las que dependen de pasos todavía pendientes (el PR
> bloqueado, el umbral definitivo) se completan cuando existan.

### Dibujá la pirámide de testing. ¿Por qué esa forma? ¿Dónde están parados tus tests hoy?

Base ancha de **unit tests** (muchos, rápidos, aislados, que dicen exactamente qué se
rompió), un medio de **integración** (piezas colaborando de verdad, como la API contra
PostgreSQL) y una punta de **e2e** (el sistema entero desde un navegador). Cuanto más
arriba, más caro, más lento y menos preciso para decir dónde está el error. Invertida
(todo e2e) es el *ice cream cone*: suites lentas, frágiles y que no localizan nada.

Hoy estoy en la base: 22 tests unitarios de backend que corren en milisegundos sin base
ni red. Falta el medio y la punta, que llegan en el TP7. El bug de la clave foránea
(§5) es justo lo que la base no puede ver.

### Mostrame un test tuyo: ¿dónde está el Arrange, el Act y el Assert? ¿Por qué importa el nombre?

El de DNI repetido (§2): el Arrange es el doble que contesta «ese DNI ya existe», el
Act es el `crearPaciente`, y el Assert son los dos `expect`: el rechazo con su mensaje,
y que la base recibió una sola consulta. El nombre —*rechaza un DNI que ya está
registrado y no inserta nada*— es el diagnóstico cuando falla en el pipeline: dice qué
regla se rompió sin abrir el código.

### Mock vs stub. ¿Qué dependencia reemplazaste y qué verifica el assert?

El **stub** provee respuestas fijas y no verifica nada; el **mock** se usa para
verificar la **interacción**: qué llamadas recibió y cuántas. Mi doble reemplaza a la
base (`db.query`). Contestando filas es un stub; cuando el assert es
`toHaveBeenCalledTimes(1)` o `toHaveBeenLastCalledWith('DELETE …', [3])`, es un mock.
Para poder inyectarlo tuve que sacar las reglas de los handlers a `servicios.js`, que
recibe la base por parámetro (§1).

### Line coverage vs branch coverage: ¿cuál puede mentirte más?

La de **línea**. Un `if` ejecutado sólo por el lado verdadero da 100 % de línea y 50 %
de rama. Mi caso real: `reglas.js` tiene **100 % de líneas y 93,1 % de ramas**. Las dos
ramas que faltan son dos `??`, en líneas que se ejecutan siempre pero nunca con el
valor nulo.

### Tu coverage es del 97 %: ¿prueba que tu código funciona?

No: mide qué se **ejecutó**, no qué se **verificó**. Un test sin `expect` que llame a
`superaCupoDiario` suma cobertura y no comprueba nada. Mi ejemplo real es
`eliminarProfesional`: cubierta al 100 %, test en verde, y en la base real da 500 por la
clave foránea (§5). Lo que sí da evidencia de que los tests verifican son los
mutantes: cinco bordes corridos a mano, y los cinco pusieron algún test en rojo.

### ¿Qué es un quality gate? ¿Cuál es la condición del tuyo?

Una condición **medible** que el código tiene que cumplir para avanzar; si no se
cumple, el check falla y el PR no se mergea. La del mío: que los tests pasen **y** que
la cobertura de la lógica no baje de 90 % de líneas y 85 % de ramas (a confirmar). Vive
adentro de los mismos `build-backend` y `build-frontend` que ya eran required checks
desde el TP4: no se agregó ningún check.

### ¿Qué encontraría un análisis estático que tus tests no ven? ¿Y al revés?

El estático lee el código sin correrlo: bugs probables (un nulo desreferenciado),
código muerto, complejidad, vulnerabilidades. Los tests sólo verifican lo que a alguien
se le ocurrió probar. Al revés, el estático no sabe que el cupo era **8** y no 10: eso
sólo lo custodian los tests. Y ninguno de los dos sabe si entendí bien el requisito.

### Dos de tus tres guardianes son automáticos. ¿Qué no puede detectar ninguno?

Que el requisito se haya entendido mal: el test congela lo que **yo** entendí. Un
agente de IA hoy sí puede revisar diseño, nombres y legibilidad, y bien. Lo que queda
afuera aunque lo use es lo que no está escrito en el repo (lo que pidió el cliente) y
la responsabilidad por la decisión. Por eso el PR obligatorio es el único guardián que
puede atrapar eso: ahí miro yo.
