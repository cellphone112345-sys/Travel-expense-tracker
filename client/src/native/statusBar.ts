import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

/**
 * Android draws the WebView edge-to-edge by default, so without this the status bar
 * overlaps the app's top content. No-op on web/PWA — only runs inside the native shell.
 */
export async function configureStatusBar(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await StatusBar.setOverlaysWebView({ overlay: false });
  await StatusBar.setStyle({ style: Style.Light });
  await StatusBar.setBackgroundColor({ color: "#4f46e5" });
}
