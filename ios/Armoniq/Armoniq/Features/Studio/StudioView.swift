import SwiftUI

struct StudioView: View {
    @StateObject private var recorder = StudioRecorder()
    
    var practiceTimeFormatted: String {
        let mins = recorder.practiceSeconds / 60
        let secs = recorder.practiceSeconds % 60
        return String(format: "%02d:%02d", mins, secs)
    }
    
    var recordTimeFormatted: String {
        let mins = Int(recorder.recordDuration) / 60
        let secs = Int(recorder.recordDuration) % 60
        return String(format: "%02d:%02d", mins, secs)
    }
    
    var body: some View {
        NavigationStack {
            ZStack {
                ArmoniqTheme.paperBackground.ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Header
                        VStack(alignment: .leading, spacing: 6) {
                            Text("PRÁCTICA LIBRE Y AUDIO")
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundColor(ArmoniqTheme.warmClay)
                                .tracking(1.2)
                            
                            HStack {
                                Text("Estudio de práctica")
                                    .font(.system(size: 28, weight: .bold, design: .serif))
                                    .foregroundColor(ArmoniqTheme.textPrimary)
                                Text("✳")
                                    .foregroundColor(ArmoniqTheme.warmClay)
                            }
                            
                            Text("Toca, graba tomas de audio en tu dispositivo y escucha tu evolución sin filtros.")
                                .font(.subheadline)
                                .foregroundColor(ArmoniqTheme.textMuted)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal)
                        
                        // Practice Session Timer Card
                        VStack(spacing: 12) {
                            Text("TIEMPO EN ESTA SESIÓN")
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundColor(ArmoniqTheme.textMuted)
                            
                            Text(practiceTimeFormatted)
                                .font(.system(size: 56, weight: .bold, design: .serif))
                                .foregroundColor(ArmoniqTheme.textPrimary)
                            
                            HStack(spacing: 6) {
                                Circle()
                                    .fill(ArmoniqTheme.forestGreen)
                                    .frame(width: 8, height: 8)
                                Text("Cada minuto frente al instrumento suma.")
                                    .font(.caption)
                                    .foregroundColor(ArmoniqTheme.textMuted)
                            }
                        }
                        .padding(.vertical, 24)
                        .armoniqCard()
                        .padding(.horizontal)
                        
                        // Audio Recorder Card
                        VStack(spacing: 20) {
                            HStack {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Grabadora de tomas")
                                        .font(.headline)
                                        .foregroundColor(ArmoniqTheme.textPrimary)
                                    Text(recorder.isRecording ? "Grabando toma actual..." : (recorder.hasRecording ? "Toma lista para escuchar" : "Sin tomas grabadas"))
                                        .font(.caption)
                                        .foregroundColor(ArmoniqTheme.textMuted)
                                }
                                Spacer()
                                if recorder.isRecording {
                                    HStack(spacing: 6) {
                                        Circle()
                                            .fill(Color.red)
                                            .frame(width: 10, height: 10)
                                        Text(recordTimeFormatted)
                                            .font(.subheadline)
                                            .fontWeight(.bold)
                                            .foregroundColor(.red)
                                    }
                                }
                            }
                            
                            // Recording Controls
                            HStack(spacing: 16) {
                                Button(action: {
                                    if recorder.isRecording {
                                        recorder.stopRecording()
                                    } else {
                                        recorder.startRecording()
                                    }
                                }) {
                                    HStack(spacing: 10) {
                                        Image(systemName: recorder.isRecording ? "stop.circle.fill" : "record.circle")
                                            .font(.title3)
                                        Text(recorder.isRecording ? "Detener grabación" : "Grabar toma")
                                            .fontWeight(.bold)
                                    }
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 14)
                                    .background(recorder.isRecording ? Color.red : ArmoniqTheme.forestGreen)
                                    .foregroundColor(.white)
                                    .cornerRadius(14)
                                }
                                
                                if recorder.hasRecording {
                                    Button(action: {
                                        if recorder.isPlaying {
                                            recorder.stopPlayback()
                                        } else {
                                            recorder.playRecording()
                                        }
                                    }) {
                                        Image(systemName: recorder.isPlaying ? "pause.fill" : "play.fill")
                                            .font(.title3)
                                            .frame(width: 50, height: 50)
                                            .background(ArmoniqTheme.sageLight)
                                            .foregroundColor(ArmoniqTheme.forestGreen)
                                            .cornerRadius(14)
                                    }
                                }
                            }
                        }
                        .padding(20)
                        .armoniqCard()
                        .padding(.horizontal)
                        
                        // Quick Links
                        VStack(alignment: .leading, spacing: 14) {
                            Text("Herramientas complementarias")
                                .font(.headline)
                                .foregroundColor(ArmoniqTheme.textPrimary)
                            
                            HStack(spacing: 12) {
                                NavigationLink(destination: TunerView()) {
                                    VStack(alignment: .leading, spacing: 6) {
                                        Image(systemName: "tuningfork")
                                            .font(.title2)
                                            .foregroundColor(ArmoniqTheme.forestGreen)
                                        Text("Afinador")
                                            .font(.subheadline)
                                            .fontWeight(.bold)
                                            .foregroundColor(ArmoniqTheme.textPrimary)
                                        Text("Ajusta tus cuerdas")
                                            .font(.caption2)
                                            .foregroundColor(ArmoniqTheme.textMuted)
                                    }
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .padding(14)
                                    .background(ArmoniqTheme.paperBackground)
                                    .cornerRadius(12)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 12)
                                            .stroke(ArmoniqTheme.borderSubtle, lineWidth: 1)
                                    )
                                }
                                
                                NavigationLink(destination: MetronomeView()) {
                                    VStack(alignment: .leading, spacing: 6) {
                                        Image(systemName: "metronome.fill")
                                            .font(.title2)
                                            .foregroundColor(ArmoniqTheme.warmClay)
                                        Text("Metrónomo")
                                            .font(.subheadline)
                                            .fontWeight(.bold)
                                            .foregroundColor(ArmoniqTheme.textPrimary)
                                        Text("Ajusta el compás")
                                            .font(.caption2)
                                            .foregroundColor(ArmoniqTheme.textMuted)
                                    }
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .padding(14)
                                    .background(ArmoniqTheme.paperBackground)
                                    .cornerRadius(12)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 12)
                                            .stroke(ArmoniqTheme.borderSubtle, lineWidth: 1)
                                    )
                                }
                            }
                        }
                        .padding(20)
                        .armoniqCard()
                        .padding(.horizontal)
                    }
                    .padding(.vertical)
                }
            }
            .navigationTitle("Estudio")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}
