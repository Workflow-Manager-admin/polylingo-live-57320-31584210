import React, { useState, useEffect, useRef } from 'react';
import { translateText } from './translationService';

/*
  PolyLingo Live - MainContainer Scaffold

  This is the main UI container for PolyLingo Live,
  now updated to support real-time translation via the translation service API.
*/

/* ---------------------------------
 * PUBLIC_INTERFACE
 * LanguageSelector
 * - Selects input and output languages, and allows toggling language auto-detection.
 * - Props: inputLanguage, outputLanguage, onInputLanguageChange, onOutputLanguageChange, autoDetect, onAutoDetectChange
 */
function LanguageSelector({
  inputLanguage,
  outputLanguage,
  onInputLanguageChange,
  onOutputLanguageChange,
  autoDetect,
  onAutoDetectChange
}) {
  // Example language options
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
    // Add more as desired
  ];

  return (
    <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 24 }}>
      <div>
        <label style={{ marginRight: 10 }}>
          <input
            type="checkbox"
            checked={autoDetect}
            onChange={e => onAutoDetectChange(e.target.checked)}
            style={{ marginRight: 6 }}
          />
          Auto-detect
        </label>
        <select
          value={inputLanguage}
          disabled={autoDetect}
          onChange={e => onInputLanguageChange(e.target.value)}
        >
          {/* When autoDetect: dropdown is disabled and inputLanguage forced to 'auto' */}
          <option value="auto">-- Select Input --</option>
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
      <div style={{ fontSize: '1.25rem', color: '#bbb' }}>→</div>
      <div>
        <select
          value={outputLanguage}
          onChange={e => onOutputLanguageChange(e.target.value)}
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/* ---------------------------------
 * PUBLIC_INTERFACE
 * InputArea
 * - Area for entering text (or triggering voice)
 * - Props: inputText, inputLanguage, inputMethod, onInputTextChange, onInputVoice, setInputMethod
 */
function InputArea({ inputText, onInputTextChange, onInputVoice, inputMethod, setInputMethod, inputLanguage }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <textarea
        style={{
          width: '100%',
          minHeight: '2.25em',
          fontSize: 16,
          padding: 8,
          resize: 'vertical',
          marginBottom: 8,
        }}
        value={inputText}
        placeholder={`Type or speak in ${inputLanguage === 'auto' ? 'any language' : inputLanguage}`}
        onChange={e => onInputTextChange(e.target.value)}
      />
      <br />
      <button
        type="button"
        className="btn"
        onClick={() => setInputMethod('text')}
        disabled={inputMethod === 'text'}
        style={{ marginRight: 8 }}
      >
        ✍️ Text
      </button>
      <button
        type="button"
        className="btn"
        onClick={onInputVoice}
        style={{ marginRight: 8 }}
      >
        🎤 Voice
      </button>
      <span style={{ color: '#bbb' }}>Input mode: <b>{inputMethod}</b></span>
    </div>
  );
}

/* ---------------------------------
 * PUBLIC_INTERFACE
 * TranslationDisplay
 * - Shows the translation output
 * - Props: translationResult, outputLanguage, translationInProgress
 */
function TranslationDisplay({ translationResult, outputLanguage, translationInProgress }) {
  return (
    <div style={{
      minHeight: 40,
      background: '#181e23',
      padding: 16,
      borderRadius: 8,
      margin: '12px 0',
      fontSize: 18,
      color: translationInProgress ? '#666' : '#fff'
    }}>
      {translationInProgress ? (
        <span>Translating...</span>
      ) : translationResult ? (
        <span>{translationResult}</span>
      ) : (
        <span style={{ color: '#555' }}>Translation will appear here.</span>
      )}
    </div>
  );
}

/* ---------------------------------
 * PUBLIC_INTERFACE
 * OutputControls
 * - Buttons for Copy, Replay, Clear
 * - Props: translationResult, onCopy, onReplay, onClear, outputLanguage
 */
/**
 * PUBLIC_INTERFACE
 * OutputControls
 * - Buttons for Copy, Replay (TTS), Clear
 * - Props: translationResult, onCopy, outputLanguage, etc.
 */
