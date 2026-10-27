/**
 * Las operaciones del sistema de turnos que, ademas de aplicar reglas, tocan la base.
 *
 * Cada funcion RECIBE la base por parametro (`db`: cualquier objeto con un metodo
 * `query`, como el pool de pg) en vez de importarla. La API le pasa el pool real y los
 * tests le pasan un doble. Antes estas reglas vivian adentro de los handlers de
 * index.js, pegadas al pool: para probarlas habia que levantar un PostgreSQL.
 */
import {
  ReglaViolada,
  NoEncontrado,
  validarDni,
  validarNombre,
  validarFechaFutura,
  validarTransicion,
  haySolapamiento,
  superaCupoDiario,
} from './reglas.js';

export async function crearProfesional(db, { nombre, especialidad }) {
  const nombreValido = validarNombre(nombre);
  const especialidadValida = validarNombre(especialidad);

  const { rows } = await db.query(
    'INSERT INTO profesionales (nombre, especialidad) VALUES ($1, $2) RETURNING *',
    [nombreValido, especialidadValida]
  );
  return rows[0];
}

/** Regla: no se borra un profesional que todavia tiene turnos pendientes. */
export async function eliminarProfesional(db, id) {
  const { rows: pendientes } = await db.query(
    "SELECT 1 FROM turnos WHERE profesional_id = $1 AND estado = 'PENDIENTE' LIMIT 1",
    [id]
  );
  if (pendientes.length > 0) {
    throw new ReglaViolada('No se puede eliminar un profesional con turnos pendientes');
  }
  await db.query('DELETE FROM profesionales WHERE id = $1', [id]);
}

/** Regla: no puede haber dos pacientes con el mismo DNI. */
export async function crearPaciente(db, { nombre, dni }) {
  const nombreValido = validarNombre(nombre);
  const dniValido = validarDni(dni);

  const { rows: existe } = await db.query('SELECT 1 FROM pacientes WHERE dni = $1', [dniValido]);
  if (existe.length > 0) {
    throw new ReglaViolada(`Ya existe un paciente con el DNI ${dniValido}`);
  }

  const { rows } = await db.query(
    'INSERT INTO pacientes (nombre, dni) VALUES ($1, $2) RETURNING *',
    [nombreValido, dniValido]
  );
  return rows[0];
}

/**
 * Saca un turno: la fecha tiene que ser futura, y el profesional no puede tener otro
 * turno que se pise ni haber llenado el cupo del dia. `ahora` entra por parametro para
 * que los tests no dependan del reloj.
 */
export async function crearTurno(db, { pacienteId, profesionalId, fechaHora }, ahora = new Date()) {
  const fecha = validarFechaFutura(fechaHora, ahora);

  const { rows: turnosDelProfesional } = await db.query(
    'SELECT fecha_hora, estado FROM turnos WHERE profesional_id = $1',
    [profesionalId]
  );

  if (haySolapamiento(fecha, turnosDelProfesional)) {
    throw new ReglaViolada('El profesional ya tiene un turno que se superpone con ese horario');
  }
  if (superaCupoDiario(fecha, turnosDelProfesional)) {
    throw new ReglaViolada('El profesional alcanzo el cupo de turnos para ese dia');
  }

  const { rows } = await db.query(
    `INSERT INTO turnos (paciente_id, profesional_id, fecha_hora)
     VALUES ($1, $2, $3) RETURNING *`,
    [pacienteId, profesionalId, fecha.toISOString()]
  );
  return rows[0];
}

/** Cambia el estado de un turno, si la transicion esta permitida. */
export async function cambiarEstadoTurno(db, id, estadoNuevo) {
  const { rows: actual } = await db.query('SELECT estado FROM turnos WHERE id = $1', [id]);
  if (actual.length === 0) {
    throw new NoEncontrado('Turno no encontrado');
  }

  const nuevo = validarTransicion(actual[0].estado, estadoNuevo);
  const { rows } = await db.query('UPDATE turnos SET estado = $1 WHERE id = $2 RETURNING *', [
    nuevo,
    id,
  ]);
  return rows[0];
}
