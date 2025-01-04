import { elizaLogger } from "@elizaos/core";

export class BookmarkActions {
  async createBookmark(bookmark: chrome.bookmarks.CreateDetails): Promise<chrome.bookmarks.BookmarkTreeNode | null> {
    try {
      const [createdBookmark] = await chrome.bookmarks.create(bookmark);
      return createdBookmark;
    } catch (error) {
      elizaLogger.error(`Error creating bookmark: ${error}`);
      return null;
    }
  }

  async getBookmarks(id: string): Promise<chrome.bookmarks.BookmarkTreeNode[]> {
    try {
      return await chrome.bookmarks.getChildren(id);
    } catch (error) {
      elizaLogger.error(`Error getting bookmarks: ${error}`);
      return [];
    }
  }

  async updateBookmark(id: string, changes: chrome.bookmarks.UpdateChanges): Promise<chrome.bookmarks.BookmarkTreeNode | null> {
    try {
      return await chrome.bookmarks.update(id, changes);
    } catch (error) {
      elizaLogger.error(`Error updating bookmark: ${error}`);
      return null;
    }
  }

  async removeBookmark(id: string): Promise<void> {
    try {
      await chrome.bookmarks.remove(id);
    } catch (error) {
      elizaLogger.error(`Error removing bookmark: ${error}`);
    }
  }
}
