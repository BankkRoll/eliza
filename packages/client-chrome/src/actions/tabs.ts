import { elizaLogger } from "@elizaos/core";

export class TabActions {
  async createTab(createProperties: chrome.tabs.CreateProperties): Promise<chrome.tabs.Tab | null> {
    try {
      const tab = await chrome.tabs.create(createProperties);
      elizaLogger.log(`Tab created: ${tab.id}`);
      return tab;
    } catch (error) {
      elizaLogger.error(`Error creating tab: ${error}`);
      return null;
    }
  }

  async updateTab(tabId: number, updateProperties: chrome.tabs.UpdateProperties): Promise<chrome.tabs.Tab | null> {
    try {
      const tab = await chrome.tabs.update(tabId, updateProperties);
      elizaLogger.log(`Tab updated: ${tabId}`);
      return tab;
    } catch (error) {
      elizaLogger.error(`Error updating tab: ${error}`);
      return null;
    }
  }

  async removeTab(tabId: number): Promise<void> {
    try {
      await chrome.tabs.remove(tabId);
      elizaLogger.log(`Tab removed: ${tabId}`);
    } catch (error) {
      elizaLogger.error(`Error removing tab: ${error}`);
    }
  }

  async queryTabs(queryInfo: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]> {
    try {
      const tabs = await chrome.tabs.query(queryInfo);
      elizaLogger.log(`Query returned ${tabs.length} tabs`);
      return tabs;
    } catch (error) {
      elizaLogger.error(`Error querying tabs: ${error}`);
      return [];
    }
  }

  async moveTab(tabId: number, moveProperties: chrome.tabs.MoveProperties): Promise<chrome.tabs.Tab | null> {
    try {
      const [tab] = await chrome.tabs.move(tabId, moveProperties);
      elizaLogger.log(`Tab moved: ${tabId}`);
      return tab;
    } catch (error) {
      elizaLogger.error(`Error moving tab: ${error}`);
      return null;
    }
  }

  async duplicateTab(tabId: number): Promise<chrome.tabs.Tab | null> {
    try {
      const tab = await chrome.tabs.duplicate(tabId);
      elizaLogger.log(`Tab duplicated: ${tabId}`);
      return tab;
    } catch (error) {
      elizaLogger.error(`Error duplicating tab: ${error}`);
      return null;
    }
  }
}
