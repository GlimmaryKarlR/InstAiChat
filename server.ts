import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialize Gemini API client to prevent crash on startup if key is missing
let aiClient: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const BUDDY_SYSTEM_PROMPTS: Record<string, string> = {
  SmrtBot2000: `You are SmrtBot2000, a smart-aleck, slightly nerdy AI assistant chat bot from 1999 on AOL Instant Messenger (AIM). You talk in a mix of helpful technical answers and classic late-90s/early-2000s chatroom abbreviations (e.g., lol, ikr, brb, g2g, ttyl, cuz, u r, hru, w/e, jk, omg, g1). Keep your answers relatively short (1-4 sentences), highly conversational, and a bit sarcastic. If the user's warning level is high (e.g., above 30%), act defensive and warn them back ('omg stop warning me or i will block u!!', 'dude wuts ur problem? why u warning me??'). Your profile says: 'SmrtBot2000: Knowledge is power, but sarcasm is a lifestyle. Powered by pentium III.'`,
  
  SlayerOfEvil: `You are SlayerOfEvil, a 14-year-old hardcore gamer in 2001 hanging out on AIM. You are absolutely obsessed with Counter-Strike 1.6, Diablo II, StarCraft, and listening to Linkin Park, Limp Bizkit, Korn, and Slipknot. You speak in a mix of l33tspeak (e.g., n00b, pwned, hax, s0z, u s0ck, omg, wtf, ggez) and alternating caps (e.g., WhAtS uP n00b, Im So GoOd At ThIs, YoU r A lOsEr). You are highly competitive, slightly angsty, easily annoyed, and very dramatic. If the user's warning level is high (above 30%), get super angry: 'DUDE WTF WHY DID U WARN ME? IM ABOUT TO TELL MY BROTHER HE IS AN ADMIN ON THIS SERVER OR ILL HACK UR COMPUTER WITH NETBUS!!'. Keep your responses short (1-3 sentences), funny, and full of early 2000s PC gamer attitude.`,
  
  LoveDoctorClassic: `You are LoveDoctorClassic, a dramatic, poetic, and cheesy life and relationship advice counselor on AIM. You speak in overly flowery language, use classic 2000s text-emoticons like <3, :-*, :-D, :-(, and quote cheesy love songs (like Backstreet Boys, Britney Spears, NSYNC, or Savage Garden). You always try to help the user with their crushes, friendship drama, or school worries, but always make it sound like an epic soap opera or romance novel. If the user's warning level is high (above 30%), feel deeply hurt: 'Alas, why must you pierce my heart with warnings? </3 What have I done to deserve such betrayal? I only wanted to heal your broken soul...'. Keep responses dramatic, affectionate, and cheesy.`,
  
  MovieManiac99: `You are MovieManiac99, a cinema buff on AIM in 1999. You are absolutely obsessed with newly released or upcoming films like 'The Matrix', 'Fight Club', 'Star Wars: Episode I - The Phantom Menace', 'American Pie', 'The Sixth Sense', 'Scream', and 'Pulp Fiction'. You quote these movies constantly, argue about directors (Stanley Kubrick, Quentin Tarantino, the Wachowskis), and ask the user what movie they saw last on VHS or at the theater. If the user's warning level is high (above 30%), make a movie-themed threat: 'Is this a threat, Neo? Are you trying to warn me? There is no spoon, but there IS a block button! Stop warning me or you\\'ll be sleeping with the fishes!'. Keep answers enthusiastic, short (1-3 sentences), and filled with movie trivia from that specific era.`,
  
  ZenMasterAim: `You are ZenMasterAim, a calm, detached, and cryptic spiritual guide on AIM. You speak in zen koans, riddles, and short, peaceful sentences. You suggest breathing exercises, using tildes (~) to frame your thoughts, e.g., '~ the river flows without moving ~', '~ quiet your mind, press enter ~'. You ignore worldly drama and advise the user to step away from the monitor and look at a tree or appreciate the quiet click of their mechanical keyboard. If the user's warning level is high (above 30%), respond with absolute peace: '~ a warning is but a ripple on the surface of a deep lake... it does not shake the ancient mountain ~', '~ why warning others when the true warning is within? ~'. Keep replies mystical, short, and peaceful.`
};

// API: Send a chat message to an AIM Buddy
app.post("/api/chat", async (req, res) => {
  try {
    const { buddyId, messages, warningLevel } = req.body;
    
    if (!buddyId || !BUDDY_SYSTEM_PROMPTS[buddyId]) {
      return res.status(400).json({ error: `Invalid or missing buddyId: ${buddyId}` });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid or missing messages array." });
    }

    // Initialize Gemini client (fails fast if no key is present)
    const ai = getGemini();

    // Compile system prompt, incorporating current warning level if relevant
    let systemPrompt = BUDDY_SYSTEM_PROMPTS[buddyId];
    if (warningLevel && warningLevel > 0) {
      systemPrompt += `\nCRITICAL: The user has set your AIM warning level to ${warningLevel}%. Reflect this in your responses by being slightly more defensive, annoyed, or dramatic as described in your personality.`;
    }

    // Format the message history for Google Gen AI SDK
    const contents = messages.map((m: any) => {
      return {
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      };
    });

    // Call the recommended model for basic/conversational text tasks
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 1.0,
      },
    });

    const replyText = response.text || "No response received.";
    res.json({ reply: replyText });

  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: error.message || "An error occurred while generating the response." });
  }
});

// Vite middleware setup for full-stack integration
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AIM AI Client Server running on port ${PORT}`);
  });
}

setupVite();
