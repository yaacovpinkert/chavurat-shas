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
- **Per-track book/tractate selection** — Choose exactly which masechtot or books to include in each track; the scheduler maps through your selection seamlessly
- **Spaced-repetition scheduling** — Each unit is reviewed 5 times on days 0, 1, 8, 38, and 128 to optimize long-term retention
- **Hebrew calendar date picker** — Set your start date by picking directly from a Hebrew calendar view
- **Hebrew calendar overview** — Navigate study progress by Hebrew date with day-by-day modal details
- **Progress tracking** — See completion count and percentage per track in the settings screen
- **Full RTL support** — Fully Hebrew-localized interface designed for right-to-left reading
- **Warm traditional theme** — Parchment background, warm gold accents, and Heebo typography
- **Local-first data** — All data stored on-device (AsyncStorage on native, localStorage on web); no account or server required
- **Instant visual feedback** — Color-coded session badges (1/5 through 5/5) and a daily progress ring

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

1. **Setup:** On first launch, choose your study track, pick a start date on the Hebrew calendar, and select which masechtot or books to include
2. **Daily view:** "היום" tab shows all study items due today, with session indicators (1/5, 2/5, etc.) and a progress ring
3. **Track progress:** Tap an item to mark it complete; the app tracks all 5 sessions automatically
4. **Calendar view:** "לוח שנה" shows a Hebrew calendar with progress overlay — tap a day to see detailed breakdown
5. **Manage tracks:** "הגדרות" lets you add/remove tracks, change types, adjust start dates, change masechtot/books, and see per-track completion stats

**Spaced-review schedule:**
- Session 1 (S1): Day 0 (today)
- Session 2 (S2): Day 1 (tomorrow)
- Session 3 (S3): Day 8 (one week later)
- Session 4 (S4): Day 38 (~one month later)
- Session 5 (S5): Day 128 (~three months later)

---

## 🐛 Known limitations & future work

- Backup/sync: Progress stored only locally; no cloud sync or export
- Offline: App is fully offline-capable but has no sync when reconnecting
- Platform support: iOS and Android via Expo; web via Metro bundler

---

**Made with ❤️ for Torah learners**

For questions or feedback, reach out at pinkertny@gmail.com
