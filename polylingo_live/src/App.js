/*
  PolyLingo Live - Main App Container Design Plan and Skeleton

  Key Application State:
    - inputText: Current text input by the user (freeform text, from text area or voice).
    - inputLanguage: Selected input language ("auto-detect" supported).
    - outputLanguage: Selected output language (can be a single language or multiple for future extension).
    - translationResult: Result of translation (string or object for multiple outputs).
    - translationInProgress: Boolean for async translation state.
    - inputMethod: 'text' | 'voice' (for toggling input modes).
    - history: Array of past {inputText, inputLanguage, outputLanguage, translationResult, timestamp}

  Top-Level Component Structure:
    App
    └── PolyLingoContainer
         ├── LanguageSelector      // Selects input/output languages (handles auto-detect as input option)
         ├── InputArea            // Text area for input and controls for switching to voice input
         ├── TranslationDisplay   // Shows translated results (and text-to-speech output control)
         ├── OutputControls       // Actions: Copy, replay (TTS), clear, etc.
         └── HistoryPanel         // Shows list of past translations

  Prop & State Flow:
    - App (owns state) passes props down; state updates driven from subcomponents via callbacks.
    - LanguageSelector: Updates inputLanguage/outputLanguage in App.
    - InputArea: Sends inputText (or triggers voice input), notifies changes to App.
    - TranslationDisplay: Receives translationResult/outputLanguage, may trigger TTS.
    - OutputControls: Invokes actions (copy to clipboard, replay TTS, etc), could receive translationResult.
    - HistoryPanel: Reads app history, allows restoring from history (inputs/outputs).

  The Large State Remains in App/Container - individual components get only what's needed via props.

  --------- Below: Pseudocode & Skeleton Implementation ---------
*/

import React, { useState } from 'react';
import './App.css';

/* -- Placeholder stubs for future subcomponents -- */
// Each component below will be defined in its own file in a full implementation,
// but placed here as skeletons for clarity.

/**
 * Props:
 *  - inputLanguage, outputLanguage: current selection.
 *  - onInputLanguageChange, onOutputLanguageChange: handlers for updating selection.
 */
function LanguageSelector({ inputLanguage, outputLanguage, onInputLanguageChange, onOutputLanguageChange }) {
  // Implementation (Dropdowns, etc.)
  return <div>{/* Language dropdowns go here */}</div>;
}

/**
 * PUBLIC_INTERFACE
 * InputArea component for text/voice input.
 * Props:
 *  - inputText: Current value from App state
 *  - onInputTextChange: Handler for text input (string)
 *  - onInputVoice: Handler to receive finished voice input (string)
 *  - inputMethod: 'text' or 'voice'
 *  - setInputMethod: Callback to switch input modes
 *  - inputLanguage: For context/display
 */
