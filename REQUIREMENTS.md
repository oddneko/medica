# Requirements: Local-First Tracking App

*Living document, last updated November 21, 2026*

## 1. Core requirements

| # | Requirement | Status |
| --- | --- | --- |
| R1 | Local-first, lightweight tracking app | Confirmed |
| R2 | Cloud service used only for backing up local data | Confirmed |
| R3 | Text-to-speech (TTS) support | Confirmed |
| R4 | Camera capture to identify a medicine's name and log it | Optional (AI-assisted) |
| R5 | Read a medical prescription and create a timetable automatically | Optional (AI-assisted) |
| R6 | Offline language localisation: use the device language, with a manual language choice | Confirmed |
| R7 | Notification service for dose reminders | Confirmed |

## 2. Requirement details

### R1. Local-first, lightweight tracking app

- The device's own database is the primary copy of the data.
- The app must work fully offline, with no waiting on the network.
- Keep the app small and fast: minimal dependencies, quick load, low resource use.
- Deployable as a web app, ideally installable as a PWA (web manifest plus service worker).
- **Purpose:** medicine tracking for elderly users, so the interface must be simple to use.

**Approach discussed:** IndexedDB for storage (Dexie.js as a wrapper), service worker to cache app files, versioned local schema so updates can migrate data safely.

### R2. Cloud backup only

- The cloud exists only to back up local data and restore it, including onto another device.
- The app never depends on the cloud to function.
- Sign-in is needed only for backup, so people can use the app without an account.

**Approach discussed:**

- Snapshot backup (export JSON, upload, restore) for small datasets, or incremental sync (UUID per record, `updated_at`, soft-delete flag, change queue) for multi-device use.
- Supabase (auth, Postgres, row-level security) or Firebase as the backend; Dexie Cloud as a turnkey option.
- Request persistent storage with `navigator.storage.persist()`, since browsers can clear local data.
- Back up automatically (on open, after changes, when back online) and show sync status.
- Offer a manual JSON or CSV export as a safety net.

### R3. Text-to-speech

- The app can read text aloud.
- Should work offline where possible.

**Approach discussed:**

- Start with the browser's Web Speech API (`speechSynthesis`) using on-device voices (`localService`).
- Trigger speech from a user tap, handle async voice loading, and split long text into sentence chunks.
- Add a settings screen: voice, speed, and a test button.
- Hide or disable the feature if the browser lacks support.
- Upgrade path if quality is lacking: pre-generated audio for fixed phrases, an on-device neural model (Piper or Kokoro), or cloud TTS through the backend with cached audio.

### R4. Camera capture and medicine identification

- The app can use the device camera to capture an image of a medicine (box, bottle or label).
- The medicine's name is identified from the image and logged, so the person does not have to type it.
- Optional AI assistance, off by default. Initially everything is manual and offline.
- The manual path always works without the camera or AI.

**Proposed approach:**

- Capture with `getUserMedia` (live camera, needs HTTPS and a permission prompt) or an `<input type="file" accept="image/*" capture="environment">` field, which opens the native camera and is simpler on phones.
- Read the name from the label text: on-device OCR (for example Tesseract.js) keeps images on the phone, while a cloud vision model is more accurate but sends the image off the device.
- Match the detected text against the person's own medicine list first, which cuts errors.
- Always show the detected name for the person to confirm or correct before saving. A wrong match must never be logged silently.

### R5. Prescription reading and automatic timetable

- The app reads a photo of a medical prescription and extracts the medicine names, doses and schedule.
- It then builds a medicine timetable for the user.
- Optional AI assistance, off by default. Until then, timetables are entered by hand.

**Proposed approach:**

- Plain OCR struggles with handwriting and abbreviations such as "BD" or "TID", so a vision-language model is the better fit for extraction.
- Show the result as an editable draft. The timetable is created only after the user, or a caregiver, confirms it.
- AI extraction needs an internet connection and the person's consent to send the image. Call the model from the backend, never with a key inside the browser app.
- This conflicts with R2 (cloud used only for backup), so it needs a decision (see open questions).
- A timetable makes dose reminders more important; see R7.

### R6. Language localisation (offline)

