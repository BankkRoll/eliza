import type { IAgentRuntime } from "@elizaos/core";
import { z } from 'zod';

export interface ChromeTab {
  id: number;
  url: string;
  title: string;
  favIconUrl?: string;
  status: 'loading' | 'complete' | 'error';
}

export interface ChromeWindow {
  id: number;
  tabs: ChromeTab[];
  focused: boolean;
  incognito: boolean;
}

export const ChromeMessageSchema = z.object({
  type: z.enum([
    'PAGE_CONTENT',
    'USER_ACTION',
    'TAB_UPDATE',
    'MEMORY_STORE',
    'MEMORY_RETRIEVE',
    'EXTENSION_STATE',
    'NAVIGATION'
  ]),
  payload: z.unknown(),
  timestamp: z.number(),
  tabId: z.number().optional(),
  windowId: z.number().optional()
});

export type ChromeMessage = z.infer<typeof ChromeMessageSchema>;

export interface ChromeMemory {
  id: string;
  type: 'tab' | 'action' | 'content';
  content: string;
  metadata: Record<string, unknown>;
  timestamp: number;
}

export interface ChromeState {
  activeTabs: Map<number, ChromeTab>;
  activeWindows: Map<number, ChromeWindow>;
  memories: ChromeMemory[];
}

export interface ChromeClientConfig {
  extensionId: string;
  allowedOrigins: string[];
  maxTabs: number;
  memoryRetention: number;
}

export interface ChromeMessageHandler {
  initialize(runtime: IAgentRuntime): Promise<void>;
  handleMessage(message: ChromeMessage): Promise<void>;
  cleanup(): Promise<void>;
}

