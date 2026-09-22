# TaskFlow Mobile Client (React Native / Expo)

A cross-platform iOS & Android mobile application for the MERN Task Manager built with **React Native**, **Expo**, **React Navigation**, and **Axios**.

## Architecture & Features
- **Cross-Platform**: Supports native iOS and Android with platform-aware networking (`10.0.2.2` for Android emulator, `localhost` for iOS simulator).
- **Authentication**: JWT-based session management using React Context and automatic `x-auth-token` HTTP header interception.
- **Task Management**:
  - Filter by status tabs: `All`, `To-Do`, `In Progress`, `Done`.
  - Color-coded priority badges (`High`, `Medium`, `Low`).
  - Native bottom-sheet modal for task creation and editing.
  - Pull-to-refresh and one-tap status cycle progression.

## Setup & Running

```bash
cd mobile
npm install
npm start
```

Press `a` for Android Emulator, `i` for iOS Simulator, or scan the QR code with Expo Go on your physical device.
