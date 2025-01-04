import { MemoryManager } from "./memory-manager";
import { TabManager } from "./tab-manager";
import { elizaLogger } from "@elizaos/core";

export class EventManager {
  constructor(private tabManager: TabManager, private memoryManager: MemoryManager) {}

  initialize(): void {
    chrome.tabs.onActivated.addListener(this.handleTabActivated.bind(this));
    chrome.windows.onFocusChanged.addListener(this.handleWindowFocusChanged.bind(this));
    chrome.tabs.onUpdated.addListener(this.handleTabUpdated.bind(this));
    chrome.tabs.onRemoved.addListener(this.handleTabRemoved.bind(this));
  }

  private async handleTabActivated(activeInfo: chrome.tabs.TabActiveInfo): Promise<void> {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    await this.tabManager.updateActiveTab(tab);
    await this.memoryManager.storeMemory({
      id: `tab-activated-${Date.now()}`,
      type: 'action',
      content: `Tab activated: ${tab.title}`,
      metadata: { tabId: tab.id, windowId: tab.windowId },
      timestamp: Date.now()
    });
    elizaLogger.log(`Tab activated: ${tab.id}`);
  }

  private async handleWindowFocusChanged(windowId: number): Promise<void> {
    if (windowId !== chrome.windows.WINDOW_ID_NONE) {
      const window = await chrome.windows.get(windowId, { populate: true });
      await this.tabManager.updateActiveWindow(window);
      await this.memoryManager.storeMemory({
        id: `window-focused-${Date.now()}`,
        type: 'action',
        content: `Window focused: ${windowId}`,
        metadata: { windowId },
        timestamp: Date.now()
      });
      elizaLogger.log(`Window focused: ${windowId}`);
    }
  }

  private async handleTabUpdated(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab): Promise<void> {
    await this.tabManager.updateActiveTab(tab);
    if (changeInfo.status === 'complete') {
      await this.memoryManager.storeMemory({
        id: `tab-updated-${Date.now()}`,
        type: 'action',
        content: `Tab updated: ${tab.title}`,
        metadata: { tabId: tab.id, windowId: tab.windowId, url: tab.url },
        timestamp: Date.now()
      });
      elizaLogger.log(`Tab updated: ${tab.id}`);
    }
  }

  private async handleTabRemoved(tabId: number, removeInfo: chrome.tabs.TabRemoveInfo): Promise<void> {
    await this.memoryManager.storeMemory({
      id: `tab-removed-${Date.now()}`,
      type: 'action',
      content: `Tab removed: ${tabId}`,
      metadata: { tabId, windowId: removeInfo.windowId },
      timestamp: Date.now()
    });
    elizaLogger.log(`Tab removed: ${tabId}`);
  }
}
