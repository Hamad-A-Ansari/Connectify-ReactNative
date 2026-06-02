# Connectify

A real-time social networking app built with React Native (Expo), Convex serverless backend, and Clerk authentication. Users can create profiles, share posts, follow others, and interact through likes, comments, and bookmarks.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- [Convex CLI](https://docs.convex.dev/getting-started) (`npm install -g convex`)
- A [Clerk](https://clerk.com/) account with a project configured for Expo/React Native
- iOS Simulator (macOS) or Android Emulator, or a physical device with [Expo Go](https://expo.dev/go)

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd connectify

# Install dependencies
npm install

# Set up environment variables (see below)
cp .env.local.example .env.local

# Deploy the Convex backend
npx convex dev
```

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key from your Clerk dashboard |
| `EXPO_PUBLIC_CONVEX_URL` | Yes | Convex deployment URL (provided after `npx convex dev`) |
| `CONVEX_DEPLOYMENT` | Yes (local) | Convex deployment identifier for local development |
| `CLERK_ISSUER_URL` | Yes (Convex) | Clerk issuer domain — set this in the Convex dashboard under Environment Variables |
| `EXPO_PUBLIC_TOS_URL` | No | Terms of Service URL (defaults to bundled placeholder) |
| `EXPO_PUBLIC_PRIVACY_URL` | No | Privacy Policy URL (defaults to bundled placeholder) |

> **Note:** `CLERK_ISSUER_URL` is a Convex server-side environment variable. Set it in the [Convex dashboard](https://dashboard.convex.dev/) under Settings → Environment Variables rather than in `.env.local`.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   React Native (Expo)                │
│  ┌───────────┐  ┌────────────┐  ┌───────────────┐  │
│  │ Expo Router│  │ Components │  │  Providers    │  │
│  │(file-based)│  │  & Hooks   │  │(Clerk+Convex) │  │
│  └─────┬─────┘  └─────┬──────┘  └───────┬───────┘  │
└────────┼───────────────┼─────────────────┼──────────┘
         │               │                 │
         ▼               ▼                 ▼
┌─────────────────┐  ┌──────────────────────────────┐
│   Expo Router   │  │         Convex Backend        │
│  Navigation     │  │  (serverless functions, DB)   │
└─────────────────┘  └──────────────┬───────────────┘
                                    │
                     ┌──────────────┼──────────────┐
                     ▼              ▼              ▼
              ┌──────────┐  ┌───────────┐  ┌───────────┐
              │  Queries │  │ Mutations │  │  HTTP     │
              │(realtime)│  │  (writes) │  │ (webhooks)│
              └──────────┘  └───────────┘  └───────────┘
```

**Tech Stack:**

- **Frontend:** React Native with [Expo](https://expo.dev/) SDK 52
- **Backend:** [Convex](https://convex.dev/) — serverless database, real-time queries, and mutations
- **Authentication:** [Clerk](https://clerk.com/) with Google SSO via Expo AuthSession
- **Navigation:** [Expo Router](https://docs.expo.dev/router/introduction/) — file-based routing
- **Key Libraries:** expo-image, expo-web-browser, expo-secure-store, date-fns, react-native-reanimated

## Directory Structure

```
app/                 Expo Router pages (file-based routing)
├── (auth)/          Authentication screens (login)
├── (tabs)/          Main tab navigation
│   ├── index.tsx        Feed
│   ├── create.tsx       Create post
│   ├── bookmarks.tsx    Saved bookmarks
│   ├── notifications.tsx Notifications
│   └── profile.tsx      Current user profile
└── user/            Dynamic user profile routes

components/          Reusable React components (Post, Comments, etc.)
constants/           App constants (colors, theme, legal URLs)
convex/              Convex backend functions
├── schema.ts            Database schema
├── posts.ts             Post queries and mutations
├── comments.ts          Comment mutations
├── users.ts             User queries and mutations
├── blocks.ts            Block/unblock system
├── reports.ts           Content reporting
├── bookmarks.ts         Bookmark mutations
├── notifications.ts     Notification queries
├── validation.ts        Shared input validation helpers
└── http.ts              HTTP endpoints (Clerk webhooks)

hooks/               Custom React hooks
lib/                 Utility modules (logger, error formatting)
provider/            Context providers (ClerkAndConvex, Toast)
styles/              StyleSheet definitions
assets/              Static assets (images, fonts, legal pages)
__tests__/           Test files (unit and property-based tests)
```

## Development Workflow

### Running Locally

1. Start the Convex development server (watches for backend changes):

```bash
npx convex dev
```

2. In a separate terminal, start the Expo development server:

```bash
npx expo start
```

3. Run on your target platform:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan the QR code with Expo Go on a physical device

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npx jest
```

### Linting

```bash
npm run lint
```

## Production Deployment

### 1. Set Up Production Environment

- Create a separate Clerk production instance and note the publishable key and issuer URL.
- Create a Convex production deployment:

```bash
npx convex deploy
```

- Set the `CLERK_ISSUER_URL` environment variable in the Convex production dashboard.

### 2. Configure Environment Variables

Update your environment to use production values:

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
EXPO_PUBLIC_CONVEX_URL=https://your-production.convex.cloud
```

### 3. Build for App Stores

```bash
# Build for iOS
npx expo run:ios --configuration Release

# Build for Android
npx expo run:android --variant release
```

For managed workflow builds using EAS:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure and build
eas build --platform ios
eas build --platform android
```

### 4. Submit to Stores

```bash
eas submit --platform ios
eas submit --platform android
```

> **Note:** You need an Apple Developer account ($99/year) or a Google Play Developer account ($25 one-time) to publish to the respective app stores.

## License

This project is private and not licensed for redistribution.
