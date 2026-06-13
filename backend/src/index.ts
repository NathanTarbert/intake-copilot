import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNodeExpressEndpoint,
} from "@copilotkit/runtime";
import { MastraAgent } from "@ag-ui/mastra";
import { mastra } from "./mastra/index.js";

const PORT = Number(process.env.PORT ?? 4000);
const ENDPOINT = "/api/copilotkit";

const agents = await MastraAgent.getLocalAgents({ mastra });
console.log("[CopilotKit] Available agents:", Object.keys(agents ?? {}));

const runtime = new CopilotRuntime({ agents });
const serviceAdapter = new ExperimentalEmptyAdapter();

const copilotHandler = copilotRuntimeNodeExpressEndpoint({
  endpoint: "/",
  runtime,
  serviceAdapter,
});

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["*"],
  }),
);

app.get("/health", (_req, res) => res.json({ ok: true }));

const openaiClient = new OpenAI();

app.post(
  "/api/transcribe",
  express.raw({ type: "*/*", limit: "25mb" }),
  async (req, res) => {
    try {
      const audio = req.body as Buffer;
      if (!audio?.length) {
        return res.status(400).json({ error: "empty audio body" });
      }
      const mime = req.headers["content-type"] || "audio/webm";
      const ext =
        typeof mime === "string" && mime.includes("mp4")
          ? "mp4"
          : typeof mime === "string" && mime.includes("wav")
            ? "wav"
            : "webm";
      const file = await OpenAI.toFile(audio, `intake.${ext}`, {
        type: String(mime),
      });
      const result = await openaiClient.audio.transcriptions.create({
        file,
        model: "whisper-1",
      });
      res.json({ text: result.text });
    } catch (err: any) {
      console.error("[transcribe] error:", err?.message ?? err);
      res.status(500).json({ error: err?.message ?? "transcription failed" });
    }
  },
);

app.use(ENDPOINT, copilotHandler);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, "../../client/dist");

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) =>
    res.sendFile(path.join(clientDist, "index.html"))
  );
}

app.listen(PORT, () => {
  console.log(`[CopilotKit] Listening on http://localhost:${PORT}${ENDPOINT}`);
});
