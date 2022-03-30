/***
 * Copyright 2018-2022 bluefox <dogafox@gmail.com>
 *
 * MIT License
 *
 ***/

 /**
  * Translation string management.
  */
class I18n {
    /**
     * List of all languages with their translations.
     * @type {{ [lang in ioBroker.Languages]?: Record<string, string>; }}
     */
    static translations = {};

    /**
     * The currently displayed language.
     * @type {ioBroker.Languages}
     */
    static lang = window.sysLang || 'en';

    static _disableWarning = false;

    /**
     * Set the language to display.
     * @param {ioBroker.Languages} lang
     */
    static setLanguage(lang) {
        if (lang) {
            I18n.lang = lang;
        }
    }

     /**
      * Add translations
      * User can provide two types of structures:
      * - {"word1": "translated word1", "word2": "translated word2"}, but in this case the lang must be provided
      * - {"word1": {"en": "translated en word1", "de": "translated de word1"}, "word2": {"en": "translated en word2", "de": "translated de word2"}}, but no lang must be provided
      * @param {object} words additional words for specific language
      * @param {ioBroker.Languages} lang
      */
     static extendTranslations(words, lang) {
         try {
             if (!lang) {
                 Object.keys(words).forEach(word => {
                     Object.keys(words[word]).forEach(lang => {
                         if (!I18n.translations[lang]) {
                             console.warn(`Used unknown language: ${lang}`);
                         }
                         if (!I18n.translations[lang][word]) {
                             I18n.translations[lang][word] = words[word][lang];
                         } else if (I18n.translations[lang][word] !== words[word][lang]) {
                             console.warn(`Translation for word "${word}" in "${lang}" was ignored: existing = "${I18n.translations[lang][word]}", new = ${words[word][lang]}`);
                         }
                     });
                 });
             } else {
                 if (!I18n.translations[lang]) {
                     console.warn(`Used unknown language: ${lang}`);
                 }
                 I18n.translations[lang] = I18n.translations[lang] || {};
                 Object.keys(words)
                     .forEach(word => {
                         if (!I18n.translations[lang][word]) {
                             I18n.translations[lang][word] = words[word];
                         } else if (I18n.translations[lang][word] !== words[word]) {
                             console.warn(`Translation for word "${word}" in "${lang}" was ignored: existing = "${I18n.translations[lang][word]}", new = ${words[word]}`);
                         }
                     });
             }
         } catch (e) {
             console.error(`Cannot apply translations: ${e}`);
         }
    }

    /**
     * Sets all translations (in all languages).
     * @param {{ [lang in ioBroker.Languages]?: Record<string, string>; }} translations
     */
    static setTranslations(translations) {
        if (translations) {
            I18n.translations = translations;
        }
    }

    /**
     * Get the currently chosen language.
     * @returns {ioBroker.Languages} The current language.
     */
    static getLanguage() {
        return I18n.lang;
    }

    /**
     * Translate the given string to the selected language.
     * @param {string} word The (key) word to look up the string.
     * @param {string[]} args Optional arguments which will replace the first (second, third, ...) occurrences of %s
     */
    static t(word, ...args) {
        const translation = I18n.translations[I18n.lang];
        if (translation) {
            const w = translation[word];
            if (w) {
                word = w;
            } else {
                I18n._disableWarning && console.log(`Translate: ${word}`);
            }
        }
        for (const arg of args) {
            word = word.replace('%s', arg);
        }
        return word;
    }

     /**
      * Disable warning about non-translated words
      * Required during development
      * @param {boolean} disable Do the warning should be disabled
      */
    static disableWarning(disable) {
        I18n._disableWarning = !!disable;
    }
}

/*I18n.translations = {
    'en': require('./i18n/en'),
    'ru': require('./i18n/ru'),
    'de': require('./i18n/de'),
};
I18n.fallbacks = true;
I18n.t = function () {};*/

export default I18n;