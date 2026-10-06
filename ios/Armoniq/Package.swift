// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "Armoniq",
    defaultLocalization: "es",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(
            name: "ArmoniqCore",
            targets: ["ArmoniqCore"]
        )
    ],
    targets: [
        .target(
            name: "ArmoniqCore",
            path: "Armoniq",
            exclude: ["Resources/Info.plist", "Resources/Assets.xcassets"]
        )
    ]
)
