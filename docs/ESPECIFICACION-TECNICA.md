# Armoniq — Especificación técnica y plan de producto

**Versión:** 0.1 · **Fecha:** 6 de octubre de 2026  
**Plataforma de esta entrega:** aplicación web React con TypeScript/TSX.  
**Dirección del producto:** plataforma de aprendizaje musical desde fundamentos físicos hasta interpretación, lectura, técnica e improvisación.

## 1. Alcance y criterio de realidad

Armoniq conecta cuenta → perfil musical → ruta → lección → práctica → progreso. La entrega inicial contiene lógica ejecutable, audio sintetizado, análisis de micrófono y persistencia en servidor. No usa porcentajes de ejemplo ni datos de usuarios inventados como progreso.

Esta versión inicia una aplicación real, pero no equivale todavía a toda la plataforma comercial descrita en el brief. El contenido especializado se concentra en guitarra; otros instrumentos disponen de perfil, fundamentos y herramientas generales. El reconocimiento polifónico, la visión por cámara y el profesor generativo requieren desarrollos y validaciones adicionales.

### Matriz de capacidades

| Capacidad | Estado 0.1 | Límite o siguiente paso |
|---|---|---|
| Acceso y cuenta | Identidad real mediante inicio con ChatGPT en la publicación privada | No hay Apple, Google, contraseña propia ni passkeys de Armoniq |
| Perfil musical | Nombre, instrumento activo, experiencia declarada, objetivo y minutos diarios guardados | Edad y estilos no se solicitan todavía |
| Múltiples instrumentos | Sesiones y lecciones se registran por instrumento; cambiar el activo conserva lo anterior | No hay nivel calculado por instrumento |
| Prueba de nivel | No implementada | Experiencia declarada, nunca presentada como diagnóstico |
| Inicio | Siguiente lección, herramientas, plan orientativo y cifras derivadas del historial | El plan no es un optimizador pedagógico completo |
| Ruta y lecciones | Siete lecciones iniciales de guitarra; fundamentos para los demás instrumentos | Sin vídeos, manos animadas o curso avanzado |
| Afinador | Micrófono, YIN monofónico en Worker, cents, perfiles, modo automático/manual/cromático, A4 y referencias | No certifica precisión física de ±1 cent o latencia universal |
| Metrónomo | AudioContext, acentos, 2/4–7/8, subdivisiones, swing en dos partes, tap tempo, silencio por compás, volumen | Cambiar tempo detiene el transporte; rampas adaptativas pendientes |
| Acordes | Ocho formas de guitarra con sonido y teclado de piano | No hay búsqueda ilimitada, inversiones completas ni reconocimiento de lo tocado |
| Notas | Octava de piano, primeras posiciones de guitarra, recepción MIDI si el navegador lo permite | MIDI no se usa aún para puntuar interpretaciones |
| Canciones | Tres estudios originales, secciones, acordes sincronizados, velocidad, bucle, cuenta previa y acompañamiento sintetizado | No hay canciones comerciales, stems grabados, letra ni tablatura editorial |
| Práctica libre | Temporizador, metrónomo, anotación, grabación local y descarga | Audio no se sincroniza ni se puntúa |
| Oído | Cinco rondas de reconocimiento entre C4, D4, E4, G4 y A4 | No incluye todavía intervalos o dictado melódico |
| Ritmo | Cuenta previa, 16 pulsos, desviaciones y puntuación de pulsaciones | Sin detección de ataques por micrófono ni calibración de latencia |
| Guía | Reglas deterministas según lecciones y último resultado rítmico | No es un chat generativo ni diagnostica dedos/postura |
| Progreso | Lecciones, duración, sesiones, actividad semanal, favoritos, exportación y eliminación | Estadísticas sobre un máximo de 500 sesiones recientes |
| Cámara, logros y repetición espaciada | Diseñados en esta especificación | Pendientes de implementación |

