import SwiftUI

struct ChordFretboardView: View {
    let chord: ChordDefinition
    let stringNames = ["E", "A", "D", "G", "B", "e"]
    
    var body: some View {
        VStack(spacing: 8) {
            Text(chord.symbol)
                .font(.system(size: 32, weight: .bold, design: .serif))
                .foregroundColor(ArmoniqTheme.textPrimary)
            
            // Fretboard Canvas
            Canvas { context, size in
                let marginX: CGFloat = 36
                let marginTop: CGFloat = 30
                let marginBottom: CGFloat = 30
                let boardWidth = size.width - 2 * marginX
                let boardHeight = size.height - marginTop - marginBottom
                let stringSpacing = boardWidth / 5.0
                let fretSpacing = boardHeight / 4.0
                
                // Top Nut line (thick)
                var nutPath = Path()
                nutPath.move(to: CGPoint(x: marginX, y: marginTop))
                nutPath.addLine(to: CGPoint(x: size.width - marginX, y: marginTop))
                context.stroke(nutPath, with: .color(ArmoniqTheme.textPrimary), lineWidth: 4)
                
                // Frets lines (horizontal)
                for f in 1...4 {
                    let y = marginTop + CGFloat(f) * fretSpacing
                    var fretPath = Path()
                    fretPath.move(to: CGPoint(x: marginX, y: y))
                    fretPath.addLine(to: CGPoint(x: size.width - marginX, y: y))
                    context.stroke(fretPath, with: .color(ArmoniqTheme.borderSubtle), lineWidth: 1.5)
                }
                
                // Strings (vertical)
                for s in 0..<6 {
                    let x = marginX + CGFloat(s) * stringSpacing
                    var stringPath = Path()
                    stringPath.move(to: CGPoint(x: x, y: marginTop))
                    stringPath.addLine(to: CGPoint(x: x, y: marginTop + boardHeight))
                    context.stroke(stringPath, with: .color(ArmoniqTheme.borderSubtle), lineWidth: 1.5)
                    
                    // Top symbols: mute (X) or open (O)
                    let fretVal = chord.frets[s]
                    if fretVal == -1 {
                        context.draw(
                            Text("×").font(.system(size: 18, weight: .bold)).foregroundColor(ArmoniqTheme.textMuted),
                            at: CGPoint(x: x, y: marginTop - 15)
                        )
                    } else if fretVal == 0 {
                        context.draw(
                            Text("○").font(.system(size: 18)).foregroundColor(ArmoniqTheme.textMuted),
                            at: CGPoint(x: x, y: marginTop - 15)
                        )
                    }
                    
                    // Finger dots
                    if fretVal > 0 {
                        let dotY = marginTop + (CGFloat(fretVal) - 0.5) * fretSpacing
                        let dotRect = CGRect(x: x - 12, y: dotY - 12, width: 24, height: 24)
                        let fingerNum = chord.fingers[s]
                        let dotColor = fingerNum == 2 ? ArmoniqTheme.warmClay : ArmoniqTheme.forestGreen
                        
                        context.fill(Path(ellipseIn: dotRect), with: .color(dotColor))
                        
                        if fingerNum > 0 {
                            context.draw(
                                Text("\(fingerNum)").font(.system(size: 13, weight: .bold)).foregroundColor(.white),
                                at: CGPoint(x: x, y: dotY)
                            )
                        }
                    }
                    
                    // Bottom String Name
                    context.draw(
                        Text(stringNames[s]).font(.system(size: 13, weight: .medium)).foregroundColor(ArmoniqTheme.textMuted),
                        at: CGPoint(x: x, y: marginTop + boardHeight + 15)
                    )
                }
            }
            .frame(width: 240, height: 230)
            
            // Play Chord Audio Button
            Button(action: {
                AudioSynthesizer.shared.playChord(midiNotes: chord.midi)
            }) {
                HStack(spacing: 8) {
                    Image(systemName: "speaker.wave.2.fill")
                    Text("Escuchar acorde")
                        .fontWeight(.semibold)
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 10)
                .background(ArmoniqTheme.sageLight)
                .foregroundColor(ArmoniqTheme.forestGreen)
                .cornerRadius(20)
            }
            .padding(.top, 4)
        }
        .padding(.vertical, 16)
    }
}
