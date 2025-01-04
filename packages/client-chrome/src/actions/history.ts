import { elizaLogger } from "@elizaos/core";

export class HistoryActions {
  async addUrl(details: chrome.history.UrlDetails): Promise<void> {
    try {
      await chrome.history.addUrl(details);
    } catch (error) {
      elizaLogger.error(`Error adding URL to history: ${error}`);
    }
  }

  async deleteUrl(details: chrome.history.Url): Promise<void> {
    try {
      await chrome.history.deleteUrl(details);
    } catch (error) {
      elizaLogger.error(`Error deleting URL from history: ${error}`);
    }
  }

  async getVisits(details: chrome.history.Url): Promise<chrome.history.VisitItem[]> {
    try {
      return await chrome.history.getVisits(details);
    } catch (error) {
      elizaLogger.error(`Error getting visit history: ${error}`);
      return [];
    }
  }

  async search(query: chrome.history.HistoryQuery): Promise<chrome.history.HistoryItem[]> {
    try {
      return await chrome.history.search(query);
    } catch (error) {
      elizaLogger.error(`Error searching history: ${error}`);
      return [];
    }
  }
}

