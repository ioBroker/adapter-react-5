/**
 * Copyright 2018-2023 Denis Haev (bluefox) <dogafox@gmail.com>
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
     * List of unknown translations during development.
     * @type {string[]}
     */
    static unknownTranslations = [];

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
        // automatically extend all languages with prefix
        if (words.prefix) {
            if (typeof words.prefix === 'string') {
                const prefix = words.prefix;
                delete words.prefix;
                Object.keys(words).forEach(_lang => {
                    const _words = {};
                    Object.keys(words[_lang]).forEach(word => {
                        if (!word) {
                            return;
                        }
                        if (!word.startsWith(prefix)) {
                            _words[`${prefix}${word}`] = words[_lang][word];
                        } else {
                            _words[word] = words[_lang][word];
                        }
                    });
                    words[_lang] = _words;
                });
            } else {
                console.warn('Found prefix in translations, but it is not a string');
            }
        }

        try {
            if (!lang) {
                if (words.en && words.de && words.ru) {
                    Object.keys(words).forEach(_lang => {
                        I18n.translations[_lang] = I18n.translations[_lang] || {};
                        Object.assign(I18n.translations[_lang], words[_lang]);
                    });
                } else {
                    Object.keys(words).forEach(word => {
                        Object.keys(words[word]).forEach(_lang => {
                            if (!I18n.translations[_lang]) {
                                console.warn(`Used unknown language: ${_lang}`);
                            }
                            if (!I18n.translations[_lang][word]) {
                                I18n.translations[_lang][word] = words[word][_lang];
                            } else if (I18n.translations[_lang][word] !== words[word][_lang]) {
                                console.warn(`Translation for word "${word}" in "${_lang}" was ignored: existing = "${I18n.translations[_lang][word]}", new = ${words[word][_lang]}`);
                            }
                        });
                    });
                }
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
                if (!I18n.unknownTranslations.includes(word)) {
                    I18n.unknownTranslations.push(word);
                    !I18n._disableWarning && console.log(`Translate: ${word}`);
                }
                // fallback to english
                if (I18n.lang !== 'en' && I18n.translations.en) {
                    const wordEn = I18n.translations.en[word];
                    if (wordEn) {
                        word = wordEn;
                    }
                }
            }
        }
        for (const arg of args) {
            word = word.replace('%s', arg);
        }
        return word;
    }

    /**
     * Show non-translated words
     * Required during development
     * @param {string | RegExp} filter filter words
     */
    static i18nShow(filter) {
        /**
         * List words with their translations.
         * @type {Record<string, string>}
         */
        const result = {};
        if (!filter) {
            I18n.unknownTranslations.forEach(word => {
                result[word] = word;
            });
            console.log(JSON.stringify(result, null, 2));
        } else if (typeof filter === 'string') {
            I18n.unknownTranslations.forEach(word => {
                if (word.startsWith(filter)) {
                    result[word] = word.replace(filter, '');
                }
            });
            console.log(JSON.stringify(result, null, 2));
        } else if (typeof filter === 'object') {
            I18n.unknownTranslations.forEach(word => {
                if (filter.test(word)) {
                    result[word] = word;
                }
            });
            console.log(JSON.stringify(result, null, 2));
        }
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

// install global handlers
window.i18nShow = I18n.i18nShow;
window.i18nDisableWarning = I18n.disableWarning;

/*
I18n.translations = {
    'en': require('./i18n/en'),
    'ru': require('./i18n/ru'),
    'de': require('./i18n/de'),
};
I18n.fallbacks = true;
I18n.t = function () {};
*/

export default I18n;
