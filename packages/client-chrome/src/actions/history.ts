import { elizaLogger } from "@elizaos/core";

export class HistoryActions {
  async addUrl(details: chrome.history.UrlDetails): Promise<void> {
    try {
      await chrome.history.addUrl(details);
      elizaLogger.log(`URL added to history: ${details.url}`);
    } catch (error) {
      elizaLogger.error(`Error adding URL to history: ${error}`);
    }
  }

  async deleteUrl(details: chrome.history.Url): Promise<void> {
    try {
      await chrome.history.deleteUrl(details);
      elizaLogger.log(`URL deleted from history: ${details.url}`);
    } catch (error) {
      elizaLogger.error(`Error deleting URL from history: ${error}`);
    }
  }

  async getVisits(details: chrome.history.Url): Promise<chrome.history.VisitItem[]> {
    try {
      const visits = await chrome.history.getVisits(details);
      elizaLogger.log(`Retrieved ${visits.length} visits for URL: ${details.url}`);
      return visits;
    } catch (error) {
      elizaLogger.error(`Error getting visit history: ${error}`);
      return [];
    }
  }

  async search(query: chrome.history.HistoryQuery): Promise<chrome.history.HistoryItem[]> {
    try {
      const results = await chrome.history.search(query);
      elizaLogger.log(`Found ${results.length} history items matching query`);
      return results;
    } catch (error) {
      elizaLogger.error(`Error searching history: ${error}`);
      return [];
    }
  }

  async deleteRange(range: chrome.history.Range): Promise<void> {
    try {
      await chrome.history.deleteRange(range);
      elizaLogger.log(`Deleted history items in range: ${JSON.stringify(range)}`);
    } catch (error) {
      elizaLogger.error(`Error deleting history range: ${error}`);
    }
  }
}
