# Transjakarta Fleet Management App

A React Native mobile application for managing vehicle fleets using the MBTA API. This app provides real-time tracking, filtering, and detailed information about the fleet with support for multiple languages and themes.

## Features

- **Vehicle List**: Displays a list of vehicles with real-time status, coordinates, and last update time.
- **Pagination**: Loads 10 vehicles per fetch with infinite scroll.
- **Pull-to-Refresh**: Refresh the vehicle list easily.
- **Filters**: Filter vehicles by multiple Routes and Trips.
- **Search**: Search vehicles by ID or label.
- **Vehicle Details**: Detailed view of each vehicle including its current position on a map.
- **Map Integration**: Visualizes vehicle location using Google Maps.
- **Localization**: Support for English and Indonesian languages.
- **Theme Support**: Light and Dark mode support with persistent preferences.
- **TypeScript**: Built with strong typing for better maintainability.

## Tech Stack

- **React Native**: 0.79.0
- **TypeScript**: For type safety.
- **React Navigation**: For screen transitions.
- **React Native Maps**: For map visualization.
- **i18next**: For internationalization.
- **AsyncStorage**: For local data persistence (theme preferences).
- **MBTA V3 API**: Data source.

## Architecture

The project follows a clean and modular architecture. For a detailed breakdown, see [architecture.md](./architecture.md).

- `src/components`: Reusable UI components.
- `src/screens`: Main application screens (Home, Detail, Filter, Splash).
- `src/services`: API service layer for data fetching.
- `src/types`: TypeScript interfaces and types.
- `src/theme`: Theme configuration and Context provider.
- `src/languages`: Localization files and configuration.
- `src/navigation`: Navigation configuration.

## Prerequisites

- Node.js > 18
- Yarn (preferred package manager)
- React Native CLI
- Android Studio / Xcode (for emulators)
- CocoaPods (for iOS)

## Environment Setup

This project uses `react-native-config` to manage environment variables.

1. **Create a `.env` file** in the root directory:

   ```bash
   cp .env.example .env
   ```

2. **Configure your API Keys**:
   Open the `.env` file and provide your Google Maps API Key:
   - `GOOGLE_MAPS_API_KEY`: Required for Google Maps to render on Android.

## Getting Started

1. **Clone the repository**:

   ```bash
   git clone https://github.com/ivanarifin/Transjakarta.git
   cd Transjakarta
   ```

2. **Install dependencies**:

   ```bash
   yarn install
   ```

3. **iOS Setup**:

   ```bash
   cd ios && pod install && cd ..
   ```

4. **Run the application**:
   - **Android**:
     ```bash
     yarn android
     ```
   - **iOS**:
     ```bash
     yarn ios
     ```

## Localization

The app supports multiple languages using `i18next`.

- **Indonesian (Default)**
- **English**

Translation files are located in `src/languages/`.

## Themes

The app supports Light and Dark modes. Theme preferences are saved locally using `AsyncStorage`.

- Theme configuration: `src/theme/colors.ts`
- Theme logic: `src/theme/ThemeContext.tsx`

## Notes

- Google Maps requires a valid API key configured in `AndroidManifest.xml` and `AppDelegate.mm` for production use.
