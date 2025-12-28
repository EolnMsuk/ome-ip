# ome-ip v2.0

![ome-ads](https://github.com/user-attachments/assets/01f14147-2fab-4f52-b826-fc56abbd953b)

![Version](https://img.shields.io/badge/version-2.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**The ultimate power suite for Ome.tv and Omegle-like platforms.** `ome-ip` is a sophisticated Userscript that injects a pro-level control panel directly into your chat interface. It provides real-time geolocation, stealth features, automation, and advanced protection layers that bypass standard restrictions.


---

## ⚡ Key Features

### 🌍 Advanced Geolocation & IP Tools

* **Real-Time IP Fetching:** Instantly grabs partner IP addresses using native WebRTC interception.
* **Precision Geolocation:** Displays City, Region, Country, and ISP information (powered by `ip-api.com`).
* **Map Integration:** Built-in draggable Map Window.
* **Street View Mode:** Drop directly into street view of the target location.


* **Relay/VPN Detection:** Automatically detects and flags TURN server/Relay IPs (proxies) in red to warn you of masked connections.
* **History & Notes:** Saves history of encountered IPs. Add custom notes to specific IPs (e.g., "Good convo", "Bot") that reappear if you match them again.

### 🛡️ Stealth & Protection (Bypass)

* **Face Detection Bypass:** Spoofs the camera stream for "Face Detection" checks, preventing bans on sites that require a visible face.
* **Report Protection:** Intercepts and blocks WebSocket report packets (`rimage`/`banned` signals), preventing many common automated bans.
* **Native Code Masking:** Overwrites browser functions (`RTCPeerConnection`, `Worker`, `WebSocket`) with "native-looking" wrappers to prevent sites from detecting the extension.
* **Anti-Fingerprint:** Prevents sites from sniffing your true location via WebRTC leakage.

### 🚫 Blocking & Filtering

* **Country Blocker:** Block entire countries or specific regions.
* Sort countries by **Continent**, **A-Z**, or **Language**.
* Smart "Auto-Skip" triggers immediately upon matching a blocked country.


* **IP Blocker:** One-click "Block IP" button. Automatically skips if you ever match that user again.
* **Connection Upgrade Logic:** Smartly handles IPv4 vs IPv6, prioritizing direct connections over relays for better location accuracy.

### 🤖 Automation & UI

* **Smart Skip:** Intelligent skipping logic that attempts multiple methods (ESC key, clicking 'Next', DOM simulation) to ensure the skip happens even if the site lags.
* **Dark Mode / UI Cleaner:** Turns the interface black and hides site watermarks/logos.
* **Element Hider:** Click-to-select tool to permanently hide/black out specific annoying page elements (ads, banners).


* **Ghost Mode:** Makes the extension window transparent and non-interactive (click-through) for recording/streaming without obstruction.
* **Volume Booster:** Independent volume slider to boost or lower partner audio.
* **Dev Console:** Built-in log viewer for debugging connection events and errors.

---

## 💻 Current Support

This script is optimized for and matches the following sites:

* `ome.tv`
* `thundr.com`
* `monkey.app`
* `omegleapp.me`
* `umingle.com`
* `omegleweb.com`
* `chatroulette.com`

<img width="1729" height="1749" alt="ome-ipSS" src="https://github.com/user-attachments/assets/bd2a084a-0168-4afe-b9ca-fb5bf33e2eb5" />

---

## 📥 Installation Guide

This tool functions as a **Userscript** and requires a browser extension to run. Follow these steps to install it on Windows (Chrome, Edge, Brave, or Firefox).

### Step 1: Install a Userscript Manager

You need an extension that manages scripts. **Tampermonkey** is the industry standard.

* **Chrome / Brave / Edge:** [Click here to install Tampermonkey from Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
* **Firefox:** [Click here to install Tampermonkey from Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)

### Step 2: Install ome-ip

1. Click the **Tampermonkey icon** in your browser toolbar and select **"Create a new script..."**.
2. Delete **all** the default code currently in the editor so it is completely blank.
3. Copy the entire content of `ome-ip.js` from this repository.
4. Paste the code into the Tampermonkey editor.
5. Press **File > Save** (or `Ctrl+S`).

### Step 3: Run It

1. Go to one of the supported sites (e.g., `ome.tv`).
2. The **ome-ip** control panel will appear automatically on the screen (draggable black window).
3. **Troubleshooting:** If the window does not appear, refresh the page. Ensure the "Status" dots in the panel are green (Active).

---

## ⚙️ How to Use

* **Draggable Windows:** All panels (Main, Map, Settings) are draggable. Click and hold the header/background to move them.
* **Status Toggles (Top Left):**
* 🎭 **Face:** Toggle Face Detection bypass.
* 🛡️ **Shield:** Toggle Report/Ban protection.
* 📡 **Dish:** Toggle IP Grabbing.


* **Badges (Top Right):**
* `CNTRY`: Toggles the Country Blocker on/off.
* `IP`: Toggles the specific IP Blocker on/off.
* `CMD`: Opens the developer log console.
* 👻 (Ghost): Toggles transparency mode.
* 👁️ (Eye): Toggles "Dark Mode" and hides website watermarks.


* **Map:** Click the **Blue MAP Button** to open the location viewer. Click "Open Street View" inside the map to see the street level.

---

## 📝 Disclaimer

*This tool is for educational purposes and research into WebRTC logic and browser security. The developer is not responsible for bans or account suspensions resulting from the use of this tool. Use responsibly.*

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Author: [$eolnmsuk](https://github.com/EolnMsuk)*
