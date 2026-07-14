import React, { useState, useRef, useEffect } from "react";
import { Buddy, Message, FontSettings, Conversation } from "../types";
import { soundManager } from "../lib/sounds";

interface ChatWindowProps {
  buddy: Buddy;
  conversation: Conversation;
  onSendMessage: (text: string, fontSettings: FontSettings) => void;
  onWarnBuddy: () => void;
  onToggleBlock: () => void;
  onGetInfo: () => void;
  onClose: () => void;
  isSending: boolean;
}

const COLOR_OPTIONS = [
  { name: "Black", value: "#000000" },
  { name: "Blue", value: "#0000ff" },
  { name: "Red", value: "#ff0000" },
  { name: "Green", value: "#008000" },
  { name: "Magenta", value: "#ff00ff" },
  { name: "Orange", value: "#ff6600" },
  { name: "Teal", value: "#008080" },
  { name: "Purple", value: "#800080" }
];

const SMILEYS = [":-)", ":-(", ";-)", ":-D", ":-P", "<3", "8-)", ":-*"];

export default function ChatWindow({
  buddy,
  conversation,
  onSendMessage,
  onWarnBuddy,
  onToggleBlock,
  onGetInfo,
  onClose,
  isSending,
}: ChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const [fontSettings, setFontSettings] = useState<FontSettings>({
    family: "Arial",
    color: "#0000ff", // Classic AIM blue text!
    size: "medium",
    bold: false,
    italic: false,
    underline: false,
  });

  const [showColors, setShowColors] = useState(false);
  const [showSmileys, setShowSmileys] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the conversation history log when new messages arrive
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (conversation.isBlocked) {
      soundManager.playWarning();
      alert("This buddy is blocked. Unblock them first to resume chatting!");
      return;
    }

    onSendMessage(inputText.trim(), fontSettings);
    setInputText("");
    soundManager.playSent();
  };

  const insertSmiley = (smiley: string) => {
    setInputText((prev) => prev + " " + smiley);
    setShowSmileys(false);
    soundManager.playSent();
  };

  const getFontFamilyStyle = (family: string) => {
    switch (family) {
      case "Courier New": return "font-mono";
      case "Comic Sans MS": return "font-sans font-medium tracking-tight";
      case "Times New Roman": return "font-serif";
      default: return "font-sans";
    }
  };

  return (
    <div className="w-[520px] bg-retro-gray bevel-out p-1 flex flex-col font-sans text-sm h-[420px] select-none text-black">
      {/* Title Bar */}
      <div className="bg-gradient-to-r from-retro-blue to-retro-light-blue text-white px-1.5 py-1 flex items-center justify-between select-none">
        <div className="flex items-center gap-1.5">
          <span className="text-yellow-400 font-bold text-xs">🏃</span>
          <span className="font-bold text-xs">{buddy.screenName} - Instant Message</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button 
            className="w-4 h-4 bg-retro-gray bevel-out text-black font-extrabold text-[9px] flex items-center justify-center pb-1 hover:bg-neutral-100 cursor-pointer"
            onClick={onClose}
            aria-label="Minimize"
          >
            _
          </button>
          <button 
            className="w-4 h-4 bg-retro-gray bevel-out text-black font-extrabold text-[9px] flex items-center justify-center hover:bg-neutral-100 cursor-pointer"
            onClick={onClose}
            aria-label="Close"
          >
            X
          </button>
        </div>
      </div>

      {/* Warning Level Display Area */}
      <div className="px-2 py-1 border-b border-retro-dark-gray text-[11px] text-neutral-700 bg-neutral-100 flex items-center justify-between">
        <span>To: <strong className="font-bold text-black">{buddy.screenName}</strong></span>
        <span className="font-semibold text-red-700">
          {buddy.screenName}'s Warning Level: <strong className="font-bold">{buddy.warningLevel}%</strong>
        </span>
      </div>

      {/* Main Body Grid */}
      <div className="flex flex-row flex-grow min-h-0 bg-neutral-200">
        {/* Left: Chat history log + formatting toolbar + input area */}
        <div className="flex flex-col flex-grow min-w-0 p-2 gap-1.5">
          {/* Conversation Chat History Log */}
          <div className="flex-grow bg-white bevel-in p-2.5 overflow-y-auto h-48 retro-scrollbar flex flex-col gap-2">
            {conversation.messages.length === 0 ? (
              <div className="text-[11px] text-neutral-400 italic text-center py-4">
                Chat session started. Send a message to {buddy.screenName}!
              </div>
            ) : (
              conversation.messages.map((msg) => {
                const isMe = msg.sender === "Me";
                return (
                  <div key={msg.id} className="text-xs">
                    {/* Header line */}
                    <div className="flex items-center gap-1.5 select-text">
                      <strong className={`font-bold ${isMe ? "text-red-700" : "text-blue-800"}`}>
                        {msg.sender}:
                      </strong>
                      <span className="text-[10px] text-neutral-400 font-mono">({msg.timestamp})</span>
                      {msg.isAutoResponse && (
                        <span className="text-[9px] bg-red-100 text-red-800 px-1 rounded-sm border border-red-300 font-semibold uppercase">
                          Auto
                        </span>
                      )}
                    </div>
                    {/* Message Text with individual font styles */}
                    <div 
                      className={`mt-0.5 whitespace-pre-wrap leading-relaxed select-text font-sans`}
                      style={{
                        color: isMe ? fontSettings.color : "#000000",
                        fontFamily: isMe ? fontSettings.family : "MS Sans Serif",
                        fontWeight: isMe && fontSettings.bold ? "bold" : "normal",
                        fontStyle: isMe && fontSettings.italic ? "italic" : "normal",
                        textDecoration: isMe && fontSettings.underline ? "underline" : "none",
                        fontSize: isMe 
                          ? (fontSettings.size === "small" ? "11px" : fontSettings.size === "large" ? "15px" : "13px") 
                          : "13px"
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            {isSending && (
              <div className="text-[11px] text-neutral-400 italic flex items-center gap-1">
                <span className="animate-pulse">🏃</span> {buddy.screenName} is typing...
              </div>
            )}
            <div ref={logEndRef} />
          </div>

          {/* Text Formatting Toolbar */}
          <div className="flex items-center gap-1 bg-retro-gray p-0.5 border border-retro-dark-gray/30 rounded-sm relative">
            {/* Font Family Dropdown */}
            <select
              className="text-[11px] bg-white border border-retro-dark-gray px-1 py-0.5 outline-none font-bold"
              value={fontSettings.family}
              onChange={(e) => setFontSettings(prev => ({ ...prev, family: e.target.value as any }))}
              aria-label="Font Family"
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times Roman</option>
              <option value="Courier New">Courier</option>
              <option value="Comic Sans MS">Comic Sans</option>
            </select>

            {/* Font Size Dropdown */}
            <select
              className="text-[11px] bg-white border border-retro-dark-gray px-1 py-0.5 outline-none font-bold"
              value={fontSettings.size}
              onChange={(e) => setFontSettings(prev => ({ ...prev, size: e.target.value as any }))}
              aria-label="Font Size"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>

            <span className="w-[1px] h-4 bg-retro-dark-gray/40 mx-0.5" />

            {/* Bold Toggle */}
            <button
              type="button"
              className={`w-6 h-5 flex items-center justify-center font-extrabold text-xs bevel-out cursor-pointer hover:bg-neutral-100 ${
                fontSettings.bold ? "bevel-out-active bg-neutral-300" : "bg-retro-gray"
              }`}
              onClick={() => {
                setFontSettings(prev => ({ ...prev, bold: !prev.bold }));
                soundManager.playSent();
              }}
              title="Bold"
            >
              B
            </button>

            {/* Italic Toggle */}
            <button
              type="button"
              className={`w-6 h-5 flex items-center justify-center italic font-bold text-xs bevel-out cursor-pointer hover:bg-neutral-100 ${
                fontSettings.italic ? "bevel-out-active bg-neutral-300" : "bg-retro-gray"
              }`}
              onClick={() => {
                setFontSettings(prev => ({ ...prev, italic: !prev.italic }));
                soundManager.playSent();
              }}
              title="Italic"
            >
              I
            </button>

            {/* Underline Toggle */}
            <button
              type="button"
              className={`w-6 h-5 flex items-center justify-center underline font-bold text-xs bevel-out cursor-pointer hover:bg-neutral-100 ${
                fontSettings.underline ? "bevel-out-active bg-neutral-300" : "bg-retro-gray"
              }`}
              onClick={() => {
                setFontSettings(prev => ({ ...prev, underline: !prev.underline }));
                soundManager.playSent();
              }}
              title="Underline"
            >
              U
            </button>

            <span className="w-[1px] h-4 bg-retro-dark-gray/40 mx-0.5" />

            {/* Text Color Selector */}
            <button
              type="button"
              className="w-6 h-5 flex items-center justify-center bevel-out cursor-pointer hover:bg-neutral-100"
              style={{ color: fontSettings.color }}
              onClick={() => {
                setShowColors(!showColors);
                setShowSmileys(false);
                soundManager.playSent();
              }}
              title="Font Color"
            >
              A
            </button>

            {/* Smiley Emoji Selector */}
            <button
              type="button"
              className="w-6 h-5 flex items-center justify-center text-xs font-bold bevel-out cursor-pointer hover:bg-neutral-100"
              onClick={() => {
                setShowSmileys(!showSmileys);
                setShowColors(false);
                soundManager.playSent();
              }}
              title="Smileys"
            >
              :-)
            </button>

            {/* Floating Color Menu */}
            {showColors && (
              <div className="absolute top-6 left-28 bg-retro-gray border border-retro-dark-gray p-1 grid grid-cols-4 gap-1 z-30 shadow-md bevel-out">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className="w-4 h-4 cursor-pointer border border-neutral-400 hover:scale-110 flex"
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                    onClick={() => {
                      setFontSettings(p => ({ ...p, color: c.value }));
                      setShowColors(false);
                      soundManager.playSent();
                    }}
                  />
                ))}
              </div>
            )}

            {/* Floating Smiley Menu */}
            {showSmileys && (
              <div className="absolute top-6 left-36 bg-retro-gray border border-retro-dark-gray p-1 grid grid-cols-4 gap-1.5 z-30 shadow-md bevel-out text-xs">
                {SMILEYS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="px-1.5 py-0.5 hover:bg-retro-blue hover:text-white cursor-pointer rounded-sm"
                    onClick={() => insertSmiley(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Form Message Typing Area */}
          <form onSubmit={handleSend} className="flex gap-2 items-start">
            <textarea
              id="chat-message-input"
              className={`bevel-in p-2 flex-grow h-14 text-xs outline-none resize-none font-sans`}
              style={{
                fontFamily: fontSettings.family,
                color: fontSettings.color,
                fontWeight: fontSettings.bold ? "bold" : "normal",
                fontStyle: fontSettings.italic ? "italic" : "normal",
                textDecoration: fontSettings.underline ? "underline" : "none",
                fontSize: fontSettings.size === "small" ? "11px" : fontSettings.size === "large" ? "15px" : "13px"
              }}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your instant message..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              maxLength={400}
            />
            <button
              type="submit"
              className="px-4 py-3 bg-retro-gray bevel-out text-xs font-bold hover:bg-neutral-100 active:bevel-out-active cursor-pointer h-14 flex items-center justify-center text-black"
              id="chat-send-btn"
            >
              Send
            </button>
          </form>
        </div>

        {/* Right: Buddy profile image box and action controls */}
        <div className="w-[120px] border-l border-retro-dark-gray/40 flex flex-col items-center p-2.5 bg-retro-gray justify-between">
          {/* Beveled Buddy Icon Box Frame */}
          <div className="flex flex-col items-center gap-1 w-full">
            <div className="w-[72px] h-[72px] bg-white bevel-in flex items-center justify-center text-4xl select-none shadow-inner rounded-sm">
              {conversation.isBlocked ? "🚫" : buddy.avatar}
            </div>
            <span className="text-[10px] text-neutral-600 font-semibold truncate max-w-full text-center">
              {buddy.screenName}
            </span>
          </div>

          {/* Side Action Column Buttons */}
          <div className="flex flex-col gap-1 w-full mt-3">
            <button
              type="button"
              className="w-full py-0.5 bg-retro-gray bevel-out text-[11px] hover:bg-neutral-100 active:bevel-out-active text-black cursor-pointer"
              onClick={() => {
                onWarnBuddy();
                soundManager.playWarning();
              }}
              title="Warn this buddy (increases their warning level)"
            >
              Warn
            </button>
            <button
              type="button"
              className={`w-full py-0.5 bevel-out text-[11px] hover:bg-neutral-100 active:bevel-out-active cursor-pointer ${
                conversation.isBlocked ? "bg-red-200 text-red-900 font-bold" : "text-black"
              }`}
              onClick={() => {
                onToggleBlock();
                soundManager.playSignOff();
              }}
            >
              {conversation.isBlocked ? "Unblock" : "Block"}
            </button>
            <button
              type="button"
              className="w-full py-0.5 bg-retro-gray bevel-out text-[11px] hover:bg-neutral-100 active:bevel-out-active text-black cursor-pointer"
              onClick={onGetInfo}
            >
              Get Info
            </button>
          </div>
        </div>
      </div>

      {/* Ad Space (Nostalgic placeholder) */}
      <div className="bg-[#f1f1f1] h-8 mx-2 mb-1.5 flex items-center justify-center border border-retro-dark-gray/30 text-neutral-500 text-[10px] uppercase tracking-wider select-none font-sans">
        Advertisement: Upgrade to <strong className="font-black text-blue-800 mx-1">AIM Gold</strong> for Unlimited Premium AI features!
      </div>
    </div>
  );
}
