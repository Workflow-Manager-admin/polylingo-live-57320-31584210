import React, { useState } from 'react';

/*
  PolyLingo Live - MainContainer Scaffold

  This is the main UI container for PolyLingo Live,
  initially providing only layout and placeholder regions for:

    - LanguageSelector: Selects input/output languages
    - InputArea: User can type (or in future: speak) content
    - TranslationDisplay: Displays translation output
    - OutputControls: "Copy", "Replay", "Clear" actions
    - HistoryPanel: Shows recent translations

  These are stub, presentational-only components for now.
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
function OutputControls({ translationResult, onCopy, onReplay, onClear, outputLanguage }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <button className="btn" style={{ marginRight: 8 }} onClick={onCopy} disabled={!translationResult}>📋 Copy</button>
      <button className="btn" style={{ marginRight: 8 }} onClick={onReplay} disabled={!translationResult}>🔈 Replay</button>
      <button className="btn" style={{ marginRight: 8 }} onClick={onClear}>❌ Clear</button>
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
  // Demo state only; these would be wired to backend/smart logic in future steps
  const [inputText, setInputText] = useState('');
  const [autoDetect, setAutoDetect] = useState(true); // new: auto-detect toggle
  const [inputLanguage, setInputLanguage] = useState('auto'); // will be 'auto' or language code
  const [outputLanguage, setOutputLanguage] = useState('en');
  const [translationResult, setTranslationResult] = useState('');
  const [translationInProgress] = useState(false); // hardcoded false for demo stub
  const [inputMethod, setInputMethod] = useState('text');
  const [history, setHistory] = useState([
    // Pre-seeded history entries as demo
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

  // Subcomponent callback stubs
  const handleInputTextChange = (txt) => setInputText(txt);

  const handleInputVoice = () => {
    setInputText('Simulated voice text.');
    setInputMethod('voice');
  };

  // If auto-detect is on, always set inputLanguage to 'auto'
  const handleInputLanguageChange = (lang) => {
    if (!autoDetect) setInputLanguage(lang);
  };

  const handleAutoDetectChange = (checked) => {
    setAutoDetect(checked);
    if (checked) setInputLanguage('auto');
  };

  const handleOutputLanguageChange = setOutputLanguage;

  const handleCopy = () => window.alert('Copy not implemented');
  const handleReplay = () => window.alert('Replay not implemented');
  const handleClear = () => {
    setInputText('');
    setTranslationResult('');
  };
  const handleRestore = (item) => {
    setInputText(item.inputText);
    setInputLanguage(item.inputLanguage);
    setOutputLanguage(item.outputLanguage);
    setTranslationResult(item.translationResult);
    setAutoDetect(item.inputLanguage === 'auto');
  };

  return (
    <div className="container" style={{ maxWidth: 720, marginBottom: 64 }}>
      {/* Language selection (top) including auto-detect */}
      <LanguageSelector
        inputLanguage={inputLanguage}
        outputLanguage={outputLanguage}
        onInputLanguageChange={handleInputLanguageChange}
        onOutputLanguageChange={handleOutputLanguageChange}
        autoDetect={autoDetect}
        onAutoDetectChange={handleAutoDetectChange}
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

      {/* History panel */}
      <HistoryPanel
        history={history}
        onRestore={handleRestore}
      />
    </div>
  );
}

export default MainContainer;
