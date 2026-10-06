# Armoniq para iOS (Swift & Xcode)

Proyecto nativo en Swift y SwiftUI para iPhone y iPad, con la arquitectura completa de audio de Armoniq.

## Características incluidas

1. **Afinador Cromático YIN (`TunerAudioEngine.swift` & `TunerView.swift`)**
   - Procesamiento en tiempo real con `AVAudioEngine` y tap de entrada de micrófono.
   - Algoritmo YIN / Autocorrelación para detección precisa de tono fundamental (60 Hz a 1200 Hz).
   - Indicador visual tipo aguja/dial con cálculo de desviación en cents (-50¢ a +50¢).
   - Referencia acústica para afinación estándar de guitarra (E2, A2, D3, G3, B3, E4) con osciladores nativos.

2. **Metrónomo de Alta Precisión (`MetronomeEngine.swift` & `MetronomeView.swift`)**
   - Temporizador de baja latencia con `DispatchSourceTimer`.
   - Clics de madera sintetizados con diferenciación acústica en el primer tiempo.
   - Retroalimentación háptica sincronizada en iPhone con `UIImpactFeedbackGenerator`.
   - Modos de compás 2/4, 3/4, 4/4 y 6/8 con Tap Tempo interactivo.

3. **Explorador y Diccionario de Acordes (`ChordLibraryView.swift` & `ChordFretboardView.swift`)**
   - Visualización vectorial del mástil en SwiftUI con trastes, cuerdas al aire, silencios y posiciones de dedos.
   - Reproducción acústica mediante síntesis polifónica con rasgueo simulado (`AudioSynthesizer.swift`).
   - Biblioteca completa de acordes abiertos y con séptima, con fórmulas teóricas y progresión guiada.

4. **Estudio de Práctica y Grabadora (`StudioRecorder.swift` & `StudioView.swift`)**
   - Contador de tiempo de sesión de práctica.
   - Grabación de tomas en formato AAC (`.m4a`) mediante `AVAudioRecorder`.
   - Reproductor integrado para escuchar y comparar tomas.

5. **Perfil del Músico (`ProfileView.swift`)**
   - Persistencia local mediante `@AppStorage`.
   - Meta diaria de práctica en minutos y nivel de experiencia.

## Cómo compilar en Xcode

1. **Requisitos:**
   - macOS con **Xcode 15.0** o superior.
   - iOS 17.0+ (compatible con iOS 18).
   - Sin dependencias de CocoaPods ni Carthage. Cero librerías externas.

2. **Pasos para abrir y compilar:**
   ```bash
   cd ios/Armoniq
   open Armoniq.xcodeproj
   ```
   O abre Xcode, selecciona **File > Open** y elige la carpeta `ios/Armoniq/Armoniq.xcodeproj`.

3. **Ejecución:**
   - Selecciona cualquier simulador de iOS (por ejemplo: `iPhone 16 Pro`) o tu dispositivo físico conectado.
   - Presiona **Cmd + R** (o haz clic en el botón Play).
   - El proyecto compilará de inmediato sin requerir ningún comando adicional.

4. **Permisos de Micrófono:**
   - `Info.plist` ya tiene configurado el permiso obligatorio `NSMicrophoneUsageDescription`.
   - Al abrir el afinador o la grabadora, iOS solicitará el permiso de micrófono de forma nativa.