- The app opens in the device's language when that language is supported.
- If the device language is English (or any supported language), the person can still choose another language in settings.
- No online service is needed: all translations ship with the app.

**Proposed approach:**

- Detect the language with `navigator.languages`, match it to the supported list, fall back to English, and store a manual choice in local settings so it overrides detection.
- Bundle one translation file per language and cache them all in the service worker.
- Use the browser's `Intl` APIs for dates, times, numbers and plurals, which work offline.
- Show each language's name in its own script in the picker (for example "Español", "हिन्दी").
- Use human-reviewed translations for medical wording; do not machine-translate at runtime.
- Set the text-to-speech voice language (R3) to match the chosen language, and check that a local voice exists.

### R7. Notification service

- The app notifies the person on their device when a dose is due, based on the medicine timetable.
- Reminders must not break the offline-first rule: the timetable stays local.
- The main design question is reliability, because a browser cannot reliably schedule a notification while the app is closed.

**Options:**

| Option | Works when app is closed | Needs internet and account | Notes |
| --- | --- | --- | --- |
| Local notifications from the service worker (`showNotification`) | No | No | Fully offline. Fires only while the app or its service worker is alive. |
| Best effort: in-app banner plus Periodic Background Sync | Sometimes | No | Installed Chromium PWAs only, and the browser picks the timing. |
| Web Push from a backend | Yes | Yes | Dependable, but the server stores the schedule. Conflicts with R2 (cloud only for backup). |
| Native wrapper (for example Capacitor) with local notifications | Yes | No | Dependable and offline, but needs an app-store build. |

**Proposed approach:**

- Ask for notification permission from a tap, and explain why. Show a warning in the app if notifications are blocked.
- With Web Push, keep the message generic and build the text on the device from local data, so the server never sees medicine names.
- Add action buttons such as "Taken" and "Snooze" where supported; iOS does not support them.
- On iOS, notifications work only for apps installed to the home screen (iOS 16.4 or later).
- Read the reminder aloud with text-to-speech (R3) when the app opens or the notification is tapped; speech cannot run in the service worker.

### Delivery phases

1. **Phase 1:** everything manual and offline: local storage, manual logging and timetables, backup and text-to-speech (R1 to R3).
2. **Phase 2:** optional AI assistance, off by default: camera identification and prescription reading (R4 and R5).

## 3. Under consideration (not yet requirements)

- **None at the moment.** Reminder notifications moved to R7.

## 4. Open questions

1. What does the app track, and how much data per user (hundreds of records, tens of thousands, or photos and files)?
2. Will people use more than one device at the same time, or is backup and restore enough?
3. Is the tracked data sensitive enough to justify end-to-end encryption of backups?
4. What should TTS read: short alerts and confirmations, or longer notes and summaries?
5. How reliable must reminders be: is a few minutes late acceptable, and is an occasional missed one acceptable?
6. Is taking a photo to log a dose (with no AI) part of Phase 1, or only part of the optional AI features?
7. Which AI route: on-device OCR (private, works offline, less accurate) or a cloud vision model (more accurate, needs internet, breaks "cloud only for backup")?
8. Should the photo be kept as a record of the dose, or discarded once the name is read?
9. Who confirms AI results and timetables: the elderly person, or a caregiver or family member?
10. Identify medicines by label text only, or also by pill appearance (much harder, with a higher risk of errors)?
11. Which platforms must reminders work on: Android, iPhone, desktop, or all?
12. Is it acceptable to ship a native wrapper (for dependable offline reminders), or must it stay a pure web app?

## 5. Candidate stack

React or plain JS, Dexie (IndexedDB), service worker/PWA, Supabase for backup, deployed on Vercel or Netlify. Treat this as a starting point until the open questions are answered.

## 6. Change log

- **Nov 21, 2026:** Document created with requirements R1 to R3.
- **Nov 21, 2026:** Added R4 (camera identification) and R5 (prescription reading and timetable) as optional AI assistance, plus delivery phases and open questions.
- **Nov 21, 2026:** Added R6, offline language localisation with a manual language choice.
- **Nov 21, 2026:** Added R7, notification service for dose reminders; moved it out of "under consideration".
