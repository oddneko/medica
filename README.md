<h1><img src="assets/medica.svg" alt="MEDICA logo" width="42" height="42" align="center"> MEDICA</h1>

**An offline-first medicine tracker for keeping schedules, doses, and personal records on your device.**

## Features

- **Medicine schedules:** Record a medicine's name, photo, dosage, time, daily schedule, or selected weekdays.
- **Dose tracking:** Mark a dose as taken and review today's dose history.
- **Archive and restore:** Archive medicines that are no longer active, then restore them from Settings when needed.
- **Local-first storage:** Medicine records and dose history are stored in IndexedDB. Profile preferences are stored in the browser's local storage.
- **Works offline:** The app shell is cached by a service worker and can be installed as a Progressive Web App (PWA) in supported browsers.
- **Language choice:** Choose English, Spanish, French, German, or Hindi during setup or in Settings. The choice is saved locally, and text-to-speech uses the selected language when a matching browser voice is available.
- **Text-to-speech:** Optional voice assistance reads medicine information and dose confirmations aloud using the browser's speech synthesis support.
- **Data exports:** Export dose history as CSV, or export a JSON backup containing the profile, medicines, and dose logs.
- **Delete all data:** Settings includes a confirmed action to clear the app's profile, medicines, and dose history from the device.

## Accessibility

- Forms use visible labels and standard browser controls.
- Buttons and touch targets are sized for straightforward use on phones and tablets.
- The medicine photo picker can be opened by keyboard, and the dashboard dialog can be closed with Escape.
- Animated backgrounds are disabled when the device requests reduced motion.
- Optional text-to-speech provides spoken medicine details and dose confirmations.

## Run locally

Serve the project directory over HTTP. A local server allows browser features such as IndexedDB and the service worker to work as intended.

```sh
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000). The app starts at `index.html` and guides first-time users through setup.

## Data and backups

All tracking data stays in the browser on the current device unless you export it. Use **Export Backup as JSON** in Settings for a backup of the profile, medicines (including archived medicines), and dose history. **Export Logs as CSV** exports dose history for use in a spreadsheet. Keep exported files somewhere safe; deleting browser data or using **Delete All Data** removes the local copy.

## Future plans

- More language support
- Cloud backup database 
- Optional AI integrations

## Project files

- `index.html` — medicine dashboard
- `landing-1.html`, `landing-2.html`, `landing-3.html` — first-run onboarding
- `landing-welcome.html` — short welcome screen on later launches
- `settings.html` — profile, language, archived medicines, and data exports
- `js/medicine-db.js` — IndexedDB storage
- `js/i18n.js` — bundled offline interface translations
- `sw.js` — service worker and offline app-shell cache
