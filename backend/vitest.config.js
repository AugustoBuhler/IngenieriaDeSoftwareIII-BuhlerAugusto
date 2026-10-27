import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      // text: la tabla en la consola · html: el reporte navegable que se publica como
      // artefacto · json-summary: los totales que el pipeline convierte en el resumen
      reporter: ['text', 'html', 'json-summary'],
      // Que entra en la cuenta: todo src/ MENOS el arranque. Se excluye en vez de
      // nombrar lo que entra: un archivo nuevo en src/ entra solo a la medicion, y si
      // nace sin tests el numero baja y el gate avisa.
      //  - index.js: rutas y arranque del servidor; las reglas ya no viven ahi.
      //  - db.js: la conexion y el schema; sin reglas, y solo se prueba contra una
      //    base de verdad (eso es integracion, TP7).
      include: ['src/**'],
      exclude: ['src/index.js', 'src/db.js'],
      // El umbral que frena el build: por debajo, vitest sale con error aunque todos
      // los tests pasen. El numero y su porque estan en decisiones.md (TP5).
      thresholds: { lines: 90, branches: 85 },
    },
  },
});
