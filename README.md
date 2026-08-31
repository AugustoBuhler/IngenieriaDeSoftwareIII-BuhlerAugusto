# IngSoft3 — Sistema de Turnos de Consultorio

Sistema de gestion de turnos para consultorios: permite registrar
profesionales y la agenda que los cruza. Es la app del semestre de **Ingeniería
del Software 3** (UCC, 2026) — cada trabajo práctico le agrega una capa del
sistema de entrega: contenedores, planificación, CI, tests, despliegue,
infraestructura como código y seguridad.

| | |
|---|---|
| **Backend** | Node 22 + Express — API REST |
| **Frontend** | React 18 + Vite, servido por nginx |
| **Base de datos** | PostgreSQL 16 |
| **Orquestación** | Docker Compose |

---

## Arranque

Necesitás **Docker** instalado y corriendo (`docker ps` tiene que responder).

```bash
git clone https://github.com/AugustoBuhler/IngenieriaDeSoftwareIII-BuhlerAugusto.git
cd IngenieriaDeSoftwareIII-BuhlerAugusto

cp .env.example .env          # 1 · el secreto, que no viaja en el repo
docker compose up -d --build  # 2 · el sistema completo
```

Listo. Son **dos pasos, no uno**, y eso es a propósito: el `.env` contiene la
contraseña de la base y por eso no está commiteado. Lo único que viaja en el
repositorio es `.env.example`, que documenta qué variables hacen falta.

| Dónde | URL |
|---|---|
| Aplicación | http://localhost:3000 |
| API | http://localhost:8080 |
| Salud de la API | http://localhost:8080/health |

Para apagar:

```bash
docker compose down       # apaga, CONSERVA los datos
docker compose down -v    # apaga y BORRA el volumen: la base queda vacía
```

## Levantarlo sin el código, desde las imágenes publicadas

Las imágenes están publicadas en GitHub Container Registry con visibilidad
pública. Este compose **no construye nada**: las descarga.

```bash
cp .env.example .env
docker compose -f docker-compose.registry.yml up -d
```

- `ghcr.io/augustobuhler/turnos-backend:v0.1.0`
- `ghcr.io/augustobuhler/turnos-frontend:v0.1.0`

## Estructura

```
.
├── backend/              API REST
│   ├── src/
│   │   ├── index.js        rutas de Express
│   │   ├── reglas.js       reglas de negocio (funciones puras)
│   │   └── db.js           pool de PostgreSQL y schema
│   ├── Dockerfile          multi-stage: build → runtime
│   └── .dockerignore
├── frontend/             SPA
│   ├── src/
│   ├── nginx.conf          sirve los estáticos y proxea /api al backend
│   ├── Dockerfile          multi-stage: build con Node → nginx
│   └── .dockerignore
├── docker-compose.yml            construye desde el código
├── docker-compose.registry.yml   descarga las imágenes publicadas
├── .env.example
├── decisiones.md         las decisiones de cada TP y por qué
├── evidencias.md         capturas y salidas que respaldan la entrega
└── TpsDocs/              bitácora detallada por trabajo práctico
```

## La API

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/health` | Chequeo de salud |
| `GET` `POST` | `/api/pacientes` | Listar y dar de alta pacientes |
| `GET` `POST` `DELETE` | `/api/profesionales` | Listar, dar de alta y eliminar profesionales |
| `GET` `POST` | `/api/turnos` | Listar y sacar turnos |
| `PATCH` | `/api/turnos/:id/estado` | Cambiar el estado de un turno |

## Reglas de negocio

Viven en [`backend/src/reglas.js`](backend/src/reglas.js), separadas de Express y
de la base: son funciones puras que reciben datos y devuelven un veredicto, así
que se pueden verificar sin levantar un servidor.

1. El DNI del paciente debe tener 7 u 8 dígitos numéricos
2. No puede haber dos pacientes con el mismo DNI
3. No se puede sacar un turno en una fecha que ya pasó
4. Un profesional no puede tener dos turnos que se superpongan
5. Un profesional tiene un cupo máximo de turnos por día
6. Un turno `PENDIENTE` puede pasar a `ATENDIDO` o `CANCELADO`, pero un turno ya
   cerrado no vuelve atrás
7. No se puede eliminar un profesional que tiene turnos pendientes

## Desarrollo sin Docker

```bash
# base de datos como contenedor suelto
docker run -d --name pg-turnos -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=app -p 5432:5432 postgres:16-alpine

cd backend  && npm install && npm run dev   # API en :8080
cd frontend && npm install && npm run dev   # SPA en :5173 (Vite proxea /api)
```

---

*Repositorio de cursada — [decisiones.md](decisiones.md) · [evidencias.md](evidencias.md) · [TpsDocs/](TpsDocs/)*