Las funciones pendientes no deben adquirir apariencia de funcionamiento por medio de números aleatorios, respuestas genéricas atribuidas a análisis de audio o botones que anuncien éxito sin una operación real.

## 2. Experiencia e identidad visual

Se conservan los rasgos de las diez referencias: fondo crema, verde bosque, acento naranja, títulos serif, tarjetas suaves, iconografía fina y fotografía cálida. La web adapta el contenido a escritorio sin dibujar un teléfono alrededor. En móvil aparece navegación inferior: Inicio, Aprender, Práctica, Biblioteca y Perfil.

Tokens principales:

- Fondo: `#F7F3EB`; superficie: `#FFFDF8`.
- Texto: `#142D28`; verde principal: `#1D4E3E`.
- Naranja de acción: `#ED7B2B`; verde claro: `#E5EBDE`.
- Títulos: Georgia; texto y controles: DM Sans con fallback de sistema.
- Radios: 18–22 px para superficies; 30–32 px para botones.
- El color se acompaña de texto para afinación, errores y estados.
- Los controles deben permitir teclado, foco visible, ampliación y reducción de movimiento.

La fotografía del estudio se generó como un recurso independiente. Los screenshots proporcionados son referencias de diseño, no interfaces pegadas como una imagen.

### Rutas

| Ruta | Finalidad |
|---|---|
| /bienvenida, /acceso | Presentación y entrada al proveedor de identidad |
| /perfil-musical | Alta o edición del perfil, elección de instrumento y objetivo |
| /inicio | Continuidad y resumen personal |
| /aprender, /leccion/:id | Ruta y secuencia Aprende → Practica → Resumen |
| /practica | Acceso a herramientas |
| /afinador, /afinaciones | Escucha y perfiles de afinación |
| /metronomo | Reloj, compás y subdivisiones |
| /acordes, /notas | Biblioteca musical interactiva |
| /canciones, /cancion/:id | Estudios y reproductor por secciones |
| /estudio | Práctica libre con grabación |
| /oido, /ritmo | Ejercicios evaluables |
| /profesor | Guía determinista; futura superficie del profesor con IA |
| /perfil | Historial, métricas y control de datos |
| /privacidad | Explicación del tratamiento de audio y datos |

### Flujos implementados

**Nuevo usuario:** bienvenida → iniciar sesión → perfil musical → guardar → inicio → primera lección.  
**Usuario recurrente:** cuenta → perfil existente → siguiente lección no completada del instrumento activo.  
**Lección:** pasos de contenido → herramienta adecuada → confirmación de práctica → completar → ruta actualizada. Completar contenido no acredita dominio técnico.  
**Práctica libre:** crear sesión servidor → iniciar tiempo → pausar o grabar → terminar → guardar resumen → consultar historial.  
**Ritmo/oído:** crear sesión → realizar ejercicio → ver resultado → guardar → repetir.  
**Cambiar instrumento:** editar perfil → elegir instrumento → conservar sesiones anteriores → cargar la ruta correspondiente.

Estados necesarios: carga, ausencia de perfil, lista vacía, micrófono denegado, dispositivo inexistente, audio suspendido, error de guardado, sesión expirada y éxito confirmado. Una falla de guardado conserva el estado de la sesión para volver a intentar.

## 3. Arquitectura de la entrega

```text
NAVEGADOR — React / TypeScript / TSX
├── Pantallas y componentes accesibles
├── AudioContext compartido
│   ├── Transport / sintetizador de clics
│   ├── tonos y acompañamiento
│   └── AnalyserNode → Worker YIN
├── MediaRecorder → Blob local → descarga
└── MIDI Input → explorador de notas
             │ HTTPS / JSON
             ▼
SERVIDOR — Vinext / Cloudflare Worker
├── identidad proporcionada por el dispatcher de Sites
├── validación Zod y autorización por usuario
├── API /api/state
└── D1: perfiles, sesiones, lecciones, favoritos
```

