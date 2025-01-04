import {
  AgentRuntime,
  Client,
  IAgentRuntime,
  elizaLogger,
} from "@elizaos/core";
import type { ChromeMessage, ChromeState } from "./types";

import { BookmarkActions } from "./actions/bookmarks";
import { HistoryActions } from "./actions/history";
import { MemoryManager } from "./managers/memory-manager";
import { TabActions } from "./actions/tabs";
import { TabManager } from "./managers/tab-manager";
import { WindowActions } from "./actions/windows";
import { validateChromeConfig } from "./config";

export class ChromeClient {
  private runtime: AgentRuntime;
  private tabManager: TabManager;
  private memoryManager: MemoryManager;
  private config: Awaited<ReturnType<typeof validateChromeConfig>>;

  // New action instances
  private tabActions: TabActions;
  private windowActions: WindowActions;
  private bookmarkActions: BookmarkActions;
  private historyActions: HistoryActions;

  constructor(runtime: AgentRuntime) {
    this.runtime = runtime;
    this.tabManager = new TabManager();
    this.memoryManager = new MemoryManager(24 * 60 * 60 * 1000); // 24 hours

    // Initialize action instances
    this.tabActions = new TabActions();
    this.windowActions = new WindowActions();
    this.bookmarkActions = new BookmarkActions();
    this.historyActions = new HistoryActions();
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
        case 'TAB_ACTION':
          return await this.handleTabAction(message);
        case 'WINDOW_ACTION':
          return await this.handleWindowAction(message);
        case 'BOOKMARK_ACTION':
          return await this.handleBookmarkAction(message);
        case 'HISTORY_ACTION':
          return await this.handleHistoryAction(message);
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

  private async handleTabAction(message: ChromeMessage) {
    const { action, params } = message.payload as { action: string; params: any };
    switch (action) {
      case 'CREATE':
        return await this.tabActions.createTab(params.url);
      case 'UPDATE':
        return await this.tabActions.updateTab(params.tabId, params.updateProperties);
      case 'REMOVE':
        return await this.tabActions.removeTab(params.tabId);
      case 'QUERY':
        return await this.tabActions.queryTabs(params.queryInfo);
      default:
        return { error: 'Unknown tab action' };
    }
  }

  private async handleWindowAction(message: ChromeMessage) {
    const { action, params } = message.payload as { action: string; params: any };
    switch (action) {
      case 'CREATE':
        return await this.windowActions.createWindow(params.createData);
      case 'UPDATE':
        return await this.windowActions.updateWindow(params.windowId, params.updateInfo);
      case 'REMOVE':
        return await this.windowActions.removeWindow(params.windowId);
      case 'GET':
        return await this.windowActions.getWindow(params.windowId);
      default:
        return { error: 'Unknown window action' };
    }
  }

  private async handleBookmarkAction(message: ChromeMessage) {
    const { action, params } = message.payload as { action: string; params: any };
    switch (action) {
      case 'CREATE':
        return await this.bookmarkActions.createBookmark(params.bookmark);
      case 'GET':
        return await this.bookmarkActions.getBookmarks(params.id);
      case 'UPDATE':
        return await this.bookmarkActions.updateBookmark(params.id, params.changes);
      case 'REMOVE':
        return await this.bookmarkActions.removeBookmark(params.id);
      default:
        return { error: 'Unknown bookmark action' };
    }
  }

  private async handleHistoryAction(message: ChromeMessage) {
    const { action, params } = message.payload as { action: string; params: any };
    switch (action) {
      case 'ADD_URL':
        return await this.historyActions.addUrl(params.details);
      case 'DELETE_URL':
        return await this.historyActions.deleteUrl(params.details);
      case 'GET_VISITS':
        return await this.historyActions.getVisits(params.details);
      case 'SEARCH':
        return await this.historyActions.search(params.query);
      default:
        return { error: 'Unknown history action' };
    }
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

