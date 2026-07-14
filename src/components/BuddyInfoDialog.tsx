import React, { useState } from "react";
import { Buddy } from "../types";
import { soundManager } from "../lib/sounds";

interface BuddyInfoDialogProps {
  buddy: Buddy;
  onClose: () => void;
}

export default function BuddyInfoDialog({ buddy, onClose }: BuddyInfoDialogProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "away" | "spec">("profile");

  const playClick = () => {
    soundManager.playSent();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 font-sans text-sm p-4">
      <div className="w-[400px] bg-retro-gray bevel-out p-1 flex flex-col">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-retro-blue to-retro-light-blue text-white px-1.5 py-1 flex items-center justify-between select-none">
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-400 font-bold text-xs">🏃</span>
            <span className="font-bold text-xs">{buddy.screenName}'s Profile Info</span>
          </div>
          <button 
            className="w-4 h-4 bg-retro-gray bevel-out text-black font-extrabold text-[9px] flex items-center justify-center hover:bg-neutral-100"
            onClick={onClose}
            aria-label="Close"
          >
            X
          </button>
        </div>

        {/* Buddy Basic Details Banner */}
        <div className="p-3 bg-neutral-100 flex items-start gap-3 border-b border-neutral-300">
          <div className="text-4xl p-2 bg-white bevel-in rounded-sm flex items-center justify-center select-none shadow-sm">
            {buddy.avatar}
          </div>
          <div className="flex flex-col gap-0.5">
            <h2 className="font-extrabold text-base text-black tracking-tight">{buddy.screenName}</h2>
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-600">
              <span className={`w-2.5 h-2.5 rounded-full ${
                buddy.status === "online" ? "bg-green-500" : buddy.status === "away" ? "bg-yellow-500" : "bg-neutral-400"
              }`} />
              <span className="capitalize">{buddy.status}</span>
              <span>• Warning: {buddy.warningLevel}%</span>
            </div>
          </div>
        </div>

        {/* 90s Style Tabs */}
        <div className="px-2 pt-2 flex gap-1 bg-retro-gray border-b border-retro-dark-gray">
          <button
            type="button"
            className={`px-3 py-1 text-xs border-t border-l border-r rounded-t-md font-bold cursor-pointer transition-all ${
              activeTab === "profile" 
                ? "bg-white border-neutral-400 translate-y-[1px] z-10 text-black pb-1.5" 
                : "bg-neutral-200 border-transparent text-neutral-600 hover:bg-neutral-100 pb-1"
            }`}
            onClick={() => { setActiveTab("profile"); playClick(); }}
          >
            Profile Bio
          </button>
          
          <button
            type="button"
            className={`px-3 py-1 text-xs border-t border-l border-r rounded-t-md font-bold cursor-pointer transition-all ${
              activeTab === "away" 
                ? "bg-white border-neutral-400 translate-y-[1px] z-10 text-black pb-1.5" 
                : "bg-neutral-200 border-transparent text-neutral-600 hover:bg-neutral-100 pb-1"
            }`}
            onClick={() => { setActiveTab("away"); playClick(); }}
          >
            Away Message
          </button>

          <button
            type="button"
            className={`px-3 py-1 text-xs border-t border-l border-r rounded-t-md font-bold cursor-pointer transition-all ${
              activeTab === "spec" 
                ? "bg-white border-neutral-400 translate-y-[1px] z-10 text-black pb-1.5" 
                : "bg-neutral-200 border-transparent text-neutral-600 hover:bg-neutral-100 pb-1"
            }`}
            onClick={() => { setActiveTab("spec"); playClick(); }}
          >
            System Spec
          </button>
        </div>

        {/* Tab Content Display Area */}
        <div className="p-3 bg-white flex-grow min-h-[160px] max-h-[220px] overflow-y-auto bevel-in text-xs font-mono retro-scrollbar text-black selection:bg-retro-blue selection:text-white">
          {activeTab === "profile" && (
            <div className="whitespace-pre-wrap leading-relaxed">
              {buddy.bio}
            </div>
          )}

          {activeTab === "away" && (
            <div className="italic text-neutral-700">
              {buddy.status === "away" && buddy.awayMessage ? (
                <div>
                  <p className="font-bold not-italic mb-2 text-red-700">🚨 AWAY STATUS ACTIVE:</p>
                  "{buddy.awayMessage}"
                </div>
              ) : (
                <p className="text-neutral-500">This user is currently online and does not have an active away message.</p>
              )}
            </div>
          )}

          {activeTab === "spec" && (
            <div className="flex flex-col gap-1 text-neutral-800">
              <span className="font-bold border-b border-neutral-200 pb-1 mb-1 text-retro-blue text-[11px] not-italic">HARDWARE INFORMATION</span>
              <p><strong className="font-bold text-neutral-600">Client:</strong> AIM v4.7.2481 (TCP/IP)</p>
              <p><strong className="font-bold text-neutral-600">Processor:</strong> Intel Pentium II @ 350Mhz (Katmai)</p>
              <p><strong className="font-bold text-neutral-600">RAM:</strong> 64MB SDRAM (PC100)</p>
              <p><strong className="font-bold text-neutral-600">Dialer:</strong> USRobotics 56k Sportster External Modem</p>
              <p><strong className="font-bold text-neutral-600">ISP:</strong> America Online Inc. (150 Hours Free CD-ROM)</p>
            </div>
          )}
        </div>

        {/* Actions Button Panel */}
        <div className="p-2.5 bg-retro-gray flex justify-end gap-2 border-t border-neutral-300">
          <button
            type="button"
            className="px-5 py-1 bg-retro-gray bevel-out text-xs font-bold hover:bg-neutral-100 active:bevel-out-active text-black cursor-pointer"
            onClick={() => { playClick(); onClose(); }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
