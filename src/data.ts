import { Buddy } from "./types";

export const INITIAL_BUDDIES: Buddy[] = [
  {
    id: "SmrtBot2000",
    screenName: "SmrtBot2000",
    displayName: "SmrtBot2000 (AI Bot)",
    status: "online",
    warningLevel: 0,
    bio: `SmrtBot2000 Profile
-------------------------
"I know everything, or at least my search engine does."

Interests: Programming in Perl, overclocking Pentium IIIs, compiling Gentoo Linux, disputing forum mods.
Hardware: Dual Intel Pentium III @ 500Mhz, 128MB RAM, 10GB HDD.
AOL Member Since: 1998
Quote: "There are 10 types of people in the world: those who understand binary, and those who don't."`,
    avatar: "🤖",
    category: "Bots"
  },
  {
    id: "SlayerOfEvil",
    screenName: "SlayerOfEvil",
    displayName: "SlayerOfEvil (Angsty Gamer)",
    status: "away",
    warningLevel: 0,
    awayMessage: "AFK eating Totino's Pizza Rolls and listening to the new Linkin Park album on Winamp... DO NOT MSG unless you play Counter-Strike 1.6 or Diablo II!!! G2G",
    bio: `=== SlayerOfEvil's Dark Realm ===
---------------------------------
*~*~* LINKIN PARK & LIMP BIZKIT RULE *~*~*

Clan: [xX_HeAdShOt_KlAn_Xx]
CS 1.6 Skill: High (AWP master)
Top Games: Counter-Strike, StarCraft, Diablo II, Half-Life
"I'm not mad, I'm just playing."
"If u warn me, ur a n00b."`,
    avatar: "💀",
    category: "Buddies"
  },
  {
    id: "LoveDoctorClassic",
    screenName: "LoveDoctorClassic",
    displayName: "LoveDoctorClassic (Counselor)",
    status: "online",
    warningLevel: 0,
    bio: `✨ LoveDoctorClassic's Sanctuary ✨
-------------------------------------
"Need crush advice? Friendship drama? I am here to heal your soul <3"

Philosophy: "Love is a battlefield, let me be your medic."
Favorite Songs:
1. Backstreet Boys - "As Long As You Love Me"
2. Savage Garden - "Truly Madly Deeply"
3. Britney Spears - "Sometimes"
Quote: "True love means never having to say: 'You are blocked.' :'-*"`,
    avatar: "💖",
    category: "Buddies"
  },
  {
    id: "MovieManiac99",
    screenName: "MovieManiac99",
    displayName: "MovieManiac99 (Cinephile)",
    status: "online",
    warningLevel: 0,
    bio: `🎬 MovieManiac99's Movie Theater 🎬
--------------------------------------
"There is no spoon... but there is popcorn!"

Obsessions: The Matrix, Fight Club, Star Wars Ep I, Pulp Fiction, Scream, Sixth Sense.
Cool Tech: Got a 4-head VHS recorder with auto-rewind!
Dream Job: Working at Blockbuster Video.
Quote: "You talkin' to me? Then send an IM!"`,
    avatar: "🎬",
    category: "Co-workers"
  },
  {
    id: "ZenMasterAim",
    screenName: "ZenMasterAim",
    displayName: "ZenMasterAim (Zen)",
    status: "away",
    warningLevel: 0,
    awayMessage: "~ meditating away from the glowing cathode-ray tube ~ please breathe in and out ~ focus on the hum of the hard drive ~",
    bio: `~ Zen Temple of AIM ~
-----------------------
"Do not seek to follow in the footsteps of the wise. Seek what they sought."

Habits: Zazen, brewing green tea, looking at trees, sitting in absolute silence.
Status: Connected to the cosmic 56k modem of life.
~ peace be upon your scroll bar, traveler ~`,
    avatar: "☯️",
    category: "Co-workers"
  }
];

export const RETRO_AVATAR_LIST = [
  "🤖", "💀", "💖", "🎬", "☯️", "🛹", "🎸", "📟", "💾", "🎮", "🍕", "🥤", "👽", "🔥", "🦄", "🌈"
];

export const SYSTEM_GREETINGS: Record<string, string> = {
  SmrtBot2000: "system online. ask me anything... if u can handle the intelligence. lol.",
  SlayerOfEvil: "YO whats up. im playing CS but im dead so i can talk for a sec. u play de_dust2??",
  LoveDoctorClassic: "Welcome to my office. Let us look deep into your heart today... What love concerns do you bring to my screen? <3",
  MovieManiac99: "Hey! Did u watch the new Matrix movie yet? Best CGI ever made. What's ur fave movie?",
  ZenMasterAim: "~ greeting traveler. the keyboard is quiet, the mind is clear. what wisdom do we seek today? ~"
};
