import type { CapacitorConfig } from "@capacitor/cli";

// The app talks to a live backend for auth + data sync, so instead of bundling a static
// snapshot of `dist` into the APK, we point the WebView at the deployed server. If the
// Render URL ever changes (e.g. renamed, redeployed elsewhere), update `url` and rebuild.
const config: CapacitorConfig = {
  appId: "com.travelexpense.app",
  appName: "旅遊記帳",
  webDir: "dist",
  server: {
    url: "https://travel-expense-tracker-ogrs.onrender.com",
  },
};

export default config;
