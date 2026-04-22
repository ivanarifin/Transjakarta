# Transjakarta Fleet Management App

A React Native mobile application for managing vehicle fleets using the MBTA API.

## Features

- **Vehicle List**: Displays a list of vehicles with real-time status, coordinates, and last update time.
- **Pagination**: Loads 10 vehicles per fetch with infinite scroll.
- **Pull-to-Refresh**: Refresh the vehicle list easily.
- **Filters**: Filter vehicles by multiple Routes and Trips (Bonus).
- **Vehicle Details**: Detailed view of each vehicle including its current position on a map.
- **Map Integration**: Visualizes vehicle location using Google Maps (Bonus).
- **TypeScript**: Built with strong typing for better maintainability (Bonus).

## Tech Stack

- **React Native**: 0.79.0
- **TypeScript**: For type safety.
- **React Navigation**: For screen transitions.
- **React Native Maps**: For map visualization.
- **MBTA V3 API**: Data source.

## Architecture

The project follows a clean and modular architecture:
- `src/components`: Reusable UI components.
- `src/screens`: Main application screens (Home, Detail, Filter).
- `src/services`: API service layer for data fetching.
- `src/types`: TypeScript interfaces and types.
- `src/hooks`: Custom React hooks for shared logic.
- `src/navigation`: Navigation configuration.

## Prerequisites

- Node.js > 18
- React Native CLI
- Android Studio / Xcode (for emulators)
- CocoaPods (for iOS)

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ivanarifin/Transjakarta.git
   cd Transjakarta
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **iOS Setup**:
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Run the application**:
   - **Android**:
     ```bash
     npx react-native run-android
     ```
   - **iOS**:
     ```bash
     npx react-native run-ios
     ```

## Notes

- This application uses the public MBTA API. No API key is required for basic usage, but rate limits may apply.
- Google Maps requires a valid API key configured in `AndroidManifest.xml` and `AppDelegate.mm` for production use.
