import type { CapacitorConfig } from "@capacitor/cli";

// The app talks to a live backend for auth + data sync, so instead of bundling a static
// snapshot of `dist` into the APK, we point the WebView at the running server. Today
// that's the LAN address (only reachable on the same WiFi); once the backend is deployed
// (see docs/DEPLOYMENT.md), change `url` to the public address and rebuild the APK.
const config: CapacitorConfig = {
  appId: "com.travelexpense.app",
  appName: "旅遊記帳",
  webDir: "dist",
  server: {
    url: "http://192.168.22.11:4000",
    cleartext: true,
  },
};

export default config;
