import { elizaLogger } from "@elizaos/core";

export class WindowActions {
  async createWindow(createData: chrome.windows.CreateData): Promise<chrome.windows.Window | null> {
    try {
      const window = await chrome.windows.create(createData);
      elizaLogger.log(`Window created: ${window.id}`);
      return window;
    } catch (error) {
      elizaLogger.error(`Error creating window: ${error}`);
      return null;
    }
  }

  async updateWindow(windowId: number, updateInfo: chrome.windows.UpdateInfo): Promise<chrome.windows.Window | null> {
    try {
      const window = await chrome.windows.update(windowId, updateInfo);
      elizaLogger.log(`Window updated: ${windowId}`);
      return window;
    } catch (error) {
      elizaLogger.error(`Error updating window: ${error}`);
      return null;
    }
  }

  async removeWindow(windowId: number): Promise<void> {
    try {
      await chrome.windows.remove(windowId);
      elizaLogger.log(`Window removed: ${windowId}`);
    } catch (error) {
      elizaLogger.error(`Error removing window: ${error}`);
    }
  }

  async getWindow(windowId: number, getInfo?: chrome.windows.GetInfo): Promise<chrome.windows.Window | null> {
    try {
      const window = await chrome.windows.get(windowId, getInfo);
      elizaLogger.log(`Retrieved window: ${windowId}`);
      return window;
    } catch (error) {
      elizaLogger.error(`Error getting window: ${error}`);
      return null;
    }
  }

  async getAllWindows(getInfo?: chrome.windows.GetInfo): Promise<chrome.windows.Window[]> {
    try {
      const windows = await chrome.windows.getAll(getInfo);
      elizaLogger.log(`Retrieved ${windows.length} windows`);
      return windows;
    } catch (error) {
      elizaLogger.error(`Error getting all windows: ${error}`);
      return [];
    }
  }

  async focusWindow(windowId: number): Promise<void> {
    try {
      await chrome.windows.update(windowId, { focused: true });
      elizaLogger.log(`Window focused: ${windowId}`);
    } catch (error) {
      elizaLogger.error(`Error focusing window: ${error}`);
    }
  }
}
