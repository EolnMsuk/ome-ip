// ==UserScript==
// @name         ome-ip
// @license      MIT License
// @namespace    https://github.com/EolnMsuk/ome-ip
// @version      1.3
// @description  ome.tv + more privacy and info extension
// @author       $eolnmsuk
// @match        https://ome.tv/*
// @match        https://www.ome.tv/*
// @match        https://omegleapp.me/*
// @match        https://www.omegleapp.me/*
// @match        https://chatroulette.com/*
// @match        https://www.chatroulette.com/*
// @match        https://monkey.app/*
// @match        https://www.monkey.app/*
// @match        https://umingle.com/*
// @match        https://www.umingle.com/*
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 1. UI: Create the Floating Log Box
    function createLogWindow() {
        if (document.getElementById("ip-log-window")) return;

        var logContainer = document.createElement("div");
        logContainer.id = "ip-log-window";
        logContainer.style.position = "fixed";
        logContainer.style.top = "120px";
        logContainer.style.left = "10px";

        // --- RESIZE SETTINGS ---
        logContainer.style.width = "280px";
        logContainer.style.minWidth = "200px";
        logContainer.style.minHeight = "100px";
        logContainer.style.resize = "both";
        logContainer.style.overflow = "hidden";

        // Appearance
        logContainer.style.padding = "15px";
        logContainer.style.backgroundColor = "rgba(0,0,0,0.3)";
        logContainer.style.color = "#00FF00";
        logContainer.style.zIndex = "999999";
        logContainer.style.fontSize = "16px";
        logContainer.style.fontWeight = "bold";
        logContainer.style.fontFamily = "monospace";

        logContainer.style.borderRadius = "12px";
        logContainer.style.border = "1px solid #444";
        logContainer.style.backdropFilter = "blur(5px)";
        logContainer.style.cursor = "move";
        logContainer.style.boxShadow = "0 4px 15px rgba(0,0,0,0.5)";

        var content = document.createElement("div");
        content.id = "ip-content-area";
        content.innerHTML = "<span style='color:#ccc;'>📍 Waiting for partner...</span>";
        content.style.pointerEvents = "none";
        logContainer.appendChild(content);

        document.body.appendChild(logContainer);

        // --- SMART DRAG LOGIC ---
        let isDragging = false;
        let offsetX, offsetY;

        logContainer.addEventListener('mousedown', function(e) {
            // Check if clicking text (allow selection)
            if (e.target.tagName !== "B" && e.target.tagName !== "SPAN" && e.target.tagName !== "DIV") {
                 e.preventDefault();
            }

            // Check if clicking resize handle (bottom-right 20px)
            if (e.offsetX > logContainer.offsetWidth - 20 && e.offsetY > logContainer.offsetHeight - 20) {
                return;
            }

            isDragging = true;
            offsetX = e.clientX - logContainer.offsetLeft;
            offsetY = e.clientY - logContainer.offsetTop;
            logContainer.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                logContainer.style.left = (e.clientX - offsetX) + 'px';
                logContainer.style.top = (e.clientY - offsetY) + 'px';
            }
        });

        document.addEventListener('mouseup', function() {
            isDragging = false;
            logContainer.style.cursor = 'move';
        });
    }

    // 2. STYLE: Inject Complete Dark Theme
    function customizeChatTheme() {
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
            body, html, #roulette, .roulette-box, .chat-container, .chat, .buttons, .chat__body, .chat__messages {
                background-color: #000000 !important;
            }
            .message-bubble {
                background-color: #111111 !important;
                border: 1px solid #333 !important;
                color: #ffffff !important;
            }
            .message.system .message-bubble {
                color: #aaaaaa !important;
            }
            .message-report-link {
                color: #ff5555 !important;
            }
            .chat__textarea, #chat-text, .chat__textfield {
                background-color: #000000 !important;
                color: #ffffff !important;
                border: 1px solid #333 !important;
            }
            .chat__textarea::placeholder {
                color: #666 !important;
            }
            .buttons__wrapper {
                background-color: #000000 !important;
                border-top: 1px solid #222 !important;
            }
            .country-filter-popup, .gender-selector__popup {
                background-color: #111111 !important;
                border: 1px solid #444 !important;
                color: #ffffff !important;
            }
            .country-filter-popup__country, .gender-selector__popup-item {
                color: #cccccc !important;
            }
            .country-filter-popup__country:hover, .gender-selector__popup-item:hover {
                background-color: #333333 !important;
                color: #ffffff !important;
            }
        `;
        document.head.appendChild(style);
    }

    // 3. HELPER: Standard HTML Escaping (No extra formatting)
    function safe(str) {
        if (!str) return "Unknown";
        // Just prevents code injection, displays symbols as they are
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    // 4. Helper to Overwrite Message
    var updateMessage = function(htmlContent) {
        var contentArea = document.getElementById("ip-content-area");
        if (contentArea) {
            contentArea.innerHTML = htmlContent;
        }
    };

    // 5. LOGIC: Stealth Hook
    const nativeAddIceCandidate = window.RTCPeerConnection.prototype.addIceCandidate;
    window.RTCPeerConnection.prototype.addIceCandidate = function(iceCandidate, ...args) {
        if (iceCandidate && iceCandidate.candidate) {
            const fields = iceCandidate.candidate.split(" ");
            if (fields[7] === "srflx") {
                const ip = fields[4];
                getLocation(ip);
            }
        }
        return nativeAddIceCandidate.apply(this, [iceCandidate, ...args]);
    };

    // 6. API: BYPASS CORS using GM_xmlhttpRequest
    var getLocation = function(ip) {
        updateMessage(`<span style='color:yellow'>Fetching info for ${ip}...</span>`);

        GM_xmlhttpRequest({
            method: "GET",
            // We use http here because ip-api.com's free tier is HTTP only.
            // GM_xmlhttpRequest allows this mixed content without issues.
            url: `http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,isp,query`,
            onload: function(response) {
                try {
                    var json = JSON.parse(response.responseText);
                    if (json.status === 'success') {
                        const output = `
                        <div style="line-height: 1.6; text-shadow: 1px 1px 2px black;">
                            <span style="color:#777777;">${safe(json.country)}</span><br>
                            <span style="color:#DDDDDD;">${safe(json.city)}, ${safe(json.regionName)}</span><br>
                            <span style="color:#33CCFF;">${safe(json.isp)}</span><br>
                            <span style="color:#00FF00;">${safe(json.query)}</span>
                        </div>`;
                        updateMessage(output);
                    } else {
                        // If the API returns a logic error (like "reserved range")
                        var errorReason = json.message || "Private/Local IP";
                        updateMessage(`<span style='color:red'>${safe(errorReason)}</span>`);
                    }
                } catch (e) {
                    // This triggers if the API sends HTML (Ban page) instead of JSON
                    console.error("Parsing failed. Response was:", response.responseText);
                    updateMessage(`<span style='color:red'>Data Parse Error (Check Console)</span>`);
                }
            },
            onerror: function(error) {
                updateMessage(`<span style='color:red'>Connection Blocked</span>`);
            }
        });
    };

    // 7. BYPASS: Face Detection Worker Hook
    const nativeWorker = window.Worker;
    window.Worker = function(scriptURL, options) {
        const urlString = String(scriptURL);

        // Check for known vision/face detection scripts
        if (urlString.includes('vision') || urlString.includes('face') || urlString.includes('wasm')) {
            console.log("OME-IP: Intercepting Vision/Face Worker ->", urlString);

            // Create a dummy worker that just says "Yes, I see a face"
            const dummyWorkerCode = `
                self.onmessage = function(e) {
                    // Respond to any message with a "success" or fake face data
                    self.postMessage({
                        action: 'faceDetections',
                        faces: [{x:0.5, y:0.5, width:0.5, height:0.5}],
                        detected: 1
                    });
                };
            `;

            // Convert code string to a Blob so it can be loaded as a Worker
            const blob = new Blob([dummyWorkerCode], { type: 'application/javascript' });
            const blobURL = URL.createObjectURL(blob);

            return new nativeWorker(blobURL, options);
        }

        // Return standard worker for everything else
        return new nativeWorker(scriptURL, options);
    };

    // Initialize UI on load
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function() {
            createLogWindow();
            customizeChatTheme();
        });
    } else {
        createLogWindow();
        customizeChatTheme();
    }
})();