Se usa el starter Vinext existente y se conserva su integración Sites. El frontend está escrito en TSX; el servidor y los motores en TypeScript. El lockfile fija las versiones exactas instaladas. D1 es una base relacional SQLite administrada. Esta entrega no utiliza PostgreSQL, Redis, FastAPI ni almacenamiento R2.

La decisión de empezar con un monolito modular evita operar múltiples servicios antes de validar la experiencia. Los motores de audio permanecen en el cliente para evitar enviar micrófono a la nube y no depender de la red para el pulso.

### Organización del código

- `app/`: rutas, layout, estilos, acceso y API.
- `components/armoniq.tsx`: composición de cuenta, perfil, bienvenida e inicio.
- `components/audio-tools.tsx`: afinador y metrónomo.
- `components/learning.tsx`: lecciones, acordes, notas y estudios.
- `components/practice.tsx`: estudio, oído, ritmo, guía y perfil.
- `components/shared.tsx`: contexto, controles y diagramas.
- `lib/content.ts`: catálogo inicial tipado y funciones musicales.
- `lib/audio.ts`: contexto de audio, síntesis y transporte.
- `lib/pitch.ts`, `lib/pitch.worker.ts`: análisis monofónico.
- `db/schema.ts`, `drizzle/`: modelo y migraciones versionadas.
- `tests/`: pruebas de audio y API.
- `docs/`: especificación, instalación y estado de validación.

La API siempre filtra por la identidad del servidor. No acepta un userId del cuerpo de la solicitud. En producción, los headers de identidad solo son confiables porque el dispatcher de Sites controla su inyección y acceso. Publicar el Worker directamente sin esa frontera requiere sustituir esta autenticación.

## 4. Datos actuales

### profiles

Clave primaria `user_id`. Campos: nombre, instrumento activo, nivel declarado, objetivo, minutos diarios, settings JSON, created_at y updated_at. Las fechas se almacenan como milisegundos Unix.

Settings contiene preferencias de afinador y tempo. Las preferencias de producto se guardan en D1, no en localStorage.

### completions

Clave compuesta `(user_id, instrument, lesson_id)`. Campo `completed_at`. Insertar una lección ya completada no duplica el registro. La API comprueba que exista en el currículo del instrumento.

### sessions

Clave UUID `id`. Campos: user_id, instrument, kind, started_at, finished_at, seconds, score nullable y observations JSON. Índice por `(user_id, started_at)`.

Estados: abierta, terminada. Las sesiones abiertas no aparecen como actividad completada. El servidor limita el tiempo declarado al transcurrido desde la apertura. La finalización es idempotente. La práctica libre y canciones fuerzan score=null; oído y ritmo guardan una medida calculada en el cliente.

Las puntuaciones de esta versión sirven al aprendizaje personal: no son verificaciones antitrampa para competiciones. Antes de un ranking público se requieren eventos firmados o recomputación verificable.

### favorites

Clave compuesta `(user_id, item_id)`. Identificadores con namespace, por ejemplo `chord:G` o `song:nuevo-dia`.

Las relaciones dependen del perfil. La eliminación se ejecuta en batch y borra sesiones, completions, favorites y perfil. No borra la cuenta del proveedor de identidad.

### Modelo objetivo para MUSE

Agregar en migraciones separadas, cuando se implemente cada función:

