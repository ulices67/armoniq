# Validación — Armoniq 0.1

Fecha: 6 de octubre de 2026.

## Resultados completados

- TypeScript estricto: sin errores.
- Build de frontend y Worker: completado.
- 14 pruebas automatizadas de DSP y scoring: aprobadas.
- 38 comprobaciones de integración contra Worker local compilado: aprobadas.
- Migración inicial D1 aplicada al entorno local.
- Inicio y metrónomo inspeccionados visualmente en escritorio.
- Inicio/parada del metrónomo y cambio a compás 6/8 verificados en el navegador.
- Se observó un desbordamiento móvil en los controles de tempo y se redujeron anchos y espaciados. La revisión visual móvil final no se completó tras reiniciarse el navegador.

## Alcance de las pruebas de audio

Frecuencias sintéticas B0, E1, E2, A2, G3, C4, A4, E5 y A5, con armónicos; silencio; señal débil; referencia de 442 Hz; conversión de octavas; desviación de 17 cents; scoring con pulsos ausentes. Las pruebas de frecuencia aprobaron tolerancia inferior a 2 cents en estas señales sintéticas.

Esto no acredita el mismo error en micrófonos e instrumentos reales. No se probó la captura de micrófono con hardware, MIDI físico, grabación en Safari o precisión de audio por loopback.

## Alcance de las pruebas API

Anonimato rechazado, origen externo rechazado, perfil inválido rechazado, perfil persistente, datos separados entre dos usuarios, finalización de lección idempotente, validación por instrumento, favoritos persistentes, inicio de sesión de práctica, rechazo de cierre de sesión ajena, finalización idempotente, límite de duración al tiempo transcurrido y score nulo obligatorio para práctica libre.

Veintiuna rutas respondieron 200; una ruta desconocida respondió 404. Los tests crean identidades aisladas y no alteran el perfil local usado en la interfaz.

## Incidencias corregidas

- Error de sintaxis TSX en el guardado de favoritos.
- Tipado de respuestas JSON y resultado nulo.
- Primera entrada de acompañamiento cuando se desactiva la cuenta previa.
- Solicitudes rechazadas con cuerpo sin consumir en el proxy local: el cuerpo ahora se lee antes de validar el origen.
- Controles móviles de tempo y varios pulsos.

## Verificaciones pendientes antes del lanzamiento público

- Navegación y formularios E2E completos en móvil.
- Medición de audio en micrófonos internos/USB, silencio y ruido real.
- Permisos revocados, cambios de dispositivo y suspensión en Safari/iOS.
- Calibración de latencia para scoring de ritmo.
- Pruebas de carga, rate limiting, backups y restauración.
- Auditoría de accesibilidad y contraste sistemática.
- Proveedor de identidad propio, recuperación de cuentas y OAuth externo.
- Evaluación pedagógica de contenido y expansión del catálogo.

La publicación privada valida entrega técnica del build; no sustituye estos requisitos comerciales.

