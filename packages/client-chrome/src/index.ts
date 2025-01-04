import {
  AgentRuntime,
  Client,
  IAgentRuntime,
  elizaLogger,
} from "@elizaos/core";
import type { ChromeMessage, ChromeState } from "./types";

import { MemoryManager } from "./managers/memory-manager";
import { TabManager } from "./managers/tab-manager";
import { validateChromeConfig } from "./config";

export class ChromeClient {
  private runtime: AgentRuntime;
  private tabManager: TabManager;
  private memoryManager: MemoryManager;
  private config: Awaited<ReturnType<typeof validateChromeConfig>>;

  constructor(runtime: AgentRuntime) {
    this.runtime = runtime;
    this.tabManager = new TabManager();
    this.memoryManager = new MemoryManager(24 * 60 * 60 * 1000); // 24 hours
  }

  async initialize() {
    this.config = await validateChromeConfig(this.runtime);
    await this.tabManager.initialize();
    await this.memoryManager.initialize();

    if (typeof window !== 'undefined' && chrome?.runtime) {
      chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
    }

    elizaLogger.log("Chrome client initialized");
  }

  private async handleMessage(message: ChromeMessage) {
    try {
      elizaLogger.log(`Handling chrome message: ${JSON.stringify(message)}`);

      switch (message.type) {
        case 'PAGE_CONTENT':
          await this.handlePageContent(message);
          break;
        case 'USER_ACTION':
          await this.handleUserAction(message);
          break;
        case 'MEMORY_STORE':
          await this.handleMemoryStore(message);
          break;
        case 'MEMORY_RETRIEVE':
          return await this.handleMemoryRetrieve(message);
        case 'EXTENSION_STATE':
          return await this.handleStateRequest(message);
        default:
          elizaLogger.warn(`Unknown message type: ${message.type}`);
          return { error: 'Unknown message type' };
      }
    } catch (error) {
      elizaLogger.error(`Error handling message: ${error}`);
      return { error: error.message };
    }
  }

  private async handlePageContent(message: ChromeMessage) {
    await this.memoryManager.storeMemory({
      id: `page-${Date.now()}`,
      type: 'content',
      content: message.payload as string,
      metadata: {
        tabId: message.tabId,
        windowId: message.windowId
      },
      timestamp: message.timestamp
    });
  }

  private async handleUserAction(message: ChromeMessage) {
    await this.memoryManager.storeMemory({
      id: `action-${Date.now()}`,
      type: 'action',
      content: JSON.stringify(message.payload),
      metadata: {
        tabId: message.tabId,
        windowId: message.windowId
      },
      timestamp: message.timestamp
    });
  }

  private async handleMemoryStore(message: ChromeMessage) {
    await this.memoryManager.storeMemory(message.payload as any);
  }

  private async handleMemoryRetrieve(message: ChromeMessage) {
    return await this.memoryManager.retrieveMemories(message.payload as string);
  }

  private async handleStateRequest(message: ChromeMessage) {
    return await this.tabManager.getState();
  }
}

export const ChromeClientInterface: Client = {
  start: async (runtime: IAgentRuntime) => {
    elizaLogger.log("ChromeClientInterface start");
    const client = new ChromeClient(runtime as AgentRuntime);
    await client.initialize();
    return client;
  },
  stop: async (_runtime: IAgentRuntime) => {
    elizaLogger.log("ChromeClientInterface stop");
  },
};

export default ChromeClientInterface;

