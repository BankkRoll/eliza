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
      chrome.windows.onCreated.addListener(this.handleWindowCreated.bind(this));
      chrome.windows.onRemoved.addListener(this.handleWindowRemoved.bind(this));
    }
  }

  private async handleTabCreated(tab: chrome.tabs.Tab): Promise<void> {
    const chromeTab: ChromeTab = {
      id: tab.id!,
      url: tab.url || '',
      title: tab.title || '',
      favIconUrl: tab.favIconUrl,
      status: tab.status as 'loading' | 'complete' | 'error'
    };
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

  private async handleWindowCreated(window: chrome.windows.Window): Promise<void> {
    const chromeWindow: ChromeWindow = {
      id: window.id!,
      tabs: [],
      focused: window.focused || false,
      incognito: window.incognito
    };
    this.state.activeWindows.set(window.id!, chromeWindow);
  }

  private async handleWindowRemoved(windowId: number): Promise<void> {
    this.state.activeWindows.delete(windowId);
  }

  async getState(): Promise<ChromeState> {
    return this.state;
  }
}

