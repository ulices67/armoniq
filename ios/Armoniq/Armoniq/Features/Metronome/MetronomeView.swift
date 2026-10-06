import SwiftUI

struct MetronomeView: View {
    @StateObject private var engine = MetronomeEngine()
    
    var tempoName: String {
        switch engine.bpm {
        case 40..<60: return "Largo"
        case 60..<66: return "Larghetto"
        case 66..<76: return "Adagio"
        case 76..<108: return "Andante"
        case 108..<120: return "Moderato"
        case 120..<168: return "Allegro"
        case 168..<200: return "Presto"
        default: return "Prestissimo"
        }
    }
    
    var body: some View {
        NavigationStack {
            ZStack {
                ArmoniqTheme.paperBackground.ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Header
                        VStack(alignment: .leading, spacing: 6) {
                            Text("RELOJ DE PRECISIÓN")
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundColor(ArmoniqTheme.warmClay)
                                .tracking(1.2)
                            
                            HStack {
                                Text("Metrónomo")
                                    .font(.system(size: 28, weight: .bold, design: .serif))
                                    .foregroundColor(ArmoniqTheme.textPrimary)
                                Text("✳")
                                    .foregroundColor(ArmoniqTheme.warmClay)
                            }
                            
                            Text("Encuentra un pulso constante con acentos configurables y respuesta háptica sincronizada.")
                                .font(.subheadline)
                                .foregroundColor(ArmoniqTheme.textMuted)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal)
                        
                        // Main Metronome Card
                        VStack(spacing: 24) {
                            // Tempo and BPM
                            VStack(spacing: 4) {
                                Text(tempoName.uppercased())
                                    .font(.caption)
                                    .fontWeight(.bold)
                                    .foregroundColor(ArmoniqTheme.warmClay)
                                    .tracking(1.5)
                                
                                HStack(alignment: .lastTextBaseline, spacing: 6) {
                                    Text("\(engine.bpm)")
                                        .font(.system(size: 72, weight: .bold, design: .serif))
                                        .foregroundColor(ArmoniqTheme.textPrimary)
                                    Text("BPM")
                                        .font(.headline)
                                        .foregroundColor(ArmoniqTheme.textMuted)
                                }
                            }
                            
                            // Visual Beat Indicators
                            HStack(spacing: 14) {
                                ForEach(0..<engine.beatsPerBar, id: \.self) { i in
                                    let isCurrent = (engine.isRunning && engine.currentBeat == (i + 1) % engine.beatsPerBar)
                                    let isAccent = (i == 0)
                                    
                                    VStack(spacing: 4) {
                                        Circle()
                                            .fill(isCurrent ? (isAccent ? ArmoniqTheme.warmClay : ArmoniqTheme.forestGreen) : Color.gray.opacity(0.2))
                                            .frame(width: isAccent ? 26 : 20, height: isAccent ? 26 : 20)
                                            .scaleEffect(isCurrent ? 1.25 : 1.0)
                                            .animation(.spring(response: 0.15, dampingFraction: 0.5), value: isCurrent)
                                        
                                        Text("\(i + 1)")
                                            .font(.caption2)
                                            .fontWeight(isCurrent ? .bold : .regular)
                                            .foregroundColor(isCurrent ? ArmoniqTheme.textPrimary : ArmoniqTheme.textMuted)
                                    }
                                }
                            }
                            .frame(height: 44)
                            
                            // Stepper Controls
                            HStack(spacing: 12) {
                                Button("-5") { engine.bpm = max(40, engine.bpm - 5) }
                                    .buttonStyle(PillButtonStyle())
                                Button("-1") { engine.bpm = max(40, engine.bpm - 1) }
                                    .buttonStyle(PillButtonStyle())
                                
                                Spacer()
                                
                                Button("+1") { engine.bpm = min(240, engine.bpm + 1) }
                                    .buttonStyle(PillButtonStyle())
                                Button("+5") { engine.bpm = min(240, engine.bpm + 5) }
                                    .buttonStyle(PillButtonStyle())
                            }
                            .padding(.horizontal, 20)
                            
                            // BPM Slider
                            Slider(value: Binding(
                                get: { Double(engine.bpm) },
                                set: { engine.bpm = Int($0) }
                            ), in: 40...240, step: 1)
                            .tint(ArmoniqTheme.forestGreen)
                            .padding(.horizontal, 20)
                            
                            // Play/Pause Big Button
                            Button(action: {
                                engine.toggle()
                            }) {
                                HStack(spacing: 12) {
                                    Image(systemName: engine.isRunning ? "pause.fill" : "play.fill")
                                        .font(.title2)
                                    Text(engine.isRunning ? "Detener" : "Iniciar metrónomo")
                                        .font(.headline)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 16)
                                .background(engine.isRunning ? ArmoniqTheme.warmClay : ArmoniqTheme.forestGreen)
                                .foregroundColor(.white)
                                .cornerRadius(16)
                            }
                            .padding(.horizontal, 20)
                        }
                        .padding(.vertical, 24)
                        .armoniqCard()
                        .padding(.horizontal)
                        
                        // Settings & Tools Grid
                        VStack(spacing: 16) {
                            // Compás / Time Signature Picker
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Compás y métrica")
                                    .font(.headline)
                                    .foregroundColor(ArmoniqTheme.textPrimary)
                                
                                HStack(spacing: 10) {
                                    ForEach([2, 3, 4, 6], id: \.self) { beats in
                                        Button(action: {
                                            engine.beatsPerBar = beats
                                        }) {
                                            Text("\(beats)/4")
                                                .font(.subheadline)
                                                .fontWeight(.bold)
                                                .frame(maxWidth: .infinity)
                                                .padding(.vertical, 10)
                                                .background(engine.beatsPerBar == beats ? ArmoniqTheme.forestGreen : ArmoniqTheme.paperBackground)
                                                .foregroundColor(engine.beatsPerBar == beats ? .white : ArmoniqTheme.textPrimary)
                                                .cornerRadius(10)
                                                .overlay(
                                                    RoundedRectangle(cornerRadius: 10)
                                                        .stroke(ArmoniqTheme.borderSubtle, lineWidth: 1)
                                                )
                                        }
                                    }
                                }
                            }
                            .padding(18)
                            .armoniqCard()
                            
                            // Tap Tempo & Haptics Row
                            HStack(spacing: 12) {
                                // Tap tempo button
                                Button(action: {
                                    engine.tapTempo()
                                }) {
                                    VStack(spacing: 6) {
                                        Image(systemName: "hand.tap.fill")
                                            .font(.title2)
                                            .foregroundColor(ArmoniqTheme.warmClay)
                                        Text("TAP TEMPO")
                                            .font(.caption)
                                            .fontWeight(.bold)
                                            .foregroundColor(ArmoniqTheme.textPrimary)
                                        Text("Pulsa al ritmo")
                                            .font(.caption2)
                                            .foregroundColor(ArmoniqTheme.textMuted)
                                    }
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 16)
                                    .background(ArmoniqTheme.cardBackground)
                                    .cornerRadius(16)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 16)
                                            .stroke(ArmoniqTheme.borderSubtle, lineWidth: 1)
                                    )
                                }
                                
                                // Haptics toggle card
                                VStack(spacing: 8) {
                                    Toggle(isOn: $engine.enableHaptics) {
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text("Vibración háptica")
                                                .font(.subheadline)
                                                .fontWeight(.bold)
                                                .foregroundColor(ArmoniqTheme.textPrimary)
                                            Text("Pulso en la mano")
                                                .font(.caption2)
                                                .foregroundColor(ArmoniqTheme.textMuted)
                                        }
                                    }
                                    .tint(ArmoniqTheme.forestGreen)
                                }
                                .padding(16)
                                .frame(maxWidth: .infinity)
                                .armoniqCard()
                            }
                        }
                        .padding(.horizontal)
                    }
                    .padding(.vertical)
                }
            }
            .navigationTitle("Metrónomo")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

private struct PillButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.caption)
            .fontWeight(.bold)
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background(ArmoniqTheme.sageLight)
            .foregroundColor(ArmoniqTheme.forestGreen)
            .cornerRadius(20)
            .scaleEffect(configuration.isPressed ? 0.94 : 1.0)
    }
}
