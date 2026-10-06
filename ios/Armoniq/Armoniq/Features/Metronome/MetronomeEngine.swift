import Foundation
import AVFoundation
import UIKit
import Combine

final class MetronomeEngine: ObservableObject {
    @Published var bpm: Int = 84 {
        didSet {
            if isRunning {
                restartTimer()
            }
        }
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
    
    init() {
        heavyHaptic.prepare()
        lightHaptic.prepare()
    }
    
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
        DispatchQueue.main.async {
            self.currentBeat = 0
        }
    }
    
    func toggle() {
        if isRunning {
            stop()
        } else {
            start()
        }
    }
    
    private func startTimer() {
        let interval = 60.0 / Double(bpm)
        timer = DispatchSource.makeTimerSource(queue: timerQueue)
        timer?.schedule(deadline: .now(), repeating: interval, leeway: .nanoseconds(1_000_000))
        timer?.setEventHandler { [weak self] in
            self?.tick()
        }
        timer?.resume()
    }
    
    private func restartTimer() {
        timer?.cancel()
        startTimer()
    }
    
    private func tick() {
        let beat = currentBeat
        let isAccent = (beat == 0)
        
        // Play click sound using high/low synthesized woodblock frequency
        let frequency = isAccent ? 1200.0 : 800.0
        AudioSynthesizer.shared.playTone(frequency: frequency, duration: 0.04, amplitude: isAccent ? 0.6 : 0.35)
        
        // Trigger haptics on main thread
        if enableHaptics {
            DispatchQueue.main.async {
                if isAccent {
                    self.heavyHaptic.impactOccurred()
                } else {
                    self.lightHaptic.impactOccurred()
                }
            }
        }
        
        DispatchQueue.main.async {
            self.currentBeat = (beat + 1) % self.beatsPerBar
        }
    }
    
    func tapTempo() {
        let now = Date()
        tapTimestamps.append(now)
        
        // Retain only taps within last 2.5 seconds
        tapTimestamps = tapTimestamps.filter { now.timeIntervalSince($0) < 2.5 }
        
        guard tapTimestamps.count >= 2 else { return }
        
        var intervals: [Double] = []
        for i in 1..<tapTimestamps.count {
            intervals.append(tapTimestamps[i].timeIntervalSince(tapTimestamps[i-1]))
        }
        
        let avgInterval = intervals.reduce(0, +) / Double(intervals.count)
        guard avgInterval > 0 else { return }
        let calculatedBpm = Int(round(60.0 / avgInterval))
        self.bpm = max(40, min(240, calculatedBpm))
    }
    
    deinit {
        timer?.cancel()
    }
}
