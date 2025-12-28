// ==UserScript==
// @name         ome-ip
// @license      MIT License
// @namespace    https://github.com/EolnMsuk/ome-ip
// @version      2.0
// @description  Pro IP Tool for all omegle like sites
// @author       $eolnmsuk
// @match        https://ome.tv/*
// @match        https://omegleapp.me/*
// @match        https://nsfw.omegleapp.me/*
// @match        https://chatroulette.com/*
// @match        https://monkey.app/*
// @match        https://omegleweb.com/*
// @match        https://thundr.com/*
// @match        https://umingle.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // --- 1. CSS INJECTION ---
    const GLOBAL_CSS = `
        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #1a1a1a; }
        ::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; cursor: pointer; }
        ::-webkit-scrollbar-thumb:hover { background: #666; }

        /* No Select Utility */
        .ome-no-select { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }
        .ome-grab { cursor: grab !important; }
        .ome-grab:active { cursor: grabbing !important; }

        /* Animations & Hover Effects */
        /* Common transition for all interactive elements */
        button, .clickable-badge, .icon-btn, .ip-copy-btn, .ome-next-btn, .ome-map-btn, .status-toggle-btn, .ome-vol-slider {
            transition: transform 0.1s ease, filter 0.1s ease, background-color 0.2s;
        }

        /* Hover: Slight Highlight / Pop / Shadow */
        button:hover, .clickable-badge:hover, .icon-btn:hover, .ip-copy-btn:hover, .ome-next-btn:hover, .ome-map-btn:hover, .status-toggle-btn:hover {
            filter: brightness(1.2);
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        }

        /* Active/Click: Depress/Shrink */
        button:active, .clickable-badge:active, .icon-btn:active, .ip-copy-btn:active, .ome-next-btn:active, .ome-map-btn:active, .status-toggle-btn:active {
            transform: scale(0.95) translateY(0);
            filter: brightness(0.9);
            box-shadow: none;
        }

        /* Specific fix for slider so it simply brightens without jumping */
        .ome-vol-slider:hover { transform: none; filter: brightness(1.1); }

        /* Input Isolation */
        .chat-disabled { pointer-events: none !important; opacity: 0.5 !important; }

        /* Resize Handle */
        .resizable-win { resize: both; overflow: hidden; cursor: default; }

        /* Outlines */
        .ome-text-outline { text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, -1px 0 0 #000, 1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000; }
        .ome-text-outline-thick { text-shadow: -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, -2px 0 0 #000, 2px 0 0 #000, 0 -2px 0 #000, 0 2px 0 #000, -1px -2px 0 #000, 1px -2px 0 #000, -2px -1px 0 #000, 2px -1px 0 #000, -1px 2px 0 #000, 1px 2px 0 #000, -2px 1px 0 #000, 2px 1px 0 #000; }

        /* Toast */
        .ome-toast {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background-color: rgba(255, 140, 0, 0.85); color: white; padding: 4px 8px; border-radius: 4px;
            font-size: 11px; font-weight: bold; pointer-events: none; opacity: 0; transition: opacity 0.3s ease;
            z-index: 1000; white-space: nowrap; box-shadow: 0 2px 5px rgba(0,0,0,0.5); border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .ome-toast.show { opacity: 1; }

        /* Toggles & Sliders */
        .ome-toggle-track { position: relative; width: 50px; height: 24px; background-color: #333; border-radius: 12px; transition: background-color 0.2s; display: flex; align-items: center; box-shadow: inset 0 1px 3px rgba(0,0,0,0.5); }
        .ome-toggle-knob { position: absolute; left: 2px; width: 20px; height: 20px; background-color: white; border-radius: 50%; transition: transform 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 8px; color: #333; font-weight: bold; }
        input[type=range].ome-vol-slider { -webkit-appearance: none; width: 100%; height: 20px; background-color: transparent; background-image: linear-gradient(to right, #FFA500 0%, #FFA500 100%, rgba(255,255,255,0.3) 100%, rgba(255,255,255,0.3) 100%); background-size: 100% 4px; background-repeat: no-repeat; background-position: center; cursor: pointer; margin: 0; }
        input[type=range].ome-vol-slider:focus { outline: none; }
        input[type=range].ome-vol-slider::-webkit-slider-thumb { -webkit-appearance: none; height: 12px; width: 12px; border-radius: 50%; background: #FFA500; cursor: pointer; margin-top: -4px; box-shadow: 0 0 2px rgba(0,0,0,0.5); }
        input[type=range].ome-vol-slider::-webkit-slider-runnable-track { width: 100%; height: 4px; cursor: pointer; background: transparent; border-radius: 2px; }

        /* Ghost Button */
        .ghost-btn-inactive { background-color: transparent !important; border-color: rgba(255,255,255,0.5) !important; opacity: 0.6; transition: opacity 0.2s, border-color 0.2s; }
        .ghost-btn-inactive:hover { opacity: 1; border-color: rgba(255,255,255,0.8) !important; }
        .ghost-btn-active { background-color: rgba(255,255,255,0.8) !important; border-color: #fff !important; box-shadow: 0 0 10px rgba(255,255,255,0.5); }

        /* --- WATERMARK & DARK MODE STYLES --- */
        body.ome-dark-mode { background-color: #000 !important; }

        /* EXCLUSION RULES: Apply Dark Mode to everything EXCEPT extension windows */
        /* We exclude .resizable-win (all your windows) and their children, plus the toast and menu */
        body.ome-dark-mode *:not(.resizable-win):not(.resizable-win *):not(.ome-toast):not(#ome-menu-dropdown):not(#ome-menu-dropdown *) {
            background-color: #000 !important;
            border-color: #333 !important;
            color: #ccc !important;
        }

        /* Standard Hide logic for common watermarks */
        body.ome-dark-mode .watermark, body.ome-dark-mode [class*="watermark"], body.ome-dark-mode .logo,
        body.ome-dark-mode [class*="logo"]:not(.ome-no-select), body.ome-dark-mode .banner, body.ome-dark-mode .overlay-banner {
            visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;
        }

        /* Selector Mode Highlights */
        .ome-selector-hover-hide { outline: 2px solid #FF0000 !important; background-color: rgba(255, 0, 0, 0.2) !important; cursor: crosshair !important; z-index: 99999999 !important; }
        .ome-selector-hover-blackout { outline: 2px solid #0000FF !important; background-color: rgba(0, 0, 255, 0.2) !important; cursor: crosshair !important; z-index: 99999999 !important; }
        .ome-selector-hover-unhide { outline: 2px solid #00FF00 !important; background-color: rgba(0, 255, 0, 0.2) !important; cursor: pointer !important; }

        /* Persistent Hidden Classes */
        .ome-visually-hidden { visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; }
        .ome-blacked-out { background-color: #000 !important; color: #000 !important; border-color: #000 !important; background-image: none !important; }
        .ome-blacked-out * { background-color: #000 !important; color: #000 !important; opacity: 0 !important; }
    `;

    const styleEl = document.createElement('style');
    styleEl.innerHTML = GLOBAL_CSS;
    document.head.appendChild(styleEl);

    // --- CONFIGURATION ---
    const COUNTRIES_DATA = [
        { code: 'tv', name: 'Tuvalu', cont: 'OC' }, { code: 'nr', name: 'Nauru', cont: 'OC' }, { code: 'ki', name: 'Kiribati', cont: 'OC' },
        { code: 'mh', name: 'Marshall Islands', cont: 'OC' }, { code: 'pw', name: 'Palau', cont: 'OC' }, { code: 'fm', name: 'Micronesia', cont: 'OC' },
        { code: 'st', name: 'Sao Tome and Principe', cont: 'AF' }, { code: 'dm', name: 'Dominica', cont: 'NA' }, { code: 'to', name: 'Tonga', cont: 'OC' },
        { code: 'vc', name: 'St. Vincent & Grenadines', cont: 'NA' }, { code: 'kn', name: 'St. Kitts & Nevis', cont: 'NA' }, { code: 'ws', name: 'Samoa', cont: 'OC' },
        { code: 'vu', name: 'Vanuatu', cont: 'OC' }, { code: 'gd', name: 'Grenada', cont: 'NA' }, { code: 'sb', name: 'Solomon Islands', cont: 'OC' },
        { code: 'km', name: 'Comoros', cont: 'AF' }, { code: 'ag', name: 'Antigua & Barbuda', cont: 'NA' }, { code: 'gw', name: 'Guinea-Bissau', cont: 'AF' },
        { code: 'sc', name: 'Seychelles', cont: 'AF' }, { code: 'gm', name: 'Gambia', cont: 'AF' }, { code: 'sl', name: 'Sierra Leone', cont: 'AF' },
        { code: 'er', name: 'Eritrea', cont: 'AF' }, { code: 'cf', name: 'Central African Republic', cont: 'AF' }, { code: 'cv', name: 'Cabo Verde', cont: 'AF' },
        { code: 'bz', name: 'Belize', cont: 'NA' }, { code: 'lc', name: 'St. Lucia', cont: 'NA' }, { code: 'ls', name: 'Lesotho', cont: 'AF' },
        { code: 'bt', name: 'Bhutan', cont: 'AS' }, { code: 'lr', name: 'Liberia', cont: 'AF' }, { code: 'gy', name: 'Guyana', cont: 'SA' },
        { code: 'dj', name: 'Djibouti', cont: 'AF' }, { code: 'tl', name: 'Timor-Leste', cont: 'AS' }, { code: 'ar', name: 'Argentina', cont: 'SA' },
        { code: 'ht', name: 'Haiti', cont: 'NA' }, { code: 'rw', name: 'Rwanda', cont: 'AF' }, { code: 'gn', name: 'Guinea', cont: 'AF' },
        { code: 'bj', name: 'Benin', cont: 'AF' }, { code: 'tj', name: 'Tajikistan', cont: 'AS' }, { code: 'mw', name: 'Malawi', cont: 'AF' },
        { code: 'mr', name: 'Mauritania', cont: 'AF' }, { code: 'me', name: 'Montenegro', cont: 'EU' }, { code: 'mv', name: 'Maldives', cont: 'AS' },
        { code: 'tg', name: 'Togo', cont: 'AF' }, { code: 'bb', name: 'Barbados', cont: 'NA' }, { code: 'fj', name: 'Fiji', cont: 'OC' },
        { code: 'sz', name: 'Eswatini', cont: 'AF' }, { code: 'xk', name: 'Kosovo', cont: 'EU' }, { code: 'so', name: 'Somalia', cont: 'AF' },
        { code: 'zw', name: 'Zimbabwe', cont: 'AF' }, { code: 'cg', name: 'Congo (Rep)', cont: 'AF' }, { code: 'ni', name: 'Nicaragua', cont: 'NA' },
        { code: 'ne', name: 'Niger', cont: 'AF' }, { code: 'cy', name: 'Cyprus', cont: 'EU' }, { code: 'mg', name: 'Madagascar', cont: 'AF' },
        { code: 'mz', name: 'Mozambique', cont: 'AF' }, { code: 'md', name: 'Moldova', cont: 'EU' }, { code: 'mn', name: 'Mongolia', cont: 'AS' },
        { code: 'mt', name: 'Malta', cont: 'EU' }, { code: 'mk', name: 'North Macedonia', cont: 'EU' }, { code: 'am', name: 'Armenia', cont: 'AS' },
        { code: 'bf', name: 'Burkina Faso', cont: 'AF' }, { code: 'bs', name: 'Bahamas', cont: 'NA' }, { code: 'na', name: 'Namibia', cont: 'AF' },
        { code: 'al', name: 'Albania', cont: 'EU' }, { code: 'jm', name: 'Jamaica', cont: 'NA' }, { code: 'kg', name: 'Kyrgyzstan', cont: 'AS' },
        { code: 'bw', name: 'Botswana', cont: 'AF' }, { code: 'ga', name: 'Gabon', cont: 'AF' }, { code: 'ps', name: 'Palestine', cont: 'AS' },
        { code: 'ge', name: 'Georgia', cont: 'AS' }, { code: 'gq', name: 'Equatorial Guinea', cont: 'AF' }, { code: 'mu', name: 'Mauritius', cont: 'AF' },
        { code: 'ml', name: 'Mali', cont: 'AF' }, { code: 'la', name: 'Laos', cont: 'AS' }, { code: 'sn', name: 'Senegal', cont: 'AF' },
        { code: 'ba', name: 'Bosnia & Herzegovina', cont: 'EU' }, { code: 'ee', name: 'Estonia', cont: 'EU' }, { code: 'kh', name: 'Cambodia', cont: 'AS' },
        { code: 'hn', name: 'Honduras', cont: 'NA' }, { code: 'tt', name: 'Trinidad & Tobago', cont: 'NA' }, { code: 'zm', name: 'Zambia', cont: 'AF' },
        { code: 'is', name: 'Iceland', cont: 'EU' }, { code: 'sv', name: 'El Salvador', cont: 'NA' }, { code: 'lv', name: 'Latvia', cont: 'EU' },
        { code: 'ug', name: 'Uganda', cont: 'AF' }, { code: 'py', name: 'Paraguay', cont: 'SA' }, { code: 'bh', name: 'Bahrain', cont: 'AS' },
        { code: 'np', name: 'Nepal', cont: 'AS' }, { code: 'jo', name: 'Jordan', cont: 'AS' }, { code: 'tn', name: 'Tunisia', cont: 'AF' },
        { code: 'cm', name: 'Cameroon', cont: 'AF' }, { code: 'bo', name: 'Bolivia', cont: 'SA' }, { code: 'az', name: 'Azerbaijan', cont: 'AS' },
        { code: 'gh', name: 'Ghana', cont: 'AF' }, { code: 'lb', name: 'Lebanon', cont: 'AS' }, { code: 'tz', name: 'Tanzania', cont: 'AF' },
        { code: 'cr', name: 'Costa Rica', cont: 'NA' }, { code: 'si', name: 'Slovenia', cont: 'EU' }, { code: 'lt', name: 'Lithuania', cont: 'EU' },
        { code: 'rs', name: 'Serbia', cont: 'EU' }, { code: 'uz', name: 'Uzbekistan', cont: 'AS' }, { code: 'cd', name: 'DR Congo', cont: 'AF' },
        { code: 'uy', name: 'Uruguay', cont: 'SA' }, { code: 'hr', name: 'Croatia', cont: 'EU' }, { code: 'ci', name: 'Ivory Coast', cont: 'AF' },
        { code: 'mm', name: 'Myanmar', cont: 'AS' }, { code: 'by', name: 'Belarus', cont: 'EU' }, { code: 'pa', name: 'Panama', cont: 'NA' },
        { code: 'et', name: 'Ethiopia', cont: 'AF' }, { code: 'lk', name: 'Sri Lanka', cont: 'AS' }, { code: 'om', name: 'Oman', cont: 'AS' },
        { code: 'do', name: 'Dominican Republic', cont: 'NA' }, { code: 'lu', name: 'Luxembourg', cont: 'EU' }, { code: 'gt', name: 'Guatemala', cont: 'NA' },
        { code: 'bg', name: 'Bulgaria', cont: 'EU' }, { code: 'ke', name: 'Kenya', cont: 'AF' }, { code: 've', name: 'Venezuela', cont: 'SA' },
        { code: 'qa', name: 'Qatar', cont: 'AS' }, { code: 'ma', name: 'Morocco', cont: 'AF' }, { code: 'sk', name: 'Slovakia', cont: 'EU' },
        { code: 'kw', name: 'Kuwait', cont: 'AS' }, { code: 'ec', name: 'Ecuador', cont: 'SA' }, { code: 'pr', name: 'Puerto Rico', cont: 'NA' },
        { code: 'hu', name: 'Hungary', cont: 'EU' }, { code: 'ao', name: 'Angola', cont: 'AF' }, { code: 'pe', name: 'Peru', cont: 'SA' },
        { code: 'kz', name: 'Kazakhstan', cont: 'AS' }, { code: 'dz', name: 'Algeria', cont: 'AF' }, { code: 'nz', name: 'New Zealand', cont: 'OC' },
        { code: 'iq', name: 'Iraq', cont: 'AS' }, { code: 'ua', name: 'Ukraine', cont: 'EU' }, { code: 'gr', name: 'Greece', cont: 'EU' },
        { code: 'fi', name: 'Finland', cont: 'EU' }, { code: 'pt', name: 'Portugal', cont: 'EU' }, { code: 'cz', name: 'Czechia', cont: 'EU' },
        { code: 'ro', name: 'Romania', cont: 'EU' }, { code: 'co', name: 'Colombia', cont: 'SA' }, { code: 'cl', name: 'Chile', cont: 'SA' },
        { code: 'pk', name: 'Pakistan', cont: 'AS' }, { code: 'hk', name: 'Hong Kong', cont: 'AS' }, { code: 'dk', name: 'Denmark', cont: 'EU' },
        { code: 'sg', name: 'Singapore', cont: 'AS' }, { code: 'ph', name: 'Philippines', cont: 'AS' }, { code: 'vn', name: 'Vietnam', cont: 'AS' },
        { code: 'my', name: 'Malaysia', cont: 'AS' }, { code: 'za', name: 'South Africa', cont: 'AF' }, { code: 'bd', name: 'Bangladesh', cont: 'AS' },
        { code: 'eg', name: 'Egypt', cont: 'AF' }, { code: 'th', name: 'Thailand', cont: 'AS' }, { code: 'ie', name: 'Ireland', cont: 'EU' },
        { code: 'no', name: 'Norway', cont: 'EU' }, { code: 'il', name: 'Israel', cont: 'AS' }, { code: 'at', name: 'Austria', cont: 'EU' },
        { code: 'ng', name: 'Nigeria', cont: 'AF' }, { code: 'pl', name: 'Poland', cont: 'EU' }, { code: 'se', name: 'Sweden', cont: 'EU' },
        { code: 'be', name: 'Belgium', cont: 'EU' }, { code: 'tw', name: 'Taiwan', cont: 'AS' }, { code: 'ae', name: 'United Arab Emirates', cont: 'AS' },
        { code: 'tr', name: 'Turkey', cont: 'AS' }, { code: 'sa', name: 'Saudi Arabia', cont: 'AS' }, { code: 'ch', name: 'Switzerland', cont: 'EU' },
        { code: 'nl', name: 'Netherlands', cont: 'EU' }, { code: 'id', name: 'Indonesia', cont: 'AS' }, { code: 'mx', name: 'Mexico', cont: 'NA' },
        { code: 'es', name: 'Spain', cont: 'EU' }, { code: 'au', name: 'Australia', cont: 'OC' }, { code: 'kr', name: 'South Korea', cont: 'AS' },
        { code: 'ru', name: 'Russia', cont: 'EU' }, { code: 'ca', name: 'Canada', cont: 'NA' }, { code: 'br', name: 'Brazil', cont: 'SA' },
        { code: 'it', name: 'Italy', cont: 'EU' }, { code: 'fr', name: 'France', cont: 'EU' }, { code: 'uk', name: 'United Kingdom', cont: 'EU' },
        { code: 'in', name: 'India', cont: 'AS' }, { code: 'jp', name: 'Japan', cont: 'AS' }, { code: 'de', name: 'Germany', cont: 'EU' },
        { code: 'cn', name: 'China', cont: 'AS' }, { code: 'us', name: 'United States', cont: 'NA' }, { code: 'ye', name: 'Yemen', cont: 'AS' }
    ];

    const LANG_MAP = {
        'us': 'English', 'uk': 'English', 'ca': 'English', 'au': 'English', 'nz': 'English', 'ie': 'English', 'sg': 'English',
        'gb': 'English', 'jm': 'English', 'bb': 'English', 'tt': 'English', 'bs': 'English', 'gy': 'English', 'bz': 'English',
        'ag': 'English', 'dm': 'English', 'gd': 'English', 'kn': 'English', 'lc': 'English', 'vc': 'English',
        'fj': 'English', 'sb': 'English', 'pg': 'English', 'vu': 'English', 'ws': 'English', 'to': 'English',
        'fm': 'English', 'pw': 'English', 'mh': 'English', 'ki': 'English', 'nr': 'English', 'tv': 'English',
        'es': 'Spanish', 'mx': 'Spanish', 'ar': 'Spanish', 'co': 'Spanish', 'cl': 'Spanish', 'pe': 'Spanish',
        've': 'Spanish', 'ec': 'Spanish', 'gt': 'Spanish', 'cu': 'Spanish', 'bo': 'Spanish', 'do': 'Spanish',
        'hn': 'Spanish', 'py': 'Spanish', 'sv': 'Spanish', 'ni': 'Spanish', 'cr': 'Spanish', 'pr': 'Spanish',
        'pa': 'Spanish', 'uy': 'Spanish', 'gq': 'Spanish',
        'fr': 'French', 'be': 'French', 'ch': 'German', 'lu': 'French', 'mc': 'French', 'sn': 'French', 'mg': 'French',
        'ci': 'French', 'cm': 'French', 'ne': 'French', 'bf': 'French', 'ml': 'French', 'gn': 'French', 'td': 'French',
        'ht': 'French', 'cg': 'French', 'ga': 'French', 'dj': 'French', 'km': 'French', 'cd': 'French', 'cf': 'French',
        'tg': 'French', 'bj': 'French', 'rw': 'French',
        'de': 'German', 'at': 'German', 'li': 'German',
        'pt': 'Portuguese', 'br': 'Portuguese', 'ao': 'Portuguese', 'mz': 'Portuguese', 'gw': 'Portuguese',
        'cv': 'Portuguese', 'st': 'Portuguese',
        'ru': 'Russian', 'by': 'Russian', 'kz': 'Russian', 'kg': 'Russian', 'tj': 'Russian', 'md': 'Romanian',
        'it': 'Italian', 'sm': 'Italian', 'va': 'Italian',
        'cn': 'Chinese', 'tw': 'Chinese', 'hk': 'Chinese',
        'jp': 'Japanese',
        'kr': 'Korean',
        'in': 'Hindi',
        'pk': 'Urdu',
        'bd': 'Bengali',
        'id': 'Indonesian',
        'my': 'Malay',
        'ph': 'Tagalog',
        'vn': 'Vietnamese',
        'th': 'Thai',
        'la': 'Lao', 'kh': 'Khmer', 'mm': 'Burmese', 'mn': 'Mongolian', 'lk': 'Sinhala', 'mv': 'Dhivehi',
        'tr': 'Turkish',
        'sa': 'Arabic', 'eg': 'Arabic', 'ae': 'Arabic', 'iq': 'Arabic', 'dz': 'Arabic', 'ma': 'Arabic',
        'sd': 'Arabic', 'sy': 'Arabic', 'tn': 'Arabic', 'ye': 'Arabic', 'lb': 'Arabic', 'jo': 'Arabic',
        'ps': 'Arabic', 'mr': 'Arabic', 'ly': 'Arabic', 'kw': 'Arabic', 'om': 'Arabic', 'qa': 'Arabic', 'bh': 'Arabic',
        'ir': 'Persian', 'af': 'Persian',
        'pl': 'Polish',
        'ua': 'Ukrainian',
        'ro': 'Romanian',
        'nl': 'Dutch',
        'gr': 'Greek', 'cy': 'Greek',
        'cz': 'Czech',
        'hu': 'Hungarian',
        'se': 'Swedish',
        'no': 'Norwegian',
        'dk': 'Danish',
        'fi': 'Finnish',
        'sk': 'Slovak',
        'bg': 'Bulgarian',
        'rs': 'Serbian',
        'hr': 'Croatian',
        'lt': 'Lithuanian',
        'si': 'Slovenian',
        'lv': 'Latvian',
        'ee': 'Estonian',
        'il': 'Hebrew',
        'al': 'Albanian', 'xk': 'Albanian',
        'mk': 'Macedonian', 'ba': 'Bosnian', 'me': 'Montenegrin',
        'am': 'Armenian', 'ge': 'Georgian', 'az': 'Azerbaijani',
        'uz': 'Uzbek', 'tm': 'Turkmen',
        'so': 'Somali', 'et': 'Amharic', 'er': 'Tigrinya',
        'tz': 'Swahili', 'ke': 'Swahili', 'ug': 'Swahili',
        'ng': 'English', 'gh': 'English', 'sl': 'English', 'lr': 'English', 'gm': 'English',
        'zw': 'English', 'zm': 'English', 'mw': 'English', 'bw': 'English', 'na': 'English', 'sz': 'English', 'ls': 'English',
        'za': 'English', 'mu': 'English', 'sc': 'English',
        'np': 'Nepali', 'bt': 'Dzongkha', 'tl': 'Tetum', 'is': 'Icelandic', 'mt': 'Maltese'
    };

    const LANG_PRIORITY = [
        'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Turkish', 'Polish', 'Dutch'
    ];

    const CONTINENT_NAMES = {
        'AF': 'Africa', 'AS': 'Asia', 'EU': 'Europe',
        'NA': 'North America', 'SA': 'South America', 'OC': 'Oceania'
    };

    const DEFAULT_BLOCKED_COUNTRIES = [
        'ae', 'al', 'am', 'bd', 'dz', 'eg', 'gr', 'id', 'in', 'iq',
        'jo', 'ke', 'kw', 'lb', 'lk', 'ma', 'my', 'ng', 'np', 'ph',
        'pk', 'qa', 'sa', 'sc', 'tn', 'tr', 'ye'
    ];

    // Global variables
    let currentIP = null;
    let isRelayIP = false;
    let currentRelayType = "";
    let currentApiData = null;
    let callTimerInterval = null;
    let callSeconds = 0;
    let globalVolume = 1.0;
    let myOwnIPData = null;

    // --- NEW GLOBALS FOR UI ---
    let isDarkModeActive = false;
    let customHiddenSelectors = new Set(); // For 'Visibility Hidden'
    let customBlackoutSelectors = new Set(); // For 'Black Out'
    let elementSelectorMode = null; // 'hide', 'blackout', 'unhide'
    let longPressTimer = null;
    let isMenuOpen = false; // Track menu state

    // --- NEW GLOBAL STATE ---
    let isStreetViewActive = false; // Locks the map window

    // Status Counters
    let facesDetectedCount = 0;
    let reportsBlockedCount = 0;
    let areWatermarksHidden = true; // Default to hidden
    let isWsProtectionActive = false;
    let isFaceProtectionEnabled = true;
    let isReportProtectionEnabled = true;
    let isIPGrabbingEnabled = true;

    // UI State
    let currentCountrySort = 'az';
    let countryBlockingEnabled = false;
    let ipBlockingEnabled = true;
    let expandedContinents = new Set();
    let isWindowTransparent = false;
    let lastActiveTab = "tab-countries";

    // Skip Logic
    let lastSkipTime = 0;
    const SKIP_DELAY = 1500;
    let fallbackMethod = 'esc1';

    // Editing State
    let isEditing = false;
    let editingIP = null;

    // Dev Logs
    let devLogs = [];
    const MAX_DEV_LOGS = 500;

    // Cache
    let ipHistoryCache = null;
    let blockedIPsCache = null;
    let blockedCountriesCache = null;
    let isDirty = false;
    let saveTimeout = null;

    const MAX_HISTORY_ITEMS = 1000;
    const KEEP_NEWEST_ITEMS = 500;

    // --- UTILITIES ---

    function makeDraggable(triggerElement, movingElement) {
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        triggerElement.classList.add('ome-no-select');
        triggerElement.classList.add('ome-grab');

        const onMouseDown = (e) => {
            // EXCLUSIONS: Do not drag if clicking these elements
            if (['BUTTON', 'INPUT', 'TEXTAREA', 'A', 'IFRAME', 'SELECT', 'LABEL'].includes(e.target.tagName)) return;

            // Allow clicking the specific buttons we added
            if (e.target.closest('.icon-btn')) return;
            if (e.target.closest('.ip-copy-btn')) return;
            if (e.target.closest('#ome-menu-dropdown')) return;
            if (e.target.classList.contains('ome-vol-slider')) return;
            if (e.target.classList.contains('status-toggle-btn')) return;

            // Prevent drag if clicking the resizing corner
            const rect = movingElement.getBoundingClientRect();
            if (e.clientX > rect.right - 20 && e.clientY > rect.bottom - 20) return;

            if (e.button !== 0) return;

            e.preventDefault();
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = movingElement.offsetLeft;
            initialTop = movingElement.offsetTop;
            triggerElement.style.cursor = 'grabbing';

            document.querySelectorAll('iframe').forEach(f => f.style.pointerEvents = 'none');
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            movingElement.style.left = `${initialLeft + dx}px`;
            movingElement.style.top = `${initialTop + dy}px`;
        };

        const onMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                triggerElement.style.cursor = '';
                document.querySelectorAll('iframe').forEach(f => f.style.pointerEvents = 'auto');
            }
        };

        triggerElement.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    // --- REPORT SOUND & WITTY REMARKS ---
    function triggerReportSound() {
        const lines = [
            "A user just reported you.",
            "Report detected. They probably couldn't handle the style.",
            "Snitch detected.",
            "Report blocked. I've filed it in the trash.",
            "Oof, someone is sensitive. Report ignored.",
            "Alert. We have a hater.",
            "They reported you. Jealousy is a disease."
        ];

        const text = lines[Math.floor(Math.random() * lines.length)];

        if ('speechSynthesis' in window) {
            // Cancel previous to avoid queue buildup
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.volume = 0.5; // 50% Volume
            utterance.rate = 1.0;

            // Try to find a male English voice
            const voices = window.speechSynthesis.getVoices();
            const maleVoice = voices.find(v => (v.lang.includes('en') && (v.name.includes('Male') || v.name.includes('David') || v.name.includes('Google US English'))));
            if (maleVoice) utterance.voice = maleVoice;

            window.speechSynthesis.speak(utterance);
        }
    }

    function updateStatusDots() {
        const ipDot = document.getElementById('status-dot-ipgrab');
        const faceDot = document.getElementById('status-dot-face');
        const reportDot = document.getElementById('status-dot-report');

        // Helper to apply the "New Look" style dynamically
        const applyStyle = (el, isActive, type) => {
            if (!el) return;
            const color = isActive ? "#00FF00" : "#FF0000";
            el.style.backgroundColor = "rgba(0,0,0,0.5)";
            el.style.boxShadow = isActive ? `0 0 8px ${color}` : "none";
            el.style.borderColor = isActive ? color : "#888";

            if (type === 'ip') el.title = isActive ? "IP Grabbing: ON (Click to Stop)" : "IP Grabbing: OFF (Click to Start)";
            if (type === 'face') el.title = isActive ? `Face Bypass: Active\nFaces Spoofed: ${facesDetectedCount}\n(Click to Disable)` : "Face Bypass: DISABLED\n(Click to Enable)";
            if (type === 'report') {
                const rColor = isReportProtectionEnabled ? (isWsProtectionActive ? "#00FF00" : "#FFA500") : "#FF0000";
                const rActive = isReportProtectionEnabled;
                el.style.borderColor = rActive ? rColor : "#888";
                el.style.boxShadow = (rActive && reportsBlockedCount > 0) ? `0 0 8px ${rColor}` : (rActive ? `0 0 5px ${rColor}` : "none");
                el.title = rActive ? `Report Protection: ${isWsProtectionActive ? "Active" : "Loading..."}\nReports Blocked: ${reportsBlockedCount}\n(Click to Disable)` : "Report Protection: DISABLED\n(Click to Enable)";
            }
        };

        applyStyle(ipDot, isIPGrabbingEnabled, 'ip');
        applyStyle(faceDot, isFaceProtectionEnabled, 'face');
        applyStyle(reportDot, isReportProtectionEnabled, 'report');

        // [NEW] Sync Advanced Settings Toggles
        updateAdvToggleVisual("adv-toggle-ip-grab", isIPGrabbingEnabled);
        updateAdvToggleVisual("adv-toggle-face-bypass", isFaceProtectionEnabled);
        updateAdvToggleVisual("adv-toggle-report-prot", isReportProtectionEnabled);
    }

    function safe(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatTime(totalSeconds) {
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function logDev(type, msg) {
        const time = new Date().toLocaleTimeString();
        const entry = { time, type, msg };
        devLogs.push(entry);
        if (devLogs.length > MAX_DEV_LOGS) devLogs.shift();

        // FIX: Only update DOM if the window exists and is visible
        const win = document.getElementById("dev-console-win");
        if (win && win.style.display !== "none") {
            updateDevConsole();
        }
    }

    function showToast(msg, parentWin = null) {
        const win = parentWin || document.getElementById("ip-log-window");
        if (!win) return;
        let toast = win.querySelector('.ome-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'ome-toast ome-no-select';
            win.appendChild(toast);
        }
        toast.innerText = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 1500);
    }

    // --- FETCH OWN IP ---
    function fetchOwnIP() {
        GM_xmlhttpRequest({
            method: "GET",
            // Switch to ip-api.com which is used elsewhere in your script and is often more reliable
            url: "http://ip-api.com/json/?fields=status,message,country,countryCode,regionName,city,query",
            onload: function(response) {
                if (response.status === 200) {
                    try {
                        const json = JSON.parse(response.responseText);
                        // ip-api uses "status": "success" instead of "success": true
                        if (json.status === 'success') {
                            // Map fields to match what updateSettingsHeaderDisplay expects
                            myOwnIPData = {
                                ip: json.query,
                                country_code: json.countryCode,
                                country: json.country,
                                region: json.regionName || json.city,
                                city: json.city
                            };

                            logDev("SYS", `Own IP Fetched: ${json.query}`);

                            // Update UI if element exists (in Advanced Window)
                            const headerContent = document.getElementById("ome-settings-header-content");
                            if(headerContent) updateSettingsHeaderDisplay(headerContent);
                        } else {
                            logDev("ERR", "Own IP Fetch Failed: " + json.message);
                        }
                    } catch(e) {
                        logDev("ERR", "Own IP Parse Error");
                    }
                }
            },
            onerror: function() {
                // If it fails entirely, set a fallback so it doesn't say "Fetching..." forever
                myOwnIPData = { ip: "Unavailable", country_code: "un", region: "Connection Error" };
                const headerContent = document.getElementById("ome-settings-header-content");
                if(headerContent) updateSettingsHeaderDisplay(headerContent);
            }
        });
    }

    // --- STORAGE LOGIC ---

    function checkAndPruneStorage() {
        if (!ipHistoryCache) return;
        const keys = Object.keys(ipHistoryCache);
        if (keys.length > MAX_HISTORY_ITEMS) {
            const sortedEntries = Object.entries(ipHistoryCache).sort(([,a], [,b]) => b.lastSeen - a.lastSeen);
            const keepEntries = sortedEntries.slice(0, KEEP_NEWEST_ITEMS);
            ipHistoryCache = {};
            keepEntries.forEach(([ip, data]) => ipHistoryCache[ip] = data);
            isDirty = true;
            forceSave();
        }
    }

    function loadData() {
        if (!ipHistoryCache) {
            try { ipHistoryCache = JSON.parse(GM_getValue('ome_ip_history', '{}')); }
            catch (e) { ipHistoryCache = {}; }
        }
        if (!blockedIPsCache) {
            try { blockedIPsCache = new Set(JSON.parse(GM_getValue('ome_blocked_ips', '[]'))); }
            catch (e) { blockedIPsCache = new Set(); }
        }
        if (!blockedCountriesCache) {
            const rawCountries = GM_getValue('ome_blocked_countries', null);
            if (rawCountries === null) {
                blockedCountriesCache = new Set(DEFAULT_BLOCKED_COUNTRIES);
                isDirty = true;
            } else {
                try { blockedCountriesCache = new Set(JSON.parse(rawCountries)); }
                catch (e) { blockedCountriesCache = new Set(); }
            }
            countryBlockingEnabled = GM_getValue('ome_country_blocking_enabled', false);
            ipBlockingEnabled = GM_getValue('ome_ip_blocking_enabled', true);
        }

        // Load UI States
        isDarkModeActive = GM_getValue('ome_dark_mode_active', false);
        areWatermarksHidden = isDarkModeActive; // Sync these for now as per request
        try { customHiddenSelectors = new Set(JSON.parse(GM_getValue('ome_custom_hidden', '[]'))); }
        catch (e) { customHiddenSelectors = new Set(); }

        try { customBlackoutSelectors = new Set(JSON.parse(GM_getValue('ome_custom_blackout', '[]'))); }
        catch (e) { customBlackoutSelectors = new Set(); }

        return { history: ipHistoryCache, blockedIPs: blockedIPsCache, blockedCountries: blockedCountriesCache };
    }

    function queueSave() {
        isDirty = true;
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(forceSave, 2000);
    }

    function forceSave() {
        if (isDirty) {
            checkAndPruneStorage();
            if (ipHistoryCache) GM_setValue('ome_ip_history', JSON.stringify(ipHistoryCache));
            if (blockedIPsCache) GM_setValue('ome_blocked_ips', JSON.stringify([...blockedIPsCache]));
            if (blockedCountriesCache) GM_setValue('ome_blocked_countries', JSON.stringify([...blockedCountriesCache]));
            GM_setValue('ome_country_blocking_enabled', countryBlockingEnabled);
            GM_setValue('ome_ip_blocking_enabled', ipBlockingEnabled);
            GM_setValue('ome_dark_mode_active', isDarkModeActive);
            GM_setValue('ome_custom_hidden', JSON.stringify([...customHiddenSelectors]));
            GM_setValue('ome_custom_blackout', JSON.stringify([...customBlackoutSelectors]));
            isDirty = false;
        }
    }

    function clearAllData() {
        if (!confirm("⚠️ DANGER: CLEAR ALL DATA? ⚠️\n\nThis will wipe:\n- All Blocked IPs\n- All History/Notes\n- Custom Hidden Elements\n- All Settings & Preferences\n\nThis cannot be undone.")) return;
        ipHistoryCache = {};
        blockedIPsCache = new Set();
        blockedCountriesCache = new Set(DEFAULT_BLOCKED_COUNTRIES);
        customHiddenSelectors = new Set();
        customBlackoutSelectors = new Set();

        countryBlockingEnabled = false;
        ipBlockingEnabled = true;
        isDarkModeActive = false; // Reset dark mode
        currentCountrySort = 'az';

        GM_setValue('ome_custom_blackout', '[]');
        GM_setValue('ome_ip_history', '{}');
        GM_setValue('ome_blocked_ips', '[]');
        GM_setValue('ome_blocked_countries', JSON.stringify([...blockedCountriesCache]));
        GM_setValue('ome_custom_hidden', '[]');
        GM_setValue('ome_country_blocking_enabled', false);
        GM_setValue('ome_ip_blocking_enabled', true);
        GM_setValue('ome_dark_mode_active', false);

        isDirty = true;
        forceSave();
        updateMasterToggles();
        toggleWatermarks(false); // Turn off visuals
        refreshStatsWindowDisplay(currentIP, null, currentApiData);
        const settingsWin = document.getElementById("ome-settings-window");
        if (settingsWin && settingsWin.style.display === "flex") switchTab('tab-countries');
        alert("✅ All Data Cleared & Reset.");
    }

    // --- SMART SKIP LOGIC ---
    function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

    function pressEscape() {
        const down = new KeyboardEvent('keydown', {
            key: 'Escape', code: 'Escape',
            keyCode: 27, which: 27,
            bubbles: true, cancelable: true, composed: true
        });
        document.dispatchEvent(down);
        if (document.activeElement) document.activeElement.dispatchEvent(down);

        const up = new KeyboardEvent('keyup', {
            key: 'Escape', code: 'Escape',
            keyCode: 27, which: 27,
            bubbles: true, cancelable: true, composed: true
        });
        document.dispatchEvent(up);
        if (document.activeElement) document.activeElement.dispatchEvent(up);
    }

    function getSiteType() {
        const host = window.location.hostname;
        if (host.includes('ome.tv')) return 'ometv';
        if (host.includes('umingle')) return 'umingle';
        if (host.includes('omegleapp')) return 'omegleapp';
        return 'other';
    }

    async function clickGenericNextBtn() {
        const site = getSiteType();

        // 1. Ome.tv Specific XPath Logic
        if (site === 'ometv') {
            const xpathResult = document.evaluate(
                "//div[contains(@class, 'btn') and .//span[@data-tr='next']]",
                document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
            );
            const btn = xpathResult.singleNodeValue;
            if (btn) {
                btn.click();
                return;
            }
        }

        // 2. Generic Fallback
        const selectors = [
            '.buttons__button.start',
            'button.next-btn',
            '.chat__header-btn',
            '.btn-new-chat',
            'button[class*="next"]',
            'button[class*="skip"]',
            'button[class*="start"]',
            '.roulette-controls .start-btn'
        ];

        let btn = null;
        for (let s of selectors) {
            btn = document.querySelector(s);
            if (btn && btn.offsetParent) break;
        }

        if (!btn) {
            const allBtns = Array.from(document.querySelectorAll('button, .btn, div[role="button"]'));
            btn = allBtns.find(el => {
                if (el.offsetParent === null) return false;
                const t = el.innerText.toLowerCase();
                return t === 'start' || t === 'next' || t === 'skip' || t === 'really?';
            });
        }

        if (btn) btn.click();
        else logDev("ERR", "No Skip Button Found");
    }

    async function performSmartSkip(reason) {
        const now = Date.now();
        const COOLDOWN = 2000;
        const timeSinceLast = now - lastSkipTime;

        if (timeSinceLast < COOLDOWN) {
            const waitTime = COOLDOWN - timeSinceLast;
            logDev("SKIP", `Cooling down... waiting ${waitTime}ms`);
            await delay(waitTime);
        }

        lastSkipTime = Date.now();
        logDev("SKIP", `${reason} (${getSiteType()})`);

        const site = getSiteType();
        if (site === 'ometv') { await clickGenericNextBtn(); return; }
        if (site === 'umingle') { pressEscape(); return; }
        if (site === 'omegleapp') { pressEscape(); return; }
        await performFallbackSkip();
    }

    async function performFallbackSkip() {
        const isChatEnded = () => {
            const startBtn = document.querySelector('.buttons__button.start, .btn-new-chat, button.newbtn');
            const stopBtn = document.querySelector('.buttons__button.stop, button.disconnectbtn');
            if (startBtn && startBtn.offsetParent) return true;
            if (stopBtn && stopBtn.offsetParent) return false;
            return true;
        };

        const doEsc = async (times) => {
            pressEscape();
            if(times > 1) { await delay(1000 + Math.random()*200); pressEscape(); }
        };
        const doClick = async (times) => {
            await clickGenericNextBtn();
            if(times > 1) { await delay(1000 + Math.random()*200); await clickGenericNextBtn(); }
        };

        let attempt = fallbackMethod;
        logDev("SKIP", `Fallback Strategy: ${attempt}`);

        if (attempt === 'esc1') {
            await doEsc(1); await delay(600);
            if (!isChatEnded()) { logDev("SKIP", "Fallback: ESCx1 failed, upgrading to ESCx2"); fallbackMethod = 'esc2'; await doEsc(1); }
        }
        else if (attempt === 'esc2') {
            await doEsc(2); await delay(600);
            if (!isChatEnded()) { logDev("SKIP", "Fallback: ESCx2 failed, upgrading to Clickx1"); fallbackMethod = 'click1'; await doClick(1); }
        }
        else if (attempt === 'click1') {
            await doClick(1); await delay(600);
            if (!isChatEnded()) { logDev("SKIP", "Fallback: Clickx1 failed, upgrading to Clickx2"); fallbackMethod = 'click2'; await doClick(1); }
        }
        else if (attempt === 'click2') {
            await doClick(2);
        }
    }

    function checkAndSkipIfBlocked(ip, countryCode) {
        if (isRelayIP) return;
        const { blockedIPs, blockedCountries } = loadData();
        let shouldSkip = false, reason = "";

        if (ipBlockingEnabled && ip && blockedIPs.has(ip)) { shouldSkip = true; reason = "Blocked IP"; }
        else if (countryBlockingEnabled && countryCode && blockedCountries.has(countryCode.toLowerCase())) { shouldSkip = true; reason = `Blocked Country (${countryCode})`; }

        if (shouldSkip) {
            const contentArea = document.getElementById("ip-stats-area");
            if (contentArea) contentArea.innerHTML += `<br><span style="color:red; font-weight:bold;">🚫 AUTO-SKIPPING (${reason})...</span>`;
            performSmartSkip(reason);
        }
    }

    // --- VOLUME CONTROL ---
    function updateVolume(val) {
        globalVolume = val;
        const media = document.querySelectorAll('video, audio');
        media.forEach(m => m.volume = globalVolume);
        const slider = document.querySelector('.ome-vol-slider');
        if (slider) {
            const pct = val * 100;
            slider.style.backgroundImage = `linear-gradient(to right, #FFA500 0%, #FFA500 ${pct}%, rgba(255,255,255,0.3) ${pct}%, rgba(255,255,255,0.3) 100%)`;
        }
    }

    // --- WATERMARK TOGGLE ---
    function toggleWatermarks(forceState = null) {
        if (forceState !== null) isDarkModeActive = forceState;
        else isDarkModeActive = !isDarkModeActive;

        const body = document.body;
        const wmBtn = document.getElementById("watermark-toggle-btn");

        // Apply Dark Mode Class
        if (isDarkModeActive) {
            body.classList.add('ome-dark-mode');
            showToast("Dark Mode ON");

            // --- BLOODSHOT EFFECT (Active) ---
            if (wmBtn) {
                wmBtn.style.borderColor = "#FF0000";          // Red Veins
                wmBtn.style.boxShadow = "0 0 8px #FF0000";    // Red Glow
                wmBtn.style.backgroundColor = "rgba(100, 0, 0, 0.6)"; // Inflamed Background
                wmBtn.title = "Visual Menu (Dark Mode: ON)";
            }
        } else {
            body.classList.remove('ome-dark-mode');
            showToast("Dark Mode OFF");

            // --- NORMAL EFFECT (Inactive) ---
            if (wmBtn) {
                wmBtn.style.borderColor = "#666";
                wmBtn.style.boxShadow = "none";
                wmBtn.style.backgroundColor = "rgba(0,0,0,0.5)";
                wmBtn.title = "Visual Menu";
            }
        }

        // Always apply custom hides regardless of mode
        applyCustomHides();
        queueSave();
    }

    function applyCustomHides() {
        // 1. If we are in "Unhide" mode, do NOT enforce hiding.
        // This stops the observer from re-hiding elements while we try to select them.
        if (elementSelectorMode === 'unhide') return;

        // 2. Clear old states to prevent duplication
        document.querySelectorAll('.ome-visually-hidden').forEach(el => el.classList.remove('ome-visually-hidden'));
        document.querySelectorAll('.ome-blacked-out').forEach(el => el.classList.remove('ome-blacked-out'));

        // 3. Re-apply based on lists (Works in BOTH Light and Dark mode now)
        customHiddenSelectors.forEach(selector => {
            try { document.querySelectorAll(selector).forEach(el => el.classList.add('ome-visually-hidden')); } catch(e) {}
        });
        customBlackoutSelectors.forEach(selector => {
            try { document.querySelectorAll(selector).forEach(el => el.classList.add('ome-blacked-out')); } catch(e) {}
        });
    }

    // --- ELEMENT SELECTOR LOGIC ---
    function startSelector(mode) {
        if (elementSelectorMode) exitSelectorMode();
        elementSelectorMode = mode;

        if (mode === 'unhide') {
            showToast("Select element to UNHIDE (Green)");
            // Show hidden elements temporarily for selection
            customHiddenSelectors.forEach(sel => {
                document.querySelectorAll(sel).forEach(el => {
                    el.classList.add('ome-selector-hover-unhide'); // Use class for highlight
                    el.classList.remove('ome-visually-hidden'); // Reveal
                });
            });
            customBlackoutSelectors.forEach(sel => {
                document.querySelectorAll(sel).forEach(el => {
                    el.classList.add('ome-selector-hover-unhide');
                    el.classList.remove('ome-blacked-out');
                });
            });
        } else if (mode === 'hide') {
            showToast("Select element to HIDE (Red - Keeps Space)");
            document.body.style.cursor = "crosshair";
        } else if (mode === 'blackout') {
            showToast("Select element to BLACK OUT (Blue)");
            document.body.style.cursor = "crosshair";
        }

        document.addEventListener('mouseover', handleSelectorHover);
        document.addEventListener('click', handleSelectorClick, true);
    }

    function handleSelectorHover(e) {
        if (!elementSelectorMode || elementSelectorMode === 'unhide') return;
        e.stopPropagation();
        const target = e.target;
        if (target.closest('#ip-log-window') || target.closest('#ome-menu-dropdown')) return;

        // Clean up old highlights
        document.querySelectorAll('.ome-selector-hover-hide, .ome-selector-hover-blackout').forEach(el => {
            el.classList.remove('ome-selector-hover-hide');
            el.classList.remove('ome-selector-hover-blackout');
        });

        if (elementSelectorMode === 'hide') target.classList.add('ome-selector-hover-hide');
        if (elementSelectorMode === 'blackout') target.classList.add('ome-selector-hover-blackout');
    }

    function handleSelectorClick(e) {
        if (!elementSelectorMode) return;
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();

        const target = e.target;
        if (target.closest('#ip-log-window') || target.closest('#ome-menu-dropdown')) {
            exitSelectorMode(); return;
        }

        if (elementSelectorMode === 'hide') {
            const selector = generateCssPath(target);
            if(confirm(`Hide Element?\nSelector: ${selector}`)) {
                customHiddenSelectors.add(selector);
                applyCustomHides(); // Immediate update
            }
        } else if (elementSelectorMode === 'blackout') {
            const selector = generateCssPath(target);
            if(confirm(`Black Out Element?\nSelector: ${selector}`)) {
                customBlackoutSelectors.add(selector);
                applyCustomHides(); // Immediate update
            }
        } else if (elementSelectorMode === 'unhide') {
            // Robust Unhide: Check target and all parents
            let found = false;
            let el = target;
            while (el && el !== document.body) {
                customHiddenSelectors.forEach(sel => {
                    if (el.matches && el.matches(sel)) { customHiddenSelectors.delete(sel); found = true; }
                });
                customBlackoutSelectors.forEach(sel => {
                    if (el.matches && el.matches(sel)) { customBlackoutSelectors.delete(sel); found = true; }
                });
                el = el.parentElement;
            }

            if(found) {
                applyCustomHides(); // Refresh to remove classes
                showToast("Element Unhidden");
            } else {
                showToast("No saved rule found for this element");
            }
        }

        exitSelectorMode();
        queueSave();
    }

    // [REPLACE THE ENTIRE generateCssPath FUNCTION WITH THIS]
    function generateCssPath(el) {
        if (!(el instanceof Element)) return;

        const path = [];
        while (el.nodeType === Node.ELEMENT_NODE) {
            let selector = el.nodeName.toLowerCase();

            if (el.id) {
                selector += '#' + el.id;
                path.unshift(selector);
                break; // IDs are unique, we can stop here
            } else {
                let sibling = el;
                let nth = 1;
                while (sibling = sibling.previousElementSibling) {
                    if (sibling.nodeName.toLowerCase() == selector) nth++;
                }

                // Add classes if available, but filter out common generic/dynamic ones
                if (el.className && typeof el.className === 'string') {
                    const validClasses = el.className.split(/\s+/)
                    .filter(c => c && !c.includes('ome-') && !c.includes('active') && !c.includes('hover') && !c.match(/^\d/));

                    if (validClasses.length > 0) {
                        selector += '.' + validClasses.join('.');
                    }
                }

                if (nth > 1) selector += `:nth-of-type(${nth})`;
            }
            path.unshift(selector);
            el = el.parentNode;
        }
        return path.join(" > ");
    }

    function exitSelectorMode() {
        elementSelectorMode = null;
        document.body.style.cursor = "default";
        document.removeEventListener('mouseover', handleSelectorHover);
        document.removeEventListener('click', handleSelectorClick, true);

        // Remove all highlight classes
        document.querySelectorAll('.ome-selector-hover-hide, .ome-selector-hover-blackout, .ome-selector-hover-unhide').forEach(el => {
            el.classList.remove('ome-selector-hover-hide');
            el.classList.remove('ome-selector-hover-blackout');
            el.classList.remove('ome-selector-hover-unhide');
        });

        // FORCE re-application of hides immediately
        applyCustomHides();
    }

    function unhideAllElements() {
        if (!confirm("Unhide ALL custom hidden elements?\nThis will clear all your saved hides.")) return;
        customHiddenSelectors.clear();
        customBlackoutSelectors.clear();
        applyCustomHides();
        queueSave();
        showToast("All elements unhidden");
    }

    // --- UI CREATION ---
    function createLogWindow() {
        if (document.getElementById("ip-log-window")) return;

        const win = document.createElement("div");
        win.id = "ip-log-window";
        win.className = "ome-no-select resizable-win";
        Object.assign(win.style, {
            position: "fixed", top: "120px", left: "10px", width: "480px",
            minWidth: "320px", minHeight: "280px",
            backgroundColor: "rgba(0,0,0,0.85)",
            fontWeight: "bold", fontFamily: "monospace", borderRadius: "12px", border: "1px solid #444",
            backdropFilter: "blur(5px)", boxShadow: "0 4px 15px rgba(0,0,0,0.9)",
            display: "flex", flexDirection: "column",
            zIndex: "99999970"
        });

        // --- TOP RIGHT HEADER CONTAINER ---
        const mainHeaderContainer = document.createElement("div");
        Object.assign(mainHeaderContainer.style, {
            position: "absolute", top: "8px", right: "8px",
            display: "flex", gap: "8px", alignItems: "flex-start",
            zIndex: "20", pointerEvents: "none"
        });

        // 1. CIRCLE ICONS ROW (Left Side of Header)
        const iconRow = document.createElement("div");
        Object.assign(iconRow.style, {
            display: "flex", gap: "6px", alignItems: "center", pointerEvents: "auto"
        });

        // Helper: Create Round Icon Toggle
        const createToggleDot = (id, isActive, content, titleOn, titleOff, onClick) => {
            const dot = document.createElement("div");
            dot.id = id; dot.className = "status-toggle-btn ome-no-select";
            dot.innerText = content;
            const color = isActive ? "#00FF00" : "#FF0000";
            Object.assign(dot.style, {
                width: "32px", height: "32px", borderRadius: "50%",
                backgroundColor: "rgba(0,0,0,0.5)",
                boxShadow: isActive ? `0 0 8px ${color}` : "none",
                border: `1px solid ${isActive ? '#00FF00' : '#888'}`,
                cursor: "pointer", transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px", color: "#fff", fontWeight: "bold"
            });
            dot.title = isActive ? titleOn : titleOff;
            dot.onclick = (e) => { e.stopPropagation(); onClick(dot); };
            return dot;
        };

        // A. IP Grabber
        const ipGrabDot = createToggleDot("status-dot-ipgrab", isIPGrabbingEnabled, "📡", "IP Grabbing: ON", "IP Grabbing: OFF", () => {
            isIPGrabbingEnabled = !isIPGrabbingEnabled; updateStatusDots();
        });

        // B. Ban Protection
        const reportDot = createToggleDot("status-dot-report", isReportProtectionEnabled, "🛡️", "Report Protection: ON", "Report Protection: OFF", () => {
            isReportProtectionEnabled = !isReportProtectionEnabled;
            window.dispatchEvent(new CustomEvent('ome-bypass-config', { detail: { type: 'report', enabled: isReportProtectionEnabled } }));
            updateStatusDots();
        });

        // C. Face Bypass
        const faceDot = createToggleDot("status-dot-face", isFaceProtectionEnabled, "🎭", "Face Bypass: ON", "Face Bypass: OFF", () => {
            isFaceProtectionEnabled = !isFaceProtectionEnabled;
            window.dispatchEvent(new CustomEvent('ome-bypass-config', { detail: { type: 'face', enabled: isFaceProtectionEnabled } }));
            updateStatusDots();
        });

        // --- ORDER: Face -> Shield -> IP ---
        iconRow.appendChild(faceDot);
        iconRow.appendChild(reportDot);
        iconRow.appendChild(ipGrabDot);

        // 2. BADGE COLUMN (Right Side of Header)
        const badgeCol = document.createElement("div");
        Object.assign(badgeCol.style, {
            display: "flex", flexDirection: "column", gap: "5px", alignItems: "flex-end", pointerEvents: "auto"
        });

        const createBadge = (id, text, hoverText, action) => {
            const b = document.createElement("button"); b.id = id; b.className = "clickable-badge ome-no-select";
            b.innerText = text; b.title = hoverText;
            Object.assign(b.style, {
                fontSize: "11px", padding: "3px 8px", borderRadius: "4px", fontWeight: "bold",
                letterSpacing: "0.5px", cursor: "pointer", border: "1px solid", transition: "all 0.2s",
                height: "auto", display: "flex", alignItems:"center", background: "transparent", minWidth: "65px", justifyContent: "center"
            });
            b.onclick = (e) => { e.stopPropagation(); action(); };
            return b;
        };

        const cntryBadge = createBadge("badge-country", "CNTRY: OFF", "Toggle Country Blocking", () => { countryBlockingEnabled = !countryBlockingEnabled; updateMasterToggles(); queueSave(); });
        const ipBadge = createBadge("badge-ip", "IP: OFF", "Toggle IP Blocking", () => { ipBlockingEnabled = !ipBlockingEnabled; updateMasterToggles(); queueSave(); });

        const cmdBtn = document.createElement("div"); cmdBtn.id = "cmd-btn"; cmdBtn.className = "clickable-badge ome-no-select";
        cmdBtn.innerText = "CMD"; cmdBtn.title = "Open Console";
        Object.assign(cmdBtn.style, {
            fontSize: "11px", padding: "3px 8px", borderRadius: "4px", fontWeight: "bold",
            letterSpacing: "0.5px", cursor: "pointer",
            border: "1px solid #00FF00", backgroundColor: "rgba(0, 100, 0, 0.2)", color: "#00FF00",
            textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center",
            minWidth: "65px"
        });
        cmdBtn.onclick = (e) => { e.stopPropagation(); toggleDevConsole(); };

        // --- MINI ROW FOR GHOST & EYE UNDER CMD ---
        const rightMiniRow = document.createElement("div");
        Object.assign(rightMiniRow.style, { display: "flex", gap: "3px", marginTop: "2px" });

        // Ghost Button
        const ghostBtn = document.createElement("div"); ghostBtn.id = "ghost-mode-btn";
        ghostBtn.className = "icon-btn ome-no-select ghost-btn-inactive";
        ghostBtn.title = "Toggle Ghost Mode";
        Object.assign(ghostBtn.style, {
            width: "30px", height: "30px", borderRadius: "50%", border: "1px solid #666",
            cursor: "pointer", backgroundColor:"rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px"
        });
        ghostBtn.innerHTML = "👻";
        ghostBtn.onclick = (e) => { e.stopPropagation(); toggleGhostMode(win); };

        // Eye Button
        const wmWrapper = document.createElement("div"); Object.assign(wmWrapper.style, { position: "relative", width: "30px", height: "30px" });
        const wmBtn = document.createElement("div"); wmBtn.id = "watermark-toggle-btn";
        wmBtn.className = "icon-btn ome-no-select"; wmBtn.innerText = "👁️";
        wmBtn.title = "Visual Menu";
        Object.assign(wmBtn.style, {
            width: "30px", height: "30px", borderRadius: "50%", background: "rgba(0,0,0,0.5)",
            border: "1px solid #666", cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: "16px"
        });

        const menu = document.createElement("div"); menu.id = "ome-menu-dropdown";
        Object.assign(menu.style, { display: "none", position: "absolute", top: "35px", right: "0", backgroundColor: "rgba(0,0,0,0.95)", border: "1px solid #555", borderRadius: "6px", width: "160px", zIndex: "999999", padding: "4px" });

        const createMenuItem = (txt, color, action) => {
            const item = document.createElement("div"); item.innerText = txt;
            Object.assign(item.style, { padding: "8px", color: color, cursor: "pointer", fontSize: "11px", borderBottom: "1px solid #333" });
            item.onclick = (e) => { e.stopPropagation(); menu.style.display = "none"; action(); };
            return item;
        };
        menu.appendChild(createMenuItem("1. Toggle Dark/Hide", "#fff", () => toggleWatermarks()));
        menu.appendChild(createMenuItem("2. Select to Hide", "#FF4444", () => startSelector('hide')));
        menu.appendChild(createMenuItem("3. Select to Unhide", "#00FF00", () => startSelector('unhide')));
        menu.appendChild(createMenuItem("4. Unhide ALL Elements", "#FFA500", () => unhideAllElements()));

        wmBtn.onclick = (e) => {
            e.stopPropagation();
            const isOpening = menu.style.display === "none";
            menu.style.display = isOpening ? "block" : "none";
            // If opening, white border. If closing, restore based on mode.
            if(isOpening) wmBtn.style.borderColor = "#fff";
            else {
                if (isDarkModeActive) { wmBtn.style.borderColor = "#FF0000"; }
                else { wmBtn.style.borderColor = "#666"; }
            }
        };
        wmWrapper.appendChild(wmBtn); wmWrapper.appendChild(menu);

        rightMiniRow.appendChild(ghostBtn);
        rightMiniRow.appendChild(wmWrapper);

        badgeCol.appendChild(cntryBadge);
        badgeCol.appendChild(ipBadge);
        badgeCol.appendChild(cmdBtn);
        badgeCol.appendChild(rightMiniRow);

        mainHeaderContainer.appendChild(iconRow);
        mainHeaderContainer.appendChild(badgeCol);
        win.appendChild(mainHeaderContainer);

        // --- CONTENT AREA ---
        const content = document.createElement("div");
        content.id = "ip-stats-area"; content.className = "ome-no-select";
        content.style.padding = "10px 15px"; content.style.flex = "1"; content.style.overflow = "hidden";
        content.style.marginTop = "5px";
        content.innerHTML = "<span style='color:#ccc;'>⏳ Waiting...</span>";
        win.appendChild(content);

        // --- CONTROLS AREA ---
        const controls = document.createElement("div");
        controls.id = "ip-controls-area";
        Object.assign(controls.style, { padding: "10px", borderTop: "1px solid #333", backgroundColor: "rgba(30,30,30,0.5)", display: "flex", flexDirection: "column", gap: "8px" });

        // Row 1
        const row = document.createElement("div"); row.style.display = "flex"; row.style.gap = "8px";
        const createCtrlBtn = (id, txt, bg, border, tooltip, action) => {
            const b = document.createElement("button"); b.id = id; b.innerText = txt; b.className = "ome-no-select";
            b.title = tooltip;
            Object.assign(b.style, { flex: "1", padding: "8px", backgroundColor: bg, color: "#FFFFFF", border: border, borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", backdropFilter: "blur(5px)" });
            b.onclick = action; return b;
        };

        const editBtn = createCtrlBtn("ip-btn-edit", "✏️ Note", "rgba(255, 215, 0, 0.3)", "1px solid rgba(218, 165, 32, 0.8)", "Edit Note", () => { if (currentIP) openNoteEditor(currentIP); });
        editBtn.style.display = "none";
        const mapBtn = createCtrlBtn("ome-map-btn-ctrl", "🗺️ MAP", "#2196F3", "1px solid #64B5F6", "Open Map", (e) => { e.stopPropagation(); createMapWindow(); });
        mapBtn.style.backgroundColor = "#6495ED"; mapBtn.style.display = "none";
        const settingsBtn = createCtrlBtn("ip-btn-settings", "⚙️ Settings", "rgba(0, 0, 0, 0.5)", "1px solid rgba(80, 80, 80, 0.8)", "Open Settings", toggleSettingsWindow);

        row.appendChild(editBtn); row.appendChild(mapBtn); row.appendChild(settingsBtn);
        controls.appendChild(row);

        // Volume Slider
        const volContainer = document.createElement("div"); volContainer.style.display = "flex"; volContainer.style.alignItems = "center"; volContainer.style.gap = "5px"; volContainer.style.marginTop = "2px";
        const volLabel = document.createElement("span"); volLabel.innerText = "🔊"; volLabel.style.fontSize = "12px";
        const volSlider = document.createElement("input");
        volSlider.type = "range"; volSlider.min = "0"; volSlider.max = "1"; volSlider.step = "0.01"; volSlider.value = "1.0"; volSlider.className = "ome-vol-slider";
        volSlider.title = "Volume Control";
        volSlider.oninput = (e) => { e.stopPropagation(); updateVolume(parseFloat(e.target.value)); };
        setTimeout(() => updateVolume(1.0), 0);
        volContainer.appendChild(volLabel); volContainer.appendChild(volSlider);
        controls.appendChild(volContainer);

        // Footer Row
        const footerRow = document.createElement("div"); Object.assign(footerRow.style, { display: "flex", gap: "8px", marginTop: "4px" });
        const blockBtn = document.createElement("button"); blockBtn.id = "btn-block-skip"; blockBtn.className = "ome-no-select"; blockBtn.innerHTML = "🚫 BLOCK IP"; blockBtn.style.display = "none";
        blockBtn.title = "Block this IP";
        Object.assign(blockBtn.style, { flex: "1", padding: "10px", backgroundColor: "rgba(139, 0, 0, 0.3)", color: "#fff", border: "1px solid rgba(255, 68, 68, 0.8)", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", textTransform: "uppercase", backdropFilter: "blur(5px)" });
        blockBtn.onclick = () => { if (isRelayIP || !currentIP) return; loadData().blockedIPs.add(currentIP); queueSave(); performSmartSkip("Manual Block"); blockBtn.innerText = "BLOCKED!"; setTimeout(() => { blockBtn.innerHTML = "🚫 BLOCK IP"; }, 1000); };

        const nextBtn = document.createElement("button"); nextBtn.id = "ome-next-btn-footer"; nextBtn.innerText = "SKIP ⏭"; nextBtn.className = "ome-next-btn ome-no-select";
        nextBtn.title = "Skip to Next Partner";
        Object.assign(nextBtn.style, { flex: "1", padding: "10px", backgroundColor: "#00AA00", color: "#FFF", border: "1px solid #00FF00", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", boxShadow: "0 2px 4px rgba(0,0,0,0.5)" });
        nextBtn.onclick = (e) => { e.stopPropagation(); performSmartSkip("Manual Next"); };

        footerRow.appendChild(blockBtn); footerRow.appendChild(nextBtn);
        controls.appendChild(footerRow);

        win.appendChild(controls);
        document.body.appendChild(win);
        makeDraggable(win, win);
        updateMasterToggles();
        if (areWatermarksHidden) document.body.classList.add('ome-hide-watermarks');

        // CLICK OUTSIDE LISTENER (UPDATED FOR BLOODSHOT RETENTION)
        document.addEventListener('click', (e) => {
            const menu = document.getElementById("ome-menu-dropdown");
            const btn = document.getElementById("watermark-toggle-btn");
            if (menu && menu.style.display === 'block') {
                if (!menu.contains(e.target) && !btn.contains(e.target)) {
                    menu.style.display = 'none';
                    if(btn) {
                        // Check if Dark Mode is active to restore Bloodshot look
                        if (isDarkModeActive) {
                            btn.style.borderColor = "#FF0000";
                        } else {
                            btn.style.borderColor = "#666";
                        }
                    }
                }
            }
        });

        sandboxWindowEvents(win);
    }

    function toggleGhostMode(win) {
        isWindowTransparent = !isWindowTransparent;

        // --- Selectors ---
        const ghostBtn = document.getElementById("ghost-mode-btn");
        const copyBtns = document.querySelectorAll(".ip-copy-btn");
        const nextBtn = document.querySelector(".ome-next-btn");
        const mapBtn = document.getElementById("ome-map-btn-ctrl");
        const statsArea = document.getElementById("ip-stats-area");
        const wmBtn = document.getElementById("watermark-toggle-btn");
        const volSlider = document.querySelector(".ome-vol-slider");
        const volIcon = volSlider ? volSlider.previousElementSibling : null;

        // Buttons to dim
        const dimmedElements = document.querySelectorAll(
            ".clickable-badge, .status-toggle-btn, #ip-btn-edit, #ip-btn-settings, #btn-block-skip, #cmd-btn"
        );

        if (isWindowTransparent) {
            // --- GHOST MODE ACTIVE ---
            win.style.backgroundColor = "rgba(0,0,0,0.15)";
            win.style.backdropFilter = "none";
            const controlsArea = document.getElementById("ip-controls-area");
            if (controlsArea) controlsArea.style.backgroundColor = "transparent";

            // Make text/sliders dull
            if (wmBtn) { wmBtn.style.opacity = "0.3"; wmBtn.style.borderColor = "transparent"; }
            if (volSlider) volSlider.style.opacity = "0.3";
            if (volIcon) volIcon.style.opacity = "0.3";
            if (mapBtn) { mapBtn.style.opacity = "0.3"; mapBtn.style.boxShadow = "none"; }

            // --- CHANGED LOGIC HERE ---
            dimmedElements.forEach(el => {
                // If it is a Status Toggle (Circle), keep it BRIGHT and COLORFUL
                if (el.classList.contains('status-toggle-btn')) {
                    el.style.opacity = "1";       // Keep fully visible
                    el.style.filter = "none";     // Do not make it grey
                    // Do NOT remove box-shadow (Glow)
                }
                // If it is the Country/IP Badge, keep it semi-visible so text is readable
                else if (el.classList.contains('clickable-badge')) {
                    el.style.opacity = "0.8";
                    el.style.filter = "none";
                    el.style.boxShadow = "none";
                }
                // Everything else (Settings button, etc) gets dimmed
                else {
                    el.style.opacity = "0.3";
                    el.style.filter = "grayscale(80%)";
                    el.style.boxShadow = "none";
                }
            });

            // Ghost button stays active/visible
            if (ghostBtn) {
                ghostBtn.classList.remove("ghost-btn-inactive");
                ghostBtn.classList.add("ghost-btn-active");
                ghostBtn.style.backgroundColor = "rgba(255,255,255,0.8)";
            }

            copyBtns.forEach(btn => {
                btn.style.background = "transparent";
                btn.style.border = "1px solid rgba(255,255,255,0.2)";
                btn.style.color = "rgba(255,255,255,0.5)";
            });

            if (nextBtn) {
                nextBtn.style.backgroundColor = "rgba(0, 170, 0, 0.2)";
                nextBtn.style.border = "1px solid rgba(0, 255, 0, 0.2)";
                nextBtn.style.color = "rgba(255,255,255,0.5)";
                nextBtn.style.boxShadow = "none";
            }

            if (statsArea) {
                statsArea.querySelectorAll('.ome-text-outline').forEach(el => {
                    el.classList.remove('ome-text-outline');
                    el.classList.add('ome-text-outline-thick');
                });
            }

        } else {
            // --- NORMAL MODE ---
            win.style.backgroundColor = "rgba(0,0,0,0.85)";
            win.style.backdropFilter = "blur(5px)";
            const controlsArea = document.getElementById("ip-controls-area");
            if (controlsArea) controlsArea.style.backgroundColor = "rgba(30,30,30,0.5)";

            // Restore styling
            dimmedElements.forEach(el => {
                el.style.opacity = "1";
                el.style.filter = "none";
                // Re-trigger updateStatusDots to restore correct box-shadows/colors for toggles
                updateStatusDots();
            });
            // Re-apply master toggles logic for badges
            updateMasterToggles();

            if (wmBtn) wmBtn.style.opacity = isDarkModeActive ? "1" : "0.6";
            if (wmBtn) wmBtn.style.borderColor = "#666";
            if (volSlider) volSlider.style.opacity = "1";
            if (volIcon) volIcon.style.opacity = "1";
            if (mapBtn) { mapBtn.style.opacity = "1"; mapBtn.style.boxShadow = "none"; }

            if (ghostBtn) {
                ghostBtn.classList.remove("ghost-btn-active");
                ghostBtn.classList.add("ghost-btn-inactive");
                ghostBtn.style.backgroundColor = "rgba(0,0,0,0.5)";
            }

            copyBtns.forEach(btn => {
                btn.style.background = "#000";
                btn.style.border = "1px solid #777";
                btn.style.color = "#eee";
            });

            if (nextBtn) {
                nextBtn.style.backgroundColor = "#00AA00";
                nextBtn.style.border = "1px solid #00FF00";
                nextBtn.style.color = "#FFF";
                nextBtn.style.boxShadow = "0 2px 4px rgba(0,0,0,0.5)";
            }

            if (statsArea) {
                statsArea.querySelectorAll('.ome-text-outline-thick').forEach(el => {
                    el.classList.remove('ome-text-outline-thick');
                    el.classList.add('ome-text-outline');
                });
            }
        }
    }

    function updateMasterToggles() {
        // 1. Update Main Window Badges
        const cnBadge = document.getElementById("badge-country"), ipBadge = document.getElementById("badge-ip");
        if (cnBadge) { cnBadge.style.background = countryBlockingEnabled ? '#004400' : '#440000'; cnBadge.style.color = countryBlockingEnabled ? '#00FF00' : '#FF7777'; cnBadge.style.borderColor = countryBlockingEnabled ? '#00FF00' : '#FF0000'; cnBadge.innerText = countryBlockingEnabled ? 'CNTRY: ON' : 'CNTRY: OFF'; }
        if (ipBadge) { ipBadge.style.background = ipBlockingEnabled ? '#004400' : '#440000'; ipBadge.style.color = ipBlockingEnabled ? '#00FF00' : '#FF7777'; ipBadge.style.borderColor = ipBlockingEnabled ? '#00FF00' : '#FF0000'; ipBadge.innerText = ipBlockingEnabled ? 'IP: ON' : 'IP: OFF'; }

        // 2. Update Simple Settings Window
        updateSettingSwitch("setting-toggle-ip", ipBlockingEnabled, "🛡️ IP Blocking");
        updateSettingSwitch("setting-toggle-country", countryBlockingEnabled, "🌍 Country Blocking");

        // 3. Update Block Button Visibility
        const blockBtn = document.getElementById("btn-block-skip");
        if (blockBtn) {
            if (!ipBlockingEnabled || !currentIP || isRelayIP) blockBtn.style.display = 'none';
            else blockBtn.style.display = 'block';
        }

        // 4. Update Tabs if Settings Window is open
        const settingsWin = document.getElementById("ome-settings-window");
        if (settingsWin && settingsWin.style.display === "flex") {
            switchTab(lastActiveTab);
        }

        // 5. [NEW] Sync Advanced Settings Toggles
        updateAdvToggleVisual("adv-toggle-ip-block", ipBlockingEnabled);
        updateAdvToggleVisual("adv-toggle-country-block", countryBlockingEnabled);
    }

    function updateSettingSwitch(id, isEnabled, labelText) {
        const btn = document.getElementById(id);
        if (!btn) return;
        const bgColor = isEnabled ? "#00E000" : "#FF0000";
        const switchPos = isEnabled ? "26px" : "2px";
        const switchText = isEnabled ? "ON" : "OFF";
        btn.style.backgroundColor = isEnabled ? "rgba(0, 100, 0, 0.3)" : "rgba(100, 0, 0, 0.3)";
        btn.style.border = `1px solid ${bgColor}`;
        btn.innerHTML = `<div style="display: flex; align-items: center; justify-content: space-between; width: 100%;"><span style="color: white; font-weight: bold; font-size: 14px;">${labelText}</span><div class="ome-toggle-track" style="background-color: ${bgColor};"><div class="ome-toggle-knob" style="transform: translateX(${switchPos});">${switchText}</div></div></div>`;
    }

    // --- MAP WINDOW ---
    function createMapWindow() {
        if (!currentApiData || !currentApiData.latitude || !currentApiData.longitude) {
            showToast("No Location Data Available");
            return;
        }

        let win = document.getElementById("ome-map-window");
        if (win) {
            if (win.style.display === "flex") {
                win.style.display = "none";
                const container = win.querySelector("#ome-map-container");
                if(container) container.innerHTML = "";
                // Reset State on Close
                isStreetViewActive = false;
            } else {
                win.style.display = "flex";
                isStreetViewActive = false; // Reset to map on re-open
                updateMapContent(win, currentApiData);
            }
            return;
        }

        win = document.createElement("div");
        win.id = "ome-map-window";
        win.className = "ome-no-select resizable-win";
        Object.assign(win.style, {
            position: "fixed", top: "150px", left: "500px", width: "500px", height: "450px",
            backgroundColor: "rgba(17, 17, 17, 0.95)", backdropFilter: "blur(10px)", color: "#FFF",
            zIndex: "99999980",
            borderRadius: "10px", border: "1px solid #444",
            display: "flex", flexDirection: "column", boxShadow: "0 10px 50px rgba(0,0,0,1)"
        });

        const header = document.createElement("div");
        Object.assign(header.style, { padding: "8px", backgroundColor: "rgba(34, 34, 34, 0.8)", borderBottom: "1px solid #444", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "default" });
        header.innerHTML = "<span style='font-weight:bold; font-size:14px;'>🗺️ Partner Location</span>";

        const closeBtn = document.createElement("button"); closeBtn.innerText = "✖";
        Object.assign(closeBtn.style, { background: "none", border: "none", color: "white", fontSize: "16px", cursor: "pointer" });
        closeBtn.onclick = () => {
            win.style.display = "none";
            const container = win.querySelector("#ome-map-container");
            if(container) container.innerHTML = "";
            isStreetViewActive = false; // Reset lock
        };
        header.appendChild(closeBtn);
        win.appendChild(header);

        const mapContainer = document.createElement("div");
        mapContainer.id = "ome-map-container";
        Object.assign(mapContainer.style, { flex: "1", position: "relative", backgroundColor: "#000" });
        win.appendChild(mapContainer);

        document.body.appendChild(win);
        makeDraggable(header, win);

        updateMapContent(win, currentApiData);
    }

    function updateMapContent(win, data) {
        const container = win.querySelector("#ome-map-container");
        if(!container) return;

        // Cleanup Footer
        const existingBtnContainer = win.querySelector("#ome-map-btn-wrapper");
        if (existingBtnContainer) existingBtnContainer.remove();

        container.innerHTML = "";
        const lat = data.latitude;
        const lon = data.longitude;

        if (isStreetViewActive) {
            // --- STREET VIEW MODE ---
            const iframe = document.createElement("iframe");
            iframe.width = "100%";
            iframe.height = "100%";
            iframe.style.border = "0";
            iframe.loading = "lazy";
            // FIXED: Added '$' before {lat}
            iframe.src = `https://maps.google.com/maps?q=&layer=c&cbll=${lat},${lon}&cbp=11,0,0,0,0&output=svembed`;
            iframe.style.pointerEvents = "auto";
            container.appendChild(iframe);

            const closeSVBtn = document.createElement("button");
            closeSVBtn.innerText = "✖";
            Object.assign(closeSVBtn.style, {
                position: "absolute", top: "10px", right: "10px",
                backgroundColor: "rgba(0,0,0,0.7)", color: "#fff", border: "1px solid #fff",
                borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer",
                fontWeight: "bold", zIndex: "10", fontSize: "14px"
            });
            closeSVBtn.onclick = () => {
                isStreetViewActive = false;
                updateMapContent(win, data);
            };
            container.appendChild(closeSVBtn);

        } else {
            // --- STANDARD MAP MODE ---
            const iframe = document.createElement("iframe");
            iframe.width = "100%";
            iframe.height = "100%";
            iframe.style.border = "0";
            iframe.loading = "lazy";
            // FIXED: Added '$' before {lat}
            iframe.src = `https://maps.google.com/maps?q=${lat},${lon}&z=16&output=embed`;
            iframe.style.pointerEvents = "auto";
            container.appendChild(iframe);
        }

        // --- FOOTER BUTTON (Toggle) ---
        const btnContainer = document.createElement("div");
        btnContainer.id = "ome-map-btn-wrapper";
        Object.assign(btnContainer.style, { padding: "8px", background: "#222", textAlign: "center", borderTop: "1px solid #444" });

        const svBtn = document.createElement("button");
        if (isStreetViewActive) {
            svBtn.innerText = "🔙 Return to Map";
            Object.assign(svBtn.style, {
                display: "inline-block", padding: "6px 12px", background: "#555", color: "#fff",
                borderRadius: "4px", fontWeight: "bold", fontSize: "12px",
                border: "1px solid #777", cursor: "pointer"
            });
        } else {
            svBtn.innerText = "🚶 Open Street View";
            Object.assign(svBtn.style, {
                display: "inline-block", padding: "6px 12px", background: "#E6C200", color: "#000",
                borderRadius: "4px", fontWeight: "bold", fontSize: "12px",
                border: "1px solid #C4A600", cursor: "pointer"
            });
        }

        svBtn.onclick = () => {
            isStreetViewActive = !isStreetViewActive;
            updateMapContent(win, data);
        };

        btnContainer.appendChild(svBtn);
        container.parentElement.appendChild(btnContainer);
        makeDraggable(btnContainer, win);
    }

    // --- DEV CONSOLE ---
    function createDevWindow() {
        if (document.getElementById("dev-console-win")) return;
        const win = document.createElement("div");
        win.id = "dev-console-win"; win.className = "ome-no-select resizable-win";
        Object.assign(win.style, {
            position: "fixed", top: "150px", left: "500px", width: "450px", height: "300px", backgroundColor: "#000", border: "1px solid #0f0", color: "#0f0", fontFamily: "monospace", fontSize: "11px", display: "none", flexDirection: "column",
            zIndex: "99999990"
        });

        const header = document.createElement("div");
        Object.assign(header.style, { padding: "5px", backgroundColor: "#002200", borderBottom: "1px solid #0f0", cursor: "default", display: "flex", justifyContent: "space-between", alignItems: "center" });

        const titleSection = document.createElement("div");
        titleSection.style.display = "flex"; titleSection.style.alignItems = "center"; titleSection.style.gap = "10px";
        const title = document.createElement("span"); title.innerText = "Console"; title.style.fontWeight = "bold";
        titleSection.appendChild(title);

        const btnSection = document.createElement("div");
        btnSection.style.display = "flex"; btnSection.style.gap = "5px";

        const copyLogBtn = document.createElement("button");
        copyLogBtn.innerText = "Copy Log";
        copyLogBtn.className = "copy-btn";
        Object.assign(copyLogBtn.style, { cursor: "pointer", background: "#004400", border: "1px solid #0f0", color: "#0f0", fontSize: "10px", padding: "2px 5px" });
        copyLogBtn.onclick = () => {
            const txt = devLogs.map(l => `[${l.time}] [${l.type}] ${l.msg}`).join("\n");
            navigator.clipboard.writeText(txt).then(() => showToast("Log Copied", win));
        };

        const copyErrBtn = document.createElement("button");
        copyErrBtn.innerText = "Copy Err";
        copyErrBtn.className = "copy-btn";
        Object.assign(copyErrBtn.style, { cursor: "pointer", background: "#440000", border: "1px solid #f00", color: "#f99", fontSize: "10px", padding: "2px 5px" });
        copyErrBtn.onclick = () => {
            const txt = devLogs.filter(l => l.type === 'ERR' || l.type === 'API' || l.msg.includes('Error') || l.msg.includes('Fail')).map(l => `[${l.time}] [${l.type}] ${l.msg}`).join("\n");
            if(!txt) { showToast("No Errors found", win); return; }
            navigator.clipboard.writeText(txt).then(() => showToast("Errors Copied", win));
        };

        const clearBtn = document.createElement("button");
        clearBtn.innerText = "Clear";
        clearBtn.className = "copy-btn";
        Object.assign(clearBtn.style, { cursor: "pointer", background: "#444400", border: "1px solid #ff0", color: "#ff0", fontSize: "10px", padding: "2px 5px" });
        clearBtn.onclick = () => {
            devLogs = [];
            updateDevConsole();
            showToast("Log Cleared", win);
        };

        const closeBtn = document.createElement("button");
        closeBtn.innerText = "X"; closeBtn.className = "close-btn";
        // INCREASED PADDING and FONT SIZE here
        Object.assign(closeBtn.style, { cursor: "pointer", background: "#440000", border: "1px solid #f00", color: "#fff", fontWeight: "bold", marginLeft: "5px", padding: "2px 15px", fontSize: "12px" });
        closeBtn.onclick = toggleDevConsole;

        btnSection.appendChild(copyLogBtn);
        btnSection.appendChild(copyErrBtn);
        btnSection.appendChild(clearBtn);
        btnSection.appendChild(closeBtn);

        header.appendChild(titleSection);
        header.appendChild(btnSection);
        win.appendChild(header);

        const logs = document.createElement("div"); logs.id = "dev-logs-container";
        Object.assign(logs.style, { flex: "1", overflowY: "auto", padding: "5px", whiteSpace: "pre-wrap" });
        win.appendChild(logs);

        document.body.appendChild(win);
        makeDraggable(header, win);
        makeDraggable(logs, win);
    }

    function toggleDevConsole() {
        createDevWindow();
        const win = document.getElementById("dev-console-win");
        win.style.display = win.style.display === "none" ? "flex" : "none";
        updateDevConsole();
    }

    function updateDevConsole() {
        const container = document.getElementById("dev-logs-container");
        // FIX: Double check visibility to prevent background rendering
        if (!container || container.offsetParent === null) return;

        // --- FILTER LOGIC ---
        // Only show 'RTC' (Sniffed Data) and 'IP' (The Detected Target)
        // This removes 'SYS', 'API', 'ERR', etc.
        const visibleTypes = ['IP', 'SYS','API','ERR'];

        const filteredLogs = devLogs.filter(l => visibleTypes.includes(l.type));

        // Join and display
        container.textContent = filteredLogs.map(l => `[${l.time}] [${l.type}] ${l.msg}`).join("\n");
        container.scrollTop = container.scrollHeight;
    }

    // --- SETTINGS WINDOW ---

    function updateSettingsHeaderDisplay(container) {
        if (!myOwnIPData) {
            container.innerHTML = "<span style='font-size:12px; color:#aaa;'>Fetching own IP...</span>";
            return;
        }
        const cc = myOwnIPData.country_code ? myOwnIPData.country_code.toLowerCase() : "un";
        const region = myOwnIPData.region || myOwnIPData.country || "Unknown";

        const toggleBlur = "this.style.filter = this.style.filter === 'none' ? 'blur(5px)' : 'none'";

        container.innerHTML = `
            <div onclick="${toggleBlur}" title="Click to reveal/hide" style="display:flex; align-items:center; gap:8px; background:rgba(0,0,0,0.3); padding:4px 8px; border-radius:4px; border:1px solid #444; cursor:pointer; filter: blur(5px); transition: filter 0.3s;">
                <img src="https://flagcdn.com/h20/${cc}.png" style="height:14px; width:auto;">
                <span style="font-size:13px; font-weight:bold; color:#00FF00;">${myOwnIPData.ip}</span>
                <span style="font-size:12px; color:#ddd; max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">(${region})</span>
            </div>
        `;
    }

    // --- SETTINGS WINDOW ---
    function createSettingsWindow() {
        if (document.getElementById("ome-settings-window")) return;
        const win = document.createElement("div"); win.id = "ome-settings-window"; win.className = "ome-no-select resizable-win";
        Object.assign(win.style, {
            position: "fixed", top: "10%", left: "50%", transform: "translateX(-50%)", width: "500px", height: "650px", backgroundColor: "rgba(17, 17, 17, 0.95)", backdropFilter: "blur(10px)", color: "#FFF",
            zIndex: "99999999",
            borderRadius: "10px", border: "1px solid #444", display: "none", flexDirection: "column", boxShadow: "0 10px 50px rgba(0,0,0,1)"
        });

        const header = document.createElement("div");
        Object.assign(header.style, { padding: "10px", backgroundColor: "rgba(34, 34, 34, 0.8)", borderBottom: "1px solid #444", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "default" });

        const headerLeft = document.createElement("div");
        headerLeft.style.display = "flex"; headerLeft.style.alignItems = "center"; headerLeft.style.gap = "15px";

        const title = document.createElement("span");
        title.innerHTML = "⚙️ Settings";
        title.style.fontWeight = "bold"; title.style.fontSize = "18px";
        headerLeft.appendChild(title);

        header.appendChild(headerLeft);

        const closeBtn = document.createElement("button"); closeBtn.innerText = "✖";
        Object.assign(closeBtn.style, { background: "none", border: "none", color: "white", fontSize: "18px", cursor: "pointer" });
        closeBtn.onclick = toggleSettingsWindow;
        header.appendChild(closeBtn); win.appendChild(header);

        const masterControls = document.createElement("div");
        masterControls.style.display = "flex"; masterControls.style.padding = "10px"; masterControls.style.gap = "10px"; masterControls.style.borderBottom = "1px solid #333";
        const createToggle = (id, action) => {
            const btn = document.createElement("div"); btn.id = id;
            Object.assign(btn.style, { flex: "1", padding: "8px", borderRadius: "5px", cursor: "pointer", userSelect: "none", transition: "all 0.2s" });
            btn.onclick = action; return btn;
        };
        masterControls.appendChild(createToggle("setting-toggle-country", () => { countryBlockingEnabled = !countryBlockingEnabled; updateMasterToggles(); queueSave(); }));
        masterControls.appendChild(createToggle("setting-toggle-ip", () => { ipBlockingEnabled = !ipBlockingEnabled; updateMasterToggles(); queueSave(); }));
        win.appendChild(masterControls);

        const tabContainer = document.createElement("div"); Object.assign(tabContainer.style, { display: "flex", position: "relative" });
        const createTab = (text, id) => {
            const tab = document.createElement("div"); tab.innerText = text; tab.dataset.target = id;
            Object.assign(tab.style, { flex: "1", padding: "10px", textAlign: "center", cursor: "pointer", border: "1px solid transparent", position: "relative" });
            tab.onclick = () => switchTab(id); return tab;
        };
        tabContainer.appendChild(createTab("Blocked Countries", "tab-countries"));
        tabContainer.appendChild(createTab("Blocked IPs", "tab-ips"));
        win.appendChild(tabContainer);

        const content = document.createElement("div"); content.id = "settings-content"; content.style.flex = "1"; content.style.overflowY = "auto";
        win.appendChild(content);

        document.body.appendChild(win);
        makeDraggable(header, win); updateMasterToggles();
        sandboxWindowEvents(win);
    }

    document.addEventListener('mousedown', (e) => {
        const settings = document.getElementById('ome-settings-window');
        const openBtn = document.getElementById('ip-btn-settings');
        if (settings && settings.style.display === 'flex') {
            if (!settings.contains(e.target) && e.target !== openBtn) toggleSettingsWindow();
        }
    });

    function toggleSettingsWindow() {
        const win = document.getElementById("ome-settings-window");
        if (!win) { createSettingsWindow(); document.getElementById("ome-settings-window").style.display = "flex"; switchTab(lastActiveTab); }
        else {
            win.style.display = win.style.display === "none" ? "flex" : "none";
            if (win.style.display === "flex") { updateMasterToggles(); switchTab(lastActiveTab); }
        }
    }

    function switchTab(tabId) {
        lastActiveTab = tabId;
        const tabs = document.querySelectorAll("#ome-settings-window > div:nth-child(3) > div");
        const content = document.getElementById("settings-content");

        // --- DYNAMIC BORDER COLOR LOGIC ---
        let borderColor = '#FF4444'; // Fallback
        if (tabId === 'tab-ips') {
            borderColor = ipBlockingEnabled ? '#00FF00' : '#FF0000';
        } else if (tabId === 'tab-countries') {
            borderColor = countryBlockingEnabled ? '#00FF00' : '#FF0000';
        }

        const winBg = "rgba(17, 17, 17, 0.95)";

        if (content) {
            content.style.border = `2px solid ${borderColor}`;
            content.style.borderRadius = "0 0 10px 10px";
            content.style.zIndex = "5";
            content.style.position = "relative";
            content.style.marginTop = "-2px";
        }

        tabs.forEach(t => {
            const active = t.dataset.target === tabId;
            if (active) {
                Object.assign(t.style, {
                    backgroundColor: winBg,
                    color: "#fff",
                    fontWeight: "bold",
                    borderTop: `2px solid ${borderColor}`,
                    borderLeft: `2px solid ${borderColor}`,
                    borderRight: `2px solid ${borderColor}`,
                    borderBottom: "none",
                    zIndex: "10",
                    marginBottom: "0px",
                    paddingBottom: "12px",
                    borderRadius: "10px 10px 0 0",
                    position: "relative"
                });
            } else {
                Object.assign(t.style, {
                    backgroundColor: "transparent",
                    color: "#888",
                    fontWeight: "normal",
                    border: "none",
                    borderBottom: `2px solid ${borderColor}`,
                    zIndex: "1",
                    marginBottom: "0px",
                    paddingBottom: "10px",
                    borderRadius: "10px 10px 0 0",
                    position: "relative"
                });
            }
        });

        if (tabId === "tab-ips") renderBlockedIPs();
        if (tabId === "tab-countries") renderBlockedCountries();
    }

    // Replace your existing createCountryControlRow function with this:
    function createCountryControlRow(container, list) {
        const row = document.createElement("div");
        Object.assign(row.style, {
            display: "flex",
            gap: "10px",
            marginBottom: "10px",
            alignItems: "center",
            padding: "0 5px",
            position: "relative", // Needed for absolute centering
            height: "36px"        // Enforce height so the absolute button fits
        });

        // 1. SELECT ALL BUTTON (Top Left)
        const selectAllBtn = document.createElement("button");
        selectAllBtn.innerText = "☑ ALL";
        selectAllBtn.title = "Select / Deselect All";
        Object.assign(selectAllBtn.style, {
            width: "70px",
            padding: "8px",
            backgroundColor: "#555", color: "#eee",
            border: "1px solid #777", borderRadius: "4px",
            cursor: "pointer", fontWeight: "bold", fontSize: "12px",
            textAlign: "center"
        });

        selectAllBtn.onclick = () => {
            const { blockedCountries } = loadData();
            if (list) {
                const allCodes = list.map(c => c.code);
                const allSel = allCodes.every(c => blockedCountries.has(c));
                allCodes.forEach(c => allSel ? blockedCountries.delete(c) : blockedCountries.add(c));
                queueSave();
                renderBlockedCountries();
            }
        };

        // 2. DEFAULT BUTTON (True Center)
        const defaultBtn = document.createElement("button");
        defaultBtn.innerText = "↺ Defaults";
        Object.assign(defaultBtn.style, {
            position: "absolute",       // Ignore other elements
            left: "50%",                // Move to middle
            transform: "translateX(-50%)", // Center align perfectly
            width: "140px",
            padding: "8px",
            backgroundColor: "#0056b3",
            color: "white",
            border: "1px solid #004494",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "12px"
        });

        defaultBtn.onclick = () => {
            loadData().blockedCountries = new Set(DEFAULT_BLOCKED_COUNTRIES);
            queueSave();
            renderBlockedCountries();
        };

        row.appendChild(selectAllBtn);
        row.appendChild(defaultBtn);
        container.appendChild(row);
    }

    function renderBlockedCountries() {
        const container = document.getElementById("settings-content"); container.innerHTML = ""; Object.assign(container.style, { padding: "10px" });
        const controlRow = document.createElement("div");
        Object.assign(controlRow.style, { display: "flex", gap: "10px", marginBottom: "15px" });

        const createSortBtn = (label, sortType, activeEmoji) => {
            const isActive = currentCountrySort === sortType;
            const btnText = isActive ? `${activeEmoji} ${label}` : label;

            const btn = document.createElement("button"); btn.innerText = btnText;

            Object.assign(btn.style, {
                flex: 1, padding: "8px", cursor: "pointer",
                border: "1px solid #444",
                backgroundColor: isActive ? "#FFC107" : "rgba(51, 51, 51, 0.5)",
                color: isActive ? "#000" : "#ccc",
                transition: "all 0.2s"
            });

            if (isActive) {
                btn.style.fontWeight = "normal";
                // CHANGED: Removed the outline class and explicitly cleared text-shadows
                btn.classList.remove("ome-text-outline");
                btn.style.textShadow = "none";

                btn.style.boxShadow = "0 0 8px rgba(255, 193, 7, 0.5)";
                btn.style.border = "1px solid #FFD54F";
            }
            btn.onclick = () => { currentCountrySort = sortType; renderBlockedCountries(); };
            return btn;
        };

        controlRow.appendChild(createSortBtn("Continent", "continents", "🌍"));
        controlRow.appendChild(createSortBtn("Name A-Z", "az", "🔤"));
        controlRow.appendChild(createSortBtn("Language", "lang", "🗣️"));
        container.appendChild(controlRow);

        const contentDiv = document.createElement("div"); container.appendChild(contentDiv);
        if (currentCountrySort === 'continents') renderContinentsList(contentDiv);
        else renderFlatCountryList(contentDiv);
    }

    function renderContinentsList(container) {
        createCountryControlRow(container, COUNTRIES_DATA);

        const { blockedCountries } = loadData();
        ['AF', 'AS', 'EU', 'NA', 'OC', 'SA'].forEach(contCode => {
            const block = document.createElement("div");
            const header = document.createElement("div");
            Object.assign(header.style, { display: "flex", alignItems: "center", padding: "12px", cursor: "pointer", backgroundColor: "rgba(26, 26, 26, 0.5)", border: "1px solid #333", marginBottom: "2px" });

            const countries = COUNTRIES_DATA.filter(c => c.cont === contCode).sort((a,b)=>a.name.localeCompare(b.name));
            const blocked = countries.filter(c => blockedCountries.has(c.code));
            const isFull = blocked.length === countries.length && countries.length > 0;
            const isPartial = blocked.length > 0 && blocked.length < countries.length;

            const check = document.createElement("input"); check.type = "checkbox"; check.checked = isFull; check.style.marginRight = "10px";
            check.indeterminate = isPartial;
            check.onclick = (e) => { e.stopPropagation(); const target = !isFull; countries.forEach(c => target ? blockedCountries.add(c.code) : blockedCountries.delete(c.code)); queueSave(); renderBlockedCountries(); };

            const title = document.createElement("span"); title.innerText = CONTINENT_NAMES[contCode]; title.style.flex = "1";
            const arrow = document.createElement("span"); arrow.innerText = expandedContinents.has(contCode) ? "▲" : "▼";

            header.appendChild(check); header.appendChild(title); header.appendChild(arrow);
            header.onclick = () => { if (expandedContinents.has(contCode)) expandedContinents.delete(contCode); else expandedContinents.add(contCode); renderBlockedCountries(); };
            block.appendChild(header);

            if (expandedContinents.has(contCode)) {
                countries.forEach(c => {
                    const r = document.createElement("div");
                    const isB = blockedCountries.has(c.code);
                    Object.assign(r.style, { display: "flex", padding: "5px 5px 5px 25px", borderBottom: "1px solid #222", cursor: "pointer", backgroundColor: isB ? "rgba(42, 21, 21, 0.5)" : "transparent", alignItems: "center" });

                    const cb = document.createElement("input"); cb.type="checkbox"; cb.checked=isB; cb.style.marginRight="10px";

                    const nm = document.createElement("span");
                    nm.innerText = c.name;
                    if(isB) nm.style.color="#ff6666";

                    const fl = document.createElement("img"); fl.src = `https://flagcdn.com/h20/${c.code}.png`; fl.style.marginRight = "8px"; fl.style.width = "20px"; // Margin Right now

                    const blockedIcon = document.createElement("span");
                    blockedIcon.innerText = isB ? " 🚫" : "";
                    blockedIcon.style.marginLeft = "6px";

                    const tog = () => { if(blockedCountries.has(c.code)) blockedCountries.delete(c.code); else blockedCountries.add(c.code); queueSave(); renderBlockedCountries(); };
                    cb.onclick=(e)=>{e.stopPropagation(); tog();}; r.onclick=tog;

                    // FIXED ORDER: Checkbox -> Flag -> Name -> Block Icon
                    r.appendChild(cb);
                    r.appendChild(fl); // Flag first
                    r.appendChild(nm); // Name second
                    r.appendChild(blockedIcon);

                    block.appendChild(r);
                });
            }
            container.appendChild(block);
        });
    }

    function renderFlatCountryList(container) {
        let displayList = [...COUNTRIES_DATA];
        if (currentCountrySort === "az") {
            displayList.sort((a, b) => a.name.localeCompare(b.name));
        } else if (currentCountrySort === "lang") {
            displayList.sort((a, b) => {
                const langA = LANG_MAP[a.code] || "Other";
                const langB = LANG_MAP[b.code] || "Other";
                const idxA = LANG_PRIORITY.indexOf(langA);
                const idxB = LANG_PRIORITY.indexOf(langB);
                if (idxA !== -1 && idxB !== -1) { if (idxA !== idxB) return idxA - idxB; return a.name.localeCompare(b.name); }
                if (idxA !== -1) return -1;
                if (idxB !== -1) return 1;
                if (langA !== langB) return langA.localeCompare(langB);
                return a.name.localeCompare(b.name);
            });
        }

        createCountryControlRow(container, displayList);
        const { blockedCountries } = loadData();
        displayList.forEach(country => {
            const row = document.createElement("div");
            Object.assign(row.style, { display: "flex", alignItems: "center", padding: "6px", borderBottom: "1px solid #222", cursor: "pointer" });
            const isBlocked = blockedCountries.has(country.code);
            if (isBlocked) row.style.backgroundColor = "rgba(42, 21, 21, 0.5)";

            const checkbox = document.createElement("input"); checkbox.type = "checkbox"; checkbox.checked = isBlocked; checkbox.style.marginRight = "10px";
            const toggle = () => { if (blockedCountries.has(country.code)) blockedCountries.delete(country.code); else blockedCountries.add(country.code); queueSave(); renderBlockedCountries(); };
            checkbox.onclick = (e) => { e.stopPropagation(); toggle(); }; row.onclick = toggle;

            const flag = document.createElement("img"); flag.src = `https://flagcdn.com/h20/${country.code}.png`; flag.style.marginLeft = "8px"; flag.style.width = "20px"; flag.style.marginRight = "8px";

            // CHANGED: Added emoji logic here
            const name = document.createElement("span");
            name.innerText = country.name + (isBlocked ? " 🚫" : "");
            if(isBlocked) name.style.color = "#ff6666";

            row.appendChild(checkbox);
            if (currentCountrySort === "lang") {
                const langSpan = document.createElement("span");
                langSpan.innerText = `[${LANG_MAP[country.code] || "Other"}]`;
                langSpan.style.color = "#aaa"; langSpan.style.fontSize = "12px"; langSpan.style.marginRight = "8px";
                row.appendChild(langSpan);
            }
            row.appendChild(flag);
            row.appendChild(name);
            container.appendChild(row);
        });
    }

    function renderBlockedIPs() {
        const container = document.getElementById("settings-content");
        container.innerHTML = "";
        // Ensure relative positioning so the absolute background works
        Object.assign(container.style, { padding: "10px", position: "relative", minHeight: "300px" });

        // --- BACKGROUND INFO (Watermark) ---
        const bgInfo = document.createElement("div");
        Object.assign(bgInfo.style, {
            // CHANGED: Moved from bottom:20px to center using top:50% + transform
            position: "absolute", top: "50%", transform: "translateY(-50%)", left: "0", width: "100%",
            textAlign: "center", zIndex: "0", pointerEvents: "none", // Behind everything
            color: "rgba(255, 255, 255, 0.08)", // Very faint
            fontSize: "14px", fontWeight: "bold", lineHeight: "1.6",
            fontFamily: "monospace", textTransform: "uppercase"
        });
        bgInfo.innerHTML = `
            <div>Donate: $eolnmsuk</div>
            <div>Support: github.com/eolnmsuk</div>
            <div>Discord: discord.gg/omeglestream</div>
        `;
        container.appendChild(bgInfo);

        const btnRow = document.createElement("div");
        // Ensure buttons are clickable (z-index)
        Object.assign(btnRow.style, { display: "flex", gap: "10px", marginBottom: "15px", position: "relative", zIndex: "10" });

        const clearBtn = document.createElement("button"); clearBtn.innerText = "🗑️ Clear All Blocked IPs";
        Object.assign(clearBtn.style, { flex: "1", padding: "8px", backgroundColor: "#cc7000", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" });
        clearBtn.onclick = () => { if(confirm("Clear IPs?")) { loadData().blockedIPs.clear(); queueSave(); renderBlockedIPs(); } };

        const advSettingsBtn = document.createElement("button");
        advSettingsBtn.innerText = "🛠️ Advanced Settings";
        Object.assign(advSettingsBtn.style, { flex: "1", padding: "8px", backgroundColor: "#555", color: "#eee", border: "1px solid #777", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" });
        advSettingsBtn.onclick = createAdvancedSettingsWindow;

        btnRow.appendChild(clearBtn); btnRow.appendChild(advSettingsBtn);
        container.appendChild(btnRow);

        const list = document.createElement("div");
        // Ensure list sits on top of the background text
        Object.assign(list.style, { position: "relative", zIndex: "5" });

        const { blockedIPs, history } = loadData();

        if (blockedIPs.size === 0) list.innerHTML = "<div style='color:#666; text-align:center;'>No IPs blocked.</div>";
        else {
            Array.from(blockedIPs).reverse().forEach(ip => {
                const item = document.createElement("div");
                Object.assign(item.style, { display: "flex", justifyContent: "space-between", padding: "8px", borderBottom: "1px solid #333", backgroundColor: "rgba(26, 26, 26, 0.95)", alignItems: "center" });

                const leftSide = document.createElement("div");
                Object.assign(leftSide.style, { display: "flex", alignItems: "center", cursor: "pointer", flex: "1" });
                leftSide.title = "Click to Copy";

                leftSide.onclick = function() {
                    navigator.clipboard.writeText(ip);
                    const msg = document.createElement("span");
                    msg.innerText = "COPIED!";
                    Object.assign(msg.style, { marginLeft: "10px", fontSize: "10px", fontWeight: "bold", color: "#00FF00" });
                    leftSide.appendChild(msg);
                    setTimeout(() => msg.remove(), 1000);
                };

                if (history[ip] && history[ip].wc) {
                    const flag = document.createElement("img");
                    flag.src = `https://flagcdn.com/h20/${history[ip].wc.toLowerCase()}.png`;
                    Object.assign(flag.style, { marginRight: "10px", width: "20px", height: "auto" });
                    leftSide.appendChild(flag);
                }

                const ipText = document.createElement("span"); ipText.innerText = ip;
                leftSide.appendChild(ipText);

                const delBtn = document.createElement("button"); delBtn.innerText = "❌";
                Object.assign(delBtn.style, { background: "none", border: "none", cursor: "pointer", paddingLeft: "10px" });
                delBtn.onclick = (e) => {
                    e.stopPropagation();
                    loadData().blockedIPs.delete(ip);
                    queueSave();
                    renderBlockedIPs();
                };

                item.appendChild(leftSide);
                item.appendChild(delBtn);
                list.appendChild(item);
            });
        }
        container.appendChild(list);
    }

    // --- NEW HELPER: Sync Advanced Settings Toggles ---
    function updateAdvToggleVisual(id, isActive) {
        const el = document.getElementById(id);
        if (!el) return;

        // Find the track and knob inside the element by class
        const track = el.querySelector('.ome-toggle-track');
        const knob = el.querySelector('.ome-toggle-knob');

        if (track) track.style.backgroundColor = isActive ? "#00E000" : "#444";
        if (knob) knob.style.transform = isActive ? "translateX(26px)" : "translateX(2px)";
    }

    function createAdvancedSettingsWindow() {
        if (document.getElementById("ome-adv-settings-window")) {
            const w = document.getElementById("ome-adv-settings-window");
            w.style.display = w.style.display === "none" ? "flex" : "none";
            if(w.style.display === "flex") {
                updateMasterToggles();
                updateStatusDots();
            }
            return;
        }

        const win = document.createElement("div"); win.id = "ome-adv-settings-window"; win.className = "ome-no-select resizable-win";
        Object.assign(win.style, {
            position: "fixed", top: "15%", left: "55%", width: "400px", maxHeight: "650px",
            backgroundColor: "rgba(20, 20, 25, 0.98)", backdropFilter: "blur(12px)", color: "#FFF",
            zIndex: "99999999", borderRadius: "12px", border: "1px solid #555",
            display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.8)", paddingBottom: "10px"
        });

        // --- HEADER ---
        const header = document.createElement("div");
        Object.assign(header.style, { padding: "12px 15px", borderBottom: "1px solid #444", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(to bottom, rgba(40,40,40,0.5), transparent)", borderRadius: "12px 12px 0 0" });
        header.innerHTML = "<span style='font-size:15px; font-weight:bold; color:#ccc;'>🛠️ Advanced Options</span>";

        const closeBtn = document.createElement("button"); closeBtn.innerText = "✖";
        Object.assign(closeBtn.style, { background: "none", border: "none", color: "#aaa", fontSize: "16px", cursor: "pointer" });
        closeBtn.onclick = () => win.style.display = "none";
        header.appendChild(closeBtn);
        win.appendChild(header);

        // --- CONTENT AREA ---
        const content = document.createElement("div");
        Object.assign(content.style, { padding: "15px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", flex: "1" });

        // 1. HOST IP DISPLAY
        const ipSection = document.createElement("div");
        ipSection.innerHTML = "<div style='font-size:10px; color:#888; margin-bottom:5px; text-transform:uppercase; letter-spacing:1px; font-weight:bold;'>Your Connection</div>";
        const ownIpContainer = document.createElement("div");
        ownIpContainer.id = "ome-settings-header-content";
        Object.assign(ownIpContainer.style, { padding: "10px", background: "rgba(0,0,0,0.3)", borderRadius: "6px", border: "1px solid #444", display:"flex", justifyContent:"center", alignItems:"center" });
        if(myOwnIPData) updateSettingsHeaderDisplay(ownIpContainer);
        else ownIpContainer.innerHTML = "<span style='color:#666; font-size:12px;'>Fetching your data...</span>";
        ipSection.appendChild(ownIpContainer);
        content.appendChild(ipSection);

        const sectionTitle = (t) => `<div style='font-size:10px; color:#666; margin: 8px 0 4px 0; text-transform:uppercase; letter-spacing:1px; font-weight:bold; border-bottom:1px solid #333; padding-bottom:2px;'>${t}</div>`;

        const createOptBtn = (text, icon, color, action, desc) => {
            const b = document.createElement("div");
            Object.assign(b.style, {
                display: "flex", alignItems: "center", padding: "8px",
                background: "rgba(255,255,255,0.05)", borderRadius: "6px", cursor: "pointer",
                border: "1px solid transparent", transition: "all 0.2s"
            });
            b.onmouseover = () => { b.style.background = "rgba(255,255,255,0.1)"; b.style.borderColor = "#444"; };
            b.onmouseout = () => { b.style.background = "rgba(255,255,255,0.05)"; b.style.borderColor = "transparent"; };
            b.onclick = action;

            const ico = document.createElement("div"); ico.innerText = icon;
            Object.assign(ico.style, { fontSize: "18px", marginRight: "12px", width: "24px", textAlign: "center" });

            const txtDiv = document.createElement("div"); txtDiv.style.flex = "1";
            txtDiv.innerHTML = `<div style="font-weight:bold; font-size:13px; color:${color}; margin-bottom:1px;">${text}</div><div style="font-size:10px; color:#aaa;">${desc}</div>`;

            b.appendChild(ico); b.appendChild(txtDiv);
            return b;
        };

        const createToggleRow = (id, label, icon, isEnabled, onToggle) => {
            const div = document.createElement("div");
            div.id = id;
            Object.assign(div.style, { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px", background:"rgba(255,255,255,0.03)", borderRadius:"6px", cursor: "pointer" });

            const left = document.createElement("div"); left.style.display="flex"; left.style.alignItems="center";
            left.innerHTML = `<span style="font-size:18px; margin-right:10px;">${icon}</span><span style="font-size:13px; font-weight:bold; color:#eee;">${label}</span>`;

            const tBtn = document.createElement("div");
            tBtn.className = "ome-toggle-track";

            tBtn.style.backgroundColor = isEnabled ? "#00E000" : "#444";
            tBtn.style.width = "46px"; tBtn.style.height = "22px";
            tBtn.innerHTML = `<div class="ome-toggle-knob" style="transition: transform 0.2s; width:18px; height:18px; transform: ${isEnabled ? 'translateX(26px)' : 'translateX(2px)'}"></div>`;

            div.onclick = onToggle;
            div.appendChild(left); div.appendChild(tBtn);
            return div;
        };

        // 2. BLOCKING CONFIG
        const blockDiv = document.createElement("div");
        blockDiv.innerHTML = sectionTitle("Blocking Rules");
        blockDiv.appendChild(createToggleRow("adv-toggle-ip-block", "IP Blocking", "🛡️", ipBlockingEnabled, () => {
            ipBlockingEnabled = !ipBlockingEnabled; updateMasterToggles(); queueSave();
        }));
        blockDiv.appendChild(createToggleRow("adv-toggle-country-block", "Country Blocking", "🌍", countryBlockingEnabled, () => {
            countryBlockingEnabled = !countryBlockingEnabled; updateMasterToggles(); queueSave();
        }));
        content.appendChild(blockDiv);

        // 3. CORE FEATURES
        const coreDiv = document.createElement("div");
        coreDiv.innerHTML = sectionTitle("Core Features");
        coreDiv.appendChild(createToggleRow("adv-toggle-ip-grab", "IP Grabber", "📡", isIPGrabbingEnabled, () => {
            isIPGrabbingEnabled = !isIPGrabbingEnabled; updateStatusDots();
        }));
        coreDiv.appendChild(createToggleRow("adv-toggle-face-bypass", "Face Bypass", "🎭", isFaceProtectionEnabled, () => {
            isFaceProtectionEnabled = !isFaceProtectionEnabled;
            window.dispatchEvent(new CustomEvent('ome-bypass-config', { detail: { type: 'face', enabled: isFaceProtectionEnabled } }));
            updateStatusDots();
        }));
        coreDiv.appendChild(createToggleRow("adv-toggle-report-prot", "Report Protection", "🛡️", isReportProtectionEnabled, () => {
            isReportProtectionEnabled = !isReportProtectionEnabled;
            window.dispatchEvent(new CustomEvent('ome-bypass-config', { detail: { type: 'report', enabled: isReportProtectionEnabled } }));
            updateStatusDots();
        }));
        content.appendChild(coreDiv);

        // 4. UI & VISUALS
        const uiDiv = document.createElement("div");
        uiDiv.innerHTML = sectionTitle("Interface & Stealth");
        uiDiv.appendChild(createOptBtn("Toggle Ghost Mode", "👻", "#00FFFF", () => toggleGhostMode(document.getElementById("ip-log-window")), "Make the extension transparent"));
        uiDiv.appendChild(createOptBtn("Toggle Dark/Hide Mode", "👁️", "#FFFFFF", () => toggleWatermarks(), "Hide watermarks & logos"));
        uiDiv.appendChild(createOptBtn("Select Element to Hide", "🟥", "#FF4444", () => { win.style.display="none"; startSelector('hide'); }, "Click an element on screen to hide it"));
        uiDiv.appendChild(createOptBtn("Select Element to Unhide", "🟩", "#00FF00", () => { win.style.display="none"; startSelector('unhide'); }, "Restore a specific hidden element"));
        uiDiv.appendChild(createOptBtn("Unhide ALL Elements", "🟧", "#FFA500", unhideAllElements, "Reset all custom hidden elements"));
        content.appendChild(uiDiv);

        // 5. UTILITIES
        const utilsDiv = document.createElement("div");
        utilsDiv.innerHTML = sectionTitle("Tools");
        utilsDiv.appendChild(createOptBtn("Developer Console", "📟", "#00FF00", toggleDevConsole, "View raw logs, errors & events"));
        utilsDiv.appendChild(createOptBtn("Location Map", "🗺️", "#64B5F6", () => { createMapWindow(); document.getElementById("ome-map-window").style.display = "flex"; }, "Open the location visualizer"));
        utilsDiv.appendChild(createOptBtn("Edit Current Note", "📝", "#FFD700", () => { if(currentIP) openNoteEditor(currentIP); else showToast("No Active IP", win); }, "Add note to current connection"));
        content.appendChild(utilsDiv);

        // 6. DANGER ZONE
        const dangerDiv = document.createElement("div");
        dangerDiv.innerHTML = sectionTitle("Danger Zone");
        dangerDiv.appendChild(createOptBtn("Reset All Data", "⚠️", "#FF4444", clearAllData, "Wipe history, blocks & settings"));
        content.appendChild(dangerDiv);

        // --- ABOUT ME FOOTER (CLICKABLE) ---
        const footer = document.createElement("div");
        Object.assign(footer.style, {
            marginTop: "10px", padding: "10px", backgroundColor: "rgba(0,0,0,0.2)",
            textAlign: "center", fontSize: "11px", color: "#666", lineHeight: "1.6",
            borderRadius: "6px", border: "1px solid #333"
        });

        const linkStyle = "color: #888; text-decoration: none; font-weight: bold; transition: color 0.2s;";
        const hoverScript = "this.style.color='#fff'";
        const outScript = "this.style.color='#888'";

        footer.innerHTML = `
            <div style="font-weight: bold; color: #555; text-transform: uppercase; margin-bottom: 4px;">About Developer</div>
            <div style="margin-bottom:2px;">
                <a href="https://cash.app/$eolnmsuk" target="_blank" style="${linkStyle}" onmouseover="${hoverScript}" onmouseout="${outScript}">$eolnmsuk</a>
            </div>
            <div style="margin-bottom:2px;">
                <a href="https://github.com/eolnmsuk" target="_blank" style="${linkStyle}" onmouseover="${hoverScript}" onmouseout="${outScript}">github.com/eolnmsuk</a>
            </div>
            <div>
                <a href="https://discord.gg/omeglestream" target="_blank" style="${linkStyle}" onmouseover="${hoverScript}" onmouseout="${outScript}">discord.gg/omeglestream</a>
            </div>
        `;
        content.appendChild(footer);

        win.appendChild(content);
        document.body.appendChild(win);
        makeDraggable(header, win);
        sandboxWindowEvents(win);
    }

    // --- NOTE WINDOW ---

    function createNoteWindow() {
        if (document.getElementById("note-input-window")) return;
        const win = document.createElement("div"); win.id = "note-input-window"; win.className = "ome-no-select resizable-win";
        Object.assign(win.style, {
            position: "fixed", top: "400px", left: "10px", width: "300px", backgroundColor: "rgba(60, 60, 0, 0.85)", backdropFilter: "blur(10px)", color: "#FFFFFF",
            zIndex: "99999995",
            borderRadius: "10px", border: "2px solid rgba(255, 215, 0, 0.5)", display: "none", flexDirection: "column", padding: "10px"
        });

        const header = document.createElement("div"); header.id = "note-window-header";
        Object.assign(header.style, { marginBottom: "8px", fontSize: "12px", color: "#eee", cursor: "default", padding: "6px", backgroundColor: "rgba(255, 255, 255, 0.1)", borderRadius: "6px", textAlign: "center", fontWeight: "bold" });
        win.appendChild(header);

        const textarea = document.createElement("textarea"); textarea.id = "note-textarea";
        Object.assign(textarea.style, { width: "100%", flex: "1", backgroundColor: "rgba(0,0,0,0.2)", color: "#fff", border: "1px solid rgba(255, 255, 255, 0.2)", borderRadius: "4px", padding: "8px", fontSize: "14px", resize: "none", marginBottom: "8px", fontFamily: "sans-serif", outline: "none", userSelect: "text" });
        textarea.addEventListener("keydown", (e) => { e.stopPropagation(); if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveNoteAction(); } });
        textarea.onmousedown = (e) => e.stopPropagation();
        win.appendChild(textarea);

        const btnRow = document.createElement("div"); btnRow.style.display = "flex"; btnRow.style.justifyContent = "space-between";
        const cancelBtn = document.createElement("button"); cancelBtn.innerText = "Cancel"; Object.assign(cancelBtn.style, { backgroundColor: "rgba(255, 255, 255, 0.1)", color: "#ccc", border: "none", borderRadius: "4px", padding: "6px 12px", cursor: "pointer" });
        cancelBtn.onclick = closeNoteEditor; cancelBtn.onmousedown = (e) => e.stopPropagation();
        const saveBtn = document.createElement("button"); saveBtn.innerText = "Done"; Object.assign(saveBtn.style, { backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", padding: "6px 12px", cursor: "pointer", fontWeight: "bold" });
        saveBtn.onclick = saveNoteAction; saveBtn.onmousedown = (e) => e.stopPropagation();
        btnRow.appendChild(cancelBtn); btnRow.appendChild(saveBtn); win.appendChild(btnRow);

        document.body.appendChild(win);
        makeDraggable(header, win);
        makeDraggable(win, win);
        sandboxWindowEvents(win);
    }

    function toggleChatInputDisability(disable) {
        const chatInputs = document.querySelectorAll('.chat__textarea, #chat-text, .chat__textfield, textarea:not(#note-textarea)');
        chatInputs.forEach(el => {
            if (disable) {
                el.classList.add('chat-disabled');
                el.setAttribute('tabindex', '-1');
                el.setAttribute('readonly', 'true');
            }
            else {
                el.classList.remove('chat-disabled');
                el.removeAttribute('tabindex');
                el.removeAttribute('readonly');
            }
        });
    }

    // [FIX 4] AGGRESSIVE FOCUS PROTECTION
    // 1. Trap focus inside our windows when they are open
    // 2. Intercept site attempts to steal focus (focus hijacking)

    // Override the native .focus() method on HTML elements
    const nativeFocus = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function(...args) {
        // If Note Editor is open, deny focus to anything else
        if (isEditing) {
            const noteArea = document.getElementById('note-textarea');
            // Allow focus only if it's our note area or buttons inside our window
            if (this === noteArea || this.closest('#note-input-window')) {
                return nativeFocus.apply(this, args);
            }
            // Deny focus to site elements (chat box)
            return;
        }

        // If Settings Window is open, deny focus to site elements (prevent glitching)
        const settingsWin = document.getElementById('ome-settings-window');
        if (settingsWin && settingsWin.style.display === 'flex') {
            if (this.closest('#ome-settings-window')) {
                return nativeFocus.apply(this, args);
            }
            // Optional: Allow chat focus if you still want to type while settings are open,
            // but usually blocking it prevents the "glitch/close" behavior.
            // return; // Uncomment to strict block
        }

        return nativeFocus.apply(this, args);
    };

    // Existing event listener to catch bubbling focus events
    window.addEventListener('focus', function(e) {
        if (isEditing) {
            const target = e.target;
            // If focus lands on something that isn't our note window
            if (target && !target.closest('#note-input-window')) {
                e.preventDefault();
                e.stopImmediatePropagation();
                const noteInput = document.getElementById('note-textarea');
                if (noteInput) {
                    nativeFocus.call(noteInput); // Use native to avoid recursion
                }
            }
        }
    }, true);

    // Stop Key events from bubbling to the site when typing in our windows
    const stopPropagation = (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
    };

    function sandboxWindowEvents(win) {
        if (!win) return;

        // Removed 'mouseup' from this list so the drag-stop event can reach the document
        ['keydown', 'keyup', 'keypress', 'mousedown', 'click'].forEach(evt => {
            win.addEventListener(evt, (e) => {
                // CHANGED: Allow Escape key to pass through to the website
                // This lets you skip using the keyboard even if the IP window is focused
                if (e.key === 'Escape') return;

                e.stopPropagation();
            });
        });
    }

    function openNoteEditor(ip) {
        isEditing = true; editingIP = ip;
        const win = document.getElementById("note-input-window");
        const header = document.getElementById("note-window-header");
        const textarea = document.getElementById("note-textarea");
        const { history } = loadData();
        textarea.value = (history[ip] && history[ip].note) ? history[ip].note : "";
        header.innerHTML = `Note for: <span style="user-select:none">${ip}</span>`;
        win.style.display = "flex";
        toggleChatInputDisability(true);
        setTimeout(() => textarea.focus(), 50);
    }

    function closeNoteEditor() {
        isEditing = false; editingIP = null;
        toggleChatInputDisability(false);
        document.getElementById("note-input-window").style.display = "none";
    }

    function saveNoteAction() {
        if (!editingIP) return;
        const textarea = document.getElementById("note-textarea");
        const newText = textarea.value.trim();
        const { history } = loadData();
        if (!history[editingIP]) history[editingIP] = { count: 1, lastSeen: Date.now() };
        if (newText === "") delete history[editingIP].note; else history[editingIP].note = newText;
        queueSave();
        if (currentIP === editingIP) refreshStatsWindowDisplay(currentIP, history[currentIP], currentApiData);
        closeNoteEditor();
    }

    // --- MAIN DISPLAY LOGIC ---

    function refreshStatsWindowDisplay(ip, userData, apiData = null) {
        const contentArea = document.getElementById("ip-stats-area");
        if (!contentArea) return;

        const blockBtn = document.getElementById("btn-block-skip");
        const editBtn = document.getElementById("ip-btn-edit");
        const mapBtn = document.getElementById("ome-map-btn-ctrl");
        const footerNextBtn = document.getElementById("ome-next-btn-footer");

        if (blockBtn) {
            if (!ipBlockingEnabled || isRelayIP || !ip) { blockBtn.style.display = "none"; if(footerNextBtn) footerNextBtn.style.flex = "100%"; }
            else { blockBtn.style.display = "block"; blockBtn.style.flex = "1"; if(footerNextBtn) footerNextBtn.style.flex = "1"; }
        }

        if (mapBtn) mapBtn.style.display = (isRelayIP || !ip) ? "none" : "block";
        if (editBtn) editBtn.style.display = !ip ? "none" : "block";

        const count = userData ? userData.count : 1;
        const noteText = userData ? userData.note : "";
        const noteHtml = noteText ? `<div class="ome-yellow-note" style="margin: 6px 0; padding: 5px; background: rgba(255,255,0,0.3); border-left: 3px solid yellow; color: #fff; font-size: 13px; text-shadow: none !important; width: fit-content; max-width: 100%; word-wrap: break-word;">${safe(noteText)}</div>` : "";
        const copyBtnStyle = isWindowTransparent ? "border-radius: 4px; border: 1px solid rgba(255,255,255,0.3); background: transparent; color: rgba(255,255,255,0.8); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 11px; padding: 2px 6px; font-weight: bold;" : "border-radius: 4px; border: 1px solid #777; background: #000; color: #eee; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 11px; padding: 2px 6px; font-weight: bold;";
        const copyBtn = `<div class="ome-no-select ip-copy-btn" style="${copyBtnStyle}" title="Copy IP" onclick="window.navigator.clipboard.writeText('${ip}').then(() => { const win=document.getElementById('ip-log-window'); if(!win)return; let t=win.querySelector('.ome-toast'); if(!t){t=document.createElement('div'); t.className='ome-toast ome-no-select'; win.appendChild(t);} t.innerText='Copied IP to clipboard!'; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 1500); })">Copy</div>`;
        const ipWrapperStyle = "display: inline-flex; align-items: center; gap: 8px; border: 1px solid #666; padding: 3px 6px; border-radius: 4px; background-color: rgba(0,0,0,0.4); max-width: 100%; box-sizing: border-box; flex-wrap: wrap; width: fit-content;";
        const blurStyle = "filter: blur(3px); cursor: pointer; transition: 0.2s; user-select: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px; display: inline-block; vertical-align: middle;";
        const toggleScript = "this.style.filter = this.style.filter === 'none' ? 'blur(3px)' : 'none'";
        const fontStyle = "font-family: system-ui, sans-serif; line-height: 1.3;";
        const outlineClass = isWindowTransparent ? "ome-text-outline-thick" : "ome-text-outline";

        let html = "";

        if (isRelayIP) {
            const isp = apiData && apiData.connection ? apiData.connection.isp : "Unknown ISP";
            const loc = apiData ? `${apiData.city||""}, ${apiData.region||""}` : "Unknown Location";
            html = `
                <div style="${fontStyle}" class="${outlineClass}">
                    <div style="font-size: 16px; font-weight: 700; color: #FF4444; margin-bottom: 2px;">⚠️ Relay IP Detected</div>
                    <div style="font-size: 13px; font-weight: bold; color: #FF0000; margin-bottom: 5px;">Reason: TURN Server / Proxy</div>
                    <div style="font-size: 14px; font-weight:bold; color: #FF7777; margin-bottom: 2px;">${safe(loc)}</div>
                    <div style="font-size: 12px; color: #FF7777; margin-bottom: 5px;">${safe(isp)}</div>
                    ${noteHtml}
                    <div style="font-size: 18px; color: #FF9536; font-weight: 600; margin-bottom: 5px;">
                        Seen ${count} ${count===1?"time":"times"} <span style="color:#aaa">  •  <span id='ip-call-timer'>${formatTime(callSeconds)}</span></span>
                    </div>
                    <div style="${ipWrapperStyle}">
                         <span title="Click to reveal" onclick="${toggleScript}" style="color:#FF9536; font-size: 16px; ${blurStyle}">${safe(ip)}</span> ${copyBtn}
                    </div>
                </div>`;
        } else if (apiData) {
            const countryCode = apiData.country_code ? apiData.country_code.toLowerCase() : "un";
            const lang = LANG_MAP[countryCode] || "Unknown";

            // UPDATED HEADER LAYOUT: Lang on top, Flag + Country below
            const headerRow = `
                <div style="margin-bottom: 5px;">
                    <div style="font-size: 10px; color: #bbb; font-weight: bold; margin-bottom: 2px; opacity: 0.8; text-transform: uppercase;">${lang}</div>
                    <div style="display: flex; align-items: center;">
                        <img src="https://flagcdn.com/h24/${countryCode}.png" draggable="false" style="height: 16px; width: auto; margin-right: 8px;" alt="">
                        <span style="font-size: 16px; font-weight: 600; color: #fff;">${safe(apiData.country || "Unknown")}</span>
                    </div>
                </div>
            `;
            html = `
                <div style="${fontStyle}" class="${outlineClass}">
                    ${headerRow}
                    <div style="font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 2px;">
                        ${safe(apiData.city)}, ${safe(apiData.region)}
                    </div>
                    <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">
                        ${safe(apiData.connection ? apiData.connection.isp : "")}
                    </div>
                    ${noteHtml}
                    <div style="font-size: 18px; color: #FF9536; font-weight: 600; margin-bottom: 5px;">
                        Seen ${count} ${count===1?"time":"times"} <span style="color:#aaa">  •  <span id='ip-call-timer'>${formatTime(callSeconds)}</span></span>
                    </div>
                     <div style="${ipWrapperStyle}">
                         <span title="Click to reveal" onclick="${toggleScript}" style="color:#FF9536; font-size: 16px; ${blurStyle}">${safe(ip)}</span> ${copyBtn}
                    </div>
                </div>`;
        } else {
            html = `<div style="${fontStyle}" class="${outlineClass}"> <div style="font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 8px;">⏳ Fetching...</div> <div style="margin-top: 4px;"> <span title="Click to reveal" onclick="${toggleScript}" style="color:#FF9536; font-size: 18px; ${blurStyle}">${ip||""}</span> </div> </div>`;
        }
        contentArea.innerHTML = html;
    }

    // --- WEBRTC (Stealth Mode) ---
    const nativeRTCPeerConnection = window.RTCPeerConnection;

    // 1. Create the hook wrapper
    const HookedRTCPeerConnection = function(...args) {
        currentIP = null;
        isRelayIP = false;
        currentRelayType = "";
        currentApiData = null;

        const pc = new nativeRTCPeerConnection(...args);
        return pc;
    };

    // 2. Preserve prototype chain
    HookedRTCPeerConnection.prototype = nativeRTCPeerConnection.prototype;

    // 3. Mask the constructor to look native (Fixes Detection Leak)
    Object.defineProperty(HookedRTCPeerConnection, 'name', { value: 'RTCPeerConnection' });
    Object.defineProperty(HookedRTCPeerConnection, 'toString', {
        value: function() { return nativeRTCPeerConnection.toString(); },
        writable: true,
        configurable: true
    });

    // 4. Overwrite global
    window.RTCPeerConnection = HookedRTCPeerConnection;

    // --- Hook setRemoteDescription to spy on partner capabilities ---

    // --- Hook addIceCandidate with Native Masking ---
    const nativeAddIceCandidate = window.RTCPeerConnection.prototype.addIceCandidate;

    const hookedAddIceCandidate = function(iceCandidate, ...args) {
        // 1. Check if IP Grabbing is globally enabled
        if (!isIPGrabbingEnabled) {
            if (typeof nativeAddIceCandidate !== 'undefined') {
                return nativeAddIceCandidate.apply(this, [iceCandidate, ...args]);
            }
            return;
        }

        if (iceCandidate && iceCandidate.candidate) {
            try {
                const rawCandidate = iceCandidate.candidate;
                const parts = rawCandidate.split(' ');

                // [FIX 1] Robust Relay Parsing: Find 'typ' keyword dynamically
                let typeField = "host"; // Default
                const typeIndex = parts.indexOf("typ");
                if (typeIndex !== -1 && parts.length > typeIndex + 1) {
                    typeField = parts[typeIndex + 1];
                }
                // Fallback to index 7 if 'typ' not found (legacy behavior)
                else if (parts.length >= 8) {
                    typeField = parts[7];
                }

                // Debug Log to Confirm Logic is Working
                if (typeField === 'relay') {
                    logDev("RTC", `⚠️ Relay Candidate Detected! (${typeField})`);
                }

                // Regex Definitions
                const ipv4Regex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
                // (Simple IPv6 regex)
                const ipv6Regex = /([a-f0-9]{1,4}(:[a-f0-9]{1,4}){7}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){0,7}::[a-f0-9]{0,4})/;

                // [FIX 2] Updated Private IP Regex to include 192.0.0. (DS-Lite)
                const privateIpRegex = /^(10\.|192\.168\.|192\.0\.0\.|172\.(1[6-9]|2\d|3[0-1])\.|127\.|100\.)/;

                let incomingIP = null;
                let isIncomingV6 = false;

                // Robust IP Extraction: Loop through parts to find valid IP
                for (let part of parts) {
                    // Check for IPv4 (excluding ports like 1.2.3.4:80)
                    if (ipv4Regex.test(part) && !part.includes(":")) {
                        incomingIP = part;
                        isIncomingV6 = false;
                        break;
                    }
                    // Check for IPv6
                    else if (ipv6Regex.test(part)) {
                        incomingIP = part;
                        isIncomingV6 = true;
                        break;
                    }
                }

                // Check for Stripped (.local)
                if (!incomingIP && rawCandidate.includes(".local")) {
                    logDev("RTC", `Stripped/mDNS candidate ignored`);
                }

                // --- PREFERENCE LOGIC ---
                if (incomingIP && !privateIpRegex.test(incomingIP)) {

                    // Helper to detect if our CURRENT stored IP is IPv4
                    const currentIsV4 = currentIP && ipv4Regex.test(currentIP);

                    // RULE 1: If we already have an IPv4, ignore any incoming IPv6
                    if (currentIsV4 && isIncomingV6) {
                        // We return here to let the connection continue, but we DON'T update the display/stats
                        if (typeof nativeAddIceCandidate !== 'undefined') {
                            return nativeAddIceCandidate.apply(this, [iceCandidate, ...args]);
                        }
                        return;
                    }

                    // RULE 2: If we are upgrading from IPv6 to IPv4, or it's a new IP
                    const isUpgrade = (!currentIsV4 && !isIncomingV6); // Had V6 (or null), found V4
                    const isNew = (currentIP !== incomingIP);

                    if (isUpgrade || isNew) {
                        // Filter strict Direct/Relay preference
                        const isRelay = (typeField === "relay");
                        const isSrflx = (typeField === "srflx");
                        const isHost = (typeField === "host");
                        // We treat 'srflx' (Server Reflexive) and 'host' (Direct) as "Direct" connections
                        const isDirect = isSrflx || (isHost && !isRelay);

                        // We generally take the IP if:
                        // 1. It is Direct
                        // 2. OR it is Relay, but we don't have ANY IP yet
                        // 3. OR it is Relay, but we are upgrading from V6 to V4 (even if V4 is relay)

                        let shouldUpdate = false;

                        if (isDirect) {
                            shouldUpdate = true;
                        } else if (isRelay) {
                            if (!currentIP || isRelayIP || isUpgrade) {
                                shouldUpdate = true;
                            }
                        }

                        if (shouldUpdate) {
                            currentIP = incomingIP;
                            isRelayIP = isRelay;
                            currentRelayType = isRelay ? "Relay" : "Direct";
                            getLocation(incomingIP);
                        }
                    }
                }
            } catch (e) {
                logDev("ERR", "RTC Parse Error: " + e.message);
            }
        }

        if (typeof nativeAddIceCandidate !== 'undefined') {
            return nativeAddIceCandidate.apply(this, [iceCandidate, ...args]);
        }
    };

    // Mask the method to look native
    Object.defineProperty(hookedAddIceCandidate, 'toString', {
        value: function() { return nativeAddIceCandidate.toString(); },
        writable: true,
        configurable: true
    });

    window.RTCPeerConnection.prototype.addIceCandidate = hookedAddIceCandidate;

    // [REPLACE YOUR EXISTING getLocation FUNCTION WITH THIS]
    function getLocation(ip) {
        fallbackMethod = 'esc1'; // Reset skip logic

        if (callTimerInterval) clearInterval(callTimerInterval);
        callSeconds = 0;
        currentApiData = null;

        logDev("IP", `Target Found: ${ip}`);

        let { history } = loadData();

        // Safety check: ensure history exists
        if (!history) history = {};

        let count = (history[ip]) ? history[ip].count + 1 : 1;

        history[ip] = {
            count: count,
            lastSeen: Date.now(),
            note: (history[ip] && history[ip].note) ? history[ip].note : "",
            wc: (history[ip] && history[ip].wc) ? history[ip].wc : null
        };
        queueSave();
        refreshStatsWindowDisplay(ip, history[ip]);
        checkAndSkipIfBlocked(ip, null);

        callTimerInterval = setInterval(() => {
            callSeconds++;
            const t = document.getElementById('ip-call-timer');
            if (t) t.innerText = `${formatTime(callSeconds)}`;
            updateVolume(globalVolume);
        }, 1000);

        // --- SWITCHED TO IP-API.COM (No Monthly Limit) ---
        GM_xmlhttpRequest({
            method: "GET",
            // We specifically use HTTP here because the free tier of ip-api doesn't support HTTPS.
            // GM_xmlhttpRequest allows this cross-origin/mixed-content request safely.
            url: `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,isp,query`,
            onload: function(response) {
                if (currentIP !== ip) return;

                try {
                    var json = JSON.parse(response.responseText);

                    // Check success (ip-api uses 'status': 'success')
                    if (json.status === 'success') {

                        // 1. Normalize Data (Convert ip-api format to match your existing script)
                        // This prevents the Map and UI from breaking
                        const normalizedData = {
                            success: true,
                            ip: json.query,
                            country_code: json.countryCode,
                            country: json.country,
                            region: json.regionName, // ip-api uses 'regionName'
                            city: json.city,
                            latitude: json.lat,      // ip-api uses 'lat'
                            longitude: json.lon,     // ip-api uses 'lon'
                            connection: {
                                isp: json.isp        // ip-api uses 'isp' directly
                            }
                        };

                        currentApiData = normalizedData;

                        // 2. Update History & UI
                        if (history[ip]) {
                            history[ip].wc = normalizedData.country_code;
                            queueSave();
                        }
                        refreshStatsWindowDisplay(ip, history[ip], normalizedData);
                        checkAndSkipIfBlocked(ip, normalizedData.country_code);

                        logDev("API", `Details: ${normalizedData.city}, ${normalizedData.region} (${normalizedData.connection.isp})`);

                        // 3. Update Map if open
                        const mapWin = document.getElementById("ome-map-window");
                        if(mapWin && mapWin.style.display === "flex" && !isStreetViewActive) {
                            updateMapContent(mapWin, currentApiData);
                        }
                    }
                    else {
                        logDev("API", `Failed: ${json.message}`);
                    }
                } catch (e) { logDev("ERR", "JSON Parse Error"); }
            },
            onerror: function() { logDev("API", "Net Error"); }
        });
    }

    // --- ADVANCED BYPASS & SECURITY (STEALTH MODE) ---
    function installPlatformBypasses() {
        const script = document.createElement('script');
        script.textContent = `(function() {
            // Configuration Flags
            let config = { face: true, report: true };

            window.addEventListener('ome-bypass-config', (e) => {
                if (e.detail.type === 'face') config.face = e.detail.enabled;
                if (e.detail.type === 'report') config.report = e.detail.enabled;
            });

            function notifyExtension(type) {
                window.dispatchEvent(new CustomEvent('ome-bypass-event', { detail: { type: type } }));
            }

            // --- 1. STEALTH WORKER HOOK (Face Detection) ---
            const NativeWorker = window.Worker;

            class StealthWorker extends NativeWorker {
                constructor(scriptURL, options) {
                    const urlStr = String(scriptURL);
                    // Check if this worker is for face detection/vision
                    if (config.face && (urlStr.includes('vision') || urlStr.includes('face') || urlStr.includes('wasm'))) {
                        notifyExtension('face');
                        // Create a dummy worker that does nothing but confirm it "loaded"
                        const dummyCode = "self.onmessage = function(e) { setTimeout(() => { self.postMessage({ action: 'faceDetections', faces: 1 }); }, 50); };";
                        const blob = new Blob([dummyCode], { type: 'application/javascript' });
                        super(URL.createObjectURL(blob), options);
                    } else {
                        // Pass through legitimate workers (like chat/connection)
                        super(scriptURL, options);
                    }
                }
            }

            // Mask the class to look like the native function
            Object.defineProperty(StealthWorker, 'name', { value: 'Worker' });
            Object.defineProperty(StealthWorker, 'toString', {
                value: function() { return NativeWorker.toString(); },
                writable: true, configurable: true
            });

            window.Worker = StealthWorker;

            // --- 2. STEALTH WEBSOCKET HOOK (Report Protection) ---
            const NativeWebSocket = window.WebSocket;

            class StealthWebSocket extends NativeWebSocket {
                constructor(...args) {
                    super(...args);

                    // Attach listener immediately after creation
                    this.addEventListener('message', (event) => {
                        if (!config.report) return;
                        try {
                            // Check for ban/report packets
                            if (typeof event.data === 'string' && (event.data.includes('rimage') || event.data.includes('banned'))) {
                                notifyExtension('report');
                                // We cannot easily "block" the event here without a Proxy,
                                // but we CAN trigger the skip logic immediately.
                                console.log("⚠️ Blocked Report Signal");
                            }
                        } catch (e) { }
                    });
                }
            }

            // Mask the class to look like the native function
            Object.defineProperty(StealthWebSocket, 'name', { value: 'WebSocket' });
            Object.defineProperty(StealthWebSocket, 'toString', {
                value: function() { return NativeWebSocket.toString(); },
                writable: true, configurable: true
            });

            window.WebSocket = StealthWebSocket;
            notifyExtension('ws-ready');

        })();`;

        (document.head || document.documentElement).appendChild(script);
        script.remove();
    }

    // CALL IMMEDIATELY - DO NOT WAIT FOR INIT
    window.addEventListener('ome-bypass-event', (e) => {
        if (e.detail.type === 'ws-ready') {
            isWsProtectionActive = true;
            // If UI exists, update it immediately
            const dot = document.getElementById('status-dot-report');
            if (dot) {
                dot.style.backgroundColor = "#00FF00";
                dot.style.boxShadow = "0 0 8px #00FF00";
                dot.title = "Report Protection: Active & Ready";
            }
        }
    });

    installPlatformBypasses();

    // --- PERSISTENCE OBSERVER ---
    function startStyleObserver() {
        let timeout;
        const observer = new MutationObserver(() => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                // Enforce Dark Mode class ONLY if active
                if (isDarkModeActive) {
                    if (!document.body.classList.contains('ome-dark-mode')) {
                        document.body.classList.add('ome-dark-mode');
                    }
                }
                // Enforce Hides ALWAYS
                applyCustomHides();
            }, 100);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
    // --- OMEGLEAPP.ME SPECIFIC DISCONNECT MONITOR ---
    let oaDisconnectSkipLock = false;

    function initOmegleAppMonitor() {
        // STRICT CHECK: Only run this on omegleapp.me domains
        const host = window.location.hostname;
        if (!host.includes("omegleapp.me")) return;

        logDev("SYS", "OmegleApp Disconnect Monitor Started");

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            // Check if the added node IS the link
                            if (checkOANode(node)) triggerOASkip();
                            // Check if the node CONTAINS the link (if a parent wrapper was added)
                            else if (node.querySelector && node.querySelector('.socialLink')) {
                                if (checkOANode(node.querySelector('.socialLink'))) triggerOASkip();
                            }
                        }
                    });
                }
            }
        });

        // Observe body for added chat messages
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function checkOANode(node) {
        // Look for wrapper classes usually associated with messages
        if (node.classList.contains('link') || node.classList.contains('text_msg') || node.classList.contains('socialLink')) {
            const txt = node.textContent || node.innerText || "";
            // Check for YOU disconnected OR STRANGER disconnected
            if (txt.includes('You have disconnected!') || txt.includes('Stranger has disconnected!')) {
                return true;
            }
        }
        return false;
    }

    function triggerOASkip() {
        if (oaDisconnectSkipLock) return;
        oaDisconnectSkipLock = true;

        // Random delay: 1000ms base + (50ms to 500ms jitter)
        const delayMs = 1000 + (Math.floor(Math.random() * 450) + 50);

        const stats = document.getElementById("ip-stats-area");
        if(stats) stats.insertAdjacentHTML('beforeend', `<br><span style="color:orange; font-size:10px;">↪ Auto-skipping in ${(delayMs/1000).toFixed(2)}s...</span>`);

        setTimeout(() => {
            performSmartSkip("OmegleApp Disconnect");
            // Unlock after 2 seconds to allow next chat skipping
            setTimeout(() => { oaDisconnectSkipLock = false; }, 2000);
        }, delayMs);
    }

    // [FIND THE init CONSTANT AT THE BOTTOM]
    const init = () => {
        // 1. Load standard extension data
        loadData();
        fetchOwnIP();
        createLogWindow();
        createNoteWindow();

        // Inject essential CSS
        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `.chat-container { background-color: transparent !important; }`;
        document.head.appendChild(style);

        window.addEventListener("beforeunload", forceSave);

        // LISTEN FOR INJECTED BYPASS EVENTS
        window.addEventListener('ome-bypass-event', (e) => {
            if (e.detail.type === 'face') {
                facesDetectedCount++;
                updateStatusDots();
            } else if (e.detail.type === 'report') {
                reportsBlockedCount++;
                updateStatusDots();
                triggerReportSound();
            } else if (e.detail.type === 'ws-ready') {
                isWsProtectionActive = true;
                const dot = document.getElementById('status-dot-report');
                if (dot) {
                    dot.style.backgroundColor = "#00FF00";
                    dot.style.boxShadow = "0 0 8px #00FF00";
                    dot.title = "Report Protection: Active & Ready";
                }
            }
        });

        // START THE OBSERVERS
        startStyleObserver();
        initOmegleAppMonitor();

        // --- NEW AUTO CLICKER TRIGGER ---

        // Apply saved state
        if (isDarkModeActive) {
            setTimeout(() => toggleWatermarks(true), 500);
        }

        logDev("SYS", "Console Initialized");
        logDev("SYS", `Resolution: ${window.screen.width}x${window.screen.height}`);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
