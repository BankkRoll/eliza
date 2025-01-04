import {
  AgentRuntime,
  Client,
  IAgentRuntime,
  elizaLogger,
} from "@elizaos/core";
import type { ChromeMessage, ChromeMessageHandler, ChromeState } from "./types";

import { AlarmManager } from "./managers/alarm-manager";
import { BookmarkActions } from "./actions/bookmarks";
import { ChromeStorage } from "./storage/chrome-storage";
import { ContextMenuManager } from "./managers/context-menu-manager";
import { EventManager } from "./managers/event-manager";
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
  private eventManager: EventManager;
  private alarmManager: AlarmManager;
  private contextMenuManager: ContextMenuManager;
  private storage: ChromeStorage;
  private config: Awaited<ReturnType<typeof validateChromeConfig>>;

  // Action instances
  private tabActions: TabActions;
  private windowActions: WindowActions;
  private bookmarkActions: BookmarkActions;
  private historyActions: HistoryActions;

  private messageHandlers: Map<string, ChromeMessageHandler>;

  constructor(runtime: AgentRuntime) {
    this.runtime = runtime;
    this.storage = new ChromeStorage();
    this.tabManager = new TabManager();
    this.alarmManager = new AlarmManager();
    this.contextMenuManager = new ContextMenuManager();
    this.messageHandlers = new Map();

    // Initialize action instances
    this.tabActions = new TabActions();
    this.windowActions = new WindowActions();
    this.bookmarkActions = new BookmarkActions();
    this.historyActions = new HistoryActions();
  }

  async initialize() {
    this.config = await validateChromeConfig(this.runtime);
    this.memoryManager = new MemoryManager(this.config.memoryRetention, this.config.encryptionKey);
    this.eventManager = new EventManager(this.tabManager, this.memoryManager);

    await this.tabManager.initialize();
    await this.memoryManager.initialize();
    this.eventManager.initialize();

    this.initializeMessageHandlers();

    if (typeof window !== 'undefined' && chrome?.runtime) {
      chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
    }

    elizaLogger.log("Chrome client initialized");
  }

  private initializeMessageHandlers() {
    this.messageHandlers.set('PAGE_CONTENT', this.handlePageContent.bind(this));
    this.messageHandlers.set('USER_ACTION', this.handleUserAction.bind(this));
    this.messageHandlers.set('MEMORY_STORE', this.handleMemoryStore.bind(this));
    this.messageHandlers.set('MEMORY_RETRIEVE', this.handleMemoryRetrieve.bind(this));
    this.messageHandlers.set('EXTENSION_STATE', this.handleStateRequest.bind(this));
    this.messageHandlers.set('TAB_ACTION', this.handleTabAction.bind(this));
    this.messageHandlers.set('WINDOW_ACTION', this.handleWindowAction.bind(this));
    this.messageHandlers.set('BOOKMARK_ACTION', this.handleBookmarkAction.bind(this));
    this.messageHandlers.set('HISTORY_ACTION', this.handleHistoryAction.bind(this));
    this.messageHandlers.set('ALARM_ACTION', this.handleAlarmAction.bind(this));
    this.messageHandlers.set('CONTEXT_MENU_ACTION', this.handleContextMenuAction.bind(this));
  }

  private async handleMessage(message: ChromeMessage) {
    try {
      elizaLogger.log(`Handling chrome message: ${JSON.stringify(message)}`);

      const handler = this.messageHandlers.get(message.type);
      if (handler) {
        return await handler(message);
      } else {
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
        return await this.tabActions.createTab(params);
      case 'UPDATE':
        return await this.tabActions.updateTab(params.tabId, params.updateProperties);
      case 'REMOVE':
        return await this.tabActions.removeTab(params.tabId);
      case 'QUERY':
        return await this.tabActions.queryTabs(params.queryInfo);
      case 'MOVE':
        return await this.tabActions.moveTab(params.tabId, params.moveProperties);
      case 'DUPLICATE':
        return await this.tabActions.duplicateTab(params.tabId);
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
        return await this.windowActions.getWindow(params.windowId, params.getInfo);
      case 'GET_ALL':
        return await this.windowActions.getAllWindows(params.getInfo);
      case 'FOCUS':
        return await this.windowActions.focusWindow(params.windowId);
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
      case 'SEARCH':
        return await this.bookmarkActions.searchBookmarks(params.query);
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
      case 'DELETE_RANGE':
        return await this.historyActions.deleteRange(params.range);
      case 'GET_VISITS':
        return await this.historyActions.getVisits(params.details);
      case 'SEARCH':
        return await this.historyActions.search(params.query);
      default:
        return { error: 'Unknown history action' };
    }
  }

  private async handleAlarmAction(message: ChromeMessage) {
    const { action, params } = message.payload as { action: string; params: any };
    switch (action) {
      case 'CREATE':
        return await this.alarmManager.createAlarm(params.name, params.alarmInfo);
      case 'GET':
        return await this.alarmManager.getAlarm(params.name);
      case 'GET_ALL':
        return await this.alarmManager.getAllAlarms();
      case 'CLEAR':
        return await this.alarmManager.clearAlarm(params.name);
      case 'CLEAR_ALL':
        return await this.alarmManager.clearAllAlarms();
      default:
        return { error: 'Unknown alarm action' };
    }
  }

  private async handleContextMenuAction(message: ChromeMessage) {
    const { action, params } = message.payload as { action: string; params: any };
    switch (action) {
      case 'CREATE':
        return await this.contextMenuManager.createContextMenu(params.createProperties);
      case 'UPDATE':
        return await this.contextMenuManager.updateContextMenu(params.id, params.updateProperties);
      case 'REMOVE':
        return await this.contextMenuManager.removeContextMenu(params.menuItemId);
      case 'REMOVE_ALL':
        return await this.contextMenuManager.removeAllContextMenus();
      default:
        return { error: 'Unknown context menu action' };
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

