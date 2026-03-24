# VN Movies HD - Admin App

A React Native (Expo) admin application for managing the VN Movies HD movie website from your Android phone.

## Features

- **Dashboard** — Overview stats: total movies, views, downloads, featured count
- **Movie Management** — Create, edit, delete movies with full form (genres, qualities, languages, download links, screenshots)
- **Analytics** — View top performing movies by views and downloads
- **Site Links** — Manage site navigation links with custom colors

## Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Backend server running (see main project README)

## Quick Start

```bash
cd admin-app

# Install dependencies
npm install

# Start the Expo development server
npx expo start
```

Then either:
- Scan the QR code with **Expo Go** app on your Android phone
- Press `a` to open in an Android emulator

## API Configuration

The app connects to `http://10.0.2.2:5003/api` by default, which is the Android emulator's alias for `localhost`.

### For a physical device on the same Wi-Fi network:

Edit `src/utils/api.js` and change `BASE_URL`:

```js
const BASE_URL = 'http://YOUR_COMPUTER_IP:5003/api';
```

Find your IP:
- Windows: `ipconfig` → look for IPv4 address (e.g. `192.168.1.100`)

### If backend runs on a different port:

Update the port number in the `BASE_URL` accordingly.

## Login Credentials

| Field    | Value      |
|----------|------------|
| Username | `admin`    |
| Password | `admin123` |

## Build APK (Standalone App)

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to Expo account (create one free at expo.dev)
eas login

# Configure build
eas build:configure

# Build Android APK
eas build --platform android --profile preview
```

The APK will be available for download from your Expo dashboard.

## Project Structure

```
admin-app/
├── App.js                    # Navigation: Stack + Bottom Tabs
├── app.json                  # Expo config
├── package.json
├── babel.config.js
└── src/
    ├── utils/
    │   ├── api.js            # Backend API client
    │   └── theme.js          # Color constants
    └── screens/
        ├── LoginScreen.js    # Auth screen
        ├── DashboardScreen.js# Stats overview
        ├── MoviesScreen.js   # Movie list + CRUD
        ├── MovieFormScreen.js# Add/Edit movie form
        ├── AnalyticsScreen.js# View analytics
        └── SiteLinksScreen.js# Manage site links
```
