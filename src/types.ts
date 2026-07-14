export type BuddyStatus = "online" | "offline" | "away";

export interface Buddy {
  id: string;
  screenName: string;
  displayName: string;
  status: BuddyStatus;
  warningLevel: number; // 0 to 100
  awayMessage?: string;
  bio: string;
  avatar: string; // Tailwind color or symbol representitive of AIM icon
  category: "Buddies" | "Co-workers" | "Bots";
  idleMinutes?: number;
}

export interface Message {
  id: string;
  sender: string; // Screen name of buddy, or 'Me'
  text: string;
  timestamp: string; // e.g., "3:14 PM"
  isAutoResponse?: boolean;
}

export interface Conversation {
  buddyId: string;
  messages: Message[];
  isBlocked: boolean;
  unreadCount: number;
}

export interface FontSettings {
  family: "Arial" | "Times New Roman" | "Courier New" | "Comic Sans MS";
  color: string; // e.g., "blue" or "#ff0000"
  size: "small" | "medium" | "large";
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

export interface UserProfile {
  screenName: string;
  status: BuddyStatus;
  awayMessage: string;
  isAway: boolean;
  avatarColor: string;
  warningLevel: number;
}
