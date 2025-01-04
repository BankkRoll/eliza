import { elizaLogger } from "@elizaos/core";

export class TabActions {
  async createTab(url: string): Promise<chrome.tabs.Tab | null> {
    try {
      return await chrome.tabs.create({ url });
    } catch (error) {
      elizaLogger.error(`Error creating tab: ${error}`);
      return null;
    }
  }

  async updateTab(tabId: number, updateProperties: chrome.tabs.UpdateProperties): Promise<chrome.tabs.Tab | null> {
    try {
      return await chrome.tabs.update(tabId, updateProperties);
    } catch (error) {
      elizaLogger.error(`Error updating tab: ${error}`);
      return null;
    }
  }

  async removeTab(tabId: number): Promise<void> {
    try {
      await chrome.tabs.remove(tabId);
    } catch (error) {
      elizaLogger.error(`Error removing tab: ${error}`);
    }
  }

  async queryTabs(queryInfo: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]> {
    try {
      return await chrome.tabs.query(queryInfo);
    } catch (error) {
      elizaLogger.error(`Error querying tabs: ${error}`);
      return [];
    }
  }
}
