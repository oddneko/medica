/*
 * Text-to-Speech (TTS) engine using the Web Speech API.
 * Works on Chrome for Android, Safari iOS (iOS 7+), Firefox, Edge.
 *
 * Key design decisions for phone compatibility:
 *  - The dashboard attempts to speak automatically on launch. Some browsers
 *    may still require a user gesture before allowing speech playback.
 *  - Android Chrome may cancel long utterances; we split long strings into
 *    sentence-sized chunks and queue them.
 *  - We expose a simple global `TTS` object so any page can call TTS.speak().
 */

// ── Service Worker Registration (PWA) ────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => {
        console.log('[SW] Registered, scope:', reg.scope);
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      })
      .catch((err) => {
        console.warn('[SW] Registration failed:', err);
      });
  });
}

// ── TTS Engine ───────────────────────────────────────────────────────────────

(function () {
  const TTS_KEY = 'tts_enabled';

  // Check if the browser supports SpeechSynthesis
  const supported = 'speechSynthesis' in window;

  // Whether TTS is enabled from user preference
  function isEnabled() {
    return localStorage.getItem(TTS_KEY) === 'yes';
  }

  // Split text into sentence chunks to avoid Android cut-off bug
  function chunkText(text) {
    return text.match(/[^.!?]+[.!?]*/g) || [text];
  }

  // Speak a string. Browsers may block calls made before user activation.
  let warmUpDone = false;

  function warmUp() {
    if (!supported || warmUpDone) return;
    warmUpDone = true;
    // Attempt an empty utterance to initialize speech on browsers that allow it.
    const silence = new SpeechSynthesisUtterance('');
    silence.volume = 0;
    window.speechSynthesis.speak(silence);
  }

  // Initialize speech on first interaction as a compatibility fallback.
  function attachWarmUp() {
    const events = ['touchstart', 'click', 'keydown'];
    function handleFirst() {
      warmUp();
      events.forEach(ev => document.removeEventListener(ev, handleFirst));
    }
    events.forEach(ev => document.addEventListener(ev, handleFirst, { once: false }));
  }

  function speak(text, options = {}) {
    if (!supported) return;
    if (!isEnabled()) return;

    // Cancel anything currently speaking
    window.speechSynthesis.cancel();

    const chunks = chunkText(String(text || ''));
    const lang = options.lang || localStorage.getItem('language') || 'en';

    // Map our language codes to BCP-47 locale tags
    const localeMap = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'hi': 'hi-IN'
    };
    const locale = localeMap[lang] || 'en-US';

    chunks.forEach((chunk, i) => {
      const utter = new SpeechSynthesisUtterance(chunk.trim());
      utter.lang = locale;
      utter.rate = options.rate || 0.95;    // slightly slower than default for elderly users
      utter.pitch = options.pitch || 1;
      utter.volume = options.volume || 1;

      // Chrome Android bug: speechSynthesis pauses after ~15 s.
      // Restart it on each boundary event.
      utter.onboundary = () => {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      };

      window.speechSynthesis.speak(utter);
    });
  }

  function stop() {
    if (!supported) return;
    window.speechSynthesis.cancel();
  }

  // Expose global API
  window.TTS = { speak, stop, isEnabled, supported };

  // Attach the iOS warm-up gesture listener as early as possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachWarmUp);
  } else {
    attachWarmUp();
  }
})();
