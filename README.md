# ome-ip

ome-ip is a powerful Userscript designed to enhance your experience on random video chat platforms. It provides real-time partner geolocation, automated protection against bans/reports, media stream manipulation (Fake Camera), and advanced blocking capabilities.

---

<img width="1837" height="2261" alt="ome-ip3" src="https://github.com/user-attachments/assets/663dc567-4c16-4d7f-9cb2-c7a44eb1a114" />

---

## 🌟 Features

### 🛡️ Core Protection & Privacy

* **IP Grabbing & Geolocation:** Instantly displays your partner's IP address, Country, Region, City, and ISP.
* **VPN/Relay Detection:** Automatically detects and warns you if a partner is using a Proxy or Turn Server (Relay IP).
* **Report Protection:** Intercepts WebSocket signals to block "Report" or "Ban" attempts from reaching the server. Includes an audio alert ("Report Detected") and auto-redirects to safety.
* **Face Detection Bypass:** Tricks site algorithms into thinking a real face is visible, preventing "Black Screen" bans.
* **Anti-Bot & Fingerprint Spoofing:**
* Spoofs Navigator properties (UserAgent, Hardware Concurrency, Device Memory).
* Bypasses automated "human verification" checks (Variance tests, Scroll length).



### 🚫 Blocking & Automation

* **Country Blocker:** Automatically skip partners from specific countries. Includes a visual continent map selector.
* **IP Blocker:** Permanently block specific IPs. If you match with them again, the script auto-skips immediately.
* **Auto-Skip Logic:** Smart skipping algorithms for Ome.tv, OmegleApp, Umingle, and more.
* **Disconnect Monitor:** Automatically finds a new partner if the current one disconnects (Specific support for OmegleApp & OmegleWeb).

### 🎬 Media & Hardware Manipulation

* **Fake Camera:** Replace your webcam feed with a custom video loop (supports `.mp4` URLs).
* **Anti-Ban Jitter:** Adds subtle movement/noise to static video feeds to prevent "Static Image" bans.
* **Device Spoofing:** Renames your hardware inputs in the browser (e.g., renames "Default Cam" to "Logitech C920").
* **Raw Audio Mode:** Disables echo cancellation and noise suppression for high-fidelity audio processing.
* **Thumbnail Capture:** Automatically captures and saves a screenshot of your partner's video stream after connection.

### 🛠️ Advanced Tools & UI

* **Draggable & Resizable UI:** A modern, dark-themed interface that can be moved, resized, or minimized.
* **Ghost Mode:** Makes the interface transparent to monitor stats without obstructing the view.
* **Map Integration:** Open a Google Maps window (Standard or Street View) centered on your partner's location.
* **Notes & History:** Keep a history of IPs encountered, save custom notes for specific users, and view past thumbnails.
* **Element Selector:** Visually select and hide (or blackout) annoying website elements (ads, banners, watermarks).
* **Developer Console:** Built-in log window to view raw WebRTC connection data and API errors.

---

## 📋 Supported Sites

The script is configured to run on the following platforms:

* Ome.tv
* OmegleApp.me
* Chatroulette.com
* Monkey.app
* Omegleweb.com
* Thundr.com
* Umingle.com
* Webcamtests.com (for testing)

---

## ⚙️ Installation Guide

### Prerequisites

You need a Userscript manager installed in your browser.

* **Chrome/Edge/Brave:** [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/).
* **Firefox:** [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) or Tampermonkey.

### Install Steps

1. Click on your Userscript manager extension icon and select **"Create a new script"**.
2. Delete any default code in the editor.
3. Copy the entire contents of `ome-ip.js`.
4. Paste the code into the editor.
5. Press `Ctrl+S` or click **File > Save**.
6. Visit any supported site (e.g., [https://ome.tv/](https://ome.tv/)) and the overlay will appear automatically.

---

## 🔧 Recommended Browser Settings

To ensure all features (especially IP Grabbing and Fake Camera) work correctly, please configure your browser as follows:

1. **WebRTC must be ENABLED:**
* Do *not* use extensions like "WebRTC Control" or "Disable WebRTC" that completely block IP leakage. This script *needs* to read the WebRTC candidates to fetch the IP.
* If you use a VPN, ensure it allows WebRTC traffic (Split Tunneling might be required if the VPN blocks P2P).


2. **Autoplay Permissions:**
* Allow the site to Autoplay video and audio. This ensures the "Fake Camera" video loads and plays correctly without user interaction.


3. **Ad Blockers:**
* Some aggressive ad blockers may interfere with the IP geolocation API (`ipwho.is`). If stats say "Net Error," try whitelisting the chat site or the API domain.


4. **Hardware Acceleration:**
* For the best performance with the "Anti-Ban Jitter" and "Fake Camera" overlays, ensure Hardware Acceleration is enabled in your browser settings.



---

## 🕹️ Controls & Shortcuts

* **Move Windows:** Click and drag the header or background of any window.
* **Resize Windows:** Drag the corners of the windows.
* **Ghost Mode:** Toggle the 👻 icon to make the UI transparent.
* **Lock UI:** Click the 🔓/🔒 icon in the top center to prevent accidental clicks on toggles.
* **Hide Watermarks:** Use the "Eye" 👁️ menu to toggle Dark Mode and hide site logos.

---

## ⚠️ Disclaimer

*This tool is for educational purposes and research into WebRTC logic and browser security. The developer is not responsible for bans or account suspensions resulting from the use of this tool. Use responsibly.*

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 💰 Donate

* Author: `https://github.com/EolnMsuk`
* CashApp: `https://cash.app/$eolnmsuk`
* BTC: `bc1qm06lzkdfule3f7flf4u70xvjrp5n74lzxnnfks`