function InputArea({ inputText, onInputTextChange, onInputVoice, inputMethod, setInputMethod, inputLanguage }) {
  // Recognizer state (for voice input mode)
  const [recognizing, setRecognizing] = React.useState(false);
  const [voiceError, setVoiceError] = React.useState('');
  const recognitionRef = React.useRef(null);

  // PUBLIC_INTERFACE
  // Start speech recognition using browser API (webkitSpeechRecognition as fallback)
  const startVoiceRecognition = () => {
    setVoiceError('');
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setVoiceError('Speech Recognition not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Basic language context (if provided)
    if (inputLanguage && inputLanguage !== 'auto') {
      recognition.lang = inputLanguage;
    }
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setRecognizing(true);
      setVoiceError('');
      setInputMethod('voice');
    };
    recognition.onresult = (event) => {
      const result = event.results && event.results[0] && event.results[0][0] && event.results[0][0].transcript;
      if (result) {
        onInputVoice(result);
      }
      setRecognizing(false);
      setInputMethod('text');
    };
    recognition.onerror = (event) => {
      setVoiceError(event.error === 'no-speech'
        ? 'No speech detected. Try again.'
        : 'Voice input failed. Try again.');
      setRecognizing(false);
      setInputMethod('text');
    };
    recognition.onend = () => {
      setRecognizing(false);
      setInputMethod('text');
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Clean-up if component unmounts while recognizing
  React.useEffect(() => {
    return () => {
      if (recognitionRef.current && recognizing) {
        recognitionRef.current.stop();
      }
    };
  }, [recognizing]);

  const handleTextChange = (e) => {
    onInputTextChange(e.target.value);
    setInputMethod('text');
  };

  return (
    <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <textarea
        style={{
          width: '100%',
          minHeight: '2.5em',
          fontSize: 16,
          padding: 8,
          resize: 'vertical',
          marginBottom: 8,
          borderRadius: 4,
          border: '1px solid var(--border-color, #333)',
        }}
        value={inputText}
        placeholder={`Type or speak in ${inputLanguage === 'auto' ? 'any language' : inputLanguage}`}
        onChange={handleTextChange}
        disabled={recognizing}
        aria-label="Enter text"
      />
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
        <button
          type="button"
          className="btn"
          onClick={() => setInputMethod('text')}
          disabled={inputMethod === 'text' || recognizing}
          style={{ marginRight: 12 }}
          aria-label="Text input mode"
        >
          ✍️ Text
        </button>
        <button
          type="button"
          className="btn"
          onClick={startVoiceRecognition}
          disabled={recognizing}
          style={{
            marginRight: 12,
            backgroundColor: recognizing ? '#50E3C2' : undefined,
          }}
          aria-label="Voice input mode"
        >
          {recognizing ? "🎙️ Listening…" : "🎤 Microphone"}
        </button>
        <span style={{ color: '#bbb', fontSize: '1em', marginLeft: 4 }}>
          Input mode: <b>{recognizing ? 'voice (listening)' : inputMethod}</b>
        </span>
      </div>
      {voiceError && (
        <div style={{ color: '#E87A41', marginTop: 2, fontSize: 13 }}>{voiceError}</div>
      )}
    </div>
  );
}

/**
 * Props:
 *  - translationResult: Translation output text/object
 *  - outputLanguage: For output text and (TTS) output
 *  - translationInProgress: Boolean/loading indicator
 */
function TranslationDisplay({ translationResult, outputLanguage, translationInProgress }) {
  // Implementation (shows translation output & spinner etc.)
  return <div>{/* Display translated text */}</div>;
}

/**
 * Props:
 *  - translationResult
 *  - onCopy, onReplay, onClear: output control handlers
 *  - outputLanguage
 */
function OutputControls({ translationResult, onCopy, onReplay, onClear, outputLanguage }) {
  // Implementation (copy button, replay TTS, clear, etc.)
  return <div>{/* Output control buttons */}</div>;
}

/**
 * Props:
 *  - history: array of { ... }
 *  - onRestore: handler to restore a previous translation
 */
function HistoryPanel({ history, onRestore }) {
  // Implementation (lists past translations; click to restore)
  return <div>{/* Translation history list */}</div>;
}

// --- Main Application Container ---
function App() {
  // --- Main application state ---
  const [inputText, setInputText] = useState('');
  const [inputLanguage, setInputLanguage] = useState('auto'); // e.g., 'en', 'es', 'auto'
  const [outputLanguage, setOutputLanguage] = useState('en'); // e.g., 'es'
  const [translationResult, setTranslationResult] = useState('');
  const [translationInProgress, setTranslationInProgress] = useState(false);
  const [inputMethod, setInputMethod] = useState('text'); // or 'voice'
  const [history, setHistory] = useState([]);

  // -- Callback handlers for subcomponents --
  const handleInputTextChange = (text) => setInputText(text);
  const handleInputVoice = (voiceText) => setInputText(voiceText);
  const handleInputLanguageChange = (lang) => setInputLanguage(lang);
  const handleOutputLanguageChange = (lang) => setOutputLanguage(lang);

  // Output control callbacks (stubs for now)
  const handleCopy = () => { /* Copy translationResult */ };
  const handleReplay = () => { /* Replay TTS for translationResult */ };
  const handleClear = () => { setInputText(''); setTranslationResult(''); };

  // History logic
  const handleRestore = (entry) => {
    setInputText(entry.inputText);
    setInputLanguage(entry.inputLanguage);
    setOutputLanguage(entry.outputLanguage);
    setTranslationResult(entry.translationResult);
  };

  // TODO: Add translation requests, update history, etc.

  return (
    <div className="app">
      {/* Navbar/Header (could also extract to a Navbar component) */}
      <nav className="navbar">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo">
              <span className="logo-symbol">*</span> PolyLingo Live
            </div>
            {/* Could place theme toggle/settings here */}
            <button className="btn">Settings</button>
          </div>
        </div>
      </nav>
      <main>
        <div className="container" style={{ paddingTop: 80 }}>
          {/* Language selection */}
          <LanguageSelector
            inputLanguage={inputLanguage}
            outputLanguage={outputLanguage}
            onInputLanguageChange={handleInputLanguageChange}
            onOutputLanguageChange={handleOutputLanguageChange}
          />
          {/* Input area for text/voice */}
          <InputArea
            inputText={inputText}
            onInputTextChange={handleInputTextChange}
            onInputVoice={handleInputVoice}
            inputMethod={inputMethod}
            setInputMethod={setInputMethod}
            inputLanguage={inputLanguage}
          />
          {/* Translation output */}
          <TranslationDisplay
            translationResult={translationResult}
            outputLanguage={outputLanguage}
            translationInProgress={translationInProgress}
          />
          {/* Output controls */}
          <OutputControls
            translationResult={translationResult}
            onCopy={handleCopy}
            onReplay={handleReplay}
            onClear={handleClear}
            outputLanguage={outputLanguage}
          />
          {/* History */}
          <HistoryPanel
            history={history}
            onRestore={handleRestore}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
