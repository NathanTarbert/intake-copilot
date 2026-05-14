import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";
import { ConsoleLogger, type LogLevel } from "@mastra/core/logger";
import { intakeAgent } from "./agents/intake-agent.js";

const LOG_LEVEL = (process.env.LOG_LEVEL as LogLevel) || "info";

export const mastra = new Mastra({
  agents: { intakeAgent },
  storage: new LibSQLStore({ id: "mastra-storage", url: ":memory:" }),
  logger: new ConsoleLogger({ level: LOG_LEVEL }),
});
