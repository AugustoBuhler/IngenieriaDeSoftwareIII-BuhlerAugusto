import { describe, it, expect } from 'vitest';
import {
  ReglaViolada,
  MAX_TURNOS_POR_DIA,
  validarDni,
  validarNombre,
  validarFechaFutura,
  haySolapamiento,
  superaCupoDiario,
  validarTransicion,
} from '../src/reglas.js';

// Las reglas son funciones puras: entra un valor, sale un veredicto. No hace falta
// ningun doble. Las fechas van siempre en UTC (la Z del final) y `ahora` se pasa a
// mano, asi el resultado no depende del reloj ni de la zona horaria de la maquina.

describe('validarDni', () => {
  it.each([
    ['vacio', ''],
    ['nulo', null],
    ['de 6 digitos', '123456'],
    ['de 9 digitos', '123456789'],
    ['con letras', '12a45678'],
    ['con puntos', '12.345.678'],
  ])('rechaza un DNI %s', (_caso, dni) => {
    expect(() => validarDni(dni)).toThrow('El DNI debe tener 7 u 8 digitos numericos');
  });

  it.each([
    ['de 7 digitos', '1234567', '1234567'],
    ['de 8 digitos', '12345678', '12345678'],
    ['con espacios alrededor', ' 12345678 ', '12345678'],
  ])('acepta un DNI %s y lo devuelve limpio', (_caso, dni, esperado) => {
    expect(validarDni(dni)).toBe(esperado);
  });
});

describe('validarNombre', () => {
  it('exige al menos 2 caracteres sin contar los espacios', () => {
    expect(() => validarNombre('  A  ')).toThrow('El nombre debe tener al menos 2 caracteres');
    expect(validarNombre('  Al ')).toBe('Al');
  });
});

describe('validarFechaFutura', () => {
  const ahora = new Date('2026-11-02T12:00:00Z');

  it('rechaza un turno en el mismo instante que ahora', () => {
    expect(() => validarFechaFutura('2026-11-02T12:00:00Z', ahora)).toThrow(
      'No se puede sacar un turno en una fecha pasada'
    );
  });

  it('rechaza una fecha que no se puede interpretar', () => {
    expect(() => validarFechaFutura('no-es-una-fecha', ahora)).toThrow(ReglaViolada);
  });
});

describe('haySolapamiento', () => {
  const turnoDeLas10 = { fecha_hora: '2026-11-03T10:00:00Z', estado: 'PENDIENTE' };

  it('detecta un turno que empieza antes de que termine el otro', () => {
    expect(haySolapamiento('2026-11-03T10:15:00Z', [turnoDeLas10])).toBe(true);
  });

  it('permite un turno que empieza justo cuando termina el anterior', () => {
    expect(haySolapamiento('2026-11-03T10:30:00Z', [turnoDeLas10])).toBe(false);
  });

  it('ignora los turnos cancelados', () => {
    const cancelado = { ...turnoDeLas10, estado: 'CANCELADO' };

    expect(haySolapamiento('2026-11-03T10:00:00Z', [cancelado])).toBe(false);
  });
});

describe('superaCupoDiario', () => {
  // `cantidad` turnos el mismo dia, uno por hora desde las 9
  const turnosDelDia = (dia, cantidad, estado = 'PENDIENTE') =>
    Array.from({ length: cantidad }, (_, i) => ({
      fecha_hora: `${dia}T${String(9 + i).padStart(2, '0')}:00:00Z`,
      estado,
    }));

  it.each([
    ['lleno', MAX_TURNOS_POR_DIA, true],
    ['con lugar', MAX_TURNOS_POR_DIA - 1, false],
  ])('el cupo esta %s con %i turnos ese dia', (_caso, cantidad, esperado) => {
    const turnos = turnosDelDia('2026-11-04', cantidad);

    expect(superaCupoDiario('2026-11-04T20:00:00Z', turnos)).toBe(esperado);
  });

  it('no cuenta los turnos cancelados ni los de otro dia', () => {
    const turnos = [
      ...turnosDelDia('2026-11-04', MAX_TURNOS_POR_DIA, 'CANCELADO'),
      ...turnosDelDia('2026-11-05', MAX_TURNOS_POR_DIA),
    ];

    expect(superaCupoDiario('2026-11-04T20:00:00Z', turnos)).toBe(false);
  });
});

describe('validarTransicion', () => {
  it.each([
    ['PENDIENTE', 'ATENDIDO'],
    ['PENDIENTE', 'CANCELADO'],
  ])('permite pasar de %s a %s', (actual, nuevo) => {
    expect(validarTransicion(actual, nuevo)).toBe(nuevo);
  });

  it.each([
    ['ATENDIDO', 'PENDIENTE'],
    ['ATENDIDO', 'CANCELADO'],
    ['CANCELADO', 'ATENDIDO'],
  ])('un turno cerrado no vuelve atras: de %s a %s se rechaza', (actual, nuevo) => {
    expect(() => validarTransicion(actual, nuevo)).toThrow(
      `No se puede pasar de ${actual} a ${nuevo}`
    );
  });

  it('rechaza un estado que no existe', () => {
    expect(() => validarTransicion('PENDIENTE', 'BORRADO')).toThrow('Estado invalido: BORRADO');
  });
});
