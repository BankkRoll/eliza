import { elizaLogger } from "@elizaos/core";

export class WindowActions {
  async createWindow(createData: chrome.windows.CreateData): Promise<chrome.windows.Window | null> {
    try {
      return await chrome.windows.create(createData);
    } catch (error) {
      elizaLogger.error(`Error creating window: ${error}`);
      return null;
    }
  }

  async updateWindow(windowId: number, updateInfo: chrome.windows.UpdateInfo): Promise<chrome.windows.Window | null> {
    try {
      return await chrome.windows.update(windowId, updateInfo);
    } catch (error) {
      elizaLogger.error(`Error updating window: ${error}`);
      return null;
    }
  }

  async removeWindow(windowId: number): Promise<void> {
    try {
      await chrome.windows.remove(windowId);
    } catch (error) {
      elizaLogger.error(`Error removing window: ${error}`);
    }
  }

  async getWindow(windowId: number): Promise<chrome.windows.Window | null> {
    try {
      return await chrome.windows.get(windowId);
    } catch (error) {
      elizaLogger.error(`Error getting window: ${error}`);
      return null;
    }
  }
}

