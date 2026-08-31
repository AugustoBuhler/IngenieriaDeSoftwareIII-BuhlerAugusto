# TpsDocs — bitácora de los trabajos prácticos

Documentación completa de cada TP: qué pide el enunciado, qué se hizo, con qué
comandos, qué salió mal y qué hay que poder explicar en la defensa.

| Documento | TP | Peso en P1 | Estado |
|---|---|---|---|
| [TP1.md](TP1.md) | Git colaborativo | 5% | **cerrado** · `v1.0.0` |
| [TP2.md](TP2.md) | Contenedores | 40% | **cerrado** · `v2.0.0` |
| TP3.md | Planificación y trazabilidad | 10% | pendiente |
| TP4.md | CI · Pipelines as Code | 45% | pendiente |

## Qué es esto y qué NO es

Esta carpeta es **material de trabajo y de estudio**, no la entrega.

Lo que la cátedra corrige vive en la **raíz** del repositorio:

- `decisiones.md` — un solo archivo acumulativo, una sección por TP
- `evidencias.md` — capturas del TP1 y del TP2

Estos documentos son más largos y más detallados: registran el paso a paso, los
comandos exactos con su salida real, los errores que aparecieron, y las preguntas
de defensa con su respuesta. Sirven para preparar los 6 minutos de la mesa.

## Convención de capturas

Las imágenes viven en `img/` **en la raíz del repositorio**, no dentro de esta
carpeta, para que `evidencias.md` (que es lo que se corrige) y estos documentos
apunten al mismo archivo.

- Desde `evidencias.md` (raíz): `![alt](img/nombre.png)`
- Desde acá (`TpsDocs/`): `![alt](../img/nombre.png)`
