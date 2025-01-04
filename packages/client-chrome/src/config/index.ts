import type { ChromeClientConfig } from "../types";
import { IAgentRuntime } from "@elizaos/core";
import { z } from "zod";

export const chromeConfigSchema = z.object({
  EXTENSION_ID: z.string().min(1, "Extension ID is required"),
  ALLOWED_ORIGINS: z.array(z.string()).default(["*"]),
  MAX_TABS: z.number().min(1).max(100).default(10),
  MEMORY_RETENTION: z.number().min(0).default(24 * 60 * 60 * 1000), // 24 hours
  ENCRYPTION_KEY: z.string().min(32, "Encryption key must be at least 32 characters long"),
});

export async function validateChromeConfig(
  runtime: IAgentRuntime
): Promise<ChromeClientConfig> {
  try {
    const config = {
      extensionId: runtime.getSetting("EXTENSION_ID"),
      allowedOrigins: runtime.getSetting("ALLOWED_ORIGINS")?.split(",") || ["*"],
      maxTabs: Number(runtime.getSetting("MAX_TABS")) || 10,
      memoryRetention: Number(runtime.getSetting("MEMORY_RETENTION")) || 24 * 60 * 60 * 1000,
      encryptionKey: runtime.getSetting("ENCRYPTION_KEY"),
    };

    const validated = chromeConfigSchema.parse({
      EXTENSION_ID: config.extensionId,
      ALLOWED_ORIGINS: config.allowedOrigins,
      MAX_TABS: config.maxTabs,
      MEMORY_RETENTION: config.memoryRetention,
      ENCRYPTION_KEY: config.encryptionKey,
    });

    return {
      extensionId: validated.EXTENSION_ID,
      allowedOrigins: validated.ALLOWED_ORIGINS,
      maxTabs: validated.MAX_TABS,
      memoryRetention: validated.MEMORY_RETENTION,
      encryptionKey: validated.ENCRYPTION_KEY,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("\n");
      throw new Error(
        `Chrome configuration validation failed:\n${errorMessages}`
      );
    }
    throw error;
  }
}
