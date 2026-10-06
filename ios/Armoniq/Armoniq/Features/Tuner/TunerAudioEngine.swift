import Foundation
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
    
    init() {
        checkPermission()
    }
    
    func checkPermission() {
        if #available(iOS 17.0, *) {
            AVAudioApplication.requestRecordPermission { [weak self] granted in
                DispatchQueue.main.async {
                    self?.permissionGranted = granted
                }
            }
        } else {
            AVAudioSession.sharedInstance().requestRecordPermission { [weak self] granted in
                DispatchQueue.main.async {
                    self?.permissionGranted = granted
                }
            }
        }
    }
    
    func start() {
        guard !isListening else { return }
        
        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setCategory(.playAndRecord, mode: .measurement, options: [.defaultToSpeaker, .allowBluetoothHFP])
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            self.errorMessage = "No se pudo configurar la sesión de audio: \(error.localizedDescription)"
            return
        }
        
        let inputNode = audioEngine.inputNode
        let inputFormat = inputNode.outputFormat(forBus: 0)
        
        inputNode.removeTap(onBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: bufferSize, format: inputFormat) { [weak self] (buffer, _) in
            self?.processAudioBuffer(buffer: buffer)
        }
        
        do {
            try audioEngine.start()
            DispatchQueue.main.async {
                self.isListening = true
                self.errorMessage = nil
            }
        } catch {
            DispatchQueue.main.async {
                self.errorMessage = "No se pudo iniciar el micrófono: \(error.localizedDescription)"
            }
        }
    }
    
    func stop() {
        guard isListening else { return }
        audioEngine.inputNode.removeTap(onBus: 0)
        audioEngine.stop()
        DispatchQueue.main.async {
            self.isListening = false
            self.frequency = 0.0
            self.noteName = "--"
            self.cents = 0.0
            self.isTuned = false
        }
    }
    
    private func processAudioBuffer(buffer: AVAudioPCMBuffer) {
        guard let channelData = buffer.floatChannelData?[0] else { return }
        let frames = Int(buffer.frameLength)
        let sampleRate = buffer.format.sampleRate
        
        // Calculate RMS (volume level) to reject background noise
        var sumSquares: Float = 0.0
        for i in 0..<frames {
            sumSquares += channelData[i] * channelData[i]
        }
        let rms = sqrt(sumSquares / Float(frames))
        guard rms > 0.015 else { return } // Threshold for audible sound
        
        // Autocorrelation / YIN pitch detection
        let minPeriod = Int(sampleRate / 1000.0) // Up to 1000 Hz
        let maxPeriod = Int(sampleRate / 60.0)   // Down to 60 Hz (low B / E guitar string)
        
        guard maxPeriod < frames else { return }
        
        var bestCorrelation: Float = 0.0
        var bestPeriod = 0
        
        for period in minPeriod...maxPeriod {
            var correlation: Float = 0.0
            for i in 0..<(frames - period) {
                correlation += channelData[i] * channelData[i + period]
            }
            if correlation > bestCorrelation {
                bestCorrelation = correlation
                bestPeriod = period
            }
        }
        
        guard bestPeriod > 0 else { return }
        let detectedFreq = sampleRate / Double(bestPeriod)
        guard detectedFreq >= 60.0 && detectedFreq <= 1200.0 else { return }
        
        // Calculate closest note, octave and cents deviation
        // Formula: midi = 69 + 12 * log2(f / 440)
        let midi = 69.0 + 12.0 * log2(detectedFreq / 440.0)
        let roundedMidi = Int(round(midi))
        let centsDev = (midi - Double(roundedMidi)) * 100.0
        
        let noteIndex = (roundedMidi % 12 + 12) % 12
        let calculatedOctave = (roundedMidi / 12) - 1
        let detectedNote = noteStrings[noteIndex]
        let tuned = abs(centsDev) <= 3.5
        
        DispatchQueue.main.async {
            self.frequency = detectedFreq
            self.noteName = detectedNote
            self.octave = calculatedOctave
            self.cents = centsDev
            self.isTuned = tuned
        }
    }
    
    deinit {
        stop()
    }
}
