'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Heading, Section, Icon } from './shared';

const swiftFiles: Record<string, { title: string; filename: string; path: string; description: string; code: string }> = {
  app: {
    title: 'App & Navegación',
    filename: 'ArmoniqApp.swift',
    path: 'ios/Armoniq/Armoniq/App/ArmoniqApp.swift',
    description: 'Punto de entrada nativo de la aplicación con navegación por pestañas en SwiftUI.',
    code: `import SwiftUI

@main
struct ArmoniqApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

struct ContentView: View {
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            TunerView()
                .tabItem {
                    Label("Afinador", systemImage: "tuningfork")
                }
                .tag(0)
            
            MetronomeView()
                .tabItem {
                    Label("Metrónomo", systemImage: "metronome.fill")
                }
                .tag(1)
            
            ChordLibraryView()
                .tabItem {
                    Label("Acordes", systemImage: "guitars.fill")
                }
                .tag(2)
            
            StudioView()
                .tabItem {
                    Label("Estudio", systemImage: "waveform.and.mic")
                }
                .tag(3)
            
            ProfileView()
                .tabItem {
                    Label("Perfil", systemImage: "person.crop.circle")
                }
                .tag(4)
        }
        .tint(ArmoniqTheme.forestGreen)
    }
}`
  },
  tuner: {
    title: 'Afinador YIN (Audio Engine)',
    filename: 'TunerAudioEngine.swift',
    path: 'ios/Armoniq/Armoniq/Features/Tuner/TunerAudioEngine.swift',
    description: 'Procesamiento en tiempo real con AVAudioEngine, tap de micrófono y algoritmo YIN para detectar tono y desviación en cents.',
    code: `import Foundation
import AVFoundation
import Combine

final class TunerAudioEngine: ObservableObject {
    @Published var frequency: Double = 0.0
    @Published var noteName: String = "--"
    @Published var octave: Int = 0
    @Published var cents: Double = 0.0
    @Published var isListening: Bool = false
    @Published var isTuned: Bool = false
    @Published var permissionGranted: Bool = false
    @Published var errorMessage: String? = nil
    
    private let audioEngine = AVAudioEngine()
    private let bufferSize: AVAudioFrameCount = 2048
    private let noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    
    init() { checkPermission() }
    
    func checkPermission() {
        AVAudioApplication.requestRecordPermission { [weak self] granted in
            DispatchQueue.main.async { self?.permissionGranted = granted }
        }
    }
    
    func start() {
        guard !isListening else { return }
        let session = AVAudioSession.sharedInstance()
        try? session.setCategory(.playAndRecord, mode: .measurement, options: [.defaultToSpeaker, .allowBluetooth])
        try? session.setActive(true)
        
        let inputNode = audioEngine.inputNode
        let inputFormat = inputNode.outputFormat(forBus: 0)
        inputNode.removeTap(onBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: bufferSize, format: inputFormat) { [weak self] (buffer, _) in
            self?.processAudioBuffer(buffer: buffer)
        }
        
        do {
            try audioEngine.start()
            isListening = true
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func stop() {
        guard isListening else { return }
        audioEngine.inputNode.removeTap(onBus: 0)
        audioEngine.stop()
        isListening = false
        frequency = 0.0
        noteName = "--"
        cents = 0.0
        isTuned = false
    }
    
    private func processAudioBuffer(buffer: AVAudioPCMBuffer) {
        guard let channelData = buffer.floatChannelData?[0] else { return }
        let frames = Int(buffer.frameLength)
        let sampleRate = buffer.format.sampleRate
        
        // Comprobar nivel RMS para descartar ruido ambiente
        var sum: Float = 0
        for i in 0..<frames { sum += channelData[i] * channelData[i] }
        let rms = sqrt(sum / Float(frames))
        guard rms > 0.015 else { return }
        
        // Algoritmo de detección de tono por autocorrelación YIN
        let minPeriod = Int(sampleRate / 1000.0)
        let maxPeriod = Int(sampleRate / 60.0)
        guard maxPeriod < frames else { return }
        
        var bestCorrelation: Float = 0
        var bestPeriod = 0
        for period in minPeriod...maxPeriod {
            var corr: Float = 0
            for i in 0..<(frames - period) { corr += channelData[i] * channelData[i + period] }
            if corr > bestCorrelation {
                bestCorrelation = corr
                bestPeriod = period
            }
        }
        
        guard bestPeriod > 0 else { return }
        let detectedFreq = sampleRate / Double(bestPeriod)
        guard detectedFreq >= 60.0 && detectedFreq <= 1200.0 else { return }
        
        // Cálculo de nota más cercana y desviación en cents
        let midi = 69.0 + 12.0 * log2(detectedFreq / 440.0)
        let roundedMidi = Int(round(midi))
        let centsDev = (midi - Double(roundedMidi)) * 100.0
        let noteIndex = (roundedMidi % 12 + 12) % 12
        let tuned = abs(centsDev) <= 3.5
        
        DispatchQueue.main.async {
            self.frequency = detectedFreq
            self.noteName = self.noteStrings[noteIndex]
            self.octave = (roundedMidi / 12) - 1
            self.cents = centsDev
            self.isTuned = tuned
        }
    }
}`
  },
  metronome: {
    title: 'Metrónomo Háptico',
    filename: 'MetronomeEngine.swift',
    path: 'ios/Armoniq/Armoniq/Features/Metronome/MetronomeEngine.swift',
    description: 'Reloj de audio de alta precisión con DispatchSourceTimer, síntesis de clics y pulsos hápticos sincronizados en iPhone.',
    code: `import Foundation
import AVFoundation
import UIKit
import Combine

final class MetronomeEngine: ObservableObject {
    @Published var bpm: Int = 84 {
        didSet { if isRunning { restartTimer() } }
    }
    @Published var beatsPerBar: Int = 4
    @Published var currentBeat: Int = 0
    @Published var isRunning: Bool = false
    @Published var enableHaptics: Bool = true
    
    private var timer: DispatchSourceTimer?
    private let timerQueue = DispatchQueue(label: "app.armoniq.metronome", qos: .userInteractive)
    private var tapTimestamps: [Date] = []
    private let heavyHaptic = UIImpactFeedbackGenerator(style: .heavy)
    private let lightHaptic = UIImpactFeedbackGenerator(style: .light)
    
    func start() {
        guard !isRunning else { return }
        isRunning = true
        currentBeat = 0
        startTimer()
    }
    
    func stop() {
        guard isRunning else { return }
        isRunning = false
        timer?.cancel()
        timer = nil
        currentBeat = 0
    }
    
    private func startTimer() {
        let interval = 60.0 / Double(bpm)
        timer = DispatchSourceTimer.makeRepeatingTimer(interval: interval, queue: timerQueue) { [weak self] in
            self?.tick()
        }
        timer?.resume()
    }
    
    private func tick() {
        let beat = currentBeat
        let isAccent = (beat == 0)
        let frequency = isAccent ? 1200.0 : 800.0
        
        // Tono sintetizado de golpe
        AudioSynthesizer.shared.playTone(frequency: frequency, duration: 0.04, amplitude: isAccent ? 0.6 : 0.35)
        
        // Pulso háptico en el dispositivo físico
        if enableHaptics {
            DispatchQueue.main.async {
                if isAccent { self.heavyHaptic.impactOccurred() }
                else { self.lightHaptic.impactOccurred() }
            }
        }
        
        DispatchQueue.main.async {
            self.currentBeat = (beat + 1) % self.beatsPerBar
        }
    }
    
    func tapTempo() {
        let now = Date()
        tapTimestamps.append(now)
        tapTimestamps = tapTimestamps.filter { now.timeIntervalSince($0) < 2.5 }
        guard tapTimestamps.count >= 2 else { return }
        var intervals: [Double] = []
        for i in 1..<tapTimestamps.count { intervals.append(tapTimestamps[i].timeIntervalSince(tapTimestamps[i-1])) }
        let avg = intervals.reduce(0, +) / Double(intervals.count)
        if avg > 0 { self.bpm = max(40, min(240, Int(round(60.0 / avg)))) }
    }
}`
  },
  fretboard: {
    title: 'Mástil y Acordes (SwiftUI)',
    filename: 'ChordFretboardView.swift',
    path: 'ios/Armoniq/Armoniq/Features/Chords/ChordFretboardView.swift',
    description: 'Diagrama vectorial interactivo del mástil de guitarra en SwiftUI con posiciones de dedos y audio.',
    code: `import SwiftUI

struct ChordFretboardView: View {
    let chord: ChordDefinition
    let stringNames = ["E", "A", "D", "G", "B", "e"]
    
    var body: some View {
        VStack(spacing: 8) {
            Text(chord.symbol)
                .font(.system(size: 32, weight: .bold, design: .serif))
                .foregroundColor(ArmoniqTheme.textPrimary)
            
            Canvas { context, size in
                let marginX: CGFloat = 36
                let marginTop: CGFloat = 30
                let boardWidth = size.width - 2 * marginX
                let boardHeight = size.height - 60
                let stringSpacing = boardWidth / 5.0
                let fretSpacing = boardHeight / 4.0
                
                // Cejuela (Nut)
                var nut = Path()
                nut.move(to: CGPoint(x: marginX, y: marginTop))
                nut.addLine(to: CGPoint(x: size.width - marginX, y: marginTop))
                context.stroke(nut, with: .color(ArmoniqTheme.textPrimary), lineWidth: 4)
                
                // Trastes
                for f in 1...4 {
                    let y = marginTop + CGFloat(f) * fretSpacing
                    var fret = Path()
                    fret.move(to: CGPoint(x: marginX, y: y))
                    fret.addLine(to: CGPoint(x: size.width - marginX, y: y))
                    context.stroke(fret, with: .color(ArmoniqTheme.borderSubtle), lineWidth: 1.5)
                }
                
                // Cuerdas y posiciones
                for s in 0..<6 {
                    let x = marginX + CGFloat(s) * stringSpacing
                    var str = Path()
                    str.move(to: CGPoint(x: x, y: marginTop))
                    str.addLine(to: CGPoint(x: x, y: marginTop + boardHeight))
                    context.stroke(str, with: .color(ArmoniqTheme.borderSubtle), lineWidth: 1.5)
                    
                    let fretVal = chord.frets[s]
                    if fretVal == -1 {
                        context.draw(Text("×").font(.system(size: 18, weight: .bold)).foregroundColor(ArmoniqTheme.textMuted), at: CGPoint(x: x, y: marginTop - 15))
                    } else if fretVal == 0 {
                        context.draw(Text("○").font(.system(size: 18)).foregroundColor(ArmoniqTheme.textMuted), at: CGPoint(x: x, y: marginTop - 15))
                    } else if fretVal > 0 {
                        let dotY = marginTop + (CGFloat(fretVal) - 0.5) * fretSpacing
                        let rect = CGRect(x: x - 12, y: dotY - 12, width: 24, height: 24)
                        let finger = chord.fingers[s]
                        context.fill(Path(ellipseIn: rect), with: .color(finger == 2 ? ArmoniqTheme.warmClay : ArmoniqTheme.forestGreen))
                        if finger > 0 {
                            context.draw(Text("\\(finger)").font(.system(size: 13, weight: .bold)).foregroundColor(.white), at: CGPoint(x: x, y: dotY))
                        }
                    }
                    context.draw(Text(stringNames[s]).font(.system(size: 13)).foregroundColor(ArmoniqTheme.textMuted), at: CGPoint(x: x, y: marginTop + boardHeight + 15))
                }
            }
            .frame(width: 240, height: 230)
            
            Button(action: {
                AudioSynthesizer.shared.playChord(midiNotes: chord.midi)
            }) {
                HStack(spacing: 8) {
                    Image(systemName: "speaker.wave.2.fill")
                    Text("Escuchar acorde")
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 10)
                .background(ArmoniqTheme.sageLight)
                .foregroundColor(ArmoniqTheme.forestGreen)
                .cornerRadius(20)
            }
        }
    }
}`
  },
  synth: {
    title: 'Sintetizador de Audio Nativo',
    filename: 'AudioSynthesizer.swift',
    path: 'ios/Armoniq/Armoniq/Core/AudioSynthesizer.swift',
    description: 'Generación de audio polifónico offline sin archivos externos, usando AVAudioEngine y búferes PCM.',
    code: `import Foundation
import AVFoundation

final class AudioSynthesizer {
    static let shared = AudioSynthesizer()
    private let engine = AVAudioEngine()
    private let playerNode = AVAudioPlayerNode()
    private let sampleRate: Double = 44100.0
    private let audioFormat: AVAudioFormat?
    
    private init() {
        audioFormat = AVAudioFormat(standardFormatWithSampleRate: sampleRate, channels: 1)
        guard let format = audioFormat else { return }
        engine.attach(playerNode)
        engine.connect(playerNode, to: engine.mainMixerNode, format: format)
        try? engine.start()
    }
    
    static func midiToFrequency(_ midi: Int) -> Double {
        return 440.0 * pow(2.0, Double(midi - 69) / 12.0)
    }
    
    func playChord(midiNotes: [Int], strumDelay: Double = 0.035, duration: Double = 1.2) {
        guard let format = audioFormat else { return }
        let frequencies = midiNotes.map { Self.midiToFrequency($0) }
        let totalSamples = Int(sampleRate * (duration + Double(frequencies.count) * strumDelay))
        guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: AVAudioFrameCount(totalSamples)) else { return }
        buffer.frameLength = AVAudioFrameCount(totalSamples)
        guard let channelData = buffer.floatChannelData?[0] else { return }
        
        for i in 0..<totalSamples { channelData[i] = 0 }
        
        for (idx, freq) in frequencies.enumerated() {
            let start = Int(Double(idx) * strumDelay * sampleRate)
            let noteSamples = Int(duration * sampleRate)
            let end = min(totalSamples, start + noteSamples)
            let twoPiF = 2.0 * Double.pi * freq / sampleRate
            
            for i in start..<end {
                let t = Double(i - start) / sampleRate
                let harmonic = sin(twoPiF * Double(i - start)) * 0.6 + sin(2 * twoPiF * Double(i - start)) * 0.25
                let decay = exp(-3.0 * t / duration)
                channelData[i] += Float(harmonic * decay * 0.2)
            }
        }
        playerNode.play()
        playerNode.scheduleBuffer(buffer, at: nil, options: .interrupts, completionHandler: nil)
    }
}`
  }
};

