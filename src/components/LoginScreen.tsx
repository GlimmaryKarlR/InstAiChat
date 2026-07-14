import React, { useState } from "react";
import { soundManager } from "../lib/sounds";

interface LoginScreenProps {
  onLoginSuccess: (screenName: string) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [screenName, setScreenName] = useState("CoolUser99");
  const [password, setPassword] = useState("password123");
  const [savePassword, setSavePassword] = useState(true);
  const [autoLogin, setAutoLogin] = useState(false);
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectStep, setConnectStep] = useState(0);
  const [connectText, setConnectText] = useState("");

  const connectionSteps = [
    "Locating AIM authentication server...",
    "Connecting to server on port 5190...",
    "Sending login credentials...",
    "Verifying security handshake...",
    "Retrieving buddy list configuration...",
    "Opening Instant Messenger session..."
  ];

  const handleSignOn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenName.trim()) {
      soundManager.playWarning();
      alert("Please enter a screen name.");
      return;
    }

    setIsConnecting(true);
    setConnectStep(0);
    setConnectText(connectionSteps[0]);

    // Play initial beep
    soundManager.playSent();

    // Staggered login simulation to recreate that classic dial-up AIM connection feel!
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < connectionSteps.length) {
        setConnectStep(currentStep);
        setConnectText(connectionSteps[currentStep]);
        // Soft click sound for step changes
        soundManager.playSent();
      } else {
        clearInterval(interval);
        // Success! Play AIM sign on door sound and pass the screen name to parent
        soundManager.playSignOn();
        onLoginSuccess(screenName);
      }
    }, 600);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#008080] p-4 font-sans text-sm selection:bg-retro-blue selection:text-white">
      {/* Main AIM Login Window */}
      <div className="w-[320px] bg-retro-gray bevel-out p-1 flex flex-col relative" id="aim-login-window">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-retro-blue to-retro-light-blue text-white px-1.5 py-1 flex items-center justify-between select-none">
          <div className="flex items-center gap-1.5">
            {/* Tiny Running Man Icon */}
            <span className="text-yellow-400 font-bold text-xs tracking-wider">🏃</span>
            <span className="font-bold text-xs">Sign On</span>
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
              onClick={() => soundManager.playWarning()}
              aria-label="Close"
            >
              X
            </button>
          </div>
        </div>

        {/* Menu bar (inert for login) */}
        <div className="flex gap-2.5 px-2 py-0.5 border-b border-retro-dark-gray text-[11px] text-neutral-800">
          <span className="cursor-pointer hover:underline">File</span>
          <span className="cursor-pointer hover:underline">Help</span>
        </div>

        {!isConnecting ? (
          <form onSubmit={handleSignOn} className="p-4 flex flex-col gap-3">
            {/* Yellow Logo Graphic */}
            <div className="flex flex-col items-center justify-center bg-white border border-retro-dark-gray py-3 rounded-sm shadow-inner relative overflow-hidden">
              <div className="text-center select-none">
                <span className="text-5xl filter drop-shadow">🏃</span>
                <h1 className="text-3xl font-extrabold tracking-tighter text-black mt-1">
                  AIM<span className="text-xs align-super font-normal">®</span>
                </h1>
                <p className="text-[10px] text-neutral-500 font-mono mt-0.5">Instant Messenger v4.7</p>
              </div>
            </div>

            {/* Inputs */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-1">
                <label className="text-xs font-bold text-neutral-800 w-24">Screen Name:</label>
                <input
                  type="text"
                  id="screenName"
                  className="bevel-in px-1.5 py-0.5 flex-grow text-xs outline-none font-mono"
                  value={screenName}
                  onChange={(e) => setNameWithLimits(e.target.value)}
                  maxLength={24}
                />
              </div>

              <div className="flex items-center justify-between gap-1">
                <label className="text-xs font-bold text-neutral-800 w-24">Password:</label>
                <input
                  type="password"
                  id="password"
                  className="bevel-in px-1.5 py-0.5 flex-grow text-xs outline-none font-mono"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col gap-1 pl-24">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700">
                <input
                  type="checkbox"
                  id="savePassword"
                  checked={savePassword}
                  onChange={(e) => setSavePassword(e.target.checked)}
                  className="accent-retro-blue"
                />
                <span>Save password</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700">
                <input
                  type="checkbox"
                  id="autoLogin"
                  checked={autoLogin}
                  onChange={(e) => setAutoLogin(e.target.checked)}
                  className="accent-retro-blue"
                />
                <span>Auto-login</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end mt-2 pt-2 border-t border-neutral-300">
              <button
                type="button"
                className="px-4 py-1 bg-retro-gray bevel-out text-xs text-neutral-800 hover:bg-neutral-100 active:bevel-out-active"
                onClick={() => {
                  soundManager.playSent();
                  alert("AIM Connection Setup: Connects via Dial-Up TCP/IP on Port 5190.");
                }}
                id="login-setup-btn"
              >
                Setup
              </button>
              <button
                type="submit"
                className="px-5 py-1 bg-retro-gray bevel-out text-xs text-black font-bold hover:bg-neutral-100 active:bevel-out-active flex items-center gap-1.5"
                id="login-signon-btn"
              >
                Sign On
              </button>
            </div>
          </form>
        ) : (
          /* Connecting Sequence Overlay */
          <div className="p-6 flex flex-col gap-5 items-center justify-center min-h-[220px]">
            <span className="text-5xl animate-bounce">🏃</span>
            <div className="w-full flex flex-col gap-1.5 text-center">
              <span className="font-bold text-xs text-neutral-800">AIM Connecting...</span>
              <p className="text-xs text-neutral-600 font-mono h-8 flex items-center justify-center px-2">
                {connectText}
              </p>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full bg-white bevel-in h-4 p-0.5">
              <div 
                className="bg-retro-blue h-full transition-all duration-300"
                style={{ width: `${((connectStep + 1) / connectionSteps.length) * 100}%` }}
              />
            </div>

            <button
              type="button"
              className="px-4 py-1 bg-retro-gray bevel-out text-xs text-neutral-800 hover:bg-neutral-100 active:bevel-out-active self-center mt-2"
              onClick={() => {
                soundManager.playSignOff();
                setIsConnecting(false);
              }}
              id="login-cancel-btn"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );

  function setNameWithLimits(val: string) {
    // Alphanumeric + spaces only for realistic AIM screen names
    const filtered = val.replace(/[^a-zA-Z0-9 ]/g, "");
    setScreenName(filtered);
  }
}
