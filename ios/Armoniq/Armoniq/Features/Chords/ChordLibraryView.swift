import SwiftUI

struct ChordLibraryView: View {
    @State private var searchText = ""
    @State private var selectedChord: ChordDefinition = ChordLibrary.allChords[1] // G
    @State private var favorites: Set<String> = []
    
    var filteredChords: [ChordDefinition] {
        if searchText.isEmpty {
            return ChordLibrary.allChords
        }
        return ChordLibrary.allChords.filter {
            $0.symbol.localizedCaseInsensitiveContains(searchText) ||
            $0.name.localizedCaseInsensitiveContains(searchText)
        }
    }
    
    var body: some View {
        NavigationStack {
            ZStack {
                ArmoniqTheme.paperBackground.ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 20) {
                        // Header
                        VStack(alignment: .leading, spacing: 6) {
                            Text("BIBLIOTECA ARMÓNICA")
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundColor(ArmoniqTheme.warmClay)
                                .tracking(1.2)
                            
                            HStack {
                                Text("Explorador de acordes")
                                    .font(.system(size: 28, weight: .bold, design: .serif))
                                    .foregroundColor(ArmoniqTheme.textPrimary)
                                Text("✳")
                                    .foregroundColor(ArmoniqTheme.warmClay)
                            }
                            
                            Text("Explora su forma, descubre sus notas y escucha cómo suena con audio sintetizado.")
                                .font(.subheadline)
                                .foregroundColor(ArmoniqTheme.textMuted)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal)
                        
                        // Search & Horizontal Chips
                        VStack(spacing: 12) {
                            HStack {
                                Image(systemName: "magnifyingglass")
                                    .foregroundColor(ArmoniqTheme.textMuted)
                                TextField("Busca C, G, Em, Am, F...", text: $searchText)
                            }
                            .padding(12)
                            .background(ArmoniqTheme.cardBackground)
                            .cornerRadius(12)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(ArmoniqTheme.borderSubtle, lineWidth: 1)
                            )
                            .padding(.horizontal)
                            
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 10) {
                                    ForEach(filteredChords) { chord in
                                        let isSelected = (chord.symbol == selectedChord.symbol)
                                        Button(action: {
                                            selectedChord = chord
                                        }) {
                                            Text(chord.symbol)
                                                .font(.headline)
                                                .padding(.horizontal, 18)
                                                .padding(.vertical, 8)
                                                .background(isSelected ? ArmoniqTheme.forestGreen : ArmoniqTheme.cardBackground)
                                                .foregroundColor(isSelected ? .white : ArmoniqTheme.textPrimary)
                                                .cornerRadius(20)
                                                .overlay(
                                                    RoundedRectangle(cornerRadius: 20)
                                                        .stroke(ArmoniqTheme.borderSubtle, lineWidth: 1)
                                                )
                                        }
                                    }
                                }
                                .padding(.horizontal)
                            }
                        }
                        
                        // Main Diagram Card
                        VStack(spacing: 12) {
                            Text(selectedChord.name)
                                .font(.title3)
                                .fontWeight(.bold)
                                .foregroundColor(ArmoniqTheme.textPrimary)
                            
                            ChordFretboardView(chord: selectedChord)
                        }
                        .padding(16)
                        .armoniqCard()
                        .padding(.horizontal)
                        
                        // Chord Theory Details Card
                        VStack(alignment: .leading, spacing: 14) {
                            Text("Teoría y notas")
                                .font(.headline)
                                .foregroundColor(ArmoniqTheme.textPrimary)
                            
                            HStack {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("NOTAS")
                                        .font(.caption2)
                                        .foregroundColor(ArmoniqTheme.textMuted)
                                    Text(selectedChord.notes)
                                        .font(.subheadline)
                                        .fontWeight(.bold)
                                        .foregroundColor(ArmoniqTheme.forestGreen)
                                }
                                Spacer()
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("FÓRMULA")
                                        .font(.caption2)
                                        .foregroundColor(ArmoniqTheme.textMuted)
                                    Text(selectedChord.formula)
                                        .font(.subheadline)
                                        .fontWeight(.bold)
                                        .foregroundColor(ArmoniqTheme.warmClay)
                                }
                            }
                            
                            Divider()
                            
                            Text("Dedos: 1 índice · 2 medio · 3 anular · 4 meñique. ○ cuerda al aire. × no tocar.")
                                .font(.caption)
                                .foregroundColor(ArmoniqTheme.textMuted)
                            
                            // Favorite Button
                            Button(action: {
                                if favorites.contains(selectedChord.symbol) {
                                    favorites.remove(selectedChord.symbol)
                                } else {
                                    favorites.insert(selectedChord.symbol)
                                }
                            }) {
                                HStack {
                                    Image(systemName: favorites.contains(selectedChord.symbol) ? "heart.fill" : "heart")
                                        .foregroundColor(favorites.contains(selectedChord.symbol) ? .red : ArmoniqTheme.forestGreen)
                                    Text(favorites.contains(selectedChord.symbol) ? "En favoritos" : "Guardar en favoritos")
                                        .fontWeight(.semibold)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 12)
                                .background(ArmoniqTheme.paperBackground)
                                .foregroundColor(ArmoniqTheme.textPrimary)
                                .cornerRadius(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(ArmoniqTheme.borderSubtle, lineWidth: 1)
                                )
                            }
                        }
                        .padding(20)
                        .armoniqCard()
                        .padding(.horizontal)
                        
                        // Progression Quick Tester
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Progresión clásica Pop/Folk")
                                .font(.headline)
                                .foregroundColor(ArmoniqTheme.textPrimary)
                            
                            HStack(spacing: 10) {
                                ForEach(["C", "G", "Am", "F"], id: \.self) { sym in
                                    Button(action: {
                                        if let found = ChordLibrary.allChords.first(where: { $0.symbol == sym }) {
                                            selectedChord = found
                                            AudioSynthesizer.shared.playChord(midiNotes: found.midi)
                                        }
                                    }) {
                                        Text(sym)
                                            .font(.headline)
                                            .frame(maxWidth: .infinity)
                                            .padding(.vertical, 10)
                                            .background(ArmoniqTheme.sageLight)
                                            .foregroundColor(ArmoniqTheme.forestGreen)
                                            .cornerRadius(10)
                                    }
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
            .navigationTitle("Acordes")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}