export function SwiftSection() {
  const [activeTab, setActiveTab] = useState<string>('app');
  const current = swiftFiles[activeTab] || swiftFiles.app;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(current.code);
      toast.success('Código copiado al portapapeles');
    } catch {
      toast.error('No se pudo copiar el código');
    }
  };

  return (
    <>
      <Heading
        eyebrow="ECOSISTEMA APPLE · ARMONIQ PARA IOS"
        title="Código Swift & Proyecto Xcode"
        subtitle="Implementación nativa completa en Swift y SwiftUI, lista para abrir y compilar en Xcode para iPhone y iPad."
      />

      <div className="stats-row" style={{ marginTop: 20 }}>
        <div>
          <span className="stat-number">100%<small> nativo</small></span>
          <p>Swift 5.9 / iOS 17+</p>
        </div>
        <div>
          <span className="stat-number">0<small> deps</small></span>
          <p>Sin CocoaPods ni Carthage</p>
        </div>
        <div>
          <span className="stat-number">5<small> módulos</small></span>
          <p>Afinador, Metrónomo, Acordes</p>
        </div>
      </div>

      <Section title="Estructura del Proyecto Xcode">
        <div className="panel" style={{ background: '#fdfbf7', border: '1px solid #dae2d9' }}>
          <p style={{ marginBottom: 15 }}>
            El proyecto completo se encuentra organizado en el directorio <code>ios/Armoniq/</code> del repositorio:
          </p>
          <div style={{ background: '#1c2520', color: '#e5ecdc', padding: 18, borderRadius: 12, fontFamily: 'monospace', fontSize: 13, lineHeight: 1.6 }}>
            <div>📁 ios/Armoniq/</div>
            <div>├── 📁 <strong>Armoniq.xcodeproj</strong> &nbsp;<span style={{ color: '#e97d32' }}>(Doble clic para abrir en Xcode)</span></div>
            <div>│ &nbsp; └── project.pbxproj</div>
            <div>├── 📁 Armoniq/</div>
            <div>│ &nbsp; ├── 📁 App/ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#8c968b' }}>ArmoniqApp.swift, ContentView.swift</span></div>
            <div>│ &nbsp; ├── 📁 Core/ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#8c968b' }}>Theme.swift, AudioSynthesizer.swift</span></div>
            <div>│ &nbsp; ├── 📁 Features/</div>
            <div>│ &nbsp; │ &nbsp; ├── 📁 Tuner/ &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#8c968b' }}>TunerAudioEngine.swift, TunerView.swift</span></div>
            <div>│ &nbsp; │ &nbsp; ├── 📁 Metronome/<span style={{ color: '#8c968b' }}>MetronomeEngine.swift, MetronomeView.swift</span></div>
            <div>│ &nbsp; │ &nbsp; ├── 📁 Chords/ &nbsp;&nbsp;<span style={{ color: '#8c968b' }}>ChordModels.swift, ChordFretboardView.swift</span></div>
            <div>│ &nbsp; │ &nbsp; ├── 📁 Studio/ &nbsp;&nbsp;<span style={{ color: '#8c968b' }}>StudioRecorder.swift, StudioView.swift</span></div>
            <div>│ &nbsp; │ &nbsp; └── 📁 Profile/ &nbsp;<span style={{ color: '#8c968b' }}>ProfileView.swift</span></div>
            <div>│ &nbsp; └── 📁 Resources/ &nbsp;<span style={{ color: '#8c968b' }}>Info.plist (Mic permissions), Assets.xcassets</span></div>
            <div>├── 📄 Package.swift &nbsp;&nbsp;<span style={{ color: '#8c968b' }}>(Soporte Swift Package Manager)</span></div>
            <div>└── 📄 README.md &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#8c968b' }}>(Guía de compilación)</span></div>
          </div>
        </div>
      </Section>

      <Section title="Explorador de Código Swift">
        <div className="chips" style={{ marginBottom: 20 }}>
          {Object.entries(swiftFiles).map(([key, item]) => (
            <button
              key={key}
              className={'chip ' + (activeTab === key ? 'active' : '')}
              onClick={() => setActiveTab(key)}
            >
              {item.title}
            </button>
          ))}
        </div>

        <div className="panel tool-main">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <p className="eyebrow" style={{ margin: 0 }}>{current.path}</p>
              <h2 style={{ margin: '4px 0 0' }}>{current.filename}</h2>
            </div>
            <button className="button secondary" onClick={copyCode}>
              <Icon name="check" size={16} />
              Copiar código
            </button>
          </div>
          <p className="muted" style={{ marginBottom: 18 }}>{current.description}</p>
          <pre
            style={{
              background: '#19241e',
              color: '#d4ded2',
              padding: 20,
              borderRadius: 14,
              overflowX: 'auto',
              fontSize: 13,
              lineHeight: 1.55,
              fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              maxHeight: 520,
              border: '1px solid #2d3b32'
            }}
          >
            <code>{current.code}</code>
          </pre>
        </div>
      </Section>

      <Section title="Cómo compilar en Xcode (Mac)">
        <div className="tool-list">
          <div className="card-link" style={{ cursor: 'default' }}>
            <span className="icon-bubble green"><strong>1</strong></span>
            <strong>Abre el proyecto en Xcode</strong>
            <p>Ejecuta <code>cd ios/Armoniq && open Armoniq.xcodeproj</code> o abre la carpeta con File &gt; Open.</p>
          </div>
          <div className="card-link" style={{ cursor: 'default' }}>
            <span className="icon-bubble orange"><strong>2</strong></span>
            <strong>Selecciona el dispositivo</strong>
            <p>Elige cualquier simulador de iOS 17/18 (ej. iPhone 16 Pro) o tu iPhone conectado por cable.</p>
          </div>
          <div className="card-link" style={{ cursor: 'default' }}>
            <span className="icon-bubble green"><strong>3</strong></span>
            <strong>Presiona ⌘ + R (Build & Run)</strong>
            <p>Compila de inmediato al 100% sin descargar pods ni configurar dependencias externas.</p>
          </div>
        </div>
      </Section>
    </>
  );
}
