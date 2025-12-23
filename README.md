# ome-ip

![Version](https://img.shields.io/badge/version-1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**ome-ip** is a userscript (Tampermonkey/Violentmonkey) designed to enhance the experience on Ome.tv, Chatroulette, and similar random video chat platforms. It provides a stealthy overlay displaying your chat partner's geolocation details and applies a sleek dark theme to the interface.

## 🚀 Features

* **📍 IP Geolocation:** Automatically intercepts WebRTC connection attempts to extract the partner's IP address.
* **🌍 Detailed Info:** Fetches and displays Country, Region, City, and ISP using the `ip-api.com` database.
* **🎨 Dark Mode:** Injects a custom CSS dark theme to replace the bright default interfaces of supported sites.
* **🖼️ Draggable UI:** Information is displayed in a floating, semi-transparent box that can be dragged and resized anywhere on the screen.
* **⚡ Cross-Platform:** Works on multiple Ome.tv clones and alternatives.

## 📦 Supported Sites

The script is configured to run on the following domains:
* `ome.tv`
* `omegleapp.me`
* `chatroulette.com`
* `monkey.app`
* `umingle.com`

## 🛠️ Installation

### Prerequisites
You need a userscript manager installed in your browser:
* **Chrome/Edge:** [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) or [Violentmonkey](https://violentmonkey.github.io/)
* **Firefox:** [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) or [Violentmonkey](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/)

### Steps
1.  Install the Tampermonkey extension for your browser.
2.  Click the extension icon and select **"Create a new script..."**.
3.  Delete any default code in the editor.
4.  Copy and paste the entire content of `ome-ip.js` into the editor.
5.  Press `File` > `Save` (or Ctrl+S).
6.  Navigate to [Ome.tv](https://ome.tv) (or any supported site) to see it in action.

## 📖 How It Works

1.  **WebRTC Hook:** The script overrides the browser's native `RTCPeerConnection` method. When a video chat connects, the browser exchanges "ICE Candidates" to establish a direct path.
2.  **Extraction:** The script silently listens for candidates tagged as `srflx` (Server Reflexive), which contain the public IP address of the remote peer.
3.  **API Query:** It uses `GM_xmlhttpRequest` to bypass Cross-Origin Resource Sharing (CORS) restrictions and queries the IP against a geolocation database.

## ⚠️ Disclaimer

This script is for **educational purposes only**.

* **Privacy:** This tool exposes data that is already public during a P2P WebRTC connection. However, do not use this tool to harass, doxx, or harm other users.
* **ToS:** Using scripts to modify the behavior of websites may violate their Terms of Service. Use at your own risk.
* **Accuracy:** Geolocation is based on IP address and may not pinpoint an exact physical location; it usually points to the ISP's local exchange or data center.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Author: [$eolnmsuk](https://github.com/EolnMsuk)*
