import { elizaLogger } from "@elizaos/core";

export class BookmarkActions {
  async createBookmark(bookmark: chrome.bookmarks.CreateDetails): Promise<chrome.bookmarks.BookmarkTreeNode | null> {
    try {
      const [createdBookmark] = await chrome.bookmarks.create(bookmark);
      elizaLogger.log(`Bookmark created: ${createdBookmark.id}`);
      return createdBookmark;
    } catch (error) {
      elizaLogger.error(`Error creating bookmark: ${error}`);
      return null;
    }
  }

  async getBookmarks(id: string): Promise<chrome.bookmarks.BookmarkTreeNode[]> {
    try {
      const bookmarks = await chrome.bookmarks.getChildren(id);
      elizaLogger.log(`Retrieved ${bookmarks.length} bookmarks`);
      return bookmarks;
    } catch (error) {
      elizaLogger.error(`Error getting bookmarks: ${error}`);
      return [];
    }
  }

  async updateBookmark(id: string, changes: chrome.bookmarks.UpdateChanges): Promise<chrome.bookmarks.BookmarkTreeNode | null> {
    try {
      const updatedBookmark = await chrome.bookmarks.update(id, changes);
      elizaLogger.log(`Bookmark updated: ${id}`);
      return updatedBookmark;
    } catch (error) {
      elizaLogger.error(`Error updating bookmark: ${error}`);
      return null;
    }
  }

  async removeBookmark(id: string): Promise<void> {
    try {
      await chrome.bookmarks.remove(id);
      elizaLogger.log(`Bookmark removed: ${id}`);
    } catch (error) {
      elizaLogger.error(`Error removing bookmark: ${error}`);
    }
  }

  async searchBookmarks(query: string): Promise<chrome.bookmarks.BookmarkTreeNode[]> {
    try {
      const results = await chrome.bookmarks.search(query);
      elizaLogger.log(`Found ${results.length} bookmarks matching query: ${query}`);
      return results;
    } catch (error) {
      elizaLogger.error(`Error searching bookmarks: ${error}`);
      return [];
    }
  }
}
