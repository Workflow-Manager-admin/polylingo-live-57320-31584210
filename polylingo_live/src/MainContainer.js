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
 * - Buttons for Copy, Replay, Clear, and TTS (Text-to-Speech)
 * - Props: translationResult, onCopy, outputLanguage, etc.
 * - copyFeedback, clearFeedback: show transient feedback on actions (optional)
 */
function OutputControls({ translationResult, onCopy, onReplay, onClear, outputLanguage, copyFeedback, clearFeedback }) {
  const [ttsActive, setTtsActive] = React.useState(false);
  const ttsUtteranceRef = React.useRef(null);

  function getVoiceForLang(lang) {
    if (!window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;
    let selected = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(lang.toLowerCase()));
    if (!selected) {
      selected = voices.find(v => v.lang && v.lang.toLowerCase().split('-')[0] === lang.toLowerCase());
    }
    return selected || voices[0];
  }

  // Play translated text out loud via SpeechSynthesis
  const handleTTS = React.useCallback(() => {
    if (!translationResult || !window.speechSynthesis) return;
    setTtsActive(true);

    window.speechSynthesis.cancel();

    const speak = () => {
      let utter = new window.SpeechSynthesisUtterance(translationResult);
      const voice = getVoiceForLang(outputLanguage);
      if (voice) utter.voice = voice;
      utter.lang = (voice && voice.lang) || outputLanguage;
      utter.onend = () => setTtsActive(false);
      utter.onerror = () => setTtsActive(false);
      ttsUtteranceRef.current = utter;
      window.speechSynthesis.speak(utter);
    };
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = speak;
    } else {
      speak();
    }
  }, [translationResult, outputLanguage]);

  // Provide the functionality to the Replay prop too (used by MainContainer for history replay)
  React.useEffect(() => {
    if (onReplay) {
      onReplay.current = handleTTS;
    }
  }, [handleTTS, onReplay]);

  React.useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const ttsDisabled = !translationResult || ttsActive;

  // Hints and accessibility feedback strings
  const copyBtnTitle = copyFeedback
    ? copyFeedback
    : "Copy translation to clipboard";
  const clearBtnTitle = clearFeedback
    ? clearFeedback
    : "Clear translation and input";
  const ttsBtnTitle = ttsActive
    ? "Playing translation (Text-to-speech)"
    : "Replay translation output with speech";

  return (
    <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <button
        className="btn"
        style={{ marginRight: 8, borderColor: copyFeedback ? "#50E3C2" : undefined, outline: copyFeedback ? "2px solid #50E3C2" : undefined, position: "relative" }}
        onClick={onCopy}
        disabled={!translationResult}
        aria-label="Copy output"
        tabIndex={0}
        title={copyBtnTitle}
      >
        {copyFeedback ? "✔️ Copied!" : "📋 Copy"}
      </button>
      <button
        className="btn"
        style={{
          marginRight: 8,
          backgroundColor: ttsActive ? '#50E3C2' : undefined,
          transition: 'background 0.2s'
        }}
        onClick={handleTTS}
        disabled={ttsDisabled}
        aria-label="Replay translation output (text-to-speech)"
        tabIndex={0}
        title={ttsBtnTitle}
      >
        {ttsActive ? "🔊 Playing…" : "🔈 Play"}
      </button>
      <button
        className="btn"
        style={{ marginRight: 8, borderColor: clearFeedback ? "#F5A623" : undefined, outline: clearFeedback ? "2px solid #F5A623" : undefined, position: "relative" }}
        onClick={onClear}
        aria-label="Clear translation and input"
        tabIndex={0}
        title={clearBtnTitle}
      >
        {clearFeedback ? "✔️ Cleared" : "❌ Clear"}
      </button>
      <span style={{ color: '#bbb' }}>(Output: {outputLanguage})</span>
    </div>
  );
}

/* ---------------------------------
 * PUBLIC_INTERFACE
 * HistoryPanel
 * - Shows previous translations, highlights selected, click to restore, replay and clear.
 * - Props: history, selectedIndex, onRestore, onReplay, onClearHistory
 */