| Entidad | Campos esenciales y restricciones |
|---|---|
| user_instruments | usuario, instrumento, objetivo, nivel evaluado, configuración; único por usuario/instrumento |
| skills | id estable, instrumento, categoría, requisitos, versión editorial |
| skill_mastery | usuario/instrumento/habilidad, dimensiones, evidencia, confianza, updated_at |
| review_items | usuario, habilidad, due_at, intervalo, estabilidad, último resultado |
| exercises | versión, skills objetivo, timeline, rúbrica, dificultad, procedencia |
| performances | sesión, ejercicio/version, modo de entrada, dispositivo, calibración, métricas |
| performance_events | timestamp de audio, nota esperada/observada, error, confianza, fuente |
| tuning_profiles | instrumento, nombre, notas MIDI con octava, referencia, autor |
| songs / arrangements | versión, tonalidad, tempo map, compás, dificultad, requisitos |
| sections / measures / cues | posición musical racional, duración y tipo de evento |
| rights_grants | obra/asset, titular, territorios, usos autorizados, vigencia y evidencias |
| media_assets | clave en almacenamiento, MIME, tamaño, hash, ownership y retención |
| achievements | definición versionada; concesión única por usuario/regla |
| coach_messages | contexto permitido, versión de modelo, evidencia referenciada, retención |

No almacenar toda la información como un único JSON de usuario. Mantener JSON para estructuras variables acotadas y tablas/indexes para consultas y ownership.

## 5. Contrato de API actual

Todas las respuestas contienen JSON y `Cache-Control: no-store`.

`GET /api/state` devuelve profile, completions, sessions y favorites. Sin identidad: 401. Error de almacenamiento: 503.

`POST /api/state` usa un discriminador `action`:

| Acción | Entrada | Resultado |
|---|---|---|
| profile | name, instrument, level, goal, minutes, settings | upsert del perfil |
| complete | instrument, lessonId | registro idempotente |
| favorite | itemId, enabled | alta/baja idempotente |
| start | instrument, kind | id de sesión y apertura en servidor |
| finish | id, seconds, score, observations | cierre validado de sesión propia |
| delete | sin otros datos | borrado del perfil musical |

Validación de origen, tamaño del cuerpo, longitudes de strings, instrumentos admitidos, minutos 5–60, duración hasta cuatro horas y score 0–100. Las consultas usan parámetros preparados; no concatenan entrada de usuario como SQL.

Ejemplo:

```json
{
  "action": "finish",
  "id": "UUID de la sesión creada por el servidor",
  "seconds": 120,
  "score": null,
  "observations": {
    "source": "self_practice",
    "note": "Cambios Em a G",
    "bpm": 60
  }
}
```

Para la versión pública separar endpoints por recurso (`/api/v1/profile`, `/sessions`, `/mastery`, `/songs`), incorporar paginación por cursor, idempotency keys, límites por identidad/origen, códigos de error estables y control de concurrencia por versión.

## 6. Afinador: diseño y límites

### Pipeline actual

```text
Permiso explícito → getUserMedia mono
→ AudioContext compartido → AnalyserNode de 8192 muestras
→ promedio por pares / reducción a 4096 muestras
→ Worker dedicado → YIN
→ frecuencia + confianza + RMS
→ nota MIDI + objetivo por perfil
→ cents → mediana corta → estado estable
```

El intervalo nominal de análisis es 90 ms. El Worker no recibe otro frame mientras procesa el anterior. El procesamiento no vuelve a conectarse a los altavoces. Se deshabilitan, cuando el navegador lo respeta, cancelación de eco, ganancia automática y supresión de ruido del dispositivo.

YIN usa diferencia normalizada, umbral 0.14, interpolación parabólica y puerta de señal RMS 0.008. Rango de búsqueda inicial: 27–1400 Hz. El hardware y entorno pueden invalidar una medición; la interfaz muestra ausencia de señal en vez de mantener una nota inventada.

Fórmulas:

```text
midi = 69 + 12 · log2(f / A4)
f_objetivo = A4 · 2^((midi_objetivo - 69) / 12)
cents = 1200 · log2(f_detectada / f_objetivo)
```

La referencia A4 se aplica también a las cuerdas, no solo al nombre de la nota. El modo automático elige la cuerda más cercana en semitonos; el manual fija la cuerda. Cromático redondea a la nota temperada más próxima.

“En tono” requiere permanecer dentro de ±5 cents por al menos 300 ms. Cambiar objetivo reinicia la estabilidad. No se debe congelar un estado verde después de perder señal.

