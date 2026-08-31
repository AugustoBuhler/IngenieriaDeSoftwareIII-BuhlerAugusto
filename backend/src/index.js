import express from 'express';
import { pool, inicializarSchema, esperarBase } from './db.js';
import {
  ReglaViolada,
  validarDni,
  validarNombre,
  validarFechaFutura,
  validarTransicion,
  haySolapamiento,
  superaCupoDiario,
} from './reglas.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT ?? 8080;

/** Envuelve un handler async para que los errores lleguen al middleware de abajo. */
const ruta = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// ---------------------------------------------------------------- salud
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ---------------------------------------------------------- profesionales
app.get(
  '/api/profesionales',
  ruta(async (_req, res) => {
    const { rows } = await pool.query('SELECT * FROM profesionales ORDER BY id');
    res.json(rows);
  })
);

app.post(
  '/api/profesionales',
  ruta(async (req, res) => {
    const nombre = validarNombre(req.body.nombre);
    const especialidad = validarNombre(req.body.especialidad);
    const { rows } = await pool.query(
      'INSERT INTO profesionales (nombre, especialidad) VALUES ($1, $2) RETURNING *',
      [nombre, especialidad]
    );
    res.status(201).json(rows[0]);
  })
);

app.delete(
  '/api/profesionales/:id',
  ruta(async (req, res) => {
    // Regla: no se borra un profesional que todavia tiene turnos pendientes.
    const { rows: pendientes } = await pool.query(
      "SELECT 1 FROM turnos WHERE profesional_id = $1 AND estado = 'PENDIENTE' LIMIT 1",
      [req.params.id]
    );
    if (pendientes.length > 0) {
      throw new ReglaViolada('No se puede eliminar un profesional con turnos pendientes');
    }
    await pool.query('DELETE FROM profesionales WHERE id = $1', [req.params.id]);
    res.status(204).end();
  })
);

// -------------------------------------------------------------- pacientes
app.get(
  '/api/pacientes',
  ruta(async (_req, res) => {
    const { rows } = await pool.query('SELECT * FROM pacientes ORDER BY id');
    res.json(rows);
  })
);

app.post(
  '/api/pacientes',
  ruta(async (req, res) => {
    const nombre = validarNombre(req.body.nombre);
    const dni = validarDni(req.body.dni);

    const { rows: existe } = await pool.query('SELECT 1 FROM pacientes WHERE dni = $1', [dni]);
    if (existe.length > 0) {
      throw new ReglaViolada(`Ya existe un paciente con el DNI ${dni}`);
    }

    const { rows } = await pool.query(
      'INSERT INTO pacientes (nombre, dni) VALUES ($1, $2) RETURNING *',
      [nombre, dni]
    );
    res.status(201).json(rows[0]);
  })
);

// ----------------------------------------------------------------- turnos
app.get(
  '/api/turnos',
  ruta(async (_req, res) => {
    const { rows } = await pool.query(`
      SELECT t.id, t.fecha_hora, t.estado,
             p.nombre AS paciente, p.dni,
             pr.nombre AS profesional, pr.especialidad
        FROM turnos t
        JOIN pacientes p     ON p.id  = t.paciente_id
        JOIN profesionales pr ON pr.id = t.profesional_id
       ORDER BY t.fecha_hora
    `);
    res.json(rows);
  })
);

app.post(
  '/api/turnos',
  ruta(async (req, res) => {
    const { pacienteId, profesionalId } = req.body;
    const fecha = validarFechaFutura(req.body.fechaHora);

    const { rows: turnosDelProfesional } = await pool.query(
      'SELECT fecha_hora, estado FROM turnos WHERE profesional_id = $1',
      [profesionalId]
    );

    if (haySolapamiento(fecha, turnosDelProfesional)) {
      throw new ReglaViolada('El profesional ya tiene un turno que se superpone con ese horario');
    }
    if (superaCupoDiario(fecha, turnosDelProfesional)) {
      throw new ReglaViolada('El profesional alcanzo el cupo de turnos para ese dia');
    }

    const { rows } = await pool.query(
      `INSERT INTO turnos (paciente_id, profesional_id, fecha_hora)
       VALUES ($1, $2, $3) RETURNING *`,
      [pacienteId, profesionalId, fecha.toISOString()]
    );
    res.status(201).json(rows[0]);
  })
);

app.patch(
  '/api/turnos/:id/estado',
  ruta(async (req, res) => {
    const { rows: actual } = await pool.query('SELECT estado FROM turnos WHERE id = $1', [
      req.params.id,
    ]);
    if (actual.length === 0) return res.status(404).json({ error: 'Turno no encontrado' });

    const nuevo = validarTransicion(actual[0].estado, req.body.estado);
    const { rows } = await pool.query(
      'UPDATE turnos SET estado = $1 WHERE id = $2 RETURNING *',
      [nuevo, req.params.id]
    );
    res.json(rows[0]);
  })
);

// ------------------------------------------------------- manejo de errores
app.use((err, _req, res, _next) => {
  if (err instanceof ReglaViolada) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ------------------------------------------------------------------ arranque
async function arrancar() {
  await esperarBase();
  await inicializarSchema();
  app.listen(PORT, () => console.log(`API de turnos escuchando en el puerto ${PORT}`));
}

arrancar().catch((err) => {
  console.error('No se pudo arrancar la API:', err);
  process.exit(1);
});
