/**
 * Configuração do app para EAS Update (OTA).
 * projectId: @advances/sigeo-mobile (EAS)
 */
const IS_DEV = process.env.APP_ENV === 'development';
const IS_STAGING = process.env.APP_ENV === 'staging';
const channel = IS_DEV ? 'development' : IS_STAGING ? 'staging' : 'production';

const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID || process.env.EAS_PROJECT_ID || '9c8a0589-7a9e-4952-b7dd-67567d3ed8bb';

module.exports = {
  expo: {
    name: 'SIGEO Mobile',
    slug: 'sigeo-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#0f172a',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.sigeo.mobile',
      infoPlist: {
        NSCameraUsageDescription: 'SIGEO precisa da câmera para registrar fotos de serviço.',
        NSLocationWhenInUseUsageDescription: 'SIGEO precisa da localização para registro de ponto e fotos.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0f172a',
      },
      package: 'com.sigeo.mobile',
      permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'CAMERA'],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    updates: {
      enabled: true,
      url: `https://u.expo.dev/${projectId}`,
      fallbackToCacheTimeout: 0,
      checkAutomatically: 'ON_LOAD',
      requestHeaders: {
        'expo-channel-name': channel,
      },
    },
    extra: {
      eas: {
        projectId,
      },
    },
  },
};