Perfiles: guitarra Standard, Drop D, Half Step Down, Open D, Open G, DADGAD; bajo estándar/5 cuerdas/Drop D; ukulele estándar/Low G; violín estándar. Piano y voz utilizan cromático. Las referencias de cuerdas se reproducen deteniendo la escucha para no medir el altavoz.

### Evolución necesaria

Sustituir el promedio de pares por un resampler con filtro antialias adecuado para uso exigente; capturar mediante AudioWorklet/ring buffer; calibrar umbral por ruido; registrar confianza y detectar octavas erróneas. Evaluar YIN frente a instrumentos reales, ataques, vibrato, resonancia y parciales dominantes. No confundir una fundamental detectada con reconocimiento de un acorde.

Objetivos futuros medibles, aún no garantizados: error mediano ≤3 cents en señal estable, percentil 95 ≤5 cents dentro del rango aprobado, decisión de estabilidad ≤400 ms tras un ataque limpio. Documentar dispositivos, micrófonos y condiciones de cada medición.

## 7. Transport y metrónomo

El reloj de audio `AudioContext.currentTime` es la referencia. Un temporizador de 25 ms llena una ventana futura de 120 ms; no dispara directamente sonidos “ahora” según el render. Osciladores breves con envolvente producen clic fuerte, normal y subdivisión.

La UI representa el reloj con requestAnimationFrame. Cuando una pestaña se oculta o el scheduler pierde la ventana, se detiene para evitar ráfagas tardías. El navegador no garantiza audio de fondo continuo.

En esta versión BPM significa negras por minuto:

```text
duración_tiempo = (60 / BPM) · (4 / denominador)
duración_subdivisión = duración_tiempo / subdivisiones
```

Por eso 6/8 a 60 BPM produce 120 corcheas por minuto. La futura UI debe permitir elegir unidad de pulso (negra, corchea, negra con punto) para evitar ambigüedad pedagógica.

Acentos: 0 silencio, 1 normal, 2 fuerte. Swing modifica las dos mitades de un tiempo; se deshabilita para subdivisiones distintas de dos. Tap tempo usa la mediana de intervalos recientes. Tempo 20–300 BPM. El cambio de tempo/compás/subdivisión detiene la sesión de metrónomo; una futura implementación con continuidad debe aplicar cambios en fronteras musicales y conservar fase.

Transport objetivo: play/pause/stop/seek, tempo map, posición en ticks o fracción racional, loop A–B, cuenta previa, pistas, clock-domain conversions y eventos versionados. No usar milisegundos redondeados como única representación de compases.

## 8. CAPE: acordes, técnica e interpretación

Cada acorde debe separar identidad armónica de voicing físico:

```text
ChordDefinition: root + quality + intervalFormula
Voicing: instrument + tuning + pitchSet + strings/frets/fingers + barre
Lesson: explicación + evidencia visual + ejercicio + rúbrica
Transition: voicingFrom + voicingTo + anchors + dificultad
```

En 0.1 las ocho formas contienen explícitamente las seis cuerdas, incluidos silencios y abiertas. Los diagramas se generan de datos, no de capturas. G abierto es 320003; C es x32010; Em es 022000. Las notas del teclado representan clases de altura del acorde.

Siguiente desarrollo: resolver inversiones y CAGED desde voicings revisados por músicos; anotar cejillas; incluir manos izquierda/derecha y zurdos; almacenar tuning y capo; introducir dificultad real de digitación. No simplificar Fmaj7 a F suponiendo que F siempre es más fácil: la cejilla puede aumentar mucho la dificultad.

La evaluación debe separar:
- notas incorrectas o ausentes;
- ataque y duración;
- relación temporal con el ejercicio;
- claridad estimada y su confianza;
- recomendaciones que necesitan inspección humana o visual.

