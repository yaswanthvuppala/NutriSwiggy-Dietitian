import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Preferences } from '@capacitor/preferences';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export const NativeBridge = {
  /**
   * Returns true if running inside native Android or iOS Capacitor wrapper
   */
  isNative(): boolean {
    return Capacitor.isNativePlatform();
  },

  /**
   * Get device GPS coordinates with fallback to Web Geolocation API
   */
  async getCurrentLocation(): Promise<LocationCoords | null> {
    try {
      if (this.isNative()) {
        const permission = await Geolocation.checkPermissions();
        if (permission.location !== 'granted') {
          const req = await Geolocation.requestPermissions();
          if (req.location !== 'granted') {
            return null;
          }
        }
        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });
        return {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
      } else if (typeof window !== 'undefined' && 'geolocation' in navigator) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            () => resolve(null),
            { timeout: 8000 }
          );
        });
      }
      return null;
    } catch (e) {
      console.warn('Geolocation error:', e);
      return null;
    }
  },

  /**
   * Capture a photo of food or meal with camera / gallery
   */
  async captureMealPhoto(): Promise<string | null> {
    try {
      if (this.isNative()) {
        const image = await Camera.getPhoto({
          quality: 85,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Prompt,
        });
        return image.base64String ? `data:image/jpeg;base64,${image.base64String}` : null;
      } else {
        // Web fallback: return null to let file input handle it
        return null;
      }
    } catch (e) {
      console.warn('Camera capture error or cancelled:', e);
      return null;
    }
  },

  /**
   * Provide tactile haptic feedback for mobile interactions
   */
  async triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium') {
    if (!this.isNative()) return;
    try {
      if (type === 'light') await Haptics.impact({ style: ImpactStyle.Light });
      else if (type === 'medium') await Haptics.impact({ style: ImpactStyle.Medium });
      else if (type === 'heavy') await Haptics.impact({ style: ImpactStyle.Heavy });
      else if (type === 'success') await Haptics.notification({ type: NotificationType.Success });
      else if (type === 'warning') await Haptics.notification({ type: NotificationType.Warning });
      else if (type === 'error') await Haptics.notification({ type: NotificationType.Error });
    } catch {
      // Ignore haptic errors on unsupported hardware
    }
  },

  /**
   * Launch official Swiggy checkout page or native app via deep link
   */
  async openSwiggyCheckout(url: string = 'https://www.swiggy.com/checkout') {
    await this.triggerHaptic('success');
    if (this.isNative()) {
      try {
        // Try opening in external browser or Swiggy app handler
        await Browser.open({ url, windowName: '_system' });
      } catch {
        window.open(url, '_blank');
      }
    } else {
      window.open(url, '_blank');
    }
  },

  /**
   * Open OAuth login window in Chrome Custom Tab
   */
  async openOAuthLogin(authUrl: string) {
    if (this.isNative()) {
      await Browser.open({ url: authUrl, windowName: '_blank' });
    } else {
      window.location.href = authUrl;
    }
  },

  /**
   * Setup listener for deep link callbacks (e.g. nutriswiggy://auth-success?session_id=...)
   */
  setupDeepLinkListener(onAuthCallback: (url: string) => void) {
    if (this.isNative()) {
      CapApp.addListener('appUrlOpen', (event) => {
        if (event.url && (event.url.startsWith('nutriswiggy://') || event.url.includes('callback'))) {
          Browser.close().catch(() => {});
          onAuthCallback(event.url);
        }
      });
    }
  },

  /**
   * Save session token securely
   */
  async setSessionToken(token: string) {
    if (this.isNative()) {
      await Preferences.set({ key: 'swiggy_mcp_session', value: token });
    } else if (typeof window !== 'undefined') {
      localStorage.setItem('swiggy_mcp_session', token);
    }
  },

  /**
   * Get saved session token
   */
  async getSessionToken(): Promise<string | null> {
    if (this.isNative()) {
      const res = await Preferences.get({ key: 'swiggy_mcp_session' });
      return res.value;
    } else if (typeof window !== 'undefined') {
      return localStorage.getItem('swiggy_mcp_session');
    }
    return null;
  },

  /**
   * Clear session token
   */
  async clearSessionToken() {
    if (this.isNative()) {
      await Preferences.remove({ key: 'swiggy_mcp_session' });
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('swiggy_mcp_session');
    }
  }
};
