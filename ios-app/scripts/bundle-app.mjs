import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const iosAppDir = path.resolve(__dirname, '..');

const sourcePath = path.join(rootDir, 'client/public/phone.html');
const destDir = path.join(iosAppDir, 'www');
const destPath = path.join(destDir, 'index.html');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

let content = fs.readFileSync(sourcePath, 'utf8');

// 1. Update Title and Meta for iOS
content = content.replace(
  '<title>Oliver - Authentic ZUJ Mobile Experience Simulator</title>',
  '<title>Oliver ZUJ Mobile</title>'
);

content = content.replace(
  '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
  '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">\n  <meta name="apple-mobile-web-app-capable" content="yes">\n  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n  <script src="capacitor.js"></script>\n  <script src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js"></script>'
);

// 2. Hide simulator desktop header permanently in native iOS app
content = content.replace(
  '<header id="simulator-header"',
  '<header id="simulator-header" style="display: none !important;"'
);

// 2b. Remove any residual 9:41 fake clock from content
content = content.replace(/>9:41</g, '><');

// 3. Add Native iOS Fullscreen CSS Overrides
const nativeIosStyles = `
  <style id="native-ios-overrides">
    html, body {
      padding: 0 !important;
      margin: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      height: 100dvh !important;
      overflow: hidden !important;
      background-color: #05110a !important;
      -webkit-touch-callout: none !important;
      -webkit-tap-highlight-color: transparent !important;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif !important;
    }
    #simulator-header {
      display: none !important;
    }
    #dynamic-island {
      display: none !important;
    }
    #phone-chassis {
      width: 100vw !important;
      max-width: 100vw !important;
      height: 100vh !important;
      height: 100dvh !important;
      max-height: 100dvh !important;
      border: none !important;
      border-radius: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
      background: #05110a !important;
    }
    #phone-screen {
      border-radius: 0 !important;
      border: none !important;
      width: 100% !important;
      height: 100% !important;
      box-shadow: none !important;
      padding-top: max(env(safe-area-inset-top), 14px) !important;
    }
    #status-bar {
      display: none !important;
      padding-top: max(env(safe-area-inset-top), 14px) !important;
      padding-left: max(env(safe-area-inset-left), 18px) !important;
      padding-right: max(env(safe-area-inset-right), 18px) !important;
    }
    #viewport-content {
      padding-bottom: calc(84px + env(safe-area-inset-bottom)) !important;
      -webkit-overflow-scrolling: touch !important;
    }
    /* Native Bottom Navigation Bar iOS Safe Area */
    nav, .fixed.bottom-0 {
      padding-bottom: max(env(safe-area-inset-bottom), 12px) !important;
    }
    /* iOS Server Connection Modal */
    #ios-server-modal {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.85);
      z-index: 9999;
      padding: 24px;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
    }
    #ios-server-modal.active {
      display: flex;
    }
  </style>
`;

content = content.replace('</head>', `${nativeIosStyles}\n</head>`);

// 4. Inject Server Connection Settings Modal & Button for iPhone
const serverConfigModal = `
  <!-- Native iPhone Server Host Config Modal -->
  <div id="ios-server-modal">
    <div class="bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 w-full max-w-sm shadow-2xl space-y-4">
      <div class="flex items-center justify-between border-b border-white/10 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">📡</div>
          <div>
            <h3 class="text-sm font-bold text-white">Oliver Server Host</h3>
            <p class="text-[10px] text-slate-400">Configure connection to laptop</p>
          </div>
        </div>
        <button onclick="closeServerConfigModal()" class="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-sm font-bold">✕</button>
      </div>

      <div class="space-y-2">
        <label class="text-xs text-slate-300 font-medium block">Backend Server URL:</label>
        <input type="text" id="ios-server-url-input" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none" placeholder="http://172.20.10.4:3000">
        <p class="text-[10px] text-slate-400">Default: <code class="text-emerald-400">http://172.20.10.4:3000</code> or your Cloudflare Tunnel / ngrok URL.</p>
      </div>

      <div class="pt-2 flex gap-2">
        <button onclick="saveServerConfig()" class="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs active:scale-95 transition-all shadow-lg shadow-emerald-900/50">Save & Connect</button>
        <button onclick="testServerConnection()" class="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs active:scale-95 transition-all">Ping</button>
      </div>
    </div>
  </div>
`;

// Add Server Config Trigger into Status Bar or Dynamic Island
const serverConfigScripts = `
  <script>
    function openServerConfigModal() {
      const modal = document.getElementById('ios-server-modal');
      const input = document.getElementById('ios-server-url-input');
      const saved = localStorage.getItem('oliver_server_url') || 'http://172.20.10.4:3000';
      if (input) input.value = saved;
      if (modal) modal.classList.add('active');
    }

    function closeServerConfigModal() {
      const modal = document.getElementById('ios-server-modal');
      if (modal) modal.classList.remove('active');
    }

    function saveServerConfig() {
      const input = document.getElementById('ios-server-url-input');
      if (input && input.value.trim()) {
        const val = input.value.trim().replace(/\\/+$/, '');
        localStorage.setItem('oliver_server_url', val);
        showToast('Server URL saved: ' + val);
        closeServerConfigModal();
      }
    }

    async function testServerConnection() {
      const input = document.getElementById('ios-server-url-input');
      const url = (input && input.value.trim()) || localStorage.getItem('oliver_server_url') || 'http://172.20.10.4:3000';
      showToast('Testing connection to ' + url + '...');
      try {
        const res = await fetch(url + '/api/trpc/auth.me', { method: 'GET', mode: 'cors' });
        if (res.ok || res.status === 200 || res.status === 400) {
          showToast('✅ Server Connected Successfully!');
        } else {
          showToast('⚠️ Server responded with HTTP ' + res.status);
        }
      } catch (err) {
        showToast('❌ Connection failed. Check Wi-Fi connection.');
      }
    }
  </script>
`;

content = content.replace('</body>', `${serverConfigModal}\n${serverConfigScripts}\n</body>`);

fs.writeFileSync(destPath, content, 'utf8');
console.log(`Successfully built native iOS app bundle at: ${destPath}`);
