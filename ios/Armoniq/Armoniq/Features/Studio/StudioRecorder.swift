import Foundation
import AVFoundation
import Combine

final class StudioRecorder: NSObject, ObservableObject, AVAudioPlayerDelegate, AVAudioRecorderDelegate {
    @Published var isRecording: Bool = false
    @Published var isPlaying: Bool = false
    @Published var recordDuration: TimeInterval = 0
    @Published var hasRecording: Bool = false
    @Published var practiceSeconds: Int = 0
    @Published var errorMessage: String? = nil
    
    private var audioRecorder: AVAudioRecorder?
    private var audioPlayer: AVAudioPlayer?
    private var timer: Timer?
    private var practiceTimer: Timer?
    
    private var recordingURL: URL {
        let tempDir = FileManager.default.temporaryDirectory
        return tempDir.appendingPathComponent("armoniq_take.m4a")
    }
    
    override init() {
        super.init()
        startPracticeTimer()
    }
    
    func startPracticeTimer() {
        practiceTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            self?.practiceSeconds += 1
        }
    }
    
    func startRecording() {
        guard !isRecording else { return }
        
        let session = AVAudioSession.sharedInstance()
        do {
            try session.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker])
            try session.setActive(true)
            
            let settings: [String: Any] = [
                AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
                AVSampleRateKey: 44100,
                AVNumberOfChannelsKey: 1,
                AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
            ]
            
            audioRecorder = try AVAudioRecorder(url: recordingURL, settings: settings)
            audioRecorder?.delegate = self
            audioRecorder?.record()
            
            isRecording = true
            recordDuration = 0
            
            timer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] _ in
                guard let self = self else { return }
                self.recordDuration = self.audioRecorder?.currentTime ?? 0
            }
        } catch {
            errorMessage = "No se pudo iniciar la grabación: \(error.localizedDescription)"
        }
    }
    
    func stopRecording() {
        guard isRecording else { return }
        timer?.invalidate()
        timer = nil
        audioRecorder?.stop()
        isRecording = false
        hasRecording = FileManager.default.fileExists(atPath: recordingURL.path)
    }
    
    func playRecording() {
        guard hasRecording, !isPlaying else { return }
        
        do {
            audioPlayer = try AVAudioPlayer(contentsOf: recordingURL)
            audioPlayer?.delegate = self
            audioPlayer?.play()
            isPlaying = true
        } catch {
            errorMessage = "No se pudo reproducir la toma: \(error.localizedDescription)"
        }
    }
    
    func stopPlayback() {
        audioPlayer?.stop()
        isPlaying = false
    }
    
    func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        DispatchQueue.main.async {
            self.isPlaying = false
        }
    }
    
    deinit {
        timer?.invalidate()
        practiceTimer?.invalidate()
    }
}
