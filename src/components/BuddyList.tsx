import React, { useState } from "react";
import { Buddy, UserProfile, BuddyStatus } from "../types";
import { soundManager } from "../lib/sounds";

interface BuddyListProps {
  userProfile: UserProfile;
  buddies: Buddy[];
  unreadCounts: Record<string, number>;
  onSelectBuddy: (buddyId: string) => void;
  onOpenAwayDialog: () => void;
  onOpenProfileDialog: () => void;
  onOpenBuddyInfo: (buddyId: string) => void;
  onToggleUserStatus: (status: BuddyStatus) => void;
  onSignOff: () => void;
}

export default function BuddyList({
  userProfile,
  buddies,
  unreadCounts,
  onSelectBuddy,
  onOpenAwayDialog,
  onOpenProfileDialog,
  onOpenBuddyInfo,
  onToggleUserStatus,
  onSignOff,
}: BuddyListProps) {
  const [selectedBuddyId, setSelectedBuddyId] = useState<string | null>(null);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    Buddies: true,
    "Co-workers": true,
    Bots: true,
  });

  const categories = ["Buddies", "Co-workers", "Bots"] as const;

  const toggleCategory = (cat: string) => {
    setExpandedCats((prev) => ({ ...prev, [cat]: !prev[cat] }));
    soundManager.playSent();
  };

  const selectBuddy = (buddyId: string) => {
    setSelectedBuddyId(buddyId);
    soundManager.playSent();
  };

  const handleDoubleClick = (buddyId: string) => {
    onSelectBuddy(buddyId);
  };

  // Helper to count online buddies per category
  const getCategoryCounts = (cat: string) => {
    const list = buddies.filter((b) => b.category === cat);
    const onlineCount = list.filter((b) => b.status === "online" || b.status === "away").length;
    return `${onlineCount}/${list.length}`;
  };

  const handleImClick = () => {
    if (selectedBuddyId) {
      onSelectBuddy(selectedBuddyId);
    } else {
      soundManager.playWarning();
      alert("Please highlight a buddy first to send an Instant Message.");
    }
  };

  const handleInfoClick = () => {
    if (selectedBuddyId) {
      onOpenBuddyInfo(selectedBuddyId);
    } else {
      soundManager.playWarning();
      alert("Please highlight a buddy first to view their profile info.");
    }
  };

  const triggerAbout = () => {
    soundManager.playReceived();
    alert("AIM AI Client v4.7\n-----------------------\nCreated for AI Studio in 2026.\nEnjoy talking with nostalgia-driven bots!");
  };

  return (
    <div className="w-[280px] bg-retro-gray bevel-out p-1 flex flex-col font-sans text-xs h-[520px] select-none text-black">
      {/* Title Bar */}
      <div className="bg-gradient-to-r from-retro-blue to-retro-light-blue text-white px-1.5 py-1 flex items-center justify-between select-none">
        <div className="flex items-center gap-1.5">
          {/* Running Man yellow icon */}
          <span className="text-yellow-400 font-bold text-xs">🏃</span>
          <span className="font-bold text-xs">{userProfile.screenName}'s Buddy List</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button 
            className="w-4 h-4 bg-retro-gray bevel-out text-black font-extrabold text-[9px] flex items-center justify-center pb-1 hover:bg-neutral-100"
            onClick={() => soundManager.playWarning()}
            aria-label="Minimize"
          >
            _
          </button>
          <button 
            className="w-4 h-4 bg-retro-gray bevel-out text-black font-extrabold text-[9px] flex items-center justify-center hover:bg-neutral-100"
            onClick={onSignOff}
            aria-label="Close"
          >
            X
          </button>
        </div>
      </div>

      {/* Classic Menu Bar */}
      <div className="flex gap-3 px-2 py-1 border-b border-retro-dark-gray text-[11px] text-neutral-800 bg-neutral-200">
        <span className="cursor-pointer hover:underline" onClick={onOpenProfileDialog}>Profile</span>
        <span className="cursor-pointer hover:underline" onClick={onOpenAwayDialog}>Away</span>
        <span className="cursor-pointer hover:underline" onClick={triggerAbout}>About</span>
        <span className="cursor-pointer hover:underline text-red-700 font-semibold ml-auto" onClick={onSignOff}>Sign Off</span>
      </div>

      {/* User Information Status Strip */}
      <div className="p-2 border-b border-retro-dark-gray/30 bg-neutral-100 flex items-center gap-2.5">
        <div className="text-2xl p-1 bg-white bevel-in w-8 h-8 flex items-center justify-center shadow-sm">
          {userProfile.avatarColor}
        </div>
        
        <div className="flex flex-col gap-0.5 flex-grow">
          <span className="font-extrabold text-black text-xs tracking-tight truncate max-w-[130px]" title={userProfile.screenName}>
            {userProfile.screenName}
          </span>
          {/* Presence Dropdown Selector */}
          <select
            id="user-presence-select"
            className="text-[10px] bg-white border border-retro-dark-gray outline-none px-1 py-0.5 font-semibold text-neutral-700 cursor-pointer w-28"
            value={userProfile.isAway ? "away" : "online"}
            onChange={(e) => {
              const val = e.target.value as BuddyStatus;
              onToggleUserStatus(val);
            }}
          >
            <option value="online">🟢 Online</option>
            <option value="away">🟡 Away Message</option>
          </select>
        </div>
      </div>

      {/* Quick Info text for Away state */}
      {userProfile.isAway && (
        <div className="bg-yellow-50 px-2 py-1.5 border-b border-yellow-300 text-[10px] text-yellow-900 leading-snug">
          <span className="font-bold">Away Msg active:</span>
          <p className="italic truncate font-mono mt-0.5">"{userProfile.awayMessage}"</p>
        </div>
      )}

      {/* Buddy Tree View Container */}
      <div className="flex-grow bg-white bevel-in p-1.5 overflow-y-auto retro-scrollbar my-1 text-black">
        {categories.map((cat) => {
          const list = buddies.filter((b) => b.category === cat);
          const isExpanded = expandedCats[cat];
          const hasBuddies = list.length > 0;

          return (
            <div key={cat} className="mb-2">
              {/* Category Header node */}
              <button
                type="button"
                className="w-full flex items-center gap-1 font-bold text-neutral-800 text-[11px] hover:text-black cursor-pointer text-left focus:outline-none"
                onClick={() => toggleCategory(cat)}
              >
                <span className="font-mono text-[9px] text-neutral-500">
                  {isExpanded ? "▼" : "▶"}
                </span>
                <span>{cat}</span>
                <span className="text-neutral-500 font-normal text-[10px] font-mono">
                  ({getCategoryCounts(cat)})
                </span>
              </button>

              {/* Collapsible buddy nodes */}
              {isExpanded && hasBuddies && (
                <div className="pl-3.5 mt-1 flex flex-col gap-0.5">
                  {list.map((buddy) => {
                    const unread = unreadCounts[buddy.id] || 0;
                    const isSelected = selectedBuddyId === buddy.id;

                    return (
                      <button
                        key={buddy.id}
                        type="button"
                        className={`w-full flex items-center gap-2 py-0.5 px-1 rounded-sm text-left select-none cursor-pointer hover:bg-neutral-100 ${
                          isSelected ? "bg-retro-blue text-white hover:bg-retro-blue" : ""
                        }`}
                        onClick={() => selectBuddy(buddy.id)}
                        onDoubleClick={() => handleDoubleClick(buddy.id)}
                      >
                        {/* Custom status bullet */}
                        <span 
                          className={`w-2.5 h-2.5 rounded-full border border-black/10 flex-shrink-0 ${
                            buddy.status === "online" 
                              ? "bg-green-500" 
                              : buddy.status === "away" 
                              ? "bg-yellow-400" 
                              : "bg-neutral-300"
                          }`}
                          title={buddy.status}
                        />
                        
                        {/* Screen Name + Warning indicators */}
                        <span className={`truncate flex-grow text-[11px] ${unread > 0 ? "font-bold" : ""}`}>
                          {buddy.screenName}
                          {buddy.warningLevel > 0 && (
                            <span className={`text-[10px] font-mono ml-1.5 ${isSelected ? "text-blue-100" : "text-neutral-500"}`}>
                              ({buddy.warningLevel}%)
                            </span>
                          )}
                        </span>

                        {/* Unread Indicator Pill */}
                        {unread > 0 && (
                          <span className="bg-red-600 text-white font-extrabold text-[9px] px-1 py-0.2 rounded-full leading-none font-mono">
                            {unread}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom control bar area */}
      <div className="p-1 border-t border-retro-dark-gray/25 grid grid-cols-5 gap-1 bg-neutral-200">
        <button
          type="button"
          className="py-1 bg-retro-gray bevel-out text-center hover:bg-neutral-100 active:bevel-out-active font-bold cursor-pointer text-black"
          onClick={handleImClick}
          title="Send Instant Message to selected buddy"
        >
          IM
        </button>
        <button
          type="button"
          className="py-1 bg-retro-gray bevel-out text-center hover:bg-neutral-100 active:bevel-out-active font-bold cursor-pointer text-black"
          onClick={handleInfoClick}
          title="Get profile info for selected buddy"
        >
          Info
        </button>
        <button
          type="button"
          className="py-1 bg-retro-gray bevel-out text-center hover:bg-neutral-100 active:bevel-out-active font-bold cursor-pointer text-black"
          onClick={onOpenAwayDialog}
          title="Set your Away Message"
        >
          Away
        </button>
        <button
          type="button"
          className="py-1 bg-retro-gray bevel-out text-center hover:bg-neutral-100 active:bevel-out-active font-bold cursor-pointer text-black"
          onClick={onOpenProfileDialog}
          title="Change your own AIM profile settings"
        >
          Setup
        </button>
        <button
          type="button"
          className="py-1 bg-retro-gray bevel-out text-center hover:bg-neutral-100 active:bevel-out-active text-red-800 font-extrabold cursor-pointer"
          onClick={onSignOff}
          title="Log out from AIM"
        >
          Exit
        </button>
      </div>
    </div>
  );
}
