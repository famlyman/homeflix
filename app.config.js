import 'dotenv/config';

export default {
  expo: {
    name: "homeflix",
    slug: "homeflix",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/icon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash.jpg",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      CLIENT_ID: process.env.CLIENT_ID,
      CLIENT_SECRET: process.env.CLIENT_SECRET,
      TMDB_API: process.env.TMDB_API,
      PREMIUMIZE_CLIENT_ID: process.env.PREMIUMIZE_CLIENT_ID,
      PREMIUMIZE_CLIENT_SECRET: process.env.PREMIUMIZE_CLIENT_SECRET,
      SCRAPINGBEE_API_KEY: process.env.SCRAPINGBEE_API_KEY,
      eas: {
        projectId: process.env.PROJECT_ID
      }
    }
  }
} 