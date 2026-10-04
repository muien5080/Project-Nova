import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import {
  Settings,
  X,
  Copy,
  Check,
  Download,
  Upload,
  RotateCcw,
  Volume2,
  VolumeX,
  HardDrive,
  AlertTriangle,
} from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { state, toggleSound, exportSave, importSave, resetGame, manualSave } = useGame();
  const [importCode, setImportCode] = useState('');
  const [importError, setImportError] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleCopySave = () => {
    const code = exportSave();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    setImportError('');
    if (!importCode.trim()) {
      setImportError('Please enter a valid save data packet string.');
      return;
    }
    const success = importSave(importCode);
    if (!success) {
      setImportError('Invalid or corrupted telemetry save format.');
    } else {
      setImportCode('');
      onClose();
    }
  };

  const handleHardReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetGame();
    setConfirmReset(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-[#0c101c] p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100 font-display uppercase tracking-wider">
              Mission Control & Telemetry Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline Playability Reassurance Banner */}
        <div className="p-3 rounded-lg border border-cyan-800/40 bg-cyan-950/20 flex items-start gap-2.5 text-xs text-cyan-300">
          <HardDrive className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Offline Playability Verified:</span> Project Nova saves all game progress, resources, buildings, and celestial discoveries locally in your browser storage. You can play completely offline without network connection.
          </div>
        </div>

        {/* Audio Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-900/50">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-slate-200">Synthesizer Audio Feedback</div>
            <div className="text-[11px] text-slate-400">Play mechanical feedback, research unlocks, and rocket launch thrusters</div>
          </div>
          <button
            onClick={toggleSound}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              state.settings.soundEnabled
                ? 'border-cyan-800/60 bg-cyan-950/60 text-cyan-400'
                : 'border-slate-800 bg-slate-950 text-slate-500'
            }`}
          >
            {state.settings.soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>ACTIVE</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>MUTED</span>
              </>
            )}
          </button>
        </div>

        {/* Export Save Data */}
        <div className="space-y-2 p-3 rounded-lg border border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Save Telemetry</span>
            </div>
            <button
              onClick={handleCopySave}
              className="flex items-center gap-1 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>
          </div>
          <div className="text-[11px] text-slate-400">
            Export a portable telemetry snapshot string to backup or transfer to another device.
          </div>
        </div>

        {/* Import Save Data */}
        <div className="space-y-2 p-3 rounded-lg border border-slate-800 bg-slate-900/50">
          <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>Import Save Telemetry</span>
          </div>
          <textarea
            value={importCode}
            onChange={(e) => setImportCode(e.target.value)}
            placeholder="Paste your base64 save string here..."
            className="w-full h-16 p-2 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-600"
          />
          {importError && (
            <div className="text-xs text-rose-400 font-mono">{importError}</div>
          )}
          <button
            onClick={handleImport}
            className="w-full py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold font-mono text-white transition-colors cursor-pointer"
          >
            Validate & Restore Save
          </button>
        </div>

        {/* Reset Game Section */}
        <div className="p-3 rounded-lg border border-rose-900/40 bg-rose-950/10 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Reset Mission Baseline</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Completely purge current local storage save and reset Project Nova to day zero. This action cannot be reversed.
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleHardReset}
              className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                confirmReset
                  ? 'bg-rose-600 text-white hover:bg-rose-500 font-bold'
                  : 'bg-rose-950/40 text-rose-300 border border-rose-800/60 hover:bg-rose-900/40'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{confirmReset ? 'CONFIRM HARD RESET?' : 'Reset All Progress'}</span>
            </button>

            {confirmReset && (
              <button
                onClick={() => setConfirmReset(false)}
                className="px-3 py-1.5 rounded text-xs font-mono text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
