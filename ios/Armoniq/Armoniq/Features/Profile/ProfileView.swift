import SwiftUI

struct ProfileView: View {
    @AppStorage("musicianName") private var musicianName = "Músico Armoniq"
    @AppStorage("selectedInstrument") private var selectedInstrument = "Guitarra"
    @AppStorage("dailyMinutes") private var dailyMinutes = 20
    @AppStorage("experienceLevel") private var experienceLevel = "Principiante"
    
    let instrumentsList = ["Guitarra", "Piano", "Bajo", "Ukelele", "Batería"]
    let levelsList = ["Principiante", "Intermedio", "Avanzado"]
    
    var body: some View {
        NavigationStack {
            ZStack {
                ArmoniqTheme.paperBackground.ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Profile Avatar Card
                        HStack(spacing: 18) {
                            ZStack {
                                Circle()
                                    .fill(ArmoniqTheme.forestGreen)
                                    .frame(width: 64, height: 64)
                                Text(String(musicianName.prefix(1)).uppercased())
                                    .font(.title)
                                    .fontWeight(.bold)
                                    .foregroundColor(.white)
                            }
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text("MI HISTORIA MUSICAL")
                                    .font(.caption2)
                                    .fontWeight(.bold)
                                    .foregroundColor(ArmoniqTheme.warmClay)
                                    .tracking(1.2)
                                Text(musicianName)
                                    .font(.title2)
                                    .fontWeight(.bold)
                                    .foregroundColor(ArmoniqTheme.textPrimary)
                                Text("La música también forma parte de tu historia.")
                                    .font(.caption)
                                    .foregroundColor(ArmoniqTheme.textMuted)
                            }
                            Spacer()
                        }
                        .padding(20)
                        .armoniqCard()
                        .padding(.horizontal)
                        
                        // Practice Stats Row
                        HStack(spacing: 12) {
                            StatBox(number: "42", unit: "min", label: "Hoy")
                            StatBox(number: "12", unit: "sesiones", label: "Total")
                            StatBox(number: "8", unit: "acordes", label: "Dominados")
                        }
                        .padding(.horizontal)
                        
                        // Preferences Form Card
                        VStack(alignment: .leading, spacing: 18) {
                            Text("Tu configuración de aprendizaje")
                                .font(.headline)
                                .foregroundColor(ArmoniqTheme.textPrimary)
                            
                            VStack(alignment: .leading, spacing: 6) {
                                Text("Nombre de músico")
                                    .font(.caption)
                                    .fontWeight(.semibold)
                                    .foregroundColor(ArmoniqTheme.textMuted)
                                TextField("Tu nombre", text: $musicianName)
                                    .padding(12)
                                    .background(ArmoniqTheme.paperBackground)
                                    .cornerRadius(10)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 10)
                                            .stroke(ArmoniqTheme.borderSubtle, lineWidth: 1)
                                    )
                            }
                            
                            VStack(alignment: .leading, spacing: 6) {
                                Text("Instrumento principal")
                                    .font(.caption)
                                    .fontWeight(.semibold)
                                    .foregroundColor(ArmoniqTheme.textMuted)
                                Picker("Instrumento", selection: $selectedInstrument) {
                                    ForEach(instrumentsList, id: \.self) { inst in
                                        Text(inst).tag(inst)
                                    }
                                }
                                .pickerStyle(.segmented)
                            }
                            
                            VStack(alignment: .leading, spacing: 6) {
                                Text("Nivel de experiencia")
                                    .font(.caption)
                                    .fontWeight(.semibold)
                                    .foregroundColor(ArmoniqTheme.textMuted)
                                Picker("Nivel", selection: $experienceLevel) {
                                    ForEach(levelsList, id: \.self) { lvl in
                                        Text(lvl).tag(lvl)
                                    }
                                }
                                .pickerStyle(.segmented)
                            }
                            
                            VStack(alignment: .leading, spacing: 6) {
                                Text("Meta diaria: \(dailyMinutes) minutos al día")
                                    .font(.caption)
                                    .fontWeight(.semibold)
                                    .foregroundColor(ArmoniqTheme.textMuted)
                                Stepper("Minutos al día: \(dailyMinutes)", value: $dailyMinutes, in: 5...60, step: 5)
                                    .tint(ArmoniqTheme.forestGreen)
                            }
                        }
                        .padding(20)
                        .armoniqCard()
                        .padding(.horizontal)
                        
                        // Cloudflare Sync Info
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Image(systemName: "cloud.fill")
                                    .foregroundColor(ArmoniqTheme.forestGreen)
                                Text("Sincronización con Armoniq Web")
                                    .font(.subheadline)
                                    .fontWeight(.bold)
                                    .foregroundColor(ArmoniqTheme.textPrimary)
                            }
                            Text("Esta app se conecta con la API de Cloudflare Workers y D1 de Armoniq para guardar sesiones e historial unificado.")
                                .font(.caption)
                                .foregroundColor(ArmoniqTheme.textMuted)
                        }
                        .padding(16)
                        .background(ArmoniqTheme.sageLight.opacity(0.5))
                        .cornerRadius(14)
                        .padding(.horizontal)
                    }
                    .padding(.vertical)
                }
            }
            .navigationTitle("Mi Perfil")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

private struct StatBox: View {
    let number: String
    let unit: String
    let label: String
    
    var body: some View {
        VStack(spacing: 2) {
            HStack(alignment: .lastTextBaseline, spacing: 2) {
                Text(number)
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(ArmoniqTheme.textPrimary)
                Text(unit)
                    .font(.caption2)
                    .foregroundColor(ArmoniqTheme.textMuted)
            }
            Text(label)
                .font(.caption2)
                .foregroundColor(ArmoniqTheme.textMuted)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .armoniqCard()
    }
}