El audio de un acorde mezclado no identifica inequívocamente un dedo, cuerda o postura. El coach debe formular una hipótesis y pedir una prueba por cuerda, nunca afirmar “tu anular tarda 180 ms” sin evidencia instrumental válida.

## 9. MUSE: evaluación y adaptación

MUSE recibe intención, observación, historial y contexto; devuelve evaluación explicable y una siguiente acción. La arquitectura objetivo divide:

| Motor | Responsabilidad |
|---|---|
| Account | identidad, permisos, sesiones de acceso |
| Instrument | reglas, rango, tuning, modos de entrada |
| Curriculum | prerequisitos y orden pedagógico |
| Audio | frames, pitch, onsets y calidad de señal |
| Performance | alineación y métricas observables |
| Practice | construir rutinas con tiempo disponible |
| CAPE / Chord / Technique | formas, movimientos enseñables y transiciones |
| Song | arreglo, timeline, secciones y medios |
| Tuner | diferencia de afinación |
| Rhythm / Transport | reloj, ataque esperado y eventos |
| Adaptive | decisiones acotadas de dificultad y tempo |
| Review | planificación espaciada por habilidad |
| Progress / Achievement | resumen y reglas de logros |
| AI Coach | explicar evidencia y proponer ejercicios aprobados |

### Contrato objetivo de evaluación

```typescript
type Evaluation = {
  sessionId: string;
  exerciseVersion: string;
  input: "microphone" | "midi" | "tap" | "self_report";
  dimensions: {
    pitch?: number;
    rhythm?: number;
    timing?: number;
    tuning?: number;
    consistency?: number;
  };
  confidence: number;
  evidenceIds: string[];
  limitations: string[];
  nextAction: {
    exerciseId: string;
    bpm: number;
    repetitions: number;
    reason: string;
  };
};
```

No llenar dimensiones no observadas con 100 o 0. Distinguir falta de evidencia de error musical. Los pesos sugeridos 40/25/20/10/5 se aplican solo cuando esas dimensiones están disponibles y validadas; evitar contar el mismo error dos veces en “ritmo” y “timing”. Para batería se sustituye pitch por clasificación de golpe cuando exista un modelo aprobado.

Adaptación objetivo: evaluar tres repeticiones comparables; si supera un umbral con confianza suficiente, subir como máximo 5 BPM; si falla, bajar de forma acotada; mantener tempo si la señal es insuficiente. Considerar fatiga y frustración sin inferir estados psicológicos como hechos.

El dominio requiere evidencia en días distintos, tempos y contextos, no una sola interpretación. Review Engine debe almacenar intervalos y evidencia por habilidad. Empezar con reglas transparentes y versionadas; aprender parámetros solo tras validar datos.

## 10. Song Engine y contenido

Los estudios iniciales contienen cuatro compases por sección y progresiones originales sencillas. El usuario escucha acordes sintetizados, observa el actual, modifica velocidad, repite y guarda tiempo. Esto no es separación de stems ni reproducción de una canción comercial.

Modelo objetivo de canción:
- obra y arreglo separados;
- fuente, derechos, versión y territorio;
- compases, métrica, tempo map y anacrusa;
- notas/acordes con duración, tablatura, letra sincronizada opcional;
- secciones y marcas de loop;
- stems con offset, sample rate y hash;
- requisitos, dificultad y variantes revisadas.

Importación futura: MusicXML/MIDI para eventos; JSON editorial para acordes/letra; audio con metadatos y autorización. Importar un archivo no concede permisos de distribución. El producto necesita registro de derechos y bloqueo de publicación cuando falte autorización; la revisión contractual corresponde al equipo responsable.

Cambiar velocidad de audio grabado requerirá time-stretch con conservación de pitch y compensación temporal, o assets preparados. La síntesis actual permite variar tempo sin ese procesamiento. Smart Loop necesita una alineación fiable entre errores y compases; no debe seleccionar compases al azar.

## 11. Profesor y cámara

