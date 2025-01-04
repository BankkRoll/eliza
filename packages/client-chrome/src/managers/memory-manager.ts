import type { ChromeMemory, ChromeState } from "../types";

import { elizaLogger } from "@elizaos/core";

export class MemoryManager {
  private memories: ChromeMemory[] = [];
  private retentionPeriod: number;

  constructor(retentionPeriod: number) {
    this.retentionPeriod = retentionPeriod;
  }

  async initialize(): Promise<void> {
    // Clean up old memories periodically
    setInterval(() => this.cleanup(), this.retentionPeriod / 2);
  }

  async storeMemory(memory: ChromeMemory): Promise<void> {
    this.memories.push(memory);
    elizaLogger.log(`Stored memory: ${memory.id}`);
  }

  async retrieveMemories(type?: string): Promise<ChromeMemory[]> {
    if (type) {
      return this.memories.filter(m => m.type === type);
    }
    return this.memories;
  }

  private async cleanup(): Promise<void> {
    const now = Date.now();
    this.memories = this.memories.filter(
      memory => now - memory.timestamp <= this.retentionPeriod
    );
    elizaLogger.log(`Cleaned up old memories. Current count: ${this.memories.length}`);
  }
}

