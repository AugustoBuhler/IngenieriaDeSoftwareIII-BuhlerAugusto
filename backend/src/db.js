import pg from 'pg';

/**
 * La conexion se lee del ENTORNO, nunca del codigo.
 *
 * Ese es el punto: la misma imagen corre en tu maquina (DATABASE_URL apuntando a
 * localhost), en compose (apuntando al servicio `db`) y manana en QA o PROD,
 * sin recompilar nada. Si la cadena estuviera escrita en el codigo, cambiar de
 * entorno obligaria a construir una imagen nueva.
 */
const connectionString =
  process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/app';

export const pool = new pg.Pool({ connectionString });

/**
 * Crea el schema si no existe. El PostgreSQL del compose nace VACIO, asi que si
 * nadie aplica el schema al arrancar, la app falla en la primera consulta.
 */
export async function inicializarSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS profesionales (
      id           SERIAL PRIMARY KEY,
      nombre       TEXT NOT NULL,
      especialidad TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pacientes (
      id     SERIAL PRIMARY KEY,
      nombre TEXT NOT NULL,
      dni    TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS turnos (
      id              SERIAL PRIMARY KEY,
      paciente_id     INTEGER NOT NULL REFERENCES pacientes(id),
      profesional_id  INTEGER NOT NULL REFERENCES profesionales(id),
      fecha_hora      TIMESTAMPTZ NOT NULL,
      estado          TEXT NOT NULL DEFAULT 'PENDIENTE'
    );
  `);
}

/** Espera a que la base acepte conexiones. Arrancar no es estar listo. */
export async function esperarBase(intentos = 15, esperaMs = 2000) {
  for (let i = 1; i <= intentos; i++) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (err) {
      console.log(`Base no disponible (intento ${i}/${intentos}): ${err.message}`);
      if (i === intentos) throw err;
      await new Promise((r) => setTimeout(r, esperaMs));
    }
  }
}