El profesor generativo deberá ser un servicio de servidor con credenciales en secretos, límites de consumo, registro mínimo y herramientas acotadas. Puede consultar resúmenes autorizados, proponer ejercicios del catálogo y explicar decisiones; no ejecutar SQL arbitrario ni cambiar progreso sin una acción validada.

Las respuestas deben citar evidencia interna y distinguir observaciones de hipótesis. Con baja confianza: pedir una nota/cuerda específica, recomendar mejorar la señal o reconocer que no puede evaluar.

Cámara: opt-in separado del micrófono, indicador visible, procesamiento local cuando sea viable y sin activación automática. Hace falta validar visión con instrumentos, manos, iluminación y movilidad diversos. No prometer corrección médica o prevención garantizada de lesiones.

Esta entrega no envía audio o vídeo a modelos externos. La guía actual es determinista y se identifica como tal.

## 12. Cuenta, seguridad y privacidad

Para abrir Armoniq al público con identidad propia:
1. Seleccionar un proveedor OIDC compatible con web y el host definitivo.
2. Configurar dominio, callbacks y secretos para Apple/Google.
3. Si hay contraseña: servicio administrado, verificación de correo, recuperación y limitación de intentos.
4. Passkeys: WebAuthn con challenge de servidor, RP ID del dominio final, verificación de origen y recuperación de cuenta.
5. Migrar identidades con tabla de vínculos; nunca unir cuentas solo porque comparten un email no verificado.
6. Cookies HttpOnly/Secure/SameSite, revocación y protección CSRF.
7. Revisar acceso de menores, consentimiento y políticas según los mercados del lanzamiento.

El acceso privado actual no equivale a un registro público abierto. No hay credenciales de Apple, Google, correo transaccional ni IA incluidas en el repositorio.

Audio: procesado localmente; grabaciones como Blob local hasta descarga. Datos de progreso en D1; exportación JSON y eliminación desde perfil. Sin capturas automáticas de micrófono/cámara. No se añade analítica comercial en 0.1.

Antes del lanzamiento: límites de tasa, restricciones de tamaño en streaming, política de seguridad de contenido compatible con el runtime, encabezados de seguridad, backups y restauración probada, monitoreo de errores sin audio ni secretos y revisión de dependencias. Las cabeceras de identidad no deben aceptarse de clientes fuera del dispatcher confiable.

## 13. Rendimiento, accesibilidad y compatibilidad

Objetivos propuestos, pendientes de medición sistemática:
- LCP móvil ≤2.5 s con red y dispositivo de referencia definidos.
- Controles de práctica utilizables con teclado y touch, objetivos táctiles cercanos a 44 px.
- Ningún desbordamiento a 390 px; repetir a 320 px, 768 px y 1440 px.
- Audio fuera del hilo de React para análisis; no bloquear interacción durante YIN.
- Error de timing de audio medido por loopback y dispositivo, no por setInterval.
- Suspender recursos al salir, ocultar pestaña o revocar permiso.

Matriz mínima antes del lanzamiento: Chrome/Edge escritorio, Safari macOS/iOS y Chrome Android; micrófono interno y USB, auriculares cableados, MIDI USB donde exista, cambio de dispositivo, revocación de permisos, silencio, ruido, pestaña oculta y red interrumpida. Bluetooth puede introducir latencia relevante y no debe usarse como referencia de timing sin calibración.

