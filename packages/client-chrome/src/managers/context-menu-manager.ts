import { elizaLogger } from "@elizaos/core";

export class ContextMenuManager {
  createContextMenu(createProperties: chrome.contextMenus.CreateProperties): Promise<void> {
    return new Promise((resolve) => {
      chrome.contextMenus.create(createProperties, () => {
        if (chrome.runtime.lastError) {
          elizaLogger.error(`Error creating context menu: ${chrome.runtime.lastError.message}`);
        } else {
          elizaLogger.log(`Context menu created: ${createProperties.id}`);
        }
        resolve();
      });
    });
  }

  updateContextMenu(id: string, updateProperties: chrome.contextMenus.UpdateProperties): Promise<void> {
    return new Promise((resolve) => {
      chrome.contextMenus.update(id, updateProperties, () => {
        if (chrome.runtime.lastError) {
          elizaLogger.error(`Error updating context menu: ${chrome.runtime.lastError.message}`);
        } else {
          elizaLogger.log(`Context menu updated: ${id}`);
        }
        resolve();
      });
    });
  }

  removeContextMenu(menuItemId: string): Promise<void> {
    return new Promise((resolve) => {
      chrome.contextMenus.remove(menuItemId, () => {
        if (chrome.runtime.lastError) {
          elizaLogger.error(`Error removing context menu: ${chrome.runtime.lastError.message}`);
        } else {
          elizaLogger.log(`Context menu removed: ${menuItemId}`);
        }
        resolve();
      });
    });
  }

  removeAllContextMenus(): Promise<void> {
    return new Promise((resolve) => {
      chrome.contextMenus.removeAll(() => {
        if (chrome.runtime.lastError) {
          elizaLogger.error(`Error removing all context menus: ${chrome.runtime.lastError.message}`);
        } else {
          elizaLogger.log('All context menus removed');
        }
        resolve();
      });
    });
  }

  onContextMenuClicked(callback: (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => void): void {
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      elizaLogger.log(`Context menu clicked: ${info.menuItemId}`);
      callback(info, tab);
    });
  }
}
