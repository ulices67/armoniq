import Foundation

struct ChordDefinition: Identifiable, Hashable {
    var id: String { symbol }
    let symbol: String
    let name: String
    let frets: [Int]       // 6 items from 6th (low E) to 1st (high e). -1 = mute, 0 = open, 1..5 = fret
    let fingers: [Int]     // finger numbers: 1 = index, 2 = middle, 3 = ring, 4 = pinky, 0 = none
    let notes: String
    let formula: String
    let midi: [Int]
}

enum ChordLibrary {
    static let allChords: [ChordDefinition] = [
        ChordDefinition(
            symbol: "C",
            name: "Do mayor",
            frets: [-1, 3, 2, 0, 1, 0],
            fingers: [0, 3, 2, 0, 1, 0],
            notes: "C · E · G",
            formula: "1 - 3 - 5",
            midi: [48, 52, 55, 60, 64]
        ),
        ChordDefinition(
            symbol: "G",
            name: "Sol mayor",
            frets: [3, 2, 0, 0, 0, 3],
            fingers: [2, 1, 0, 0, 0, 3],
            notes: "G · B · D",
            formula: "1 - 3 - 5",
            midi: [43, 47, 50, 55, 59, 67]
        ),
        ChordDefinition(
            symbol: "D",
            name: "Re mayor",
            frets: [-1, -1, 0, 2, 3, 2],
            fingers: [0, 0, 0, 1, 3, 2],
            notes: "D · F# · A",
            formula: "1 - 3 - 5",
            midi: [50, 57, 62, 66]
        ),
        ChordDefinition(
            symbol: "Em",
            name: "Mi menor",
            frets: [0, 2, 2, 0, 0, 0],
            fingers: [0, 2, 3, 0, 0, 0],
            notes: "E · G · B",
            formula: "1 - b3 - 5",
            midi: [40, 47, 52, 55, 59, 64]
        ),
        ChordDefinition(
            symbol: "Am",
            name: "La menor",
            frets: [-1, 0, 2, 2, 1, 0],
            fingers: [0, 0, 2, 3, 1, 0],
            notes: "A · C · E",
            formula: "1 - b3 - 5",
            midi: [45, 52, 57, 60, 64]
        ),
        ChordDefinition(
            symbol: "F",
            name: "Fa mayor (simplificado)",
            frets: [-1, -1, 3, 2, 1, 1],
            fingers: [0, 0, 3, 2, 1, 1],
            notes: "F · A · C",
            formula: "1 - 3 - 5",
            midi: [53, 57, 60, 65]
        ),
        ChordDefinition(
            symbol: "Cmaj7",
            name: "Do mayor con séptima mayor",
            frets: [-1, 3, 2, 0, 0, 0],
            fingers: [0, 3, 2, 0, 0, 0],
            notes: "C · E · G · B",
            formula: "1 - 3 - 5 - 7",
            midi: [48, 52, 55, 59, 64]
        ),
        ChordDefinition(
            symbol: "G7",
            name: "Sol dominante",
            frets: [3, 2, 0, 0, 0, 1],
            fingers: [3, 2, 0, 0, 0, 1],
            notes: "G · B · D · F",
            formula: "1 - 3 - 5 - b7",
            midi: [43, 47, 50, 55, 59, 65]
        )
    ]
}
