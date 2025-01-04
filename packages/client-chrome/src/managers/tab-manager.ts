import type { ChromeState, ChromeTab, ChromeWindow } from "../types";

import { elizaLogger } from "@elizaos/core";

export class TabManager {
  private state: ChromeState;

  constructor() {
    this.state = {
      activeTabs: new Map(),
      activeWindows: new Map(),
      memories: []
    };
  }

  async initialize(): Promise<void> {
    if (typeof window !== 'undefined' && chrome?.tabs) {
      chrome.tabs.onCreated.addListener(this.handleTabCreated.bind(this));
      chrome.tabs.onUpdated.addListener(this.handleTabUpdated.bind(this));
      chrome.tabs.onRemoved.addListener(this.handleTabRemoved.bind(this));
      chrome.tabs.onActivated.addListener(this.handleTabActivated.bind(this));
      chrome.windows.onCreated.addListener(this.handleWindowCreated.bind(this));
      chrome.windows.onRemoved.addListener(this.handleWindowRemoved.bind(this));
      chrome.windows.onFocusChanged.addListener(this.handleWindowFocusChanged.bind(this));
    }
    await this.syncState();
  }

  private async handleTabCreated(tab: chrome.tabs.Tab): Promise<void> {
    const chromeTab: ChromeTab = this.createChromeTab(tab);
    this.state.activeTabs.set(tab.id!, chromeTab);
    elizaLogger.log(`Tab created: ${tab.id}`);
  }

  private async handleTabUpdated(
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab
  ): Promise<void> {
    const existingTab = this.state.activeTabs.get(tabId);
    if (existingTab) {
      this.state.activeTabs.set(tabId, {
        ...existingTab,
        url: tab.url || existingTab.url,
        title: tab.title || existingTab.title,
        status: (changeInfo.status as 'loading' | 'complete' | 'error') || existingTab.status
      });
    }
  }

  private async handleTabRemoved(tabId: number): Promise<void> {
    this.state.activeTabs.delete(tabId);
    elizaLogger.log(`Tab removed: ${tabId}`);
  }

  private async handleTabActivated(activeInfo: chrome.tabs.TabActiveInfo): Promise<void> {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    await this.updateActiveTab(tab);
  }

  private async handleWindowCreated(window: chrome.windows.Window): Promise<void> {
    const chromeWindow: ChromeWindow = this.createChromeWindow(window);
    this.state.activeWindows.set(window.id!, chromeWindow);
  }

  private async handleWindowRemoved(windowId: number): Promise<void> {
    this.state.activeWindows.delete(windowId);
  }

  private async handleWindowFocusChanged(windowId: number): Promise<void> {
    if (windowId !== chrome.windows.WINDOW_ID_NONE) {
      const window = await chrome.windows.get(windowId, { populate: true });
      await this.updateActiveWindow(window);
    }
  }

  async updateActiveTab(tab: chrome.tabs.Tab): Promise<void> {
    const chromeTab = this.createChromeTab(tab);
    this.state.activeTabs.set(tab.id!, chromeTab);
  }

  async updateActiveWindow(window: chrome.windows.Window): Promise<void> {
    const chromeWindow = this.createChromeWindow(window);
    this.state.activeWindows.set(window.id!, chromeWindow);
  }

  private createChromeTab(tab: chrome.tabs.Tab): ChromeTab {
    return {
      id: tab.id!,
      url: tab.url || '',
      title: tab.title || '',
      favIconUrl: tab.favIconUrl,
      status: tab.status as 'loading' | 'complete' | 'error'
    };
  }

  private createChromeWindow(window: chrome.windows.Window): ChromeWindow {
    return {
      id: window.id!,
      tabs: window.tabs?.map(this.createChromeTab) || [],
      focused: window.focused || false,
      incognito: window.incognito
    };
  }

  async syncState(): Promise<void> {
    const [tabs, windows] = await Promise.all([
      chrome.tabs.query({}),
      chrome.windows.getAll({ populate: true })
    ]);

    this.state.activeTabs.clear();
    tabs.forEach(tab => {
      this.state.activeTabs.set(tab.id!, this.createChromeTab(tab));
    });

    this.state.activeWindows.clear();
    windows.forEach(window => {
      this.state.activeWindows.set(window.id!, this.createChromeWindow(window));
    });
  }

  async getState(): Promise<ChromeState> {
    return this.state;
  }
}
