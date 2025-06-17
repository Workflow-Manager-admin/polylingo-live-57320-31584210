// translationService.js
// Lightweight translation API utility for PolyLingo Live

/**
 * PUBLIC_INTERFACE
 * translateText: Translates text from source to target language using LibreTranslate public API.
 * @param {string} text - Input text to translate.
 * @param {string} sourceLang - Input language code (or 'auto').
 * @param {string} targetLang - Output language code.
 * @returns {Promise<{translatedText: string, detectedSourceLanguage?: string}>}
 */
export async function translateText(text, sourceLang, targetLang) {
  // LibreTranslate API endpoint; can be freely used for demo/small loads.
  const endpoint = 'https://libretranslate.com/translate';

  // Compose body; LibreTranslate accepts 'auto' for source.
  const body = {
    q: text,
    source: sourceLang === 'auto' ? 'auto' : sourceLang,
    target: targetLang,
    format: 'text'
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // No API key required for public endpoint.
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      throw new Error('Translation API error');
    }
    const data = await res.json();
    // LibreTranslate response: {translatedText: "...", detectedLanguage: "..."}
    return {
      translatedText: data.translatedText,
      detectedSourceLanguage: data.detectedLanguage
    };
  } catch (error) {
    throw new Error(
      error && error.message
        ? error.message
        : 'Failed to fetch translation. Please check your internet connection.'
    );
  }
}