Referencias técnicas consultadas:
- [MDN: getUserMedia y contexto seguro](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [MDN: reloj AudioContext.currentTime](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/currentTime)
- [MDN: Web MIDI y compatibilidad](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API)

## 14. Validación y operación

Pruebas incluidas:
- YIN con fundamentales desde B0 hasta A5, armónicos, silencio, señal débil y desafinación.
- Conversión de A4, octavas y cents.
- Puntuación temporal con pulsos omitidos.
- API: anonimato, origen, validación, persistencia, aislamiento, finalización idempotente y rutas.
- Revisión visual de inicio y herramientas en el navegador.

No confundir el resultado de tonos sintéticos con validación de guitarra o voz en un dispositivo real. Tampoco la compilación exitosa prueba entrega de correo, OAuth externo, latencia física o precisión polifónica.

Operación:
- Mantener lockfile y migraciones.
- Generar migraciones con Drizzle, inspeccionarlas y aplicar en orden.
- No modificar una migración ya aplicada; agregar otra.
- Publicar código, build y migraciones de un mismo commit.
- Probar restauración de datos antes de habilitar usuarios externos.
- Registrar release, commit, fecha, validación y limitaciones.
- Separar entorno local de cuentas y datos de producción.

## 15. Fases de implementación

Las duraciones son estimaciones de planificación para un equipo con frontend, backend/DSP y revisión pedagógica; no son compromisos de entrega.

### Fase A — Base funcional web (esta entrega)

Identidad disponible, perfil, navegación, herramientas, contenido inicial y persistencia. Criterio: guardar, recargar y continuar sin datos simulados; herramientas funcionan o explican su fallo; código compila.

### Fase B — Identidad y operación pública (2–4 semanas estimadas)

Dominio y proveedor propios, Apple/Google/correo, passkeys según proveedor, recuperación, rate limiting, respaldo, monitorización, consentimiento, política editorial y pruebas E2E. Criterio: altas/recuperación/cierre/revocación y aislamiento probados en staging; restauración aprobada.

### Fase C — Núcleo DSP y rendimiento verificable (4–8 semanas)

AudioWorklet, captura calibrada, resampling, onsets, MIDI evaluable, latencia por dispositivo, estabilidad y calibración. Criterio: dataset versionado, métricas por instrumento/rango, confianza y abstención. No publicar precisión profesional sin estos resultados.

### Fase D — CAPE y currículo de guitarra (4–8 semanas, en paralelo con DSP)

Voicings revisados, técnica con medios, transiciones, escalas, rutas por objetivos, ejercicios por cuerda y adaptaciones. Criterio: cada lección tiene objetivo, prerequisito, práctica y rúbrica revisados por docente.

### Fase E — MUSE, repetición y adaptación (3–6 semanas)

Skill mastery multidimensional, scheduler de repaso, rutinas según tiempo/errores, pruebas de nivel y progresión de BPM. Criterio: decisiones explicables y pruebas que eviten subir dificultad por ruido o por datos insuficientes.

### Fase F — Song Engine ampliado (4–8 semanas más derechos)

Editor/importador, tempo map, loops A–B, time-stretch, stems y licencias. Criterio: sincronización medida, derechos verificados por obra/arreglo y reproducción sin deriva.

### Fase G — Profesor con IA (3–5 semanas tras evidencia fiable)

Servicio generativo, contexto autorizado, herramientas musicales, límites y evaluación de respuestas. Criterio: no inventar diagnósticos; cada recomendación específica tiene evidencia o se formula como hipótesis.

### Fase H — Otros instrumentos y cámara (incremental)

Piano/MIDI, bajo, ukulele, voz, violín y batería con rúbricas y contenido propios. Cámara solo después de pruebas con diversidad de usuarios/dispositivos. No reutilizar puntuaciones de guitarra sin validarlas.

## 16. Decisiones pendientes para el lanzamiento

- Dominio y proveedor de identidad para la marca Armoniq.
- Equipo responsable de contenido pedagógico y revisión musical.
- Instrumentos y niveles que serán parte del catálogo comercial inicial.
- Presupuesto y proveedor de IA; el modo actual no consume API de IA.
- Catálogo propio/comercial y responsable de derechos.
- Almacenamiento de grabaciones, plazo de retención y consentimiento.
- Mercados, idiomas, acceso de menores, soporte y modelo de negocio.

Estas decisiones no impiden usar la base actual. Sí impiden afirmar que todos los módulos del brief están terminados o listos para distribución comercial.

