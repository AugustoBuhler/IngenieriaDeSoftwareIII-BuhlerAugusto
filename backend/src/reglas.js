/**
 * Reglas de negocio del sistema de turnos.
 *
 * Estan separadas de Express y de la base a proposito: son funciones puras que
 * reciben datos y devuelven un veredicto. Eso las hace testeables sin levantar
 * un servidor ni una base (lo vamos a necesitar en el TP5).
 */

export const ESTADOS = ['PENDIENTE', 'ATENDIDO', 'CANCELADO'];

/** Cuantos turnos como maximo puede tener un profesional en un mismo dia. */
export const MAX_TURNOS_POR_DIA = 8;

/** Error de negocio: lo distingue de un error inesperado para poder devolver 400. */
export class ReglaViolada extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'ReglaViolada';
  }
}

/** Regla 1 — el DNI es obligatorio y tiene que ser numerico de 7 u 8 digitos. */
export function validarDni(dni) {
  if (!/^\d{7,8}$/.test(String(dni ?? '').trim())) {
    throw new ReglaViolada('El DNI debe tener 7 u 8 digitos numericos');
  }
  return String(dni).trim();
}

/** Regla 2 — el nombre no puede estar vacio. */
export function validarNombre(nombre) {
  const limpio = String(nombre ?? '').trim();
  if (limpio.length < 2) {
    throw new ReglaViolada('El nombre debe tener al menos 2 caracteres');
  }
  return limpio;
}

/** Regla 3 — no se puede sacar un turno para un momento que ya paso. */
export function validarFechaFutura(fechaHora, ahora = new Date()) {
  const fecha = new Date(fechaHora);
  if (Number.isNaN(fecha.getTime())) {
    throw new ReglaViolada('La fecha y hora del turno no es valida');
  }
  if (fecha <= ahora) {
    throw new ReglaViolada('No se puede sacar un turno en una fecha pasada');
  }
  return fecha;
}

/**
 * Regla 4 — un profesional no puede tener dos turnos que se pisen.
 * Se considera que cada turno ocupa `duracionMin` minutos.
 */
export function haySolapamiento(fechaHora, turnosDelProfesional, duracionMin = 30) {
  const inicio = new Date(fechaHora).getTime();
  const fin = inicio + duracionMin * 60_000;

  return turnosDelProfesional.some((t) => {
    if (t.estado === 'CANCELADO') return false;
    const otroInicio = new Date(t.fecha_hora).getTime();
    const otroFin = otroInicio + duracionMin * 60_000;
    return inicio < otroFin && otroInicio < fin;
  });
}

/** Regla 5 — tope de turnos por profesional por dia. */
export function superaCupoDiario(fechaHora, turnosDelProfesional) {
  const dia = new Date(fechaHora).toISOString().slice(0, 10);
  const enEseDia = turnosDelProfesional.filter(
    (t) => t.estado !== 'CANCELADO' && new Date(t.fecha_hora).toISOString().slice(0, 10) === dia
  );
  return enEseDia.length >= MAX_TURNOS_POR_DIA;
}

/**
 * Regla 6 — transiciones de estado permitidas.
 * PENDIENTE puede ir a ATENDIDO o CANCELADO. Un turno ya cerrado no vuelve atras.
 */
const TRANSICIONES = {
  PENDIENTE: ['ATENDIDO', 'CANCELADO'],
  ATENDIDO: [],
  CANCELADO: [],
};

export function validarTransicion(estadoActual, estadoNuevo) {
  if (!ESTADOS.includes(estadoNuevo)) {
    throw new ReglaViolada(`Estado invalido: ${estadoNuevo}`);
  }
  const permitidos = TRANSICIONES[estadoActual] ?? [];
  if (!permitidos.includes(estadoNuevo)) {
    throw new ReglaViolada(
      `No se puede pasar de ${estadoActual} a ${estadoNuevo}`
    );
  }
  return estadoNuevo;
}
