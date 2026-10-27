import { describe, it, expect, vi } from 'vitest';
import { ReglaViolada, NoEncontrado } from '../src/reglas.js';
import {
  crearProfesional,
  eliminarProfesional,
  crearPaciente,
  crearTurno,
  cambiarEstadoTurno,
} from '../src/servicios.js';

/**
 * El doble de la base: un objeto con `query`, como el pool de pg, que contesta EN
 * ORDEN las filas que le pasamos (eso lo hace un stub). Como `query` es un `vi.fn()`,
 * ademas registra cada llamada: cuando el test verifica que consultas se hicieron —y
 * sobre todo cuales NO—, el doble esta funcionando como mock.
 */
function baseQueResponde(...respuestas) {
  const query = vi.fn();
  for (const rows of respuestas) query.mockResolvedValueOnce({ rows });
  return { query };
}

describe('crearProfesional', () => {
  it('rechaza una especialidad vacia sin tocar la base', async () => {
    const db = baseQueResponde();

    await expect(crearProfesional(db, { nombre: 'Dra. Gomez', especialidad: ' ' })).rejects.toThrow(
      ReglaViolada
    );
    expect(db.query).not.toHaveBeenCalled();
  });
});

describe('crearPaciente', () => {
  it('rechaza un DNI que ya esta registrado y no inserta nada', async () => {
    // Arrange: la base contesta que ese DNI ya existe
    const db = baseQueResponde([{ existe: 1 }]);

    // Act: intentar el alta
    const alta = crearPaciente(db, { nombre: 'Ana Perez', dni: '30111222' });

    // Assert: la regla corta, y la unica consulta fue el SELECT (el INSERT nunca llego)
    await expect(alta).rejects.toThrow('Ya existe un paciente con el DNI 30111222');
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  it('inserta el paciente con el nombre y el DNI ya limpios', async () => {
    const db = baseQueResponde([], [{ id: 7, nombre: 'Ana Perez', dni: '30111222' }]);

    const paciente = await crearPaciente(db, { nombre: '  Ana Perez ', dni: ' 30111222 ' });

    expect(paciente.id).toBe(7);
    expect(db.query).toHaveBeenLastCalledWith(
      'INSERT INTO pacientes (nombre, dni) VALUES ($1, $2) RETURNING *',
      ['Ana Perez', '30111222']
    );
  });
});

describe('eliminarProfesional', () => {
  it('no borra a un profesional que todavia tiene turnos pendientes', async () => {
    const db = baseQueResponde([{ pendiente: 1 }]);

    await expect(eliminarProfesional(db, 3)).rejects.toThrow(
      'No se puede eliminar un profesional con turnos pendientes'
    );
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  it('borra al profesional cuando no le quedan turnos pendientes', async () => {
    const db = baseQueResponde([], []);

    await eliminarProfesional(db, 3);

    expect(db.query).toHaveBeenLastCalledWith('DELETE FROM profesionales WHERE id = $1', [3]);
  });
});

describe('crearTurno', () => {
  const ahora = new Date('2026-11-02T12:00:00Z');
  const pedido = { pacienteId: 1, profesionalId: 2, fechaHora: '2026-11-03T10:00:00Z' };

  it('rechaza el turno si el profesional ya tiene otro a esa hora', async () => {
    const db = baseQueResponde([{ fecha_hora: '2026-11-03T10:00:00Z', estado: 'PENDIENTE' }]);

    await expect(crearTurno(db, pedido, ahora)).rejects.toThrow(
      'El profesional ya tiene un turno que se superpone con ese horario'
    );
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  it('guarda el turno con la fecha en ISO cuando el horario esta libre', async () => {
    const db = baseQueResponde([], [{ id: 10, estado: 'PENDIENTE' }]);

    const turno = await crearTurno(db, pedido, ahora);

    expect(turno.id).toBe(10);
    expect(db.query).toHaveBeenLastCalledWith(expect.stringContaining('INSERT INTO turnos'), [
      1,
      2,
      '2026-11-03T10:00:00.000Z',
    ]);
  });
});

describe('cambiarEstadoTurno', () => {
  it('avisa que el turno no existe en vez de intentar actualizarlo', async () => {
    const db = baseQueResponde([]);

    await expect(cambiarEstadoTurno(db, 99, 'ATENDIDO')).rejects.toThrow(NoEncontrado);
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  it('actualiza el estado cuando la transicion esta permitida', async () => {
    const db = baseQueResponde([{ estado: 'PENDIENTE' }], [{ id: 5, estado: 'ATENDIDO' }]);

    const turno = await cambiarEstadoTurno(db, 5, 'ATENDIDO');

    expect(turno.estado).toBe('ATENDIDO');
    expect(db.query).toHaveBeenLastCalledWith(
      'UPDATE turnos SET estado = $1 WHERE id = $2 RETURNING *',
      ['ATENDIDO', 5]
    );
  });
});
