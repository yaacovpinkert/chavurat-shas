# chavurat-shas 📖

A cross-platform mobile app for tracking daily study of Jewish texts with intelligent spaced-repetition scheduling. Study the Talmud, Mishna, or Tanakh at your own pace, with automatic review cycles designed to maximize retention.

**Available on:** iOS • Android • Web

---

## ✨ Features

- **Multi-track concurrent study** — Run multiple study programs simultaneously (e.g., daily Mishna + daily Talmud page)
- **5 built-in track types:**
  - משנה יומית (Daily Mishna)
  - פרק יומי במשנה (Daily Mishna chapter)
  - דף יומי בגמרא (Daily Talmud page)
  - עמוד יומי בגמרא (Daily Talmud side/amud)
  - פרק יומי בתנ״ך (Daily Bible chapter)
- **Spaced-repetition scheduling** — Each unit is reviewed 4 times on days 0, 1, 8, and 38 to optimize memory retention
- **Hebrew calendar view** — Navigate study progress by Hebrew date with day-by-day modal details
- **Full RTL support** — Fully Hebrew-localized interface designed for right-to-left reading
- **Local-first data** — All data stored locally (AsyncStorage on native, localStorage on web)
- **Instant visual feedback** — See your progress at a glance with color-coded completion badges

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)

### Installation

```bash
git clone https://github.com/yaacovpinkert/chavurat-shas.git
cd chavurat-shas
npm install
```

### Running the app

**Web (fastest for development):**
```bash
npm run web
```
Opens at http://localhost:8081 — hot reload enabled

**iOS:**
```bash
npm run ios
```
Requires Xcode and iOS simulator

**Android:**
```bash
npm run android
```
Requires Android Studio and Android emulator

**Expo Go (any platform):**
```bash
npm start
```
Scan the QR code with Expo Go app on your phone (iOS or Android)

---

## 📚 How it works

1. **Setup:** On first launch, choose your first study track, set a start date, and pick your starting unit
2. **Daily view:** "היום" tab shows all study items due today, with session indicators (1/4, 2/4, etc.)
3. **Track progress:** Tap an item to mark it complete; the app tracks all 4 sessions automatically
4. **Calendar view:** "לוח שנה" shows a Hebrew calendar with progress overlay — tap a day to see detailed breakdown
5. **Manage tracks:** "הגדרות" lets you add/remove tracks, change types, adjust start dates, or reset progress

**Spaced-review schedule:**
- Session 1 (S1): Day 0 (today)
- Session 2 (S2): Day 1 (tomorrow)
- Session 3 (S3): Day 8 (one week later)
- Session 4 (S4): Day 38 (one month later)

---

## 🛠️ Development

### Project structure

```
src/
├── screens/          # Tab-based screens (Today, Calendar, Settings)
├── components/       # Reusable UI components (pickers, badges, etc.)
├── data/             # Talmud, Mishna, Tanakh structure & indexing
├── tracks/           # Track definitions & abstraction layer
├── store/            # AsyncStorage CRUD + v1→v2 migration logic
└── utils/            # Scheduling, Hebrew calendar, cross-platform dialogs
```

### Commands

```bash
npm start         # Expo dev server
npm run web       # Web dev (fastest iteration)
npm run ios       # iOS simulator
npm run android   # Android emulator
npx tsx scripts/verify.ts  # Validate data counts & Hebrew date logic
```

### Tech stack

- **React Native 0.85.3** — Cross-platform mobile framework
- **Expo 56.0.9** — Managed React Native (no Xcode/Android Studio needed)
- **TypeScript 6.0.3** — Static typing
- **React Navigation** — Tab-based navigation
- **date-fns** — Date utility library
- **AsyncStorage** — Native local persistence
- **Pure-JS Hebrew calendar** — Reingold-Dershowitz algorithm (no external deps)

---

## 🔧 Architecture highlights

### Generic track abstraction
All tracks (Mishna, Talmud, Tanakh) implement the same `TrackDefinition` interface, letting the UI work with any text type without knowing details. New track types can be added by implementing `getUnitByIndex()`, `getIndexForPath()`, and picker levels.

### Spaced-review scheduling
Core scheduling logic in `src/utils/schedule.ts` calculates which units are due on any given date based on:
- Track start date
- Track start unit
- Current date
- Session offsets `{1:0, 2:1, 3:8, 4:38}`

### Cross-platform dialogs
Settings confirmations use a platform-aware helper (`src/utils/dialog.ts`) that routes to `window.confirm()` on web and the native `Alert` on iOS/Android. This works around a react-native-web limitation where `Alert.alert()` with buttons is a no-op.

### Hebrew calendar
Pure JavaScript implementation using the Reingold-Dershowitz algorithm — no external calendar library. Handles leap years, variable-length months (Cheshvan/Kislev), and accurate conversions between Gregorian and Hebrew dates.

---

## 📝 Configuration

### CLAUDE.md
Project conventions and persistent context for AI-assisted development. See the file for build commands, code style, architecture decisions, and gotchas.

### app.json
Expo configuration:
- RTL support enabled (`web.dir: "rtl"`)
- Portrait orientation
- Plugins: `@react-native-community/datetimepicker`, `expo-localization`

---

## 🐛 Known limitations & future work

- Web deployment: Currently tested locally; no Docker or hosted version yet
- Backup/sync: Progress stored only locally; no cloud sync or export
- Offline: App is fully offline-capable but no sync when reconnecting
- Platform support: iOS and Android via Expo; web via metro bundler

---

## 📄 License

This project is open source. Feel free to fork, modify, and deploy for personal or community use.

---

## 🤝 Contributing

Contributions welcome! Whether bug fixes, new track types, UI improvements, or documentation — please open an issue or pull request.

---

**Made with ❤️ for serious Torah learners**

For questions or feedback, reach out at pinkertny@gmail.com
