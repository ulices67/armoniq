import SwiftUI

enum ArmoniqTheme {
    static let forestGreen = Color(red: 27/255, green: 76/255, blue: 59/255)
    static let warmClay = Color(red: 233/255, green: 125/255, blue: 50/255)
    static let sageLight = Color(red: 229/255, green: 236/255, blue: 220/255)
    static let paperBackground = Color(red: 253/255, green: 251/255, blue: 247/255)
    static let cardBackground = Color(red: 255/255, green: 255/255, blue: 255/255)
    static let textPrimary = Color(red: 28/255, green: 37/255, blue: 32/255)
    static let textMuted = Color(red: 102/255, green: 115/255, blue: 106/255)
    static let borderSubtle = Color(red: 218/255, green: 226/255, blue: 217/255)
    static let successGreen = Color(red: 46/255, green: 139/255, blue: 87/255)
}

struct ArmoniqCardModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(ArmoniqTheme.cardBackground)
            .cornerRadius(18)
            .overlay(
                RoundedRectangle(cornerRadius: 18)
                    .stroke(ArmoniqTheme.borderSubtle, lineWidth: 1)
            )
            .shadow(color: Color.black.opacity(0.04), radius: 6, x: 0, y: 2)
    }
}

extension View {
    func armoniqCard() -> some View {
        self.modifier(ArmoniqCardModifier())
    }
}
