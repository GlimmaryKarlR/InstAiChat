import React, { useState } from "react";
import { soundManager } from "../lib/sounds";

interface AwayDialogProps {
  currentMessage: string;
  onSave: (message: string) => void;
  onClose: () => void;
}

const PRESET_MESSAGES = [
  "AFK eating a Hot Pocket... bbl!",
  "brb shower 🧼 don't message unless u r cool",
  "At school / doing homework 📚 leave a message, I'll see it later",
  "Out with friends, call my Nokia if it's urgent! 📱",
  "Sleeping... leave an offline message, sleep is precious 💤",
  "Listening to music on Winamp 🎧 ~ leave a msg ~",
  "In a world of my own... do not disturb"
];

export default function AwayDialog({ currentMessage, onSave, onClose }: AwayDialogProps) {
  const [customMsg, setCustomMsg] = useState(currentMessage);

  const handleSave = () => {
    onSave(customMsg);
    soundManager.playSent();
  };

  const selectPreset = (msg: string) => {
    setCustomMsg(msg);
    soundManager.playSent();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 font-sans text-sm p-4">
      <div className="w-[360px] bg-retro-gray bevel-out p-1 flex flex-col">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-retro-blue to-retro-light-blue text-white px-1.5 py-1 flex items-center justify-between select-none">
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-400 font-bold text-xs">🏃</span>
            <span className="font-bold text-xs">Set Away Message</span>
          </div>
          <button 
            className="w-4 h-4 bg-retro-gray bevel-out text-black font-extrabold text-[9px] flex items-center justify-center hover:bg-neutral-100"
            onClick={onClose}
            aria-label="Close"
          >
            X
          </button>
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col gap-3">
          <span className="font-bold text-xs text-neutral-800">Choose a Classic Preset:</span>
          
          <div className="bevel-in h-28 overflow-y-auto p-1.5 flex flex-col gap-1 text-[11px] bg-white retro-scrollbar">
            {PRESET_MESSAGES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                className="text-left py-1 px-1.5 hover:bg-retro-blue hover:text-white rounded-sm cursor-pointer truncate"
                onClick={() => selectPreset(preset)}
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1.5 mt-1">
            <label htmlFor="custom-away-textarea" className="font-bold text-xs text-neutral-800">Or write a custom away message:</label>
            <textarea
              id="custom-away-textarea"
              className="bevel-in p-2 w-full h-16 text-xs outline-none resize-none font-mono text-black"
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              maxLength={200}
              placeholder="e.g., AFK playing games..."
            />
          </div>

          {/* Dialog Action Buttons */}
          <div className="flex gap-2 justify-end border-t border-neutral-300 pt-2.5 mt-1">
            <button
              type="button"
              className="px-4 py-1 bg-retro-gray bevel-out text-xs hover:bg-neutral-100 active:bevel-out-active text-black"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-5 py-1 bg-retro-gray bevel-out text-xs font-bold hover:bg-neutral-100 active:bevel-out-active text-black"
              onClick={handleSave}
            >
              Set Away
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
