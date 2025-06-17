import React, { useState } from 'react';

/* 
  MainContainer scaffolding for PolyLingo Live

  Layout:
    - Language selection (top)
    - Input area (text box, mic button)
    - Translation output
    - Controls (copy, replay, clear)
    - Translation history panel

  All subcomponents below are basic stubs, to be replaced with detailed implementations.
*/

/* --------------------------------------------
 * PUBLIC_INTERFACE
 * LanguageSelector - Select input and output languages
 * Props:
 *   - inputLanguage, outputLanguage
 *   - onInputLanguageChange, onOutputLanguageChange
 */
function LanguageSelector({ inputLanguage, outputLanguage, onInputLanguageChange, onOutputLanguageChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label>
        Input Language:
        <select value={inputLanguage} onChange={e => onInputLanguageChange(e.target.value)}>
          <option value="auto">Auto-Detect</option>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          {/* TODO: add more language options */}
        </select>
      </label>
      <span style={{ margin: '0 12px' }}>→</span>
      <label>
        Output Language:
        <select value={outputLanguage} onChange={e => onOutputLanguageChange(e.target.value)}>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          {/* TODO: add more language options */}
        </select>
      </label>
    </div>
  );
}

/* --------------------------------------------
 * PUBLIC_INTERFACE
 * InputArea - Entry point for text (or future voice)
 * Props:
 *   - inputText
 *   - onInputTextChange, onInputVoice
 *   - inputMethod, setInputMethod
 *   - inputLanguage
 */
function InputArea({ inputText, onInputTextChange, onInputVoice, inputMethod, setInputMethod, inputLanguage }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <textarea
        style={{ width: '100%', minHeight: 48, marginBottom: 8 }}
        value={inputText}
        placeholder={`Type (or speak) text in ${inputLanguage === 'auto' ? 'any language' : inputLanguage}...`}
        onChange={e => onInputTextChange(e.target.value)}
      />
      <div>
        <button
          type="button"
          className="btn"
          style={{ marginRight: 8 }}
          onClick={() => setInputMethod('text')}
          disabled={inputMethod === 'text'}
        >
          ✍️ Text
        </button>
        <button
          type="button"
          className="btn"
          onClick={onInputVoice}
          style={{ marginRight: 8 }}
        >
          🎤 Speak
        </button>
        <span style={{ color: '#bbb' }}>Input mode: <b>{inputMethod}</b></span>
      </div>
    </div>
  );
}

/* --------------------------------------------
 * PUBLIC_INTERFACE
 * TranslationDisplay - Shows the translation output
 * Props:
 *   - translationResult
 *   - outputLanguage
 *   - translationInProgress
 */
function TranslationDisplay({ translationResult, outputLanguage, translationInProgress }) {
  return (
    <div style={{ margin: '16px 0', minHeight: 40, background: '#222', padding: 16, borderRadius: 8 }}>
      {translationInProgress ? (
        <span>Translating...</span>
      ) : translationResult ? (
        <span>{translationResult}</span>
      ) : (
        <span style={{ color: '#666' }}>Translation will appear here</span>
      )}
    </div>
  );
}

/* --------------------------------------------
 * PUBLIC_INTERFACE
 * OutputControls - Copy, replay (TTS), clear, etc.
 * Props:
 *   - translationResult
 *   - onCopy, onReplay, onClear
 *   - outputLanguage
 */
function OutputControls({ translationResult, onCopy, onReplay, onClear, outputLanguage }) {
  const actionsDisabled = !translationResult || translationResult.length === 0;
  return (
    <div style={{ marginBottom: 16 }}>
      <button className="btn" style={{ marginRight: 8 }} disabled={actionsDisabled} onClick={onCopy}>
        📋 Copy
      </button>
      <button className="btn" style={{ marginRight: 8 }} disabled={actionsDisabled} onClick={onReplay}>
        🔈 Replay
      </button>
      <button className="btn" style={{ marginRight: 8 }} disabled={actionsDisabled} onClick={onClear}>
        ❌ Clear
      </button>
      <span style={{ color: '#bbb' }}>(Output: {outputLanguage})</span>
    </div>
  );
}

/* --------------------------------------------
 * PUBLIC_INTERFACE
 * HistoryPanel - Shows translation history
 * Props:
 *   - history: array of { inputText, inputLanguage, outputLanguage, translationResult, timestamp }
 *   - onRestore: handler to restore past translation
 */
