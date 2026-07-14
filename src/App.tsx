import React, { useState, useEffect, useCallback } from "react";
import { Buddy, UserProfile, Conversation, FontSettings, Message, BuddyStatus } from "./types";
import { INITIAL_BUDDIES, SYSTEM_GREETINGS } from "./data";
import { soundManager } from "./lib/sounds";
import LoginScreen from "./components/LoginScreen";
import BuddyList from "./components/BuddyList";
import ChatWindow from "./components/ChatWindow";
import AwayDialog from "./components/AwayDialog";
import ProfileDialog from "./components/ProfileDialog";
import BuddyInfoDialog from "./components/BuddyInfoDialog";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    screenName: "CoolUser99",
    status: "online",
    awayMessage: "AFK eating a Hot Pocket... bbl!",
    isAway: false,
    avatarColor: "🎮",
    warningLevel: 0,
  });

  const [buddies, setBuddies] = useState<Buddy[]>(INITIAL_BUDDIES);
  const [conversations, setConversations] = useState<Record<string, Conversation>>({});
  const [activeChatBuddyId, setActiveChatBuddyId] = useState<string | null>(null);
  
  // Dialog visibility states
  const [showAwayDialog, setShowAwayDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [selectedInfoBuddy, setSelectedInfoBuddy] = useState<Buddy | null>(null);

  // Sound muting
  const [isMuted, setIsMuted] = useState(false);

  // Buddy typing states (stores buddyId -> isTyping)
  const [isSending, setIsSending] = useState<Record<string, boolean>>({});

  // OS Taskbar & Start Menu states
  const [taskbarTime, setTaskbarTime] = useState("");
  const [showStartMenu, setShowStartMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      setTaskbarTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Reset all state on logout
  const handleLogout = () => {
    soundManager.playSignOff();
    setIsLoggedIn(false);
    setActiveChatBuddyId(null);
    setConversations({});
    setBuddies(INITIAL_BUDDIES);
  };

  // Sound Mute Toggle
  const toggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  // Helper: Format current timestamp (e.g. 11:24 AM)
  const getTimestamp = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  // Start chat with a buddy (triggered by double-click or clicking IM)
  const handleSelectBuddy = (buddyId: string) => {
    const targetBuddy = buddies.find((b) => b.id === buddyId);
    if (!targetBuddy) return;

    if (targetBuddy.status === "offline") {
      soundManager.playWarning();
      alert(`${targetBuddy.screenName} is offline. You can only chat with online or away buddies!`);
      return;
    }

    // Initialize conversation logs if not yet present
    if (!conversations[buddyId]) {
      setConversations((prev) => ({
        ...prev,
        [buddyId]: {
          buddyId,
          messages: [],
          isBlocked: false,
          unreadCount: 0,
        },
      }));
    } else {
      // Clear unread badge
      setConversations((prev) => ({
        ...prev,
        [buddyId]: {
          ...prev[buddyId],
          unreadCount: 0,
        },
      }));
    }

    setActiveChatBuddyId(buddyId);
    soundManager.playSent();
  };

  // Toggle user between online and away status
  const handleToggleUserStatus = (status: BuddyStatus) => {
    if (status === "away") {
      setShowAwayDialog(true);
    } else {
      setUserProfile((prev) => ({
        ...prev,
        status: "online",
        isAway: false,
      }));
      soundManager.playSignOn();
    }
  };

  // Triggered when user selects their away message from dialog
  const handleSaveAwayMessage = (message: string) => {
    setUserProfile((prev) => ({
      ...prev,
      status: "away",
      isAway: true,
      awayMessage: message,
    }));
    setShowAwayDialog(false);
  };

  // Update user profile info settings
  const handleSaveProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    setShowProfileDialog(false);
  };

  // Send an IM message to buddy
  const handleSendMessage = async (text: string, fontSettings: FontSettings) => {
    if (!activeChatBuddyId) return;

    const buddyId = activeChatBuddyId;
    const buddy = buddies.find((b) => b.id === buddyId);
    if (!buddy) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "Me",
      text,
      timestamp: getTimestamp(),
    };

    // 1. Add user message to state
    setConversations((prev) => {
      const existing = prev[buddyId] || { buddyId, messages: [], isBlocked: false, unreadCount: 0 };
      return {
        ...prev,
        [buddyId]: {
          ...existing,
          messages: [...existing.messages, userMsg],
          unreadCount: 0,
        },
      };
    });

    // 2. Clear unread indicators
    soundManager.playSent();

    // 3. Initiate Gemini API response proxy call
    setIsSending((prev) => ({ ...prev, [buddyId]: true }));

    try {
      // Collect current history context
      const chatHistory = conversations[buddyId]?.messages || [];
      const updatedHistory = [...chatHistory, userMsg];

      // Format simple history logs for backend (role: user/model)
      const formattedHistory = updatedHistory.map((m) => ({
        role: m.sender === "Me" ? "user" : "model",
        text: m.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buddyId,
          messages: formattedHistory,
          warningLevel: buddy.warningLevel,
        }),
      });

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Add AI reply
      const aiReply: Message = {
        id: Math.random().toString(),
        sender: buddy.screenName,
        text: data.reply,
        timestamp: getTimestamp(),
      };

      setConversations((prev) => {
        const existing = prev[buddyId] || { buddyId, messages: [], isBlocked: false, unreadCount: 0 };
        return {
          ...prev,
          [buddyId]: {
            ...existing,
            messages: [...existing.messages, aiReply],
          },
        };
      });

      soundManager.playReceived();

    } catch (err: any) {
      console.error(err);
      soundManager.playWarning();

      const errMsg: Message = {
        id: Math.random().toString(),
        sender: "System Error",
        text: `<Connection Alert>: Failed to transmit instant message. ${err.message || "Please check your network."}`,
        timestamp: getTimestamp(),
      };

      setConversations((prev) => {
        const existing = prev[buddyId];
        return {
          ...prev,
          [buddyId]: {
            ...existing,
            messages: [...existing.messages, errMsg],
          },
        };
      });
    } finally {
      setIsSending((prev) => ({ ...prev, [buddyId]: false }));
    }
  };

  // Warn buddy (increases their warning level by 10%)
  const handleWarnBuddy = async () => {
    if (!activeChatBuddyId) return;
    const buddyId = activeChatBuddyId;

    setBuddies((prev) =>
      prev.map((b) => {
        if (b.id === buddyId) {
          const nextWarn = Math.min(b.warningLevel + 10, 100);
          return { ...b, warningLevel: nextWarn };
        }
        return b;
      })
    );

    soundManager.playWarning();

    // Trigger immediate defensive reaction from the bot regarding the warning!
    setIsSending((prev) => ({ ...prev, [buddyId]: true }));
    try {
      const buddy = buddies.find((b) => b.id === buddyId);
      const nextWarn = Math.min((buddy?.warningLevel || 0) + 10, 100);

      const sysNoticeMsg = `(SYSTEM NOTICE: The user has just clicked the Warn button on you. Your warning level has increased to ${nextWarn}%. Issue an immediate highly annoyed/defensive reaction in 1 short sentence!)`;
      
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buddyId,
          messages: [{ role: "user", text: sysNoticeMsg }],
          warningLevel: nextWarn,
        }),
      });

      const data = await res.json();
      if (!data.error) {
        const reactionMsg: Message = {
          id: Math.random().toString(),
          sender: buddy?.screenName || buddyId,
          text: data.reply,
          timestamp: getTimestamp(),
        };

        setConversations((prev) => {
          const existing = prev[buddyId];
          return {
            ...prev,
            [buddyId]: {
              ...existing,
              messages: [...existing.messages, reactionMsg],
            },
          };
        });
        soundManager.playReceived();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending((prev) => ({ ...prev, [buddyId]: false }));
    }
  };

  // Toggle blocking of buddy
  const handleToggleBlock = () => {
    if (!activeChatBuddyId) return;
    const buddyId = activeChatBuddyId;

    setConversations((prev) => {
      const existing = prev[buddyId];
      return {
        ...prev,
        [buddyId]: {
          ...existing,
          isBlocked: !existing.isBlocked,
        },
      };
    });
  };

  // Open buddy's profile card
  const handleOpenBuddyInfo = (buddyId: string) => {
    const target = buddies.find((b) => b.id === buddyId);
    if (target) {
      setSelectedInfoBuddy(target);
      soundManager.playSent();
    }
  };

  // Network Simulation: Runs periodically to simulate buddy sign-on, sign-off, or spontaneous pings!
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(async () => {
      // Pick a random buddy
      const randomIndex = Math.floor(Math.random() * buddies.length);
      const selectedBuddy = buddies[randomIndex];
      if (!selectedBuddy) return;

      const roll = Math.random();

      // Scenario A: Offline buddy signs on (25% chance of rolling a sign on if offline)
      if (selectedBuddy.status === "offline" && roll < 0.25) {
        setBuddies((prev) =>
          prev.map((b) => (b.id === selectedBuddy.id ? { ...b, status: "online" } : b))
        );
        soundManager.playSignOn();
        
        // Add offline-join notification if chat logs exist
        if (conversations[selectedBuddy.id]) {
          const sysMsg: Message = {
            id: Math.random().toString(),
            sender: "System",
            text: `*** ${selectedBuddy.screenName} has signed on.`,
            timestamp: getTimestamp(),
          };
          setConversations((prev) => ({
            ...prev,
            [selectedBuddy.id]: {
              ...prev[selectedBuddy.id],
              messages: [...prev[selectedBuddy.id].messages, sysMsg],
            },
          }));
        }
      } 
      // Scenario B: Online buddy signs off (10% chance)
      else if (selectedBuddy.status !== "offline" && roll < 0.10) {
        setBuddies((prev) =>
          prev.map((b) => (b.id === selectedBuddy.id ? { ...b, status: "offline" } : b))
        );
        soundManager.playSignOff();

        if (conversations[selectedBuddy.id]) {
          const sysMsg: Message = {
            id: Math.random().toString(),
            sender: "System",
            text: `*** ${selectedBuddy.screenName} has signed off.`,
            timestamp: getTimestamp(),
          };
          setConversations((prev) => ({
            ...prev,
            [selectedBuddy.id]: {
              ...prev[selectedBuddy.id],
              messages: [...prev[selectedBuddy.id].messages, sysMsg],
            },
          }));
        }
      }
      // Scenario C: Spontaneous chat message ping! (12% chance if online)
      else if (selectedBuddy.status === "online" && roll < 0.12) {
        // Only ping if not currently blocked
        const isBlocked = conversations[selectedBuddy.id]?.isBlocked;
        if (isBlocked) return;

        // Set typing indicator
        setIsSending((prev) => ({ ...prev, [selectedBuddy.id]: true }));

        try {
          // Send special developer instruction prompt so the AI initiates a casual ping based on personality
          const sysPrompt = `(SYSTEM: The user is idling at their computer. Send a casual, realistic AIM chat message to start a conversation, talk about your 1999/2001 interests, or ask them what they are doing. Keep it strictly to 1 short sentence.)`;
          const history = conversations[selectedBuddy.id]?.messages || [];

          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              buddyId: selectedBuddy.id,
              messages: [...history.map(m => ({ role: m.sender === "Me" ? "user" : "model", text: m.text })), { role: "user", text: sysPrompt }],
              warningLevel: selectedBuddy.warningLevel,
            }),
          });

          const data = await res.json();
          if (!data.error) {
            const spontaneousMsg: Message = {
              id: Math.random().toString(),
              sender: selectedBuddy.screenName,
              text: data.reply,
              timestamp: getTimestamp(),
            };

            setConversations((prev) => {
              const existing = prev[selectedBuddy.id] || { buddyId: selectedBuddy.id, messages: [], isBlocked: false, unreadCount: 0 };
              const isCurrentlyActive = activeChatBuddyId === selectedBuddy.id;
              return {
                ...prev,
                [selectedBuddy.id]: {
                  ...existing,
                  messages: [...existing.messages, spontaneousMsg],
                  unreadCount: isCurrentlyActive ? 0 : existing.unreadCount + 1,
                },
              };
            });

            soundManager.playReceived();
          }

        } catch (e) {
          console.error("Failed spontaneous ping:", e);
        } finally {
          setIsSending((prev) => ({ ...prev, [selectedBuddy.id]: false }));
        }
      }
    }, 15000); // Runs every 15 seconds for a highly responsive network simulation!

    return () => clearInterval(interval);
  }, [isLoggedIn, buddies, conversations, activeChatBuddyId]);

  // Away Auto-Response Hook: Triggers if user is set to Away, gets a message from a buddy, and replies automatically
  useEffect(() => {
    if (!userProfile.isAway || !isLoggedIn) return;

    // Check if the last message in any conversation is from a buddy, and we haven't auto-responded yet
    Object.keys(conversations).forEach(async (buddyId) => {
      const conv = conversations[buddyId];
      if (!conv || conv.messages.length === 0 || conv.isBlocked) return;

      const lastMsg = conv.messages[conv.messages.length - 1];
      
      // If the last message is from the buddy and NOT an autoresponse itself
      if (lastMsg.sender !== "Me" && !lastMsg.text.startsWith("<Auto-Response>")) {
        // Send our auto-response!
        const autoMsgText = `<Auto-Response>: I am currently away from my computer. Reason: ${userProfile.awayMessage}`;
        
        const autoMsg: Message = {
          id: Math.random().toString(),
          sender: "Me",
          text: autoMsgText,
          timestamp: getTimestamp(),
          isAutoResponse: true,
        };

        // Add auto response log
        setConversations((prev) => ({
          ...prev,
          [buddyId]: {
            ...prev[buddyId],
            messages: [...prev[buddyId].messages, autoMsg],
          },
        }));

        soundManager.playSent();

        // Ask the AI to reply to the auto-response in character!
        setIsSending((prev) => ({ ...prev, [buddyId]: true }));
        try {
          const sysPrompt = `(SYSTEM: The user just auto-responded to your message with: '${autoMsgText}'. Respond to this away message in your character in 1 short sentence, e.g., saying cya, expressing frustration, or leaving a joke.)`;
          const history = [...conv.messages, autoMsg];

          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              buddyId,
              messages: history.map(m => ({ role: m.sender === "Me" ? "user" : "model", text: m.text })),
              warningLevel: buddies.find(b => b.id === buddyId)?.warningLevel || 0,
            }),
          });

          const data = await res.json();
          if (!data.error) {
            const aiReply: Message = {
              id: Math.random().toString(),
              sender: buddies.find(b => b.id === buddyId)?.screenName || buddyId,
              text: data.reply,
              timestamp: getTimestamp(),
            };

            setConversations((prev) => ({
              ...prev,
              [buddyId]: {
                ...prev[buddyId],
                messages: [...prev[buddyId].messages, aiReply],
              },
            }));
            soundManager.playReceived();
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsSending((prev) => ({ ...prev, [buddyId]: false }));
        }
      }
    });
  }, [conversations, userProfile.isAway, userProfile.awayMessage, isLoggedIn, buddies]);

  const handleLoginSuccess = (name: string) => {
    setUserProfile((prev) => ({
      ...prev,
      screenName: name,
    }));
    setIsLoggedIn(true);
  };

  // Render Login Screen if not authenticated
  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Active chat session variables
  const activeBuddy = activeChatBuddyId ? buddies.find((b) => b.id === activeChatBuddyId) : null;
  const activeConversation = activeChatBuddyId ? conversations[activeChatBuddyId] : null;

  // Unread badge map for buddy list
  const unreadCountsMap: Record<string, number> = {};
  Object.keys(conversations).forEach((buddyId) => {
    unreadCountsMap[buddyId] = conversations[buddyId].unreadCount;
  });

  return (
    <div className="h-screen w-full bg-[#008080] flex flex-col justify-between font-sans overflow-hidden relative select-none">
      
      {/* Background Retro Grid Motif Wallpaper */}
      <div className="absolute inset-0 bg-[radial-gradient(#004d4d_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Top Menu Bar */}
      <div className="flex items-center gap-4 bg-retro-gray border-b border-retro-dark-gray px-3 py-1.5 text-xs shadow-sm z-20 text-black">
        <div 
          className="hover:bg-retro-blue hover:text-white px-2 py-0.5 cursor-pointer rounded-sm"
          onClick={() => {
            soundManager.playSent();
            setShowStartMenu(prev => !prev);
          }}
        >
          File
        </div>
        <div 
          className="hover:bg-retro-blue hover:text-white px-2 py-0.5 cursor-pointer rounded-sm"
          onClick={() => {
            soundManager.playSent();
            setShowProfileDialog(true);
          }}
        >
          Edit Profile
        </div>
        <div 
          className="hover:bg-retro-blue hover:text-white px-2 py-0.5 cursor-pointer rounded-sm"
          onClick={() => {
            soundManager.playSent();
            setShowAwayDialog(true);
          }}
        >
          Away Message
        </div>
        <div 
          className="hover:bg-retro-blue hover:text-white px-2 py-0.5 cursor-pointer rounded-sm"
          onClick={() => {
            soundManager.playSent();
            toggleMute();
          }}
        >
          {isMuted ? "Unmute Sound" : "Mute Sound"}
        </div>
        <div 
          className="hover:bg-retro-blue hover:text-white px-2 py-0.5 cursor-pointer rounded-sm ml-auto font-semibold"
          onClick={handleLogout}
        >
          Sign Off
        </div>
      </div>

      {/* Main Desktop Workspace Area */}
      <div className="flex-grow flex items-center justify-center p-4 relative z-10 overflow-hidden">
        <div className="w-full max-w-5xl flex gap-5 items-start justify-center">
          
          {/* Main Buddy List Hub (always visible on left) */}
          <BuddyList
            userProfile={userProfile}
            buddies={buddies}
            unreadCounts={unreadCountsMap}
            onSelectBuddy={handleSelectBuddy}
            onOpenAwayDialog={() => setShowAwayDialog(true)}
            onOpenProfileDialog={() => setShowProfileDialog(true)}
            onOpenBuddyInfo={handleOpenBuddyInfo}
            onToggleUserStatus={handleToggleUserStatus}
            onSignOff={handleLogout}
          />

          {/* Right side panel: Either Chat Window or retro welcome splash screen */}
          {activeBuddy && activeConversation ? (
            <ChatWindow
              buddy={activeBuddy}
              conversation={activeConversation}
              onSendMessage={handleSendMessage}
              onWarnBuddy={handleWarnBuddy}
              onToggleBlock={handleToggleBlock}
              onGetInfo={() => handleOpenBuddyInfo(activeBuddy.id)}
              onClose={() => setActiveChatBuddyId(null)}
              isSending={isSending[activeBuddy.id] || false}
            />
          ) : (
            /* Retro AOL Welcome Screen Placeholder */
            <div className="w-[520px] bg-retro-gray bevel-out p-1 flex flex-col h-[420px] justify-between text-black relative">
              <div className="bg-gradient-to-r from-retro-blue to-retro-light-blue text-white px-1.5 py-1 flex items-center select-none justify-between">
                <span className="font-bold text-xs">Welcome to AIM</span>
                <span className="text-yellow-400 font-bold text-xs">🏃</span>
              </div>

              <div className="flex-grow flex flex-col items-center justify-center p-6 text-center gap-4 bg-white m-2 bevel-in">
                <span className="text-6xl animate-bounce">🏃</span>
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-black text-black">AOL Instant Messenger</h2>
                  <p className="text-xs text-neutral-500 font-mono">Select a buddy from your list to start chatting.</p>
                </div>
                <div className="text-[11px] text-neutral-400 bg-neutral-50 border border-neutral-200 p-2.5 max-w-sm rounded-sm font-mono text-left leading-relaxed">
                  <span className="font-bold text-neutral-600">Retro Tips:</span>
                  <ul className="list-disc pl-4 mt-1 flex flex-col gap-0.5">
                    <li>Double-click a buddy screen name to send an Instant Message.</li>
                    <li>Click <strong>Warn</strong> to increase a bot's stress level and view their reactive outrage!</li>
                    <li>Go <strong>Away</strong> to test the automatic instant away responder loops.</li>
                  </ul>
                </div>
              </div>

              {/* Quick sound mute controller along the bottom bar */}
              <div className="p-2 border-t border-neutral-300 flex items-center justify-between bg-neutral-200 text-[11px]">
                <span className="text-neutral-500 font-mono">America Online Inc. v4.7</span>
                <button
                  type="button"
                  className="px-2 py-0.5 bg-retro-gray bevel-out text-xs font-bold hover:bg-neutral-100 active:bevel-out-active flex items-center gap-1.5 cursor-pointer text-black"
                  onClick={toggleMute}
                >
                  <span>{isMuted ? "🔇 Muted" : "🔊 Sound On"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Retro OS Taskbar */}
      <div className="bg-retro-gray border-t-2 border-white px-2 py-1 flex items-center justify-between text-xs text-black h-10 select-none z-20 shadow-[0_-2px_4px_rgba(0,0,0,0.15)] relative">
        <div className="flex items-center gap-2">
          {/* Start Button */}
          <button
            type="button"
            className={`px-3 py-1 bg-retro-gray bevel-out flex items-center gap-1.5 font-bold cursor-pointer hover:bg-neutral-100 ${
              showStartMenu ? "bevel-out-active bg-neutral-200" : ""
            }`}
            onClick={() => {
              soundManager.playSent();
              setShowStartMenu(prev => !prev);
            }}
          >
            <span className="text-sm">🏃</span>
            <span>Start</span>
          </button>

          <div className="h-6 w-[1px] bg-retro-dark-gray/40 mx-1" />

          {/* Active Tasks list */}
          <div className="flex gap-2">
            <div className="bg-white border-2 border-inset px-3 py-1 font-bold flex items-center gap-1">
              <span>🏃</span>
              <span>AIM Buddy List</span>
            </div>
            {activeBuddy && (
              <div 
                className="bg-retro-gray bevel-out px-3 py-1 flex items-center gap-1 cursor-pointer hover:bg-neutral-100"
                onClick={() => {
                  soundManager.playSent();
                }}
              >
                <span>💬</span>
                <span className="truncate max-w-[120px]">{activeBuddy.screenName}</span>
              </div>
            )}
          </div>
        </div>

        {/* System tray (Clock + Sound indicator) */}
        <div className="bg-retro-gray border-2 border-inset px-2 py-1 text-[11px] font-mono flex items-center gap-2">
          <span 
            className="cursor-pointer" 
            title={isMuted ? "Sounds are Muted" : "Sounds are Active"}
            onClick={toggleMute}
          >
            {isMuted ? "🔇" : "🔊"}
          </span>
          <span>{taskbarTime}</span>
        </div>

        {/* Start Menu Popup */}
        {showStartMenu && (
          <div className="absolute bottom-10 left-2 w-60 bg-retro-gray border-2 border-white bevel-out flex flex-col z-30 shadow-2xl text-black">
            {/* Banner/Sidebar inside Start Menu */}
            <div className="flex">
              <div className="w-8 bg-gradient-to-t from-retro-blue to-retro-light-blue text-white flex items-end justify-center py-2 select-none">
                <span className="font-bold text-xs tracking-widest uppercase font-sans -rotate-90 origin-bottom-left translate-x-2.5 -translate-y-2 whitespace-nowrap">
                  AIM 1999
                </span>
              </div>
              
              <div className="flex-grow flex flex-col py-1">
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-retro-blue hover:text-white flex items-center gap-2"
                  onClick={() => {
                    setShowStartMenu(false);
                    soundManager.playSent();
                    setShowProfileDialog(true);
                  }}
                >
                  <span className="text-base">🎮</span>
                  <span className="font-medium text-xs">Profile Settings</span>
                </button>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-retro-blue hover:text-white flex items-center gap-2"
                  onClick={() => {
                    setShowStartMenu(false);
                    soundManager.playSent();
                    setShowAwayDialog(true);
                  }}
                >
                  <span className="text-base">🟡</span>
                  <span className="font-medium text-xs">Away Message</span>
                </button>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-retro-blue hover:text-white flex items-center gap-2"
                  onClick={() => {
                    setShowStartMenu(false);
                    toggleMute();
                  }}
                >
                  <span className="text-base">{isMuted ? "🔊" : "🔇"}</span>
                  <span className="font-medium text-xs">{isMuted ? "Enable Sounds" : "Mute Sounds"}</span>
                </button>
                <div className="h-[1px] bg-retro-dark-gray/30 my-1" />
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-retro-blue hover:text-white flex items-center gap-2"
                  onClick={() => {
                    setShowStartMenu(false);
                    soundManager.playReceived();
                    alert("AIM AI Client v4.7\n-----------------------\nCreated for AI Studio in 2026.\nEnjoy talking with nostalgia-driven bots!");
                  }}
                >
                  <span className="text-base">ℹ️</span>
                  <span className="font-medium text-xs">About AIM Client</span>
                </button>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-retro-blue hover:text-white flex items-center gap-2"
                  onClick={() => {
                    setShowStartMenu(false);
                    handleLogout();
                  }}
                >
                  <span className="text-base">🚪</span>
                  <span className="font-medium text-xs font-bold text-red-800 font-sans">Sign Off</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DIALOG POP-UPS OVERLAYS */}
      
      {/* Away Dialog Settings overlay */}
      {showAwayDialog && (
        <AwayDialog
          currentMessage={userProfile.awayMessage}
          onSave={handleSaveAwayMessage}
          onClose={() => setShowAwayDialog(false)}
        />
      )}

      {/* Profile Dialog Settings overlay */}
      {showProfileDialog && (
        <ProfileDialog
          profile={userProfile}
          onSave={handleSaveProfile}
          onClose={() => setShowProfileDialog(false)}
        />
      )}

      {/* Buddy Info Profile overlay */}
      {selectedInfoBuddy && (
        <BuddyInfoDialog
          buddy={selectedInfoBuddy}
          onClose={() => setSelectedInfoBuddy(null)}
        />
      )}
    </div>
  );
}
