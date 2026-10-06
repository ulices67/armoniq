# Armoniq

Aplicación web de aprendizaje musical con React, TypeScript y TSX. Esta es la base funcional 0.1, con identidad y persistencia reales en Sites; no implementa todavía todos los motores comerciales del brief.

## Entrega

- Bienvenida, acceso, perfil e instrumentos.
- Inicio con datos reales, ruta y lecciones.
- Afinador YIN monofónico mediante micrófono y Worker.
- Metrónomo con reloj de audio, acentos, subdivisiones, swing y tap tempo.
- Acordes, teclado, mástil y entrada MIDI compatible.
- Tres estudios originales con acompañamiento sintetizado y loop.
- Estudio de práctica, grabación local y descarga.
- Entrenamiento de oído y ritmo.
- Historial, favoritos, exportación y eliminación del perfil musical.

La guía de práctica utiliza reglas. No hay profesor generativo, análisis polifónico ni cámara. Apple, Google, passkeys y correo propio requieren configurar un proveedor de identidad: el acceso de esta publicación es ChatGPT.

## Requisitos

Node.js >=22.13 y npm. No introducir secretos en el código ni en variables públicas.

## Desarrollo local

```sh
npm ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_cynical_nitro.sql
npm run dev -- --port 5194
```

Aplicar esa migración solo al inicializar una base vacía. No repetirla sobre tablas existentes.

En Windows, si el shim de npm resuelve una ruta incorrecta, invocar el entrypoint real de npm:

```powershell
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" ci
node scripts/run-framework.mjs dev --port 5194
```

El servidor de desarrollo incluye un usuario simulado local, Seedy, mediante el login del starter. Su perfil es solo para desarrollo, no se publica como usuario del producto. La producción obtiene identidad del dispatcher de Sites. El modo simulado no se incluye en el build de producción.

## Comprobaciones

```sh
node node_modules/typescript/bin/tsc --noEmit
node --test tests/audio.test.mjs
node scripts/run-framework.mjs build
```

Para API de integración, arrancar el Worker compilado en un entorno exclusivamente local:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js dev --config dist/server/wrangler.json --name armoniq-qa-worker --local --persist-to .wrangler/state --ip 127.0.0.1 --inspector-port 0 --port 5195
node tests/api.integration.mjs
```

El test crea dos identidades QA aleatorias y elimina solo sus propios datos al finalizar. Nunca apunta a producción. El Worker local sin dispatcher acepta cabeceras de prueba; no debe exponerse fuera de loopback. Detener el Worker compilado antes de reconstruir en Windows para evitar bloqueos de archivos en dist.

## Publicación

El proyecto está preparado para Sites y declara la base DB en .openai/hosting.json. La publicación aplica las migraciones y sirve frontend y API desde el mismo origen. No utilizar credenciales locales de desarrollo en producción. La publicación inicial es privada.

Para migrar a otro host, conservar el código TSX y sustituir el adaptador de identidad y el acceso a D1 por equivalentes del host. No desplegar el handler confiando directamente en headers aportados por usuarios externos.

## Documentación

- [Especificación técnica](docs/ESPECIFICACION-TECNICA.md)
- [Validación de la entrega](docs/VALIDACION.md)

## Límites conocidos

Contenido de guitarra inicial y herramientas generales para los demás instrumentos; reconocimiento monofónico solamente; puntuaciones de oído/ritmo calculadas en cliente para uso personal; métricas limitadas al historial de 500 sesiones; grabaciones locales sin sincronización; pausa del audio al ocultar pestaña. La precisión física requiere pruebas con dispositivos reales.

## Recursos

La fotografía de estudio fue generada para esta aplicación. El catálogo de canciones contiene estudios originales, sin masters comerciales. Las fuentes se cargan desde Google Fonts con fallback local. Antes de una política de recursos totalmente autocontenida, servir las fuentes localmente.

