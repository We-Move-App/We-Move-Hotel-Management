import { useEffect } from "react";

const SCRIPT_URL =
  "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";

export default function GoogleTranslateLoaderSafe({
  targetId = "google_translate_element",
  includedLanguages = "en,fr",
  timeoutMs = 15000,
  pollInterval = 250,
}) {
  useEffect(() => {
    let cancelled = false;
    if (window.__google_translate_inited_for === targetId) return;

    function tryInit() {
      try {
        const TranslateElement = window?.google?.translate?.TranslateElement;
        if (!TranslateElement) return false;

        const opts = { pageLanguage: "en", includedLanguages };
        const InlineLayout = TranslateElement?.InlineLayout;
        if (InlineLayout && InlineLayout.SIMPLE !== undefined)
          opts.layout = InlineLayout.SIMPLE;

        new TranslateElement(opts, targetId);
        window.__google_translate_inited_for = targetId;
        return true;
      } catch (err) {
        // console.warn("tryInit error", err);
        return false;
      }
    }

    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = function () {
        tryInit();
      };
    }

    if (
      !document.querySelector(
        `script[src^="https://translate.google.com/translate_a/element.js"]`
      )
    ) {
      const s = document.createElement("script");
      s.src = SCRIPT_URL;
      s.async = true;
      s.defer = true;
      s.onload = () => tryInit();
      s.onerror = (e) =>
        console.error("Failed to load Google Translate script:", e);
      document.body.appendChild(s);
    } else {
      tryInit();
    }

    const start = Date.now();
    const iv = setInterval(() => {
      if (cancelled) return clearInterval(iv);
      if (window.__google_translate_inited_for === targetId) {
        clearInterval(iv);
        return;
      }
      if (tryInit()) {
        clearInterval(iv);
        return;
      }
      if (Date.now() - start > timeoutMs) {
        clearInterval(iv);
        console.error(
          `Google Translate: timed out after ${timeoutMs}ms — TranslateElement missing.`
        );
      }
    }, pollInterval);

    return () => {
      cancelled = true;
    };
  }, [targetId, includedLanguages, timeoutMs, pollInterval]);

  return null;
}
