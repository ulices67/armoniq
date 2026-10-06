import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            TunerView()
                .tabItem {
                    Label("Afinador", systemImage: "tuningfork")
                }
                .tag(0)
            
            MetronomeView()
                .tabItem {
                    Label("Metrónomo", systemImage: "metronome.fill")
                }
                .tag(1)
            
            ChordLibraryView()
                .tabItem {
                    Label("Acordes", systemImage: "guitars.fill")
                }
                .tag(2)
            
            StudioView()
                .tabItem {
                    Label("Estudio", systemImage: "waveform.and.mic")
                }
                .tag(3)
            
            ProfileView()
                .tabItem {
                    Label("Perfil", systemImage: "person.crop.circle")
                }
                .tag(4)
        }
        .tint(ArmoniqTheme.forestGreen)
    }
}
