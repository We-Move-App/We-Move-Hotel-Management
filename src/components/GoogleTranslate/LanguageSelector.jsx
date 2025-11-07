import React, { useEffect, useRef, useState } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import GoogleTranslateLoaderSafe from "./GoogleTrnslateLoaderSafe";
import styles from "./language-selector.module.css";

const languages = [
  { code: "EN", name: "English", googleCode: "en", flag: "🇬🇧" },
  { code: "FR", name: "Français", googleCode: "fr", flag: "🇫🇷" },
];

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const saved = localStorage.getItem("preferred_lang_code");
    if (saved) {
      const found = languages.find((l) => l.googleCode === saved);
      if (found) setSelectedLanguage(found);
    }
  }, []);

  useEffect(() => {
    function onDocClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function applyTranslation(googleCode) {
    try {
      const select = document.querySelector("#google_translate_element select");
      if (select) {
        select.value = googleCode;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      }
    } catch (e) {
      // ignore
    }

    try {
      const from = "en";
      const to = googleCode;
      document.cookie = `googtrans=/${from}/${to};path=/;domain=${window.location.hostname};`;
      document.cookie = `googtrans=/${from}/${to};path=/;`;
      window.location.reload();
      return true;
    } catch (e) {
      console.error("Fallback translation failed:", e);
      return false;
    }
  }

  function handleLanguageSelect(googleCode) {
    const langObj = languages.find((l) => l.googleCode === googleCode);
    if (!langObj) return;
    setSelectedLanguage(langObj);
    localStorage.setItem("preferred_lang_code", googleCode);
    setIsOpen(false);

    setTimeout(() => {
      applyTranslation(googleCode);
    }, 150);
  }

  return (
    <>
      <div id="google_translate_element" style={{ display: "none" }} />

      <GoogleTranslateLoaderSafe
        targetId="google_translate_element"
        includedLanguages={languages.map((l) => l.googleCode).join(",")}
      />

      <div className={styles.container} ref={dropdownRef}>
        <button
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label="Select language"
          onClick={() => setIsOpen((s) => !s)}
          className={styles.toggleButton}
        >
          <Globe className={styles.icon} />
          <span className={styles.codeText}>{selectedLanguage.code}</span>
          <ChevronDown
            className={`${styles.chev} ${isOpen ? styles.rotate : ""}`}
          />
        </button>

        {isOpen && (
          <div className={styles.menu} role="menu" aria-label="Language menu">
            {languages.map((language) => {
              const isSelected = selectedLanguage.code === language.code;
              return (
                <button
                  key={language.code}
                  role="menuitemradio"
                  aria-checked={isSelected}
                  onClick={() => handleLanguageSelect(language.googleCode)}
                  className={`${styles.menuItem} ${
                    isSelected ? styles.selected : ""
                  }`}
                >
                  <span className={styles.flag}>{language.flag}</span>
                  <div className={styles.labelWrap}>
                    <span className={styles.label}>{language.name}</span>
                    <span className={styles.subLabel}>{language.code}</span>
                  </div>
                  {isSelected && <Check className={styles.check} />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