function HistoryPanel({ history, selectedIndex, onRestore, onReplay, onClearHistory }) {
  return (
    <div style={{
      marginTop: 28,
      padding: 14,
      background: '#232730',
      borderRadius: 8,
      minHeight: 60,
    }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8, justifyContent: "space-between" }}>
        <span style={{ fontWeight: 'bold' }}>History</span>
        <button
          type="button"
          className="btn"
          onClick={onClearHistory}
          style={{
            fontSize: "0.93em",
            padding: "3px 16px",
            backgroundColor: history.length === 0 ? '#555' : "#E87A41",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            marginLeft: 8,
            opacity: history.length === 0 ? 0.6 : 1,
            cursor: history.length === 0 ? "not-allowed" : "pointer",
            transition: 'background 0.18s'
          }}
          aria-label="Clear translation history"
          tabIndex={0}
          title="Clear all translation history"
          disabled={history.length === 0}
        >
          🗑️ Clear History
        </button>
      </div>
      {history.length === 0 ? (
        <div style={{ color: '#777' }}>No translation history.</div>
      ) : (
        <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
          {history.map((item, idx) => (
            <li
              key={item.timestamp || idx}
              style={{
                padding: 8,
                marginBottom: 8,
                border: selectedIndex === idx ? '2px solid #F5A623' : '1px solid #252525',
                background: selectedIndex === idx ? '#2a2f38' : undefined,
                borderRadius: 5,
                cursor: 'pointer',
                boxShadow: selectedIndex === idx ? '0 0 6px #F5A62333' : undefined,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onClick={() => onRestore(item, idx)}
              aria-current={selectedIndex === idx ? 'true' : undefined}
              tabIndex={0}
              onKeyPress={e => {
                if (e.key === 'Enter' || e.key === ' ') onRestore(item, idx);
              }}
              title="Click to restore translation to editor"
            >
              <div>
                <span style={{ color: '#50E3C2' }}>{item.inputLanguage}</span> →
                <span style={{ color: '#F5A623', marginLeft: 4 }}>{item.outputLanguage}</span>
                <span style={{ marginLeft: 16, color: '#aaa', fontSize: '0.95em' }}>
                  {item.inputText?.slice(0, 24)}{item.inputText?.length > 24 ? '…' : ''}
                </span>
                <div style={{ color: '#bbb', fontSize: '0.95em', marginTop: 2 }}>
                  {item.translationResult?.slice(0, 36)}{item.translationResult?.length > 36 ? '…' : ''}
                </div>
              </div>
              <button
                className="btn"
                type="button"
                style={{
                  marginLeft: 12,
                  fontSize: '0.9em',
                  backgroundColor: '#22293a',
                  color: '#F5A623',
                  border: 'none',
                  padding: '2px 12px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  outline: 'none'
                }}
                title="Replay this translation output with text-to-speech"
                onClick={e => { e.stopPropagation(); onReplay && onReplay(item); }}
                tabIndex={-1}
              >
                🔈
              </button>
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
 *
 * Tracks a bounded in-memory array of translation history,
 * provides a list for review/replay, and allows navigation to any translation.
 */
function MainContainer() {
  // --- Core state hooks ---
  const [inputText, setInputText] = useState('');
  const [autoDetect, setAutoDetect] = useState(true);
  const [inputLanguage, setInputLanguage] = useState('auto');
  const [outputLanguage, setOutputLanguage] = useState('en');
  const [translationResult, setTranslationResult] = useState('');
  const [translationInProgress, setTranslationInProgress] = useState(false);
  const [translationError, setTranslationError] = useState('');
  const [inputMethod, setInputMethod] = useState('text');
  // History is bounded to 10, each item: {inputText, inputLanguage, outputLanguage, translationResult, timestamp}
  const [history, setHistory] = useState([]);
  // Track selected history index, -1 means "current" input, else the index in history array
  const [selectedHistoryIdx, setSelectedHistoryIdx] = useState(-1);

  // Track last parameters to avoid duplicate API requests
  const lastTranslationRef = useRef({});

  // -- Language Selector Change Handlers --
  const handleInputLanguageChange = lang => {
    if (!autoDetect) setInputLanguage(lang);
    // leave as is if autoDetect
  };
  const handleAutoDetectChange = checked => {
    setAutoDetect(checked);
    if (checked) setInputLanguage('auto');
  };
  const handleOutputLanguageChange = lang => setOutputLanguage(lang);

  // -- Input/Output Handlers --
  const handleInputTextChange = txt => {
    setInputText(txt);
    setSelectedHistoryIdx(-1); // act as new input, not from history
  };
  const handleInputVoice = () => {
    setInputText('Simulated voice text.');
    setInputMethod('voice');
    setSelectedHistoryIdx(-1);
  };

  // -- Output Action Handlers --
  const handleCopy = () => {
    if (!translationResult) return;
    try {
      navigator.clipboard.writeText(translationResult);
      window.alert('Copied!');
    } catch {
      window.alert('Copy failed.');
    }
  };

  // -- Feedback state for copy and clear --
  const [copyFeedback, setCopyFeedback] = useState('');
  const [clearFeedback, setClearFeedback] = useState('');

  // Handles Copy to Clipboard, provides temporary feedback
  const handleCopy = () => {
    if (!translationResult) return;
    navigator.clipboard.writeText(translationResult)
      .then(() => {
        setCopyFeedback('Copied!');
        setTimeout(() => setCopyFeedback(''), 1200);
      })
      .catch(() => {
        setCopyFeedback('Copy failed');
        setTimeout(() => setCopyFeedback(''), 1200);
      });
  };

  // Replay TTS for current translation or history entry
  const replayRef = useRef(null);
  const handleReplay = (item) => {
    // If item is provided (from HistoryPanel), replay that text/language
    // If not, replayRef.current will speak the current translationResult
    if (item && window.speechSynthesis && item.translationResult) {
      const speak = () => {
        let utter = new window.SpeechSynthesisUtterance(item.translationResult);
        const voices = window.speechSynthesis.getVoices();
        let voice =
          voices.find(
            v => v.lang && v.lang.toLowerCase().startsWith(item.outputLanguage?.toLowerCase())
          ) ||
          voices.find(
            v => v.lang && v.lang.toLowerCase().split('-')[0] === item.outputLanguage?.toLowerCase()
          ) ||
          voices[0];
        if (voice) utter.voice = voice;
        utter.lang = (voice && voice.lang) || item.outputLanguage;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
      };
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = speak;
      } else {
        speak();
      }
      return;
    }
    // Else default replay via OutputControls TTS
    if (replayRef.current) replayRef.current();
  };

  // Clear output and show feedback
  const handleClear = () => {
    setInputText('');
    setTranslationResult('');
    setTranslationError('');
    setSelectedHistoryIdx(-1);
    setClearFeedback('Cleared!');
    setTimeout(() => setClearFeedback(''), 1200);
  };

  // Clear the History entirely
  const handleClearHistory = () => {
    setHistory([]);
    setSelectedHistoryIdx(-1);
  };

  // -- Restore from history, track selection, populate states without triggering new translation immediately
  const handleRestore = (item, idx) => {
    setInputText(item.inputText);
    setInputLanguage(item.inputLanguage);
    setOutputLanguage(item.outputLanguage);
    setTranslationResult(item.translationResult || '');
    setAutoDetect(item.inputLanguage === 'auto');
    setTranslationError('');
    setSelectedHistoryIdx(idx);
    setInputMethod('text');
  };

  // When a new translation result arrives, store it in history if it's not a duplicate of latest
  useEffect(() => {
    if (!inputText || !outputLanguage || selectedHistoryIdx !== -1) {
      return;
    }
    const key = `${inputText}::${inputLanguage}::${outputLanguage}`;
    if (lastTranslationRef.current.key === key) {
      return;
    }
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
        setHistory(prev => {
          if (
            prev.length &&
            prev[0].inputText === inputText &&
            prev[0].inputLanguage === inputLanguage &&
            prev[0].outputLanguage === outputLanguage &&
            prev[0].translationResult === result.translatedText
          ) {
            return prev; // don't insert duplicate
          }
          const entry = {
            inputText,
            inputLanguage,
            outputLanguage,
            translationResult: result.translatedText,
            timestamp: Date.now()
          };
          return [entry, ...prev].slice(0, 10);
        });
        setSelectedHistoryIdx(-1);
      }
    }).catch(err => {
      if (!canceled) {
        setTranslationResult('');
        setTranslationError(err.message || 'Translation failed');
      }
    }).finally(() => {
      if (!canceled) setTranslationInProgress(false);
    });

    return () => { canceled = true; };
  }, [inputText, inputLanguage, outputLanguage, selectedHistoryIdx]);

  return (
    <div className="container" style={{ maxWidth: 720, marginBottom: 64 }}>
      <LanguageSelector
        inputLanguage={inputLanguage}
        outputLanguage={outputLanguage}
        onInputLanguageChange={handleInputLanguageChange}
        onOutputLanguageChange={handleOutputLanguageChange}
        autoDetect={autoDetect}
        onAutoDetectChange={handleAutoDetectChange}
      />

      <InputArea
        inputText={inputText}
        onInputTextChange={handleInputTextChange}
        onInputVoice={handleInputVoice}
        inputMethod={inputMethod}
        setInputMethod={setInputMethod}
        inputLanguage={inputLanguage}
      />

      <TranslationDisplay
        translationResult={
          translationError
            ? `⚠️ ${translationError}`
            : translationResult
        }
        outputLanguage={outputLanguage}
        translationInProgress={translationInProgress}
      />

      <OutputControls
        translationResult={translationResult}
        onCopy={handleCopy}
        onReplay={replayRef}
        onClear={handleClear}
        outputLanguage={outputLanguage}
        copyFeedback={copyFeedback}
        clearFeedback={clearFeedback}
      />

      {/* HistoryPanel receives history, highlights selection, and enables review/restoration */}
      <HistoryPanel
        history={history}
        selectedIndex={selectedHistoryIdx}
        onRestore={handleRestore}
        onReplay={handleReplay}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}

export default MainContainer;
