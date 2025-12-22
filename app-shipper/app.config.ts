import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  let googleMapsApiKey =
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    // fallback: keep whatever is already in app.json
    (config.ios?.config as any)?.googleMapsApiKey ||
    (config.android?.config as any)?.googleMaps?.apiKey ||
    '';

  // Ignore obvious placeholder keys so we don't accidentally ship/dev-run with an invalid key.
  if (
    typeof googleMapsApiKey === 'string' &&
    (googleMapsApiKey.includes('YourGoogleMapsAPIKeyHere') ||
      googleMapsApiKey === 'YOUR_GOOGLE_MAPS_API_KEY')
  ) {
    googleMapsApiKey = '';
  }

  return {
    ...config,
    ios: {
      ...config.ios,
      config: {
        ...(config.ios?.config ?? {}),
        googleMapsApiKey,
      },
    },
    android: {
      ...config.android,
      config: {
        ...(config.android?.config ?? {}),
        googleMaps: {
          ...((config.android?.config as any)?.googleMaps ?? {}),
          apiKey: googleMapsApiKey,
        },
      },
    },
    extra: {
      ...(config.extra ?? {}),
      googleMapsApiKey,
    },
  };
};
