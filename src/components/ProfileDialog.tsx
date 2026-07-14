import React, { useState } from "react";
import { UserProfile } from "../types";
import { RETRO_AVATAR_LIST } from "../data";
import { soundManager } from "../lib/sounds";

interface ProfileDialogProps {
  profile: UserProfile;
  onSave: (updated: UserProfile) => void;
  onClose: () => void;
}

export default function ProfileDialog({ profile, onSave, onClose }: ProfileDialogProps) {
  const [screenName, setScreenName] = useState(profile.screenName);
  const [bio, setBio] = useState(profile.awayMessage || "Welcome to my AIM profile! Leave a msg.");
  const [avatarColor, setAvatarColor] = useState(profile.avatarColor);

  const handleSave = () => {
    if (!screenName.trim()) {
      soundManager.playWarning();
      alert("Screen name cannot be empty.");
      return;
    }
    onSave({
      ...profile,
      screenName: screenName.trim(),
      awayMessage: bio,
      avatarColor: avatarColor,
    });
    soundManager.playSent();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 font-sans text-sm p-4">
      <div className="w-[380px] bg-retro-gray bevel-out p-1 flex flex-col">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-retro-blue to-retro-light-blue text-white px-1.5 py-1 flex items-center justify-between select-none">
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-400 font-bold text-xs">🏃</span>
            <span className="font-bold text-xs">My Profile Setup</span>
          </div>
          <button 
            className="w-4 h-4 bg-retro-gray bevel-out text-black font-extrabold text-[9px] flex items-center justify-center hover:bg-neutral-100"
            onClick={onClose}
            aria-label="Close"
          >
            X
          </button>
        </div>

        {/* Content Tabs style */}
        <div className="p-3 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="profile-screenname-input" className="font-bold text-xs text-neutral-800">AIM Screen Name:</label>
            <input
              type="text"
              id="profile-screenname-input"
              className="bevel-in px-2 py-1 text-xs outline-none font-mono"
              value={screenName}
              onChange={(e) => setScreenName(e.target.value.replace(/[^a-zA-Z0-9 ]/g, ""))}
              maxLength={24}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-bold text-xs text-neutral-800">Select Buddy Icon:</span>
            <div className="grid grid-cols-8 gap-1.5 p-2 bg-white bevel-in max-h-20 overflow-y-auto retro-scrollbar">
              {RETRO_AVATAR_LIST.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className={`text-xl p-1 rounded-sm cursor-pointer hover:bg-neutral-100 flex items-center justify-center ${
                    avatarColor === emoji ? "bg-retro-blue/25 border-retro-blue border" : ""
                  }`}
                  onClick={() => {
                    setAvatarColor(emoji);
                    soundManager.playSent();
                  }}
                  aria-label={`Select avatar ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="profile-bio-textarea" className="font-bold text-xs text-neutral-800">Profile / Info Bio:</label>
            <textarea
              id="profile-bio-textarea"
              className="bevel-in p-2 w-full h-24 text-xs outline-none resize-none font-mono text-black"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={400}
              placeholder="Type your personal bio that other AIM buddies can read when they 'Get Info' on you..."
            />
          </div>

          {/* Action buttons */}
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
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
