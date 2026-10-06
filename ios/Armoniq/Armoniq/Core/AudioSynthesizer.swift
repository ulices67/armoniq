import Foundation
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
        do {
            try engine.start()
        } catch {
            print("AudioSynthesizer engine failed to start: \(error)")
        }
    }
    
    /// Converts a MIDI note number (e.g. 60 for Middle C) to its frequency in Hertz
    static func midiToFrequency(_ midi: Int) -> Double {
        return 440.0 * pow(2.0, Double(midi - 69) / 12.0)
    }
    
    /// Plays an array of MIDI notes simultaneously or with slight strum offset
    func playChord(midiNotes: [Int], strumDelay: Double = 0.035, duration: Double = 1.2) {
        ensureEngineRunning()
        guard let format = audioFormat else { return }
        
        let frequencies = midiNotes.map { Self.midiToFrequency($0) }
        let totalSamples = Int(sampleRate * (duration + Double(frequencies.count) * strumDelay))
        
        guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: AVAudioFrameCount(totalSamples)) else { return }
        buffer.frameLength = AVAudioFrameCount(totalSamples)
        
        guard let channelData = buffer.floatChannelData?[0] else { return }
        
        // Zero buffer
        for i in 0..<totalSamples {
            channelData[i] = 0.0
        }
        
        // Render each note into buffer with guitar-like ADSR decay
        for (noteIndex, freq) in frequencies.enumerated() {
            let startSample = Int(Double(noteIndex) * strumDelay * sampleRate)
            let noteDurationSamples = Int(duration * sampleRate)
            let endSample = min(totalSamples, startSample + noteDurationSamples)
            
            let twoPiF = 2.0 * Double.pi * freq / sampleRate
            
            for i in startSample..<endSample {
                let t = Double(i - startSample) / sampleRate
                // Harmonic richness (fundamental + 2nd + 3rd harmonic)
                let sampleVal = sin(twoPiF * Double(i - startSample)) * 0.6
                    + sin(2.0 * twoPiF * Double(i - startSample)) * 0.25
                    + sin(3.0 * twoPiF * Double(i - startSample)) * 0.1
                
                // Exponential decay envelope
                let envelope = exp(-3.0 * t / duration)
                channelData[i] += Float(sampleVal * envelope * 0.2)
            }
        }
        
        playerNode.play()
        playerNode.scheduleBuffer(buffer, at: nil, options: .interrupts, completionHandler: nil)
    }
    
    /// Plays a single frequency tone (for metronome or tuner pitch reference)
    func playTone(frequency: Double, duration: Double = 0.1, amplitude: Float = 0.3) {
        ensureEngineRunning()
        guard let format = audioFormat else { return }
        
        let frameCount = Int(sampleRate * duration)
        guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: AVAudioFrameCount(frameCount)) else { return }
        buffer.frameLength = AVAudioFrameCount(frameCount)
        
        guard let channelData = buffer.floatChannelData?[0] else { return }
        let twoPiF = 2.0 * Double.pi * frequency / sampleRate
        
        for i in 0..<frameCount {
            let t = Double(i) / sampleRate
            let envelope = Float(exp(-15.0 * t / duration))
            channelData[i] = Float(sin(twoPiF * Double(i))) * amplitude * envelope
        }
        
        playerNode.play()
        playerNode.scheduleBuffer(buffer, at: nil, options: [], completionHandler: nil)
    }
    
    private func ensureEngineRunning() {
        if !engine.isRunning {
            try? engine.start()
        }
    }
}
