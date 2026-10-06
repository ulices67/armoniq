import SwiftUI

struct TunerView: View {
    @StateObject private var engine = TunerAudioEngine()
    @State private var selectedInstrument = "Guitarra"
    
    let guitarStrings: [(name: String, note: String, freq: Double, midi: Int)] = [
        ("6ª", "E2", 82.41, 40),
        ("5ª", "A2", 110.00, 45),
        ("4ª", "D3", 146.83, 50),
        ("3ª", "G3", 196.00, 55),
        ("2ª", "B3", 246.94, 59),
        ("1ª", "E4", 329.63, 64)
    ]
    
    var body: some View {
        NavigationStack {
            ZStack {
                ArmoniqTheme.paperBackground.ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Header
                        VStack(alignment: .leading, spacing: 6) {
                            Text("AFINADOR CROMÁTICO YIN")
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundColor(ArmoniqTheme.warmClay)
                                .tracking(1.2)
                            
                            HStack {
                                Text("Afinador inteligente")
                                    .font(.system(size: 28, weight: .bold, design: .serif))
                                    .foregroundColor(ArmoniqTheme.textPrimary)
                                Text("✳")
                                    .foregroundColor(ArmoniqTheme.warmClay)
                            }
                            
                            Text("Toca una cuerda. Detectamos la frecuencia exacta mediante el micrófono en tiempo real.")
                                .font(.subheadline)
                                .foregroundColor(ArmoniqTheme.textMuted)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal)
                        
                        // Tuner Main Dial Card
                        VStack(spacing: 20) {
                            // Note display circle
                            ZStack {
                                Circle()
                                    .fill(engine.isTuned ? ArmoniqTheme.forestGreen : (engine.isListening ? ArmoniqTheme.sageLight : Color.gray.opacity(0.15)))
                                    .frame(width: 130, height: 130)
                                    .animation(.easeInOut(duration: 0.2), value: engine.isTuned)
                                
                                VStack(spacing: 2) {
                                    Text(engine.noteName)
                                        .font(.system(size: 46, weight: .bold, design: .serif))
                                        .foregroundColor(engine.isTuned ? .white : ArmoniqTheme.textPrimary)
                                    
                                    if engine.isListening && engine.frequency > 0 {
                                        Text(String(format: "%.1f Hz", engine.frequency))
                                            .font(.caption2)
                                            .fontWeight(.semibold)
                                            .foregroundColor(engine.isTuned ? .white.opacity(0.85) : ArmoniqTheme.textMuted)
                                    }
                                }
                            }
                            
                            // Cents Gauge Meter
                            VStack(spacing: 8) {
                                GeometryReader { geo in
                                    let width = geo.size.width
                                    let clampedCents = max(-50.0, min(50.0, engine.cents))
                                    let needleX = width / 2.0 + (CGFloat(clampedCents) / 50.0) * (width / 2.0 - 12)
                                    
                                    ZStack(alignment: .leading) {
                                        // Track background
                                        RoundedRectangle(cornerRadius: 6)
                                            .fill(Color.gray.opacity(0.15))
                                            .frame(height: 12)
                                        
                                        // Center target zone
                                        Rectangle()
                                            .fill(ArmoniqTheme.forestGreen.opacity(0.35))
                                            .frame(width: 24, height: 16)
                                            .position(x: width / 2, y: 6)
                                        
                                        // Center line
                                        Rectangle()
                                            .fill(ArmoniqTheme.forestGreen)
                                            .frame(width: 2, height: 20)
                                            .position(x: width / 2, y: 6)
                                        
                                        // Needle
                                        if engine.isListening {
                                            Capsule()
                                                .fill(engine.isTuned ? ArmoniqTheme.forestGreen : ArmoniqTheme.warmClay)
                                                .frame(width: 6, height: 26)
                                                .position(x: needleX, y: 6)
                                                .animation(.interactiveSpring(response: 0.15), value: needleX)
                                        }
                                    }
                                }
                                .frame(height: 30)
                                
                                HStack {
                                    Text("-50¢")
                                        .font(.caption2)
                                        .foregroundColor(ArmoniqTheme.textMuted)
                                    Spacer()
                                    Text(engine.isTuned ? "¡Afinado!" : (engine.cents > 0 ? String(format: "+%.0f¢ alta", engine.cents) : String(format: "%.0f¢ baja", engine.cents)))
                                        .font(.caption)
                                        .fontWeight(.bold)
                                        .foregroundColor(engine.isTuned ? ArmoniqTheme.forestGreen : ArmoniqTheme.textPrimary)
                                    Spacer()
                                    Text("+50¢")
                                        .font(.caption2)
                                        .foregroundColor(ArmoniqTheme.textMuted)
                                }
                            }
                            .padding(.horizontal, 20)
                            
                            // Listen Toggle Button
                            Button(action: {
                                if engine.isListening {
                                    engine.stop()
                                } else {
                                    engine.start()
                                }
                            }) {
                                HStack(spacing: 10) {
                                    Image(systemName: engine.isListening ? "stop.fill" : "mic.fill")
                                    Text(engine.isListening ? "Detener escucha" : "Escuchar")
                                        .fontWeight(.bold)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 14)
                                .background(engine.isListening ? ArmoniqTheme.warmClay : ArmoniqTheme.forestGreen)
                                .foregroundColor(.white)
                                .cornerRadius(14)
                            }
                            .padding(.horizontal, 20)
                        }
                        .padding(.vertical, 24)
                        .armoniqCard()
                        .padding(.horizontal)
                        
                        // Reference Strings Card
                        VStack(alignment: .leading, spacing: 14) {
                            Text("Cuerdas de referencia (Afinación estándar)")
                                .font(.headline)
                                .foregroundColor(ArmoniqTheme.textPrimary)
                            
                            Text("Toca cada cuerda para escuchar el tono de referencia generado por el sintetizador nativo:")
                                .font(.caption)
                                .foregroundColor(ArmoniqTheme.textMuted)
                            
                            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 10), count: 3), spacing: 10) {
                                ForEach(guitarStrings, id: \.name) { string in
                                    Button(action: {
                                        AudioSynthesizer.shared.playTone(frequency: string.freq, duration: 1.5, amplitude: 0.4)
                                    }) {
                                        VStack(spacing: 4) {
                                            Text(string.name)
                                                .font(.caption2)
                                                .foregroundColor(ArmoniqTheme.textMuted)
                                            Text(string.note)
                                                .font(.headline)
                                                .foregroundColor(ArmoniqTheme.textPrimary)
                                            Text(String(format: "%.1f Hz", string.freq))
                                                .font(.system(size: 10))
                                                .foregroundColor(ArmoniqTheme.warmClay)
                                        }
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 12)
                                        .background(ArmoniqTheme.paperBackground)
                                        .cornerRadius(12)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 12)
                                                .stroke(ArmoniqTheme.borderSubtle, lineWidth: 1)
                                        )
                                    }
                                }
                            }
                        }
                        .padding(20)
                        .armoniqCard()
                        .padding(.horizontal)
                        
                        // Privacy & Audio explanation
                        HStack(alignment: .top, spacing: 12) {
                            Image(systemName: "lock.shield.fill")
                                .foregroundColor(ArmoniqTheme.forestGreen)
                                .font(.title3)
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Privacidad en el dispositivo")
                                    .font(.subheadline)
                                    .fontWeight(.bold)
                                    .foregroundColor(ArmoniqTheme.textPrimary)
                                Text("El audio del micrófono se procesa exclusivamente en memoria local mediante AVFoundation y el algoritmo YIN. Ningún audio sale de tu dispositivo.")
                                    .font(.caption)
                                    .foregroundColor(ArmoniqTheme.textMuted)
                            }
                        }
                        .padding(16)
                        .background(ArmoniqTheme.sageLight.opacity(0.6))
                        .cornerRadius(14)
                        .padding(.horizontal)
                    }
                    .padding(.vertical)
                }
            }
            .navigationTitle("Afinador")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}
