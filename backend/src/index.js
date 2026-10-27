import express from 'express';
import { pool, inicializarSchema, esperarBase } from './db.js';
import { ReglaViolada, NoEncontrado } from './reglas.js';
import {
  crearProfesional,
  eliminarProfesional,
  crearPaciente,
  crearTurno,
  cambiarEstadoTurno,
} from './servicios.js';

/**
 * Aca quedan solo las rutas y el arranque: cada handler pide, delega y responde.
 * Las reglas viven en reglas.js (puras) y en servicios.js (las que tocan la base, que
 * la reciben por parametro): por eso este archivo no entra en la cuenta de cobertura.
 */
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
    res.status(201).json(await crearProfesional(pool, req.body));
  })
);

app.delete(
  '/api/profesionales/:id',
  ruta(async (req, res) => {
    await eliminarProfesional(pool, req.params.id);
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
    res.status(201).json(await crearPaciente(pool, req.body));
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
    res.status(201).json(await crearTurno(pool, req.body));
  })
);

app.patch(
  '/api/turnos/:id/estado',
  ruta(async (req, res) => {
    res.json(await cambiarEstadoTurno(pool, req.params.id, req.body.estado));
  })
);

// ------------------------------------------------------- manejo de errores
app.use((err, _req, res, _next) => {
  if (err instanceof ReglaViolada) {
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof NoEncontrado) {
    return res.status(404).json({ error: err.message });
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
