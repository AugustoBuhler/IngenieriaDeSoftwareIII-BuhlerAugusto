/**
 * Cliente de la API.
 *
 * Todas las rutas son RELATIVAS (`/api/...`): el front no sabe donde vive el
 * backend. En desarrollo lo resuelve el proxy de Vite; en el contenedor, nginx.
 * Gracias a eso la MISMA imagen sirve en cualquier entorno y no hace falta CORS:
 * para el navegador, todo viene del mismo origen.
 */
async function pedir(ruta, opciones = {}) {
  const res = await fetch(`/api${ruta}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones,
  });

  if (!res.ok) {
    const cuerpo = await res.json().catch(() => ({}));
    throw new Error(cuerpo.error ?? `Error ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  listarProfesionales: () => pedir('/profesionales'),
  crearProfesional: (datos) =>
    pedir('/profesionales', { method: 'POST', body: JSON.stringify(datos) }),
  borrarProfesional: (id) => pedir(`/profesionales/${id}`, { method: 'DELETE' }),

  listarPacientes: () => pedir('/pacientes'),
  crearPaciente: (datos) =>
    pedir('/pacientes', { method: 'POST', body: JSON.stringify(datos) }),

  listarTurnos: () => pedir('/turnos'),
  crearTurno: (datos) => pedir('/turnos', { method: 'POST', body: JSON.stringify(datos) }),
  cambiarEstado: (id, estado) =>
    pedir(`/turnos/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) }),
};