function OutputControls({ translationResult, onCopy, onReplay, onClear, outputLanguage }) {
  // --- TTS state and play function
  const [ttsActive, setTtsActive] = React.useState(false);
  const ttsUtteranceRef = React.useRef(null);

  // Map language code to TTS voice
  // This function will pick the first matching voice for the language code
  function getVoiceForLang(lang) {
    if (!window.speechSynthesis) return null;
    // Try to pick a matching browser voice for the language code.
    // 'en' => 'en', 'es' => 'es', etc.
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;
    // Sometimes languages like 'es' are 'es-ES' or 'en-US', so use startsWith
    let selected = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(lang.toLowerCase()));
    // Fallback: try just first matching pair
    if (!selected) {
      selected = voices.find(v => v.lang && v.lang.toLowerCase().split('-')[0] === lang.toLowerCase());
    }
    // If still nothing, use default
    return selected || voices[0];
  }

  // PUBLIC_INTERFACE
  // Play translated text out loud via SpeechSynthesis
  const handleTTS = React.useCallback(() => {
    if (!translationResult || !window.speechSynthesis) return;
    setTtsActive(true);

    // Cancel any existing speech
    window.speechSynthesis.cancel();

    // Wait for voices to be loaded if needed
    const speak = () => {
      let utter = new window.SpeechSynthesisUtterance(translationResult);
      // Assign the voice for correct language
      const voice = getVoiceForLang(outputLanguage);
      if (voice) utter.voice = voice;
      utter.lang = (voice && voice.lang) || outputLanguage;
      utter.onend = () => setTtsActive(false);
      utter.onerror = () => setTtsActive(false);
      ttsUtteranceRef.current = utter;
      window.speechSynthesis.speak(utter);
    };

    // Voices might not be loaded right away (asynchronously)
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = speak;
    } else {
      speak();
    }
  }, [translationResult, outputLanguage]);

  // Prevent multiple overlapping playbacks
  React.useEffect(() => {
    return () => {
      // On unmount, cancel any active speech
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Button disables
  const ttsDisabled = !translationResult || ttsActive;

  return (
    <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <button
        className="btn"
        style={{ marginRight: 8 }}
        onClick={onCopy}
        disabled={!translationResult}
        aria-label="Copy output"
      >📋 Copy</button>
      <button
        className="btn"
        style={{ marginRight: 8, backgroundColor: ttsActive ? '#50E3C2' : undefined }}
        onClick={handleTTS}
        disabled={ttsDisabled}
        aria-label="Speak/Playback output"
      >
        {ttsActive ? "🔊 Playing…" : "🔈 Play"}
      </button>
      <button
        className="btn"
        style={{ marginRight: 8 }}
        onClick={onClear}
        aria-label="Clear output"
      >❌ Clear</button>
      <span style={{ color: '#bbb' }}>(Output: {outputLanguage})</span>
    </div>
  );
}

/* ---------------------------------
 * PUBLIC_INTERFACE
 * HistoryPanel
 * - Shows previous translations
 * - Props: history, onRestore
 */
function HistoryPanel({ history, onRestore }) {
  return (
    <div style={{
      marginTop: 28,
      padding: 14,
      background: '#232730',
      borderRadius: 8,
      minHeight: 60,
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>History</div>
      {history.length === 0 ? (
        <div style={{ color: '#777' }}>No translation history.</div>
      ) : (
        <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
          {history.map((item, idx) => (
            <li
              key={item.timestamp || idx}
              style={{
                padding: 8, marginBottom: 8,
                border: '1px solid #252525',
                borderRadius: 5,
                cursor: 'pointer'
              }}
              onClick={() => onRestore(item)}
            >
              <div>
                <span style={{ color: '#50E3C2' }}>{item.inputLanguage}</span> →
                <span style={{ color: '#F5A623', marginLeft: 4 }}>{item.outputLanguage}</span>
                <span style={{ marginLeft: 16, color: '#aaa', fontSize: '0.95em' }}>
                  {item.inputText?.slice(0,24)}{item.inputText?.length > 24 ? '…' : ''}
                </span>
              </div>
              <div style={{ color: '#bbb', fontSize: '0.95em', marginTop: 2 }}>
                {item.translationResult?.slice(0,36)}{item.translationResult?.length > 36 ? '…' : ''}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------------------------------
 * PUBLIC_INTERFACE
 * MainContainer
 * - Top-level container holding all UI regions for PolyLingo Live
 */
function MainContainer() {
  // --- Core state hooks ---
  const [inputText, setInputText] = useState('');
  const [autoDetect, setAutoDetect] = useState(true);
  // If auto-detect is on, force "auto"; else user's selected language
  const [inputLanguage, setInputLanguage] = useState('auto');
  const [outputLanguage, setOutputLanguage] = useState('en');
  const [translationResult, setTranslationResult] = useState('');
  const [translationInProgress, setTranslationInProgress] = useState(false);
  const [translationError, setTranslationError] = useState('');
  const [inputMethod, setInputMethod] = useState('text');
  const [history, setHistory] = useState([
    {
      inputText: 'Hola, ¿cómo estás?',
      inputLanguage: 'es',
      outputLanguage: 'en',
      translationResult: 'Hello, how are you?',
      timestamp: Date.now() - 240000,
    },
    {
      inputText: 'Bonjour!',
      inputLanguage: 'fr',
      outputLanguage: 'en',
      translationResult: 'Hello!',
      timestamp: Date.now() - 360000,
    }
  ]);
  // Track last parameters to avoid duplicate API requests
  const lastTranslationRef = useRef({});

  // -- Language Selector Change Handlers --
  // Changes the input language only if autoDetect is off
  const handleInputLanguageChange = lang => {
    if (!autoDetect) setInputLanguage(lang);
  };
  // Toggles the auto-detect and makes sure input language is 'auto' when enabled.
  const handleAutoDetectChange = checked => {
    setAutoDetect(checked);
    if (checked) setInputLanguage('auto');
  };
  // Always allow the output language to be changed
  const handleOutputLanguageChange = lang => setOutputLanguage(lang);

  // -- Input/Output Handlers --
  const handleInputTextChange = txt => setInputText(txt);
  const handleInputVoice = () => {
    setInputText('Simulated voice text.');
    setInputMethod('voice');
  };

  // -- Output Action Handlers (stub) --
  const handleCopy = () => window.alert('Copy not implemented');
  const handleReplay = () => window.alert('Replay not implemented');
  const handleClear = () => {
    setInputText('');
    setTranslationResult('');
    setTranslationError('');
  };

  // -- Restore from history, set language/auto mode as stored in entry --
  const handleRestore = (item) => {
    setInputText(item.inputText);
    setInputLanguage(item.inputLanguage);
    setOutputLanguage(item.outputLanguage);
    setTranslationResult(item.translationResult || '');
    setAutoDetect(item.inputLanguage === 'auto');
    setTranslationError('');
  };

  // -- Real-time translation logic --
  useEffect(() => {
    // Only trigger if inputText is not empty, output language selected, non-trivial case
    if (!inputText || !outputLanguage) {
      setTranslationResult('');
      setTranslationError('');
      return;
    }

    // Prevent duplicate/frequent requests (skip if nothing meaningful changed)
    const key = `${inputText}::${inputLanguage}::${outputLanguage}`;
    if (lastTranslationRef.current.key === key) {
      // Did not change
      return;
    }

    // Track this request
    lastTranslationRef.current.key = key;

    let canceled = false;
    setTranslationInProgress(true);
    setTranslationError('');

    translateText(
      inputText,
      inputLanguage || 'auto',
      outputLanguage
    ).then(result => {
      if (!canceled) {
        setTranslationResult(result.translatedText);
        setTranslationError('');

        // Store in history, most recent first
        setHistory(prev => ([
          {
            inputText,
            inputLanguage,
            outputLanguage,
            translationResult: result.translatedText,
            timestamp: Date.now()
          },
          ...prev
        ].slice(0, 10))); // Max 10 entries
      }
    }).catch(err => {
      if (!canceled) {
        setTranslationResult('');
        setTranslationError(err.message || 'Translation failed');
      }
    }).finally(() => {
      if (!canceled) setTranslationInProgress(false);
    });

    // Cleanup if effect re-runs/cancels, do not update for obsolete requests
    return () => { canceled = true; };
  }, [inputText, inputLanguage, outputLanguage]);

  return (
    <div className="container" style={{ maxWidth: 720, marginBottom: 64 }}>
      {/* Language selection (top) including auto-detect and proper state wiring */}
      <LanguageSelector
        inputLanguage={inputLanguage}
        outputLanguage={outputLanguage}
        onInputLanguageChange={handleInputLanguageChange}
        onOutputLanguageChange={handleOutputLanguageChange}
        autoDetect={autoDetect}
        onAutoDetectChange={handleAutoDetectChange}
      />

      {/* Input area, inputLanguage reflects state (forced 'auto' if autoDetect true) */}
      <InputArea
        inputText={inputText}
        onInputTextChange={handleInputTextChange}
        onInputVoice={handleInputVoice}
        inputMethod={inputMethod}
        setInputMethod={setInputMethod}
        inputLanguage={inputLanguage}
      />

      {/* TranslationDisplay stateless; fully controlled output */}
      <TranslationDisplay
        translationResult={
          translationError
            ? `⚠️ ${translationError}`
            : translationResult
        }
        outputLanguage={outputLanguage}
        translationInProgress={translationInProgress}
      />

      {/* OutputControls (copy/tts/clear actions) */}
      <OutputControls
        translationResult={translationResult}
        onCopy={handleCopy}
        onReplay={handleReplay}
        onClear={handleClear}
        outputLanguage={outputLanguage}
      />

      {/* HistoryPanel receives all relevant props (history, restore logic) */}
      <HistoryPanel
        history={history}
        onRestore={handleRestore}
      />
    </div>
  );
}

export default MainContainer;