function HistoryPanel({ history, onRestore }) {
  return (
    <div style={{ marginTop: 24, background: '#181818', padding: 16, borderRadius: 8 }}>
      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Translation History</div>
      {history.length === 0 ? (
        <div style={{ color: '#666' }}>No history yet.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {history.slice().reverse().map((item, idx) => (
            <li key={item.timestamp || idx}
                style={{
                  marginBottom: 8,
                  padding: 8,
                  border: '1px solid #222',
                  borderRadius: 5,
                  cursor: 'pointer'
                }}
                onClick={() => onRestore(item)}
            >
              <div>
                <span style={{ color: '#50E3C2', marginRight: 4 }}>{item.inputLanguage}</span>
                <span style={{ color: '#888' }}>→</span>
                <span style={{ color: '#F5A623', marginLeft: 4 }}>{item.outputLanguage}</span>
                <span style={{ marginLeft: 8, color: '#aaa', fontSize: '0.92em' }}>
                  {item.inputText.substring(0, 32)}
                  {item.inputText.length > 32 ? '…' : ''}
                </span>
                <span style={{ float: 'right', color: '#333', fontSize: '0.85em' }}>
                  {item.timestamp ? (new Date(item.timestamp).toLocaleTimeString()) : ''}
                </span>
              </div>
              <div style={{ color: '#bbb', fontSize: '0.95em', marginTop: 2 }}>
                {item.translationResult.substring(0, 48)}{item.translationResult.length > 48 ? '…' : ''}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* --------------------------------------------
 * PUBLIC_INTERFACE
 * MainContainer - Primary app container for PolyLingo Live
 * All main state and callback logic are kept here.
 */
function MainContainer() {
  // --- App State (placeholders for now) ---
  const [inputText, setInputText] = useState('');
  const [inputLanguage, setInputLanguage] = useState('auto'); // e.g., 'en', 'es', 'auto'
  const [outputLanguage, setOutputLanguage] = useState('en'); // e.g., 'es'
  const [translationResult, setTranslationResult] = useState('');
  const [translationInProgress, setTranslationInProgress] = useState(false);
  const [inputMethod, setInputMethod] = useState('text'); // 'text' or 'voice'
  const [history, setHistory] = useState([]);

  // --- Callbacks ---
  // Input handlers
  const handleInputTextChange = (text) => setInputText(text);

  // Placeholder for future: triggers voice input (e.g. activates SpeechRecognition)
  const handleInputVoice = () => {
    // Here we'd integrate voice input!
    const simulatedVoiceText = 'Hello from voice input!';
    setInputMethod('voice');
    setInputText(simulatedVoiceText);
  };

  const handleInputLanguageChange = (lang) => setInputLanguage(lang);
  const handleOutputLanguageChange = (lang) => setOutputLanguage(lang);

  // Output controls
  const handleCopy = () => {
    if (translationResult) {
      // Try to copy to clipboard
      if (navigator.clipboard) {
        navigator.clipboard.writeText(translationResult);
      }
    }
  };
  const handleReplay = () => {
    // Placeholder: in future, invoke TTS
    alert('Text-to-speech not implemented.');
  };
  const handleClear = () => {
    setInputText('');
    setTranslationResult('');
  };

  // History logic
  const handleRestore = (entry) => {
    setInputText(entry.inputText);
    setInputLanguage(entry.inputLanguage);
    setOutputLanguage(entry.outputLanguage);
    setTranslationResult(entry.translationResult);
  };

  // Simulated translation request (would be API in real app)
  // For now, demo: when inputText changes and not in progress, generate dummy translation and update history.
  React.useEffect(() => {
    if (inputText && inputText !== '' && !translationInProgress) {
      setTranslationInProgress(true);
      setTimeout(() => {
        // Simulate translation for demo
        const result = `[${outputLanguage}] ${inputText}`;
        setTranslationResult(result);
        setTranslationInProgress(false);

        setHistory(prev =>
          prev.concat({
            inputText,
            inputLanguage,
            outputLanguage,
            translationResult: result,
            timestamp: Date.now(),
          })
        );
      }, 600);
    } else if (!inputText) {
      setTranslationResult('');
    }
    // eslint-disable-next-line
  }, [inputText, outputLanguage]);

  return (
    <div className="container" style={{ maxWidth: 700, marginBottom: 48 }}>
      {/* Language selection (top) */}
      <LanguageSelector
        inputLanguage={inputLanguage}
        outputLanguage={outputLanguage}
        onInputLanguageChange={handleInputLanguageChange}
        onOutputLanguageChange={handleOutputLanguageChange}
      />

      {/* Input area (text or voice) */}
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

      {/* Translation history */}
      <HistoryPanel
        history={history}
        onRestore={handleRestore}
      />
    </div>
  );
}

export default MainContainer;
