import React, { useEffect, useRef, useState } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import styles from "./language-selector.module.css";

const languages = [
  { code: "EN", name: "English", value: "en", flag: "🇬🇧" },
  { code: "FR", name: "Français", value: "fr", flag: "🇫🇷" },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[1]);
  const dropdownRef = useRef(null);

  // Load saved language
  useEffect(() => {
    const saved = localStorage.getItem("preferred_lang");
    if (saved) {
      const found = languages.find((l) => l.value === saved);
      if (found) {
        setSelectedLanguage(found);
        i18n.changeLanguage(found.value);
      }
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function handleLanguageSelect(langValue) {
    const langObj = languages.find((l) => l.value === langValue);
    if (!langObj) return;

    setSelectedLanguage(langObj);
    localStorage.setItem("preferred_lang", langValue);

    // THIS IS THE CORE
    i18n.changeLanguage(langValue);

    setIsOpen(false);
  }

  return (
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
        <div className={styles.menu} role="menu">
          {languages.map((language) => {
            const isSelected = selectedLanguage.value === language.value;

            return (
              <button
                key={language.value}
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={() => handleLanguageSelect(language.value)}
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
  );
}
