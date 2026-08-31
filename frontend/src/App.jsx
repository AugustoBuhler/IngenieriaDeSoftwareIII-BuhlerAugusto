import { useEffect, useState } from 'react';
import { api } from './api.js';
import { formatearFecha } from './utilidades-que-no-existen.js';

const PANTALLAS = ['Turnos', 'Pacientes', 'Profesionales'];

export default function App() {
  const [pantalla, setPantalla] = useState('Turnos');
  const [error, setError] = useState(null);

  return (
    <div className="app">
      <header>
        <h1>Turnos de Consultorio</h1>
        <nav>
          {PANTALLAS.map((p) => (
            <button
              key={p}
              className={p === pantalla ? 'activo' : ''}
              onClick={() => {
                setPantalla(p);
                setError(null);
              }}
            >
              {p}
            </button>
          ))}
        </nav>
      </header>

      {error && <p className="error">{error}</p>}

      <main>
        {pantalla === 'Turnos' && <Turnos onError={setError} />}
        {pantalla === 'Pacientes' && <Pacientes onError={setError} />}
        {pantalla === 'Profesionales' && <Profesionales onError={setError} />}
      </main>
    </div>
  );
}

/** Hook chico para no repetir el patron cargar / recargar / manejar error. */
function useLista(cargar, onError) {
  const [items, setItems] = useState([]);
  const recargar = () =>
    cargar()
      .then(setItems)
      .catch((e) => onError(e.message));
  useEffect(() => {
    recargar();
  }, []);
  return [items, recargar];
}

function Profesionales({ onError }) {
  const [items, recargar] = useLista(api.listarProfesionales, onError);
  const [nombre, setNombre] = useState('');
  const [especialidad, setEspecialidad] = useState('');

  // Comportamiento de UI: el boton no se habilita con el formulario incompleto.
  const puedeEnviar = nombre.trim().length >= 2 && especialidad.trim().length >= 2;

  const crear = async (e) => {
    e.preventDefault();
    onError(null);
    try {
      await api.crearProfesional({ nombre, especialidad });
      setNombre('');
      setEspecialidad('');
      recargar();
    } catch (err) {
      onError(err.message);
    }
  };

  const borrar = async (id) => {
    onError(null);
    try {
      await api.borrarProfesional(id);
      recargar();
    } catch (err) {
      onError(err.message);
    }
  };

  return (
    <section>
      <form onSubmit={crear}>
        <input
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          placeholder="Especialidad"
          value={especialidad}
          onChange={(e) => setEspecialidad(e.target.value)}
        />
        <button type="submit" disabled={!puedeEnviar}>
          Agregar
        </button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Especialidad</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.especialidad}</td>
              <td>
                <button className="borrar" onClick={() => borrar(p.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Pacientes({ onError }) {
  const [items, recargar] = useLista(api.listarPacientes, onError);
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');

  // Validacion en el cliente: el DNI tiene que ser numerico de 7 u 8 digitos.
  // El backend la vuelve a aplicar — la del front es comodidad, no seguridad.
  const dniValido = /^\d{7,8}$/.test(dni.trim());
  const puedeEnviar = nombre.trim().length >= 2 && dniValido;

  const crear = async (e) => {
    e.preventDefault();
    onError(null);
    try {
      await api.crearPaciente({ nombre, dni });
      setNombre('');
      setDni('');
      recargar();
    } catch (err) {
      onError(err.message);
    }
  };

  return (
    <section>
      <form onSubmit={crear}>
        <input
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input placeholder="DNI" value={dni} onChange={(e) => setDni(e.target.value)} />
        <button type="submit" disabled={!puedeEnviar}>
          Agregar
        </button>
      </form>
      {dni && !dniValido && <p className="aviso">El DNI debe tener 7 u 8 digitos</p>}

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>DNI</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.dni}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Turnos({ onError }) {
  const [turnos, recargarTurnos] = useLista(api.listarTurnos, onError);
  const [pacientes] = useLista(api.listarPacientes, onError);
  const [profesionales] = useLista(api.listarProfesionales, onError);

  const [pacienteId, setPacienteId] = useState('');
  const [profesionalId, setProfesionalId] = useState('');
  const [fechaHora, setFechaHora] = useState('');

  const puedeEnviar = pacienteId && profesionalId && fechaHora;

  const crear = async (e) => {
    e.preventDefault();
    onError(null);
    try {
      await api.crearTurno({
        pacienteId: Number(pacienteId),
        profesionalId: Number(profesionalId),
        fechaHora: new Date(fechaHora).toISOString(),
      });
      setFechaHora('');
      recargarTurnos();
    } catch (err) {
      onError(err.message);
    }
  };

  const cambiar = async (id, estado) => {
    onError(null);
    try {
      await api.cambiarEstado(id, estado);
      recargarTurnos();
    } catch (err) {
      onError(err.message);
    }
  };

  return (
    <section>
      <form onSubmit={crear}>
        <select value={pacienteId} onChange={(e) => setPacienteId(e.target.value)}>
          <option value="">Paciente…</option>
          {pacientes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>

        <select value={profesionalId} onChange={(e) => setProfesionalId(e.target.value)}>
          <option value="">Profesional…</option>
          {profesionales.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} ({p.especialidad})
            </option>
          ))}
        </select>

        <input
          type="datetime-local"
          value={fechaHora}
          onChange={(e) => setFechaHora(e.target.value)}
        />
        <button type="submit" disabled={!puedeEnviar}>
          Sacar turno
        </button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Fecha y hora</th>
            <th>Paciente</th>
            <th>Profesional</th>
            <th>Estado</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {turnos.map((t) => (
            <tr key={t.id}>
              <td>{new Date(t.fecha_hora).toLocaleString('es-AR')}</td>
              <td>{t.paciente}</td>
              <td>
                {t.profesional} <span className="tenue">({t.especialidad})</span>
              </td>
              <td>
                <span className={`estado ${t.estado.toLowerCase()}`}>{t.estado}</span>
              </td>
              <td>
                {t.estado === 'PENDIENTE' && (
                  <>
                    <button onClick={() => cambiar(t.id, 'ATENDIDO')}>Atendido</button>
                    <button className="borrar" onClick={() => cambiar(t.id, 'CANCELADO')}>
                      Cancelar
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
