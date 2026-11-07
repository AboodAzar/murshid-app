# Oliver ZUJ - Native iOS App Installation Guide

This dedicated subfolder (`ios-app/`) contains the complete native iOS project for **Oliver Academic Advising & E-Learning**. It is completely decoupled and isolated from the main desktop/server codebase to ensure zero interference.

---

## 📱 Device Compatibility & iOS Version
* **Target Deployment:** `iOS 15.0+`
* **Compatible Devices:**
  * **iPhone XS & iPhone XS Max** (Fully supported via iOS 15, 16, 17, and 18)
  * **All Modern iPhones** (iPhone 11, 12, 13, 14, 15, 16 Pro, etc.)
  * **Future Proofing:** Forward-compatible with future iOS releases (iOS 19 through iOS 27+) using standard modern WebKit, Swift 5+, and WKWebView architectures.

---

## 🛠 Project Structure
```
ios-app/
├── package.json              # Isolated dependencies (@capacitor/core, @capacitor/ios, etc.)
├── capacitor.config.json     # App ID (jo.edu.zuj.oliver), permissions, and networking
├── www/                      # Compiled native mobile web bundle
│   └── index.html            # Native iPhone UI (safe-area insets, notch & Dynamic Island)
├── scripts/
│   └── bundle-app.mjs        # Automated mobile packager
├── ios/
│   └── App/
│       ├── App.xcodeproj    # Official Apple Xcode project
│       ├── App.xcworkspace  # Xcode workspace with CocoaPods
│       ├── Podfile          # CocoaPods specification (iOS 15.0+)
│       └── App/
│           ├── Info.plist   # Permissions (Camera, Local Networking, Non-exempt encryption)
│           └── Assets.xcassets # App icons & Launch screen
└── .github/workflows/
    └── build-ios.yml        # Cloud Mac CI/CD to build Oliver-ZUJ.ipa automatically
```

---

## 🚀 How to Install on iPhone XS / XS Max from Windows (No Mac Required)

Since you have an Apple Developer account (**`aboodabed04@icloud.com`**) and a Windows PC, here are the easiest ways to get the app onto your iPhone:

### Method 1: Sideloadly (Recommended — Takes ~2 Minutes)
1. Download and install **Sideloadly** on your Windows PC from [https://sideloadly.io](https://sideloadly.io).
2. Connect your iPhone XS or XS Max to your PC with a Lightning-to-USB cable.
3. If prompted on your iPhone screen, tap **Trust This Computer** and enter your passcode.
4. Obtain the compiled `Oliver-ZUJ.ipa` (built via GitHub Actions workflow or cloud builder).
5. Open Sideloadly:
   * Drag and drop `Oliver-ZUJ.ipa` into Sideloadly.
   * Under **Apple account**, enter your developer email: `aboodabed04@icloud.com`.
   * Click **Start**.
6. Sideloadly will contact Apple Developer servers, sign the app with your Apple Developer certificate, and install it directly to your iPhone.
7. On your iPhone:
   * Go to **Settings** > **General** > **VPN & Device Management**.
   * Under *Developer App*, tap your Apple ID and select **Trust**.
   * Launch **Oliver ZUJ** directly from your iPhone home screen!

---

### Method 2: TestFlight (Official Apple Developer Cloud Install — No Cables)
As a member of the Apple Developer Program:
1. Log in to [App Store Connect](https://appstoreconnect.apple.com) using `aboodabed04@icloud.com`.
2. Under **Apps**, click **+** and create a new app with Bundle ID `jo.edu.zuj.oliver`.
3. In GitHub Actions, provide your App Store Connect API Key.
4. GitHub Actions builds and uploads the build directly to TestFlight.
5. Open the **TestFlight** app on your iPhone XS / XS Max and tap **Install**!

---

## 📡 Connecting the iPhone App to your Laptop Server

1. Ensure your iPhone and laptop are on the same Wi-Fi network (or iPhone Personal Hotspot).
2. Your laptop's current local IP address is:
   ```
   http://172.20.10.4:3000
   ```
3. Open the Oliver app on your iPhone:
   * Tap the top status bar or network indicator to open the **Server Host** configuration.
   * Enter `http://172.20.10.4:3000` (or your ngrok / Cloudflare Tunnel URL).
   * Tap **Save & Connect**.
4. The iPhone app will now communicate directly with your laptop's Oliver server, MySQL database, and local Ollama AI model!
