import express from "express";
import path from "path";
import dotenv from "dotenv";
import chatHandler from "./api/chat.ts";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// API: Send a chat message to an AIM Buddy (Delegated to api/chat.ts for Vercel & Express unified logic)
app.post("/api/chat", chatHandler);
app.get("/api/chat", chatHandler);


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
